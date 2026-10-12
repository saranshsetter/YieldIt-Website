import { cookies } from "next/headers";
import { COOKIE, authEnabled, passwordMatches, sessionToken } from "@/lib/auth";
import { json, fail, body } from "@/lib/http";

export async function POST(req: Request) {
  if (!authEnabled()) return fail("SETLO_PASSWORD is not set on the server.", 503);
  const { password } = await body<{ password?: string }>(req);
  if (!(await passwordMatches(password ?? ""))) return fail("Wrong password", 401);
  (await cookies()).set(COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(req.url).protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(COOKIE);
  return json({ ok: true });
}
