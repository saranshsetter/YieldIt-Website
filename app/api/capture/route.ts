import { createSnippet, addNote, getLead } from "@/lib/repo";
import { getSetting } from "@/lib/db";
import { json, fail, body } from "@/lib/http";

// Shared by the in-app capture hotkey and the Chrome extension.
export async function POST(req: Request) {
  const b = await body<{ text?: string; target?: "snippet" | "note"; leadId?: number; title?: string; category?: string; source?: string }>(req);
  const text = b.text?.trim();
  if (!text) return fail("Nothing to capture");
  if (b.target === "note") {
    const lead = await getLead(Number(b.leadId || (await getSetting("active_lead_id", "0"))));
    if (!lead) return fail("No lead is open in Setlo. Open a lead first.", 409);
    await addNote(lead.id, b.source ? `${text}\n\n— captured from ${b.source}` : text);
    return json({ ok: true, saved: "note", lead: `${lead.first_name} ${lead.last_name}` });
  }
  const s = await createSnippet({ body: text, title: b.title, category: b.category || "Captured" });
  return json({ ok: true, saved: "snippet", snippet: s });
}
