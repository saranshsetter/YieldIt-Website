"use client";

import { useEffect, useState } from "react";
import type { CallNote, StructuredNotes } from "@/lib/types";
import { BRAND } from "@/lib/brand";
import { api, copyText } from "@/lib/client";
import { ghlAction } from "@/lib/ghl-client";
import { useSetlo } from "@/components/AppShell";
import { Icon } from "@/components/Icons";

const EMPTY: StructuredNotes = { summary: "", objections: "", commitments: "", next_step: "", resources: "" };
const FIELDS: [keyof StructuredNotes, string, number][] = [
  ["summary", "Summary", 4], ["objections", "Objections", 3], ["commitments", "Commitments", 3], ["next_step", "Next step", 2], ["resources", "Resources to send", 3],
];

function notesText(n: StructuredNotes, name?: string) {
  return [
    name ? `Call notes — ${name}` : "Call notes",
    `\nSUMMARY\n${n.summary}`,
    n.objections && `\nOBJECTIONS\n${n.objections}`,
    n.commitments && `\nCOMMITMENTS\n${n.commitments}`,
    n.next_step && `\nNEXT STEP\n${n.next_step}`,
    n.resources && `\nRESOURCES TO SEND\n${n.resources}`,
  ].filter(Boolean).join("\n").trim();
}

