import { getDb, WS, now, logActivity, getSetting } from "./db";
import { STAGES, toStageId, type StageId } from "./stages";
import type { Activity, Lead, Snippet, CallNote } from "./types";
import { startOfMonth, startOfWeek } from "./dates";

const LEAD_FIELDS = ["first_name", "last_name", "phone", "email", "stage", "cash_value", "next_follow_up", "source_tool"] as const;
export type LeadInput = Partial<Pick<Lead, (typeof LEAD_FIELDS)[number]>>;

export async function listLeads(): Promise<Lead[]> {
  const db = await getDb();
  return db.all<Lead>("SELECT * FROM leads WHERE workspace_id=? ORDER BY next_follow_up IS NULL, next_follow_up, id", [WS]);
}
export async function getLead(id: number): Promise<Lead | undefined> {
  if (!Number.isFinite(id) || id <= 0) return undefined;
  const db = await getDb();
  return db.get<Lead>("SELECT * FROM leads WHERE workspace_id=? AND id=?", [WS, id]);
}
export async function getActivities(id: number): Promise<Activity[]> {
  const db = await getDb();
  return db.all<Activity>("SELECT * FROM activities WHERE workspace_id=? AND lead_id=? ORDER BY created_at DESC, id DESC", [WS, id]);
}

function clean(input: LeadInput): LeadInput {
  const out: Record<string, unknown> = {};
  for (const k of LEAD_FIELDS) {
    if (!(k in input)) continue;
    let v = (input as Record<string, unknown>)[k];
    if (k === "stage") v = toStageId(String(v)) ?? undefined;
    else if (k === "cash_value") v = Number(String(v ?? 0).replace(/[^0-9.-]/g, "")) || 0;
    else if (k === "next_follow_up") v = v ? String(v).slice(0, 10) : null;
    else v = String(v ?? "").trim();
    if (v !== undefined) out[k] = v;
  }
  return out as LeadInput;
}

