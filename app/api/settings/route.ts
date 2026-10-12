import { getDb, getSetting, setSetting, WS } from "@/lib/db";
import { getLead } from "@/lib/repo";
import { hasAnthropic, hasDeepgram } from "@/lib/ai";
import { ghl } from "@/lib/ghl";
import { authEnabled } from "@/lib/auth";
import { json, body } from "@/lib/http";

async function state() {
  const activeId = Number(await getSetting("active_lead_id", "0"));
  return {
    workspace_id: WS,
    my_name: await getSetting("my_name", ""),
    active_lead: activeId ? (await getLead(activeId)) ?? null : null,
    database: (await getDb()).dialect === "pg" ? "postgres" : "sqlite",
    auth: authEnabled(),
    integrations: { anthropic: hasAnthropic(), deepgram: hasDeepgram(), ghl: ghl.configured },
  };
}
export async function GET() {
  return json(await state());
}
export async function PUT(req: Request) {
  const b = await body<{ my_name?: string; active_lead_id?: number | null }>(req);
  if (typeof b.my_name === "string") await setSetting("my_name", b.my_name.trim());
  if ("active_lead_id" in b) await setSetting("active_lead_id", String(b.active_lead_id ?? 0));
  return json(await state());
}
