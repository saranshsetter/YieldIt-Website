import { getDb } from "@/lib/db";
import { authEnabled } from "@/lib/auth";
import { json, errMsg } from "@/lib/http";

// Public, data-free status check: is the database reachable and is the password set?
export async function GET() {
  try {
    const db = await getDb();
    await db.get("SELECT 1 AS ok");
    return json({ ok: true, database: db.dialect === "pg" ? "postgres" : "sqlite", auth: authEnabled() });
  } catch (e) {
    return json({ ok: false, error: errMsg(e), auth: authEnabled() }, 500);
  }
}
