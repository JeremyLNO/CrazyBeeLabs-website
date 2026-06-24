/**
 * Admin gate. Admins are listed in ADMIN_EMAILS (comma-separated). Defaults to
 * jeremy@lno.company so the dashboard works out of the box; override via env.
 */
export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  return (raw && raw.length ? raw : "jeremy@lno.company")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
