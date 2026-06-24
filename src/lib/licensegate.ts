import { randomBytes } from "node:crypto";
import { isLicenseGateConfigured } from "@/lib/env";

// Crockford base32 (no ambiguous 0/O, 1/I/L)
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function group(): string {
  const b = randomBytes(5);
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[b[i] % 32];
  return s;
}

/** e.g. CBL-7Q2KM-9XA4T-... */
export function generateLicenseKey(): string {
  return `CBL-${group()}-${group()}-${group()}-${group()}`;
}

const API_BASE = "https://api.licensegate.io";

/**
 * Issues a license key. Our DB is the source of truth (the macOS apps validate
 * against CrazyBeeLabs.com); if LicenseGate is configured we ALSO register the
 * key there (best-effort) so it can be validated through their API too.
 *
 * TODO: confirm the exact LicenseGate admin endpoint/fields against their docs;
 * these calls are wrapped so a mismatch never blocks provisioning.
 */
export async function issueLicense(input: {
  appSlug: string;
  validUntil: Date | null;
}): Promise<{ licenseKey: string; licensegateId: string | null }> {
  const licenseKey = generateLicenseKey();
  if (!isLicenseGateConfigured()) return { licenseKey, licensegateId: null };

  try {
    const res = await fetch(`${API_BASE}/admin/licenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LICENSEGATE_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        key: licenseKey,
        name: input.appSlug,
        expirationDate: input.validUntil ? input.validUntil.toISOString() : null,
        active: true,
      }),
    });
    if (!res.ok) {
      console.error("[licensegate] create failed", res.status);
      return { licenseKey, licensegateId: null };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string | number };
    return { licenseKey, licensegateId: json.id != null ? String(json.id) : null };
  } catch (e) {
    console.error("[licensegate] create error", e);
    return { licenseKey, licensegateId: null };
  }
}

/** Block/unblock a key in LicenseGate (best-effort; our DB is authoritative). */
export async function setLicenseGateActive(
  licensegateId: string | null,
  active: boolean,
): Promise<void> {
  if (!licensegateId || !isLicenseGateConfigured()) return;
  try {
    await fetch(`${API_BASE}/admin/licenses/${licensegateId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.LICENSEGATE_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ active }),
    });
  } catch (e) {
    console.error("[licensegate] update error", e);
  }
}
