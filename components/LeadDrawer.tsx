"use client";

import { useEffect, useState } from "react";
import type { Activity, Lead } from "@/lib/types";
import { STAGES, STAGE_IDS } from "@/lib/stages";
import { addDays, prettyDate } from "@/lib/dates";
import { api, copyText } from "@/lib/client";
import { ghlAction } from "@/lib/ghl-client";
import { useSetlo } from "./AppShell";
import { Icon } from "./Icons";

const ACT_ICON: Record<string, string> = {
  created: "plus", stage_change: "board", note: "clip", follow_up: "clock", edit: "check", ai_draft: "sparkle", call_notes: "mic", ghl: "send",
};

export default function LeadDrawer({ id, onClose }: { id: number; onClose: () => void }) {
  const { setLeads, toast, bumpOkr, settings } = useSetlo();
  const [lead, setLead] = useState<Lead | null>(null);
  const [acts, setActs] = useState<Activity[]>([]);
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState("follow-up");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ lead: Lead; activities: Activity[] }>(`/api/leads/${id}`)
      .then((r) => { setLead(r.lead); setActs(r.activities); })
      .catch(() => onClose());
  }, [id, onClose]);

  const patch = async (data: Partial<Lead>) => {
    const r = await api<{ lead: Lead; activities: Activity[] }>(`/api/leads/${id}`, { method: "PATCH", json: data });
    setLead(r.lead);
    setActs(r.activities);
    setLeads((ls) => ls.map((l) => (l.id === id ? r.lead : l)));
    if ("stage" in data || "cash_value" in data) bumpOkr();
  };

  const addNote = async (text = note) => {
    if (!text.trim()) return;
    const r = await api<{ activities: Activity[] }>(`/api/leads/${id}/notes`, { method: "POST", json: { text } });
    setActs(r.activities);
    setNote("");
  };

  const aiDraft = async () => {
    setBusy(true);
    try {
      const r = await api<{ text: string; ai: boolean }>("/api/ai/draft", { method: "POST", json: { leadId: id, kind } });
      setDraft(r.text);
      if (!r.ai) toast("Template draft (add ANTHROPIC_API_KEY for AI)");
      else api<{ lead: Lead; activities: Activity[] }>(`/api/leads/${id}`).then((x) => setActs(x.activities));
    } catch (e) { toast((e as Error).message); }
    setBusy(false);
  };

  const del = async () => {
    if (!confirm("Delete this lead?")) return;
    await api(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((ls) => ls.filter((l) => l.id !== id));
    bumpOkr();
    onClose();
  };

  const lastNote = acts.find((a) => a.type === "note" || a.type === "call_notes")?.body ?? "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onMouseDown={onClose}>
      <div className="flex h-full w-full max-w-md flex-col border-l border-line bg-bg shadow-soft" onMouseDown={(e) => e.stopPropagation()}>
        {!lead ? <div className="p-6 text-sm text-muted">Loading…</div> : (
          <>
            <div className="flex items-start justify-between border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{lead.first_name} {lead.last_name}</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: STAGES[lead.stage].dot }} /> {STAGES[lead.stage].label}
                  {lead.phone && <button className="hover:text-accent" onClick={() => copyText(lead.phone).then(() => toast("Phone copied"))}>· {lead.phone}</button>}
                </div>
              </div>
              <button onClick={onClose} className="btn-ghost !p-1.5"><Icon name="x" /></button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <section className="grid grid-cols-2 gap-3">
                <Field label="First name" value={lead.first_name} onSave={(v) => patch({ first_name: v })} />
                <Field label="Last name" value={lead.last_name} onSave={(v) => patch({ last_name: v })} />
                <Field label="Phone" value={lead.phone} onSave={(v) => patch({ phone: v })} />
                <Field label="Email" value={lead.email} onSave={(v) => patch({ email: v })} />
                <div>
                  <label className="label">Stage</label>
                  <select className="input" value={lead.stage} onChange={(e) => patch({ stage: e.target.value as Lead["stage"] })}>
                    {STAGE_IDS.map((s) => <option key={s} value={s}>{STAGES[s].label}</option>)}
                  </select>
                </div>
                <Field label="Cash value ($)" value={String(lead.cash_value)} onSave={(v) => patch({ cash_value: Number(v) || 0 })} />
                <div className="col-span-2"><Field label="Source tool" value={lead.source_tool} onSave={(v) => patch({ source_tool: v })} /></div>
              </section>

              <section>
                <label className="label">Next follow-up · {prettyDate(lead.next_follow_up)}</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <input type="date" className="input !w-40" value={lead.next_follow_up ?? ""} onChange={(e) => patch({ next_follow_up: e.target.value || null })} />
                  {[["Today", 0], ["+1d", 1], ["+3d", 3], ["+1w", 7]].map(([l, n]) => (
                    <button key={l} className="btn-outline !px-2 !py-1 text-xs" onClick={() => patch({ next_follow_up: addDays(n as number) })}>{l}</button>
                  ))}
                  <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => patch({ next_follow_up: null })}>Clear</button>
                </div>
              </section>

              <section>
                <label className="label">Add note</label>
                <textarea className="input min-h-[72px]" placeholder="What happened? (⌘/Ctrl+Enter to save)" value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addNote(); }} />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn-primary" disabled={!note.trim()} onClick={() => addNote()}>Save note</button>
                  <button className="btn-outline" disabled={!lastNote} onClick={async () => toast(await ghlAction("pushNote", id, lastNote))}>
                    <Icon name="send" /> Latest note → GHL
                  </button>
                  <button className="btn-outline" onClick={async () => toast(await ghlAction("updateStage", id))}>Stage → GHL</button>
                </div>
              </section>

              <section className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center gap-2">
                  <Icon name="sparkle" className="text-accent" />
                  <span className="text-sm font-medium">Message writer</span>
                  <span className="text-[11px] text-muted">{settings?.integrations.anthropic ? "Claude" : "template mode"}</span>
                  <select className="input ml-auto !w-auto !py-1 text-xs" value={kind} onChange={(e) => setKind(e.target.value)}>
                    <option value="follow-up">Follow-up</option>
                    <option value="nurture">Nurture</option>
                    <option value="no-show rebook">No-show rebook</option>
                    <option value="booking">Booking push</option>
                    <option value="payment failed recovery">Payment failed</option>
                  </select>
                </div>
                {draft && <textarea className="input mt-3 min-h-[90px]" value={draft} onChange={(e) => setDraft(e.target.value)} />}
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline" disabled={busy} onClick={aiDraft}>{busy ? "Drafting…" : draft ? "Redraft" : "Draft text"}</button>
                  {draft && <button className="btn-primary" onClick={() => copyText(draft).then(() => toast("Copied"))}><Icon name="copy" /> Copy</button>}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold">Activity</h3>
                <ol className="relative space-y-3 border-l border-line pl-4">
                  {acts.map((a) => (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[25px] top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-line bg-bg text-muted">
                        <Icon name={ACT_ICON[a.type] ?? "check"} size={10} />
                      </span>
                      <div className="whitespace-pre-wrap text-sm">{a.body}</div>
                      <div className="text-[11px] text-muted">{new Date(a.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <div className="flex justify-between border-t border-line px-5 py-3">
              <button className="btn-ghost text-danger" onClick={del}><Icon name="trash" /> Delete</button>
              <button className="btn-outline" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={v} onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== value && onSave(v)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
    </div>
  );
}
