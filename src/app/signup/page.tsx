import { redirect } from "next/navigation";

// Sign-up now happens inline in the unified email-first flow (login page + the
// download modal). Keep this route as a redirect so old links still work.
export default function SignupPage() {
  redirect("/login");
}
