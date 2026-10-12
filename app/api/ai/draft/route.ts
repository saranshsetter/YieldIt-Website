import { getLead, getActivities, addNote } from "@/lib/repo";
import { getSetting } from "@/lib/db";
import { draftText, leadContext } from "@/lib/ai";
import { json, fail, body, errMsg } from "@/lib/http";

export async function POST(req: Request) {
  const b = await body<{ leadId?: number; kind?: string; extra?: string }>(req);
  const lead = b.leadId ? (await getLead(Number(b.leadId))) ?? null : null;
  const recent = lead ? (await getActivities(lead.id)).slice(0, 8).map((a) => `${a.created_at.slice(0, 10)} ${a.type}: ${a.body}`) : [];
  try {
    const r = await draftText({
      lead,
      context: lead ? leadContext(lead, recent) : "No lead selected.",
      kind: b.kind || "follow-up",
      myName: await getSetting("my_name", ""),
      extra: b.extra,
    });
    if (lead && r.ai) await addNote(lead.id, `AI draft: ${r.text}`, "ai_draft");
    return json(r);
  } catch (e) {
    return fail(errMsg(e), 502);
  }
}
