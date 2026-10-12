import { listLeads, createLead } from "@/lib/repo";
import { parseCsv, toCsv } from "@/lib/csv";
import { STAGES, toStageId } from "@/lib/stages";
import { json, fail } from "@/lib/http";

const COLS = ["first_name", "last_name", "phone", "email", "stage", "cash_value", "next_follow_up", "source_tool"] as const;

export async function GET() {
  const rows = (await listLeads()).map((l) => [l.first_name, l.last_name, l.phone, l.email, STAGES[l.stage].label, l.cash_value, l.next_follow_up, l.source_tool]);
  return new Response(toCsv([[...COLS], ...rows]), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="setlo-leads.csv"` },
  });
}

// Accepts raw CSV text. Header names are matched loosely ("First Name", "first_name", "Name", "Phone Number"...).
export async function POST(req: Request) {
  const rows = parseCsv(await req.text());
  if (rows.length < 2) return fail("CSV needs a header row and at least one lead");
  const norm = (h: string) => h.toLowerCase().replace(/[^a-z]/g, "");
  const alias: Record<string, (typeof COLS)[number] | "name"> = {
    firstname: "first_name", first: "first_name", lastname: "last_name", last: "last_name", name: "name", fullname: "name",
    phone: "phone", phonenumber: "phone", mobile: "phone", email: "email", emailaddress: "email", stage: "stage",
    cashvalue: "cash_value", value: "cash_value", dealvalue: "cash_value", amount: "cash_value",
    nextfollowup: "next_follow_up", followup: "next_follow_up", sourcetool: "source_tool", source: "source_tool",
  };
  const map = rows[0].map((h) => alias[norm(h)]);
  let imported = 0, skipped = 0;
  for (const r of rows.slice(1)) {
    const rec: Record<string, string> = {};
    map.forEach((k, i) => { if (k) rec[k] = (r[i] ?? "").trim(); });
    if (rec.name && !rec.first_name) {
      const [first, ...rest] = rec.name.split(/\s+/);
      rec.first_name = first;
      rec.last_name ||= rest.join(" ");
    }
    if (!rec.first_name && !rec.phone && !rec.email) { skipped++; continue; }
    await createLead({
      first_name: rec.first_name, last_name: rec.last_name, phone: rec.phone, email: rec.email,
      stage: toStageId(rec.stage) ?? "text_blasted", cash_value: Number(rec.cash_value) || 0,
      next_follow_up: /^\d{4}-\d{2}-\d{2}/.test(rec.next_follow_up ?? "") ? rec.next_follow_up : null,
      source_tool: rec.source_tool || "CSV Import",
    });
    imported++;
  }
  return json({ imported, skipped });
}
