import { getLead, getActivities, updateLead, deleteLead, type LeadInput } from "@/lib/repo";
import { json, fail, body } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const id = Number((await ctx.params).id);
  const lead = await getLead(id);
  if (!lead) return fail("Not found", 404);
  return json({ lead, activities: await getActivities(id) });
}
export async function PATCH(req: Request, ctx: Ctx) {
  const id = Number((await ctx.params).id);
  const lead = await updateLead(id, await body<LeadInput>(req));
  if (!lead) return fail("Not found", 404);
  return json({ lead, activities: await getActivities(id) });
}
export async function DELETE(_: Request, ctx: Ctx) {
  await deleteLead(Number((await ctx.params).id));
  return json({ ok: true });
}
