import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, authEnabled, passwordMatches, sessionToken } from "@/lib/auth";

const PUBLIC = ["/login", "/api/auth", "/api/health"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();

  if (!authEnabled()) {
    // Locally the app is open. On a public deploy we refuse to serve data without a password.
    if (!process.env.VERCEL) return NextResponse.next();
    if (isApi) return NextResponse.json({ error: "Set SETLO_PASSWORD in your Vercel environment variables." }, { status: 503 });
    return NextResponse.redirect(new URL("/login?setup=1", req.url));
  }

  const cookie = req.cookies.get(COOKIE)?.value;
  if (cookie && cookie === (await sessionToken())) return NextResponse.next();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer && (await passwordMatches(bearer))) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: "Unauthorized — sign in to Setlo (or set the password in the extension)." }, { status: 401 });
  const url = new URL("/login", req.url);
  if (pathname !== "/") url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|logo.svg|favicon.ico).*)"],
};
