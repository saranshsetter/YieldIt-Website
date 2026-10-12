import { listSnippets, createSnippet, getLead } from "@/lib/repo";
import { getSetting } from "@/lib/db";
import { fillSnippet } from "@/lib/fill";
import { json, fail, body } from "@/lib/http";

// ?fill=active returns each snippet rendered for the lead currently open in the app (used by the extension).
export async function GET(req: Request) {
  const snippets = await listSnippets();
  if (new URL(req.url).searchParams.get("fill") !== "active") return json(snippets);
  const lead = (await getLead(Number(await getSetting("active_lead_id", "0")))) ?? null;
  const me = await getSetting("my_name", "");
  return json({ lead, snippets: snippets.map((s) => ({ ...s, rendered: fillSnippet(s.body, lead, me) })) });
}
export async function POST(req: Request) {
  const b = await body<{ title?: string; body?: string; category?: string }>(req);
  if (!b.body?.trim()) return fail("Snippet body is required");
  return json(await createSnippet({ title: b.title, body: b.body.trim(), category: b.category }), 201);
}
