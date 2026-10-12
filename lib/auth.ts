// Single-password gate. Set SETLO_PASSWORD to turn it on (required on Vercel).
// Browser: httpOnly session cookie. Chrome extension: `Authorization: Bearer <password>`.
export const COOKIE = "setlo_session";
export const authEnabled = () => !!process.env.SETLO_PASSWORD;

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Cookie value for the current password. Changing SETLO_PASSWORD signs everyone out. */
export const sessionToken = () => sha256(`setlo-session:${process.env.SETLO_PASSWORD}`);

export async function passwordMatches(candidate: string): Promise<boolean> {
  if (!authEnabled() || !candidate) return false;
  const [a, b] = await Promise.all([sha256(candidate), sha256(process.env.SETLO_PASSWORD!)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
