/**
 * Admin gate. The admin dashboard (/admin) is restricted to a single account:
 * jeremy@lno.company — hard-coded so it can't be widened by env misconfig.
 */
export const ADMIN_EMAIL = "jeremy@lno.company";

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
