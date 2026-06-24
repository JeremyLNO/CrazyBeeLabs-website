import { NextResponse } from "next/server";
import { verifyPaddleSignature, getInvoiceUrl } from "@/lib/paddle-server";
import {
  provisionItems,
  setSubscriptionState,
  renewBySubscription,
  type ProvisionItem,
  type PaddleRef,
} from "@/lib/provisioning";
import { getUserById } from "@/lib/users";
import { sendLicenseEmail } from "@/lib/email/brevo";

export const runtime = "nodejs";

// Paddle Billing webhook. Verifies the signature, then provisions / blocks
// licenses based on the event. Returns 200 quickly; 5xx makes Paddle retry.
export async function POST(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const raw = await req.text();

  if (!secret) {
    console.warn("[paddle] PADDLE_WEBHOOK_SECRET not set — ignoring event");
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (!verifyPaddleSignature(raw, req.headers.get("paddle-signature"), secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(raw) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (e) {
    console.error("[paddle] handler error", e);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

interface PaddleEvent {
  event_type?: string;
  data?: Record<string, unknown> & {
    id?: string;
    status?: string;
    subscription_id?: string;
    customer_id?: string;
    invoice_number?: string;
    currency_code?: string;
    custom_data?: { userId?: string; items?: ProvisionItem[] } | null;
    details?: { totals?: { total?: string | number } };
    current_billing_period?: { ends_at?: string };
  };
}

async function handleEvent(event: PaddleEvent) {
  const type = event.event_type;
  const data = event.data ?? {};
  if (!type) return;

  switch (type) {
    case "transaction.completed": {
      const userId = data.custom_data?.userId;
      const items = data.custom_data?.items;
      const ref: PaddleRef = {
        transactionId: data.id ?? null,
        subscriptionId: data.subscription_id ?? null,
        customerId: data.customer_id ?? null,
        invoiceNumber: data.invoice_number ?? null,
        invoiceUrl: data.id ? await getInvoiceUrl(data.id) : null,
        amountCents: parseAmount(data),
        currency: data.currency_code ?? null,
      };
      if (userId && items?.length) {
        const issued = await provisionItems(userId, items, ref);
        const user = await getUserById(userId);
        if (user) await sendLicenseEmail(user.email, user.name ?? undefined, issued);
      } else if (ref.subscriptionId) {
        // renewal (no custom_data) → extend by subscription
        await renewBySubscription(ref.subscriptionId, ref);
      }
      break;
    }

    case "transaction.payment_failed": {
      if (data.subscription_id) await setSubscriptionState(data.subscription_id, "past_due");
      break;
    }
    case "subscription.past_due": {
      if (data.id) await setSubscriptionState(data.id, "past_due");
      break;
    }
    case "subscription.canceled": {
      if (data.id) await setSubscriptionState(data.id, "canceled");
      break;
    }
    case "subscription.paused": {
      if (data.id) await setSubscriptionState(data.id, "blocked");
      break;
    }
    case "subscription.activated":
    case "subscription.updated": {
      if (data.id) {
        const periodEnd = data.current_billing_period?.ends_at
          ? new Date(data.current_billing_period.ends_at)
          : undefined;
        await setSubscriptionState(data.id, mapStatus(data.status), periodEnd);
      }
      break;
    }
    default:
      break;
  }
}

function parseAmount(data: PaddleEvent["data"]): number | null {
  const t = data?.details?.totals?.total;
  if (t == null) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function mapStatus(
  s: string | undefined,
): "active" | "trialing" | "past_due" | "canceled" | "blocked" {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "paused":
      return "blocked";
    default:
      return "active";
  }
}
