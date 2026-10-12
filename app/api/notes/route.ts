import { listCallNotes, saveCallNote, deleteCallNote } from "@/lib/repo";
import { json, fail, body } from "@/lib/http";

export async function GET() {
  return json(await listCallNotes());
}
export async function POST(req: Request) {
  const b = await body<Record<string, string | number | null>>(req);
  const s = (k: string) => String(b[k] ?? "");
  if (!s("summary").trim() && !s("transcript").trim()) return fail("Nothing to save");
  const id = await saveCallNote({
    lead_id: b.lead_id ? Number(b.lead_id) : null,
    transcript: s("transcript"), summary: s("summary"), objections: s("objections"),
    commitments: s("commitments"), next_step: s("next_step"), resources: s("resources"),
  });
  return json({ id }, 201);
}
export async function DELETE(req: Request) {
  await deleteCallNote(Number(new URL(req.url).searchParams.get("id")));
  return json({ ok: true });
}
