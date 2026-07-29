import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/mobile-auth";
import { profileSchema } from "@/lib/validators";
import { updateUserProfile } from "@/lib/users";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  try {
    const user = await updateUserProfile(userId, parsed.data);
    return NextResponse.json({
      ok: true,
      name: user.name,
      lastName: user.lastName,
      birthDate: user.birthDate,
    });
  } catch (e) {
    console.error("[account/profile] update failed", e);
    return NextResponse.json({ error: "Could not save your profile." }, { status: 500 });
  }
}
