import { NextResponse } from "next/server";
import { sendSupportEmail } from "@/lib/email/brevo";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kindRaw = String(form.get("kind") || "");
  const kind = kindRaw === "idea" ? "idea" : "support";
  const appLabel = String(form.get("appLabel") || "").trim();
  const firstName = String(form.get("firstName") || "").trim();
  const lastName = String(form.get("lastName") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const phone = String(form.get("phone") || "").trim();
  const message = String(form.get("message") || "").trim();

  if (!firstName || !lastName || !message || !appLabel) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Optional attachment.
  let attachment: { name: string; content: string } | undefined;
  const file = form.get("file");
  if (file && file instanceof File && file.size > 0) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, JPEG, JPG and PNG files are allowed." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "That file is larger than 8 MB." }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    attachment = { name: file.name || "attachment", content: buf.toString("base64") };
  }

  try {
    await sendSupportEmail({
      kind,
      appLabel,
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      message,
      attachment,
    });
  } catch (e) {
    console.error("[support] send failed", e);
    return NextResponse.json({ error: "Could not send your message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