export default function NotesPage() {
  const { leads, activeLead, settings, toast } = useSetlo();
  const [leadId, setLeadId] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState<StructuredNotes | null>(null);
  const [busy, setBusy] = useState<"" | "transcribe" | "structure" | "draft">("");
  const [draft, setDraft] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [history, setHistory] = useState<(CallNote & { lead_name: string | null })[]>([]);

  useEffect(() => { if (activeLead && leadId === null) setLeadId(activeLead.id); }, [activeLead, leadId]);
  const loadHistory = () => api<(CallNote & { lead_name: string | null })[]>("/api/notes").then(setHistory);
  useEffect(() => { loadHistory(); }, []);

  const lead = leads.find((l) => l.id === leadId);
  const name = lead ? `${lead.first_name} ${lead.last_name}` : undefined;
  const hasDg = settings?.integrations.deepgram;
  const hasAi = settings?.integrations.anthropic;

  const upload = async (f: File) => {
    setBusy("transcribe");
    try {
      const fd = new FormData();
      fd.append("audio", f);
      const r = await api<{ transcript: string }>("/api/notes/transcribe", { method: "POST", body: fd });
      setTranscript(r.transcript);
      toast("Transcribed");
    } catch (e) { toast((e as Error).message); }
    setBusy("");
  };

  const fromUrl = async () => {
    if (!audioUrl.trim()) return;
    setBusy("transcribe");
    try {
      const r = await api<{ transcript: string }>("/api/notes/transcribe", { method: "POST", json: { url: audioUrl.trim() } });
      setTranscript(r.transcript);
      toast("Transcribed");
    } catch (e) { toast((e as Error).message); }
    setBusy("");
  };

  const structure = async () => {
    setBusy("structure");
    try {
      const r = await api<{ notes: StructuredNotes; ai: boolean }>("/api/notes/structure", { method: "POST", json: { transcript, leadId } });
      setNotes(r.notes);
      if (!r.ai) toast("Basic extraction — add ANTHROPIC_API_KEY for AI notes");
    } catch (e) { toast((e as Error).message); }
    setBusy("");
  };

  const save = async () => {
    if (!notes) return;
    await api("/api/notes", { method: "POST", json: { ...notes, transcript, lead_id: leadId } });
    toast(lead ? `Saved to ${lead.first_name}'s timeline` : "Notes saved");
    loadHistory();
  };

  const copyForGhl = async () => {
    if (!notes) return;
    const text = notesText(notes, name);
    if (lead && settings?.integrations.ghl) toast(await ghlAction("pushNote", lead.id, text));
    else { await copyText(text); toast("Notes copied — paste into GHL"); }
  };

  const draftFollowUp = async () => {
    if (!notes) return;
    setBusy("draft");
    try {
      const r = await api<{ text: string }>("/api/ai/draft", {
        method: "POST",
        json: { leadId, kind: "post-call follow-up", extra: `Call summary: ${notes.summary}\nNext step: ${notes.next_step}\nResources to send: ${notes.resources}` },
      });
      setDraft(r.text);
    } catch (e) { toast((e as Error).message); }
    setBusy("");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{BRAND.modules.notes}</h1>
          <p className="text-sm text-muted">Call audio or transcript → clean CRM notes. Edit before saving.</p>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="chip"><span className={`h-1.5 w-1.5 rounded-full ${hasDg ? "bg-green-500" : "bg-zinc-400"}`} />Deepgram {hasDg ? "on" : "off"}</span>
          <span className="chip"><span className={`h-1.5 w-1.5 rounded-full ${hasAi ? "bg-green-500" : "bg-zinc-400"}`} />Claude {hasAi ? "on" : "off"}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-4">
          <div>
            <label className="label">Lead</label>
            <select className="input" value={leadId ?? ""} onChange={(e) => setLeadId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">No lead</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
            </select>
          </div>
          {hasDg ? (
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted hover:border-accent hover:text-fg">
              <Icon name="upload" size={20} />
              {busy === "transcribe" ? "Transcribing…" : "Upload call audio (mp3, m4a, wav…)"}
              <span className="text-[11px]">Up to ~4MB when deployed. Bigger? Use a recording link below.</span>
              <input type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          ) : null}
          {hasDg ? (
            <div className="flex gap-2">
              <input className="input" placeholder="…or paste a recording URL (GHL, Zoom, Drive public link)" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} />
              <button className="btn-outline shrink-0" disabled={!audioUrl.trim() || !!busy} onClick={fromUrl}>Transcribe</button>
            </div>
          ) : (
            <div className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">Audio upload needs <code>DEEPGRAM_API_KEY</code>. Paste a transcript below instead.</div>
          )}
          <div>
            <label className="label">Transcript</label>
            <textarea className="input min-h-[260px] font-mono text-xs" placeholder="Paste the call transcript here…" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={!transcript.trim() || !!busy} onClick={structure}>
            <Icon name="sparkle" size={14} /> {busy === "structure" ? "Writing notes…" : "Generate notes"}
          </button>
        </div>

        <div className="card space-y-3 p-4">
          {!notes ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-muted">Structured notes appear here.</div>
          ) : (
            <>
              {FIELDS.map(([k, label, rows]) => (
                <div key={k}>
                  <label className="label">{label}</label>
                  <textarea className="input" rows={rows} value={notes[k]} onChange={(e) => setNotes({ ...notes, [k]: e.target.value })} />
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="btn-primary" onClick={save}><Icon name="check" size={14} /> Save{lead ? ` to ${lead.first_name}` : ""}</button>
                <button className="btn-outline" onClick={copyForGhl}><Icon name="copy" size={14} /> Copy notes for GHL</button>
                <button className="btn-outline" disabled={busy === "draft"} onClick={draftFollowUp}><Icon name="send" size={14} /> {busy === "draft" ? "Drafting…" : "Draft follow-up text"}</button>
                <button className="btn-ghost" onClick={() => setNotes(EMPTY)}>Clear</button>
              </div>
              {draft && (
                <div className="rounded-lg border border-line p-3">
                  <textarea className="input min-h-[80px]" value={draft} onChange={(e) => setDraft(e.target.value)} />
                  <button className="btn-primary mt-2" onClick={() => copyText(draft).then(() => toast("Copied"))}><Icon name="copy" size={14} /> Copy text</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!!history.length && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold">Recent notes</h2>
          <div className="card divide-y divide-line">
            {history.map((h) => (
              <button key={h.id} className="block w-full px-4 py-3 text-left hover:bg-surface-2/60"
                onClick={() => { setNotes(h); setTranscript(h.transcript); setLeadId(h.lead_id); setDraft(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <div className="text-sm font-medium">{h.lead_name ?? "No lead"} <span className="font-normal text-muted">· {new Date(h.created_at).toLocaleString()}</span></div>
                <div className="line-clamp-1 text-xs text-muted">{h.summary}</div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
