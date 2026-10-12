// End-to-end smoke test against a running dev server: `npm run dev` then `npm run smoke`.
const BASE = process.env.SETLO_URL || "http://localhost:3100";
let failed = 0;
const ok = (name, cond, extra = "") => { console.log(`${cond ? "✓" : "✗"} ${name}${extra ? ` — ${extra}` : ""}`); if (!cond) failed++; };
// If the app has SETLO_PASSWORD set, run with SETLO_PASSWORD=... npm run smoke
const AUTH = process.env.SETLO_PASSWORD ? { authorization: `Bearer ${process.env.SETLO_PASSWORD}` } : {};
const req = async (path, opts = {}) => {
  const headers = { ...AUTH, ...(opts.json ? { "content-type": "application/json" } : opts.headers) };
  const res = await fetch(BASE + path, { ...opts, headers, body: opts.json ? JSON.stringify(opts.json) : opts.body });
  const ct = res.headers.get("content-type") || "";
  return { status: res.status, data: ct.includes("json") ? await res.json() : await res.text() };
};

for (const p of ["/", "/follow-ups", "/snippets", "/notes", "/data"]) {
  const r = await req(p);
  ok(`page ${p}`, r.status === 200 && r.data.includes("Setlo"), String(r.status));
}

const leads = (await req("/api/leads")).data;
ok("seed leads", leads.length >= 20, `${leads.length} leads`);
ok("all 9 stages seeded", new Set(leads.map((l) => l.stage)).size === 9);
ok("leads carry workspace_id", leads.every((l) => l.workspace_id));

const created = (await req("/api/leads", { method: "POST", json: { first_name: "Smoke", last_name: "Test", phone: "555-0000", stage: "text_blasted", cash_value: "1,500" } })).data;
ok("create lead", created.id && created.cash_value === 1500);
const moved = (await req(`/api/leads/${created.id}`, { method: "PATCH", json: { stage: "booked", next_follow_up: "2030-01-01" } })).data;
ok("move stage + follow-up", moved.lead.stage === "booked" && moved.activities.some((a) => a.type === "stage_change"));
const noted = (await req(`/api/leads/${created.id}/notes`, { method: "POST", json: { text: "smoke note" } })).data;
ok("add note", noted.activities.some((a) => a.body === "smoke note"));

const okr = (await req("/api/okr")).data;
ok("okr", typeof okr.sets === "number" && okr.sets >= 1 && okr.goals.monthly_cash > 0, JSON.stringify({ sets: okr.sets, booked: okr.booked, closed: okr.closed, cash: okr.cash }));
const goals = (await req("/api/okr", { method: "PUT", json: { weekly_sets: okr.goals.weekly_sets } })).data;
ok("edit goals", goals.goals.weekly_sets === okr.goals.weekly_sets);

await req("/api/settings", { method: "PUT", json: { active_lead_id: created.id } });
const filled = (await req("/api/snippets?fill=active")).data;
ok("snippets filled for active lead", filled.lead?.id === created.id && filled.snippets.some((s) => s.rendered.includes("Smoke")));

const capS = (await req("/api/capture", { method: "POST", json: { text: "Captured smoke snippet", target: "snippet" } })).data;
ok("capture → snippet", capS.saved === "snippet");
const capN = (await req("/api/capture", { method: "POST", json: { text: "Captured smoke note", target: "note" } })).data;
ok("capture → note on active lead", capN.saved === "note");
await req(`/api/snippets/${capS.snippet.id}`, { method: "DELETE" });

const draft = await req("/api/ai/draft", { method: "POST", json: { leadId: created.id, kind: "follow-up" } });
ok("message writer", draft.status === 200 && draft.data.text.length > 10, draft.data.ai ? "Claude" : "template fallback");

const transcript = "Thanks for jumping on. I'm interested but honestly it feels expensive right now. I need to talk to my partner first. I'll send you the case study video tonight. Let's book a follow up call next Tuesday at 3pm.";
const st = await req("/api/notes/structure", { method: "POST", json: { transcript, leadId: created.id } });
ok("structure notes", st.status === 200 && st.data.notes.summary.length > 0, st.data.ai ? "Claude" : "heuristic fallback");
const saved = await req("/api/notes", { method: "POST", json: { ...st.data.notes, transcript, lead_id: created.id } });
ok("save notes", saved.status === 201);
const tr = await req("/api/notes/transcribe", { method: "POST", body: new FormData() });
ok("transcribe degrades or errors cleanly", [400, 501].includes(tr.status), String(tr.status));

const g = (await req("/api/ghl", { method: "POST", json: { action: "updateStage", leadId: created.id } })).data;
ok("GHL fallback", g.ok === false && g.fallback.includes("Booked"), g.reason);

const csv = await req("/api/csv");
ok("csv export", csv.status === 200 && csv.data.startsWith("first_name,"));
const imp = (await req("/api/csv", { method: "POST", body: 'Name,Phone,Stage,Value\n"Csv Person, Jr",555-1111,Nurturing,2000' })).data;
ok("csv import", imp.imported === 1, JSON.stringify(imp));
const after = (await req("/api/leads")).data;
const csvLead = after.find((l) => l.first_name === "Csv");
ok("csv lead parsed", csvLead?.stage === "nurturing" && csvLead.cash_value === 2000);

if (saved.data?.id) await req(`/api/notes?id=${saved.data.id}`, { method: "DELETE" });
await req(`/api/leads/${created.id}`, { method: "DELETE" });
if (csvLead) await req(`/api/leads/${csvLead.id}`, { method: "DELETE" });
await req("/api/settings", { method: "PUT", json: { active_lead_id: null } });

console.log(failed ? `\n${failed} check(s) failed` : "\nAll smoke checks passed");
process.exit(failed ? 1 : 0);
