import { updateSnippet, deleteSnippet } from "@/lib/repo";
import { json, body } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, ctx: Ctx) {
  await updateSnippet(Number((await ctx.params).id), await body(req));
  return json({ ok: true });
}
export async function DELETE(_: Request, ctx: Ctx) {
  await deleteSnippet(Number((await ctx.params).id));
  return json({ ok: true });
}
