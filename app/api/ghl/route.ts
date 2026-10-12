import { ghl, GhlNotImplemented } from "@/lib/ghl";
import { getLead, addNote } from "@/lib/repo";
import { STAGES } from "@/lib/stages";
import { json, fail, body, errMsg } from "@/lib/http";

// Always returns a clipboard fallback so the UI can copy when GHL is unset or the adapter is stubbed.
export async function POST(req: Request) {
  const b = await body<{ action?: "pushNote" | "updateStage" | "importContacts"; leadId?: number; text?: string }>(req);
  const lead = b.leadId ? await getLead(Number(b.leadId)) : undefined;
  if (b.action !== "importContacts" && !lead) return fail("Lead not found", 404);
  const fallback =
    b.action === "updateStage" ? `${lead!.first_name} ${lead!.last_name} → ${STAGES[lead!.stage].label}` : b.text || "";
  if (!ghl.configured) return json({ ok: false, fallback, reason: "GHL not configured — copied to clipboard instead." });
  try {
    if (b.action === "pushNote") await ghl.pushNote(lead!, b.text || "");
    else if (b.action === "updateStage") await ghl.updateStage(lead!, lead!.stage);
    else if (b.action === "importContacts") return json({ ok: true, contacts: await ghl.importContacts() });
    await addNote(lead!.id, `Synced to GHL (${b.action})`, "ghl");
    return json({ ok: true });
  } catch (e) {
    const reason = e instanceof GhlNotImplemented ? "GHL adapter is stubbed — copied to clipboard instead." : errMsg(e);
    return json({ ok: false, fallback, reason });
  }
}
