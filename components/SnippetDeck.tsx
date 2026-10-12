"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Snippet } from "@/lib/types";
import { fillSnippet, VARIABLES } from "@/lib/fill";
import { api, copyText } from "@/lib/client";
import { useSetlo } from "./AppShell";
import { Icon } from "./Icons";

type Draft = { id?: number; title: string; body: string; category: string };
const EMPTY: Draft = { title: "", body: "", category: "" };

export default function SnippetDeck({ mode, onDone }: { mode: "modal" | "page"; onDone?: () => void }) {
  const { leads, activeLead, settings, toast } = useSetlo();
  const [snips, setSnips] = useState<Snippet[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sel, setSel] = useState(0);
  const [leadId, setLeadId] = useState<number | null>(activeLead?.id ?? null);
  const [form, setForm] = useState<Draft | null>(null);
  const [aiKind, setAiKind] = useState("follow-up");
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const load = () => api<Snippet[]>("/api/snippets").then(setSnips);
  useEffect(() => { load(); }, []);
  useEffect(() => { if (activeLead && leadId === null) setLeadId(activeLead.id); }, [activeLead, leadId]);

  const lead = leads.find((l) => l.id === leadId) ?? null;
  const cats = useMemo(() => ["All", ...Array.from(new Set(snips.map((s) => s.category)))], [snips]);
  const shown = snips.filter((s) =>
    (cat === "All" || s.category === cat) && `${s.title} ${s.body} ${s.category}`.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => setSel(0), [q, cat]);

  const use = async (s: Snippet) => {
    await copyText(fillSnippet(s.body, lead, settings?.my_name));
    toast(`Copied “${s.title}”${lead ? ` for ${lead.first_name}` : ""}`);
    api(`/api/snippets/${s.id}`, { method: "PATCH", json: { used: true } });
    setSnips((xs) => xs.map((x) => (x.id === s.id ? { ...x, uses: x.uses + 1 } : x)));
    onDone?.();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((i) => Math.min(i + 1, shown.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); use(shown[sel]); }
    else return;
    requestAnimationFrame(() => listRef.current?.querySelector(`[data-i="${Math.max(0, sel)}"]`)?.scrollIntoView({ block: "nearest" }));
  };

  const save = async () => {
    if (!form?.body.trim()) return;
    if (form.id) await api(`/api/snippets/${form.id}`, { method: "PATCH", json: form });
    else await api("/api/snippets", { method: "POST", json: form });
    setForm(null);
    load();
    toast("Snippet saved");
  };
  const remove = async (s: Snippet) => {
    if (!confirm(`Delete “${s.title}”?`)) return;
    await api(`/api/snippets/${s.id}`, { method: "DELETE" });
    load();
  };

  const draftAi = async () => {
    setAiBusy(true);
    try {
      const r = await api<{ text: string; ai: boolean }>("/api/ai/draft", { method: "POST", json: { leadId, kind: aiKind } });
      setAiText(r.text);
      if (!r.ai) toast("Template draft — add ANTHROPIC_API_KEY for AI");
    } catch (e) { toast((e as Error).message); }
    setAiBusy(false);
  };

  const modal = mode === "modal";

  return (
    <div className={modal ? "" : "grid gap-6 lg:grid-cols-[1fr_340px]"}>
      <div className={modal ? "" : "card overflow-hidden"}>
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Icon name="search" className="text-muted" />
          <input autoFocus className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" placeholder="Search snippets…"
            value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
          <select className="input !w-auto max-w-[170px] !py-1 text-xs" value={leadId ?? ""} onChange={(e) => setLeadId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">No lead</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
          </select>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${cat === c ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2"}`}>{c}</button>
          ))}
        </div>
        <div ref={listRef} className={`overflow-y-auto ${modal ? "max-h-[50vh]" : "max-h-[65vh]"}`}>
          {shown.map((s, i) => (
            <div key={s.id} data-i={i} onMouseEnter={() => setSel(i)}
              className={`group flex cursor-pointer items-start gap-3 px-4 py-3 ${i === sel ? "bg-surface-2" : ""}`} onClick={() => use(s)}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.title}</span>
                  <span className="chip">{s.category}</span>
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-muted">{fillSnippet(s.body, lead, settings?.my_name)}</div>
              </div>
              {!modal && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setForm({ id: s.id, title: s.title, body: s.body, category: s.category })}>Edit</button>
                  <button className="btn-ghost !p-1.5 text-danger" onClick={() => remove(s)}><Icon name="trash" size={14} /></button>
                </div>
              )}
              <Icon name="copy" className={`mt-1 text-muted ${i === sel ? "opacity-100" : "opacity-0"}`} />
            </div>
          ))}
          {!shown.length && <div className="px-4 py-10 text-center text-sm text-muted">No snippets match.</div>}
        </div>
        {modal && (
          <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[11px] text-muted">
            <span>{lead ? <>Filling for <b className="text-fg">{lead.first_name} {lead.last_name}</b></> : "No lead selected — variables stay as {placeholders}"}</span>
            <span><span className="kbd">↑↓</span> <span className="kbd">↵</span> copy · <span className="kbd">esc</span></span>
          </div>
        )}
      </div>

      {!modal && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{form?.id ? "Edit snippet" : "New snippet"}</h3>
              {!form && <button className="btn-primary !py-1 text-xs" onClick={() => setForm(EMPTY)}><Icon name="plus" size={14} /> New</button>}
            </div>
            {form ? (
              <div className="space-y-2">
                <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <input className="input" placeholder="Category (e.g. Booking)" list="snip-cats" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <datalist id="snip-cats">{cats.slice(1).map((c) => <option key={c} value={c} />)}</datalist>
                <textarea className="input min-h-[120px]" placeholder="Hey {first_name}…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                <div className="flex flex-wrap gap-1">
                  {VARIABLES.map((v) => (
                    <button key={v} className="chip hover:border-accent hover:text-accent" onClick={() => setForm({ ...form, body: `${form.body}{${v}}` })}>{`{${v}}`}</button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="btn-primary" onClick={save}>Save</button>
                  <button className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">Use variables like <code>{"{first_name}"}</code>. Press <span className="kbd">⌘/Ctrl ⇧ S</span> anywhere to capture selected or copied text as a snippet.</p>
            )}
          </div>

          <div className="card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="sparkle" className="text-accent" />
              <h3 className="text-sm font-semibold">Message writer</h3>
              <span className="text-[11px] text-muted">{settings?.integrations.anthropic ? "Claude" : "template mode"}</span>
            </div>
            <div className="flex gap-2">
              <select className="input !py-1.5 text-xs" value={aiKind} onChange={(e) => setAiKind(e.target.value)}>
                <option value="follow-up">Follow-up</option>
                <option value="nurture">Nurture</option>
                <option value="no-show rebook">No-show rebook</option>
                <option value="booking">Booking push</option>
              </select>
              <button className="btn-outline shrink-0" disabled={aiBusy} onClick={draftAi}>{aiBusy ? "…" : "Draft"}</button>
            </div>
            <p className="mt-2 text-[11px] text-muted">{lead ? `Uses ${lead.first_name}'s stage and recent activity.` : "Pick a lead above for context."}</p>
            {aiText && (
              <>
                <textarea className="input mt-3 min-h-[100px]" value={aiText} onChange={(e) => setAiText(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <button className="btn-primary" onClick={() => copyText(aiText).then(() => toast("Copied"))}><Icon name="copy" size={14} /> Copy</button>
                  <button className="btn-outline" onClick={() => setForm({ title: `${aiKind} draft`, body: aiText, category: "AI drafts" })}>Save as snippet</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
