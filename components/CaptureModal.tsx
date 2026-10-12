"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { useSetlo } from "./AppShell";
import { Icon } from "./Icons";

// Grabs the current selection (or clipboard) and saves it as a snippet or as a note on the active lead.
export default function CaptureModal({ initial, onDone }: { initial: string; onDone: () => void }) {
  const { activeLead, toast } = useSetlo();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Captured");
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (initial) { setText(initial); setSrc("selection"); return; }
    navigator.clipboard?.readText().then((t) => { if (t.trim()) { setText(t.trim()); setSrc("clipboard"); } }).catch(() => {});
  }, [initial]);

  const save = async (target: "snippet" | "note") => {
    try {
      const r = await api<{ saved: string; lead?: string }>("/api/capture", {
        method: "POST", json: { text, target, title: title || undefined, category, leadId: activeLead?.id },
      });
      toast(r.saved === "note" ? `Note added to ${r.lead}` : "Saved to snippets");
      onDone();
    } catch (e) { toast((e as Error).message); }
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="clip" className="text-accent" />
        <h3 className="text-sm font-semibold">Capture</h3>
        <span className="text-[11px] text-muted">{src ? `from ${src}` : "paste or type below"}</span>
      </div>
      <textarea autoFocus className="input min-h-[120px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text to capture…"
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save(activeLead ? "note" : "snippet"); }} />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input className="input" placeholder="Snippet title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="input" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-primary" disabled={!text.trim()} onClick={() => save("snippet")}><Icon name="bolt" size={14} /> Save as snippet</button>
        <button className="btn-outline" disabled={!text.trim() || !activeLead} onClick={() => save("note")}>
          <Icon name="clip" size={14} /> {activeLead ? `Note on ${activeLead.first_name} ${activeLead.last_name}` : "Open a lead to add a note"}
        </button>
      </div>
    </div>
  );
}
