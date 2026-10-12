import { structureNotes, leadContext } from "@/lib/ai";
import { getLead, getActivities } from "@/lib/repo";
import { json, fail, body, errMsg } from "@/lib/http";

export const maxDuration = 60;

export async function POST(req: Request) {
  const b = await body<{ transcript?: string; leadId?: number }>(req);
  if (!b.transcript?.trim()) return fail("Transcript is empty");
  const lead = b.leadId ? await getLead(Number(b.leadId)) : undefined;
  const ctx = lead ? leadContext(lead, (await getActivities(lead.id)).slice(0, 5).map((a) => a.body)) : "";
  try {
    return json(await structureNotes(b.transcript, ctx));
  } catch (e) {
    return fail(errMsg(e), 502);
  }
}
