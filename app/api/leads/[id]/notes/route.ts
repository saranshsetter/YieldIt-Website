import { addNote, getActivities, getLead } from "@/lib/repo";
import { json, fail, body } from "@/lib/http";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = Number((await ctx.params).id);
  const { text } = await body<{ text?: string }>(req);
  if (!(await getLead(id))) return fail("Not found", 404);
  if (!text?.trim()) return fail("Empty note");
  await addNote(id, text.trim());
  return json({ activities: await getActivities(id) });
}