export async function createLead(input: LeadInput): Promise<Lead> {
  const db = await getDb();
  const d = clean(input);
  const t = now();
  const id = await db.insert(
    `INSERT INTO leads (workspace_id,first_name,last_name,phone,email,stage,cash_value,next_follow_up,source_tool,created_at,updated_at,stage_changed_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [WS, d.first_name ?? "", d.last_name ?? "", d.phone ?? "", d.email ?? "", d.stage ?? "text_blasted", d.cash_value ?? 0,
      d.next_follow_up ?? null, d.source_tool ?? "Manual", t, t, t],
  );
  await logActivity(id, "created", `Lead created${d.source_tool ? ` from ${d.source_tool}` : ""}`);
  return (await getLead(id))!;
}

export async function updateLead(id: number, input: LeadInput): Promise<Lead | undefined> {
  const prev = await getLead(id);
  if (!prev) return undefined;
  const d = clean(input) as Record<string, unknown>;
  const keys = Object.keys(d).filter((k) => d[k] !== (prev as Record<string, unknown>)[k]);
  if (!keys.length) return prev;
  const t = now();
  const sets = [...keys.map((k) => `${k}=?`), "updated_at=?", ...(keys.includes("stage") ? ["stage_changed_at=?"] : [])];
  const vals = [...keys.map((k) => d[k]), t, ...(keys.includes("stage") ? [t] : [])];
  const db = await getDb();
  await db.run(`UPDATE leads SET ${sets.join(", ")} WHERE workspace_id=? AND id=?`, [...vals, WS, id]);
  const stage = d.stage as StageId | undefined;
  if (stage && stage !== prev.stage) {
    await logActivity(id, "stage_change", `Moved ${STAGES[prev.stage].label} → ${STAGES[stage].label}`, { from: prev.stage, to: stage });
  }
  if (keys.includes("next_follow_up")) {
    await logActivity(id, "follow_up", d.next_follow_up ? `Follow-up set for ${d.next_follow_up}` : "Follow-up cleared");
  }
  const edited = keys.filter((k) => k !== "stage" && k !== "next_follow_up");
  if (edited.length) await logActivity(id, "edit", `Updated ${edited.map((k) => k.replace(/_/g, " ")).join(", ")}`);
  return getLead(id);
}

export async function deleteLead(id: number) {
  const db = await getDb();
  await db.run("DELETE FROM leads WHERE workspace_id=? AND id=?", [WS, id]);
}

export async function addNote(id: number, body: string, type: Activity["type"] = "note") {
  await logActivity(id, type, body);
}

export async function okr() {
  const db = await getDb();
  const week = startOfWeek().toISOString();
  const month = startOfMonth().toISOString();
  const metaTo = db.dialect === "pg" ? "(meta::json->>'to')" : "json_extract(meta,'$.to')";
  const sets = await db.get<{ n: number }>(
    `SELECT CAST(COUNT(DISTINCT lead_id) AS INTEGER) n FROM activities WHERE workspace_id=? AND type='stage_change' AND ${metaTo}='booked' AND created_at>=?`,
    [WS, week],
  );
  const booked = await db.get<{ n: number }>("SELECT CAST(COUNT(*) AS INTEGER) n FROM leads WHERE workspace_id=? AND stage IN ('booked','rescheduled')", [WS]);
  const won = await db.get<{ n: number; cash: number }>(
    "SELECT CAST(COUNT(*) AS INTEGER) n, COALESCE(SUM(cash_value),0) cash FROM leads WHERE workspace_id=? AND stage='closed_won' AND stage_changed_at>=?",
    [WS, month],
  );
  const [ws, mc, mcash] = await Promise.all([getSetting("goal_weekly_sets", "20"), getSetting("goal_monthly_closes", "8"), getSetting("goal_monthly_cash", "40000")]);
  return {
    sets: Number(sets?.n ?? 0),
    booked: Number(booked?.n ?? 0),
    closed: Number(won?.n ?? 0),
    cash: Number(won?.cash ?? 0),
    goals: { weekly_sets: Number(ws), monthly_closes: Number(mc), monthly_cash: Number(mcash) },
  };
}

export async function listSnippets(): Promise<Snippet[]> {
  const db = await getDb();
  return db.all<Snippet>("SELECT * FROM snippets WHERE workspace_id=? ORDER BY uses DESC, id", [WS]);
}
export async function createSnippet(s: { title?: string; body: string; category?: string }): Promise<Snippet> {
  const db = await getDb();
  const title = (s.title || s.body.split("\n")[0].slice(0, 48) || "Untitled").trim();
  const id = await db.insert("INSERT INTO snippets (workspace_id,title,body,category,uses,created_at) VALUES (?,?,?,?,0,?)",
    [WS, title, s.body, (s.category || "Captured").trim(), now()]);
  return (await db.get<Snippet>("SELECT * FROM snippets WHERE id=?", [id]))!;
}
export async function updateSnippet(id: number, s: Partial<Pick<Snippet, "title" | "body" | "category">> & { used?: boolean }) {
  const db = await getDb();
  if (s.used) await db.run("UPDATE snippets SET uses=uses+1 WHERE workspace_id=? AND id=?", [WS, id]);
  for (const k of ["title", "body", "category"] as const) {
    if (typeof s[k] === "string") await db.run(`UPDATE snippets SET ${k}=? WHERE workspace_id=? AND id=?`, [s[k], WS, id]);
  }
}
export async function deleteSnippet(id: number) {
  const db = await getDb();
  await db.run("DELETE FROM snippets WHERE workspace_id=? AND id=?", [WS, id]);
}

export async function listCallNotes(): Promise<(CallNote & { lead_name: string | null })[]> {
  const db = await getDb();
  return db.all(
    `SELECT c.*, CASE WHEN l.id IS NULL THEN NULL ELSE l.first_name || ' ' || l.last_name END lead_name
     FROM call_notes c LEFT JOIN leads l ON l.id=c.lead_id WHERE c.workspace_id=? ORDER BY c.created_at DESC LIMIT 50`,
    [WS],
  );
}
export async function saveCallNote(n: Omit<CallNote, "id" | "created_at">) {
  const db = await getDb();
  const id = await db.insert(
    "INSERT INTO call_notes (workspace_id,lead_id,transcript,summary,objections,commitments,next_step,resources,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    [WS, n.lead_id, n.transcript, n.summary, n.objections, n.commitments, n.next_step, n.resources, now()],
  );
  if (n.lead_id) await logActivity(n.lead_id, "call_notes", `Call notes: ${n.summary.slice(0, 220)}`, { call_note_id: id });
  return id;
}
export async function deleteCallNote(id: number) {
  const db = await getDb();
  await db.run("DELETE FROM call_notes WHERE workspace_id=? AND id=?", [WS, id]);
}
