"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import { useSetlo } from "@/components/AppShell";
import { Icon } from "@/components/Icons";

export default function DataPage() {
  const { settings, refreshSettings, refreshLeads, toast, bumpOkr } = useSetlo();
  const [csv, setCsv] = useState("");
  const [name, setName] = useState<string | null>(null);

  const importCsv = async (text: string) => {
    try {
      const r = await api<{ imported: number; skipped: number }>("/api/csv", { method: "POST", body: text, headers: { "content-type": "text/csv" } });
      toast(`Imported ${r.imported} leads${r.skipped ? ` (${r.skipped} skipped)` : ""}`);
      setCsv("");
      refreshLeads();
      bumpOkr();
    } catch (e) { toast((e as Error).message); }
  };

  const saveName = async () => {
    if (name === null) return;
    await api("/api/settings", { method: "PUT", json: { my_name: name } });
    await refreshSettings();
    setName(null);
    toast("Saved");
  };

  const int = settings?.integrations;
  const rows: [string, boolean | undefined, string][] = [
    ["Claude (ANTHROPIC_API_KEY)", int?.anthropic, "Message writer + structured call notes. Off → templates and basic extraction."],
    ["Deepgram (DEEPGRAM_API_KEY)", int?.deepgram, "Audio transcription. Off → paste a transcript."],
    ["GoHighLevel (GHL_API_TOKEN + GHL_LOCATION_ID)", int?.ghl, "Adapter is stubbed. Buttons copy to clipboard until implemented."],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">Data & settings</h1>

      <section className="card p-4">
        <h2 className="mb-1 text-sm font-semibold">Leads CSV</h2>
        <p className="mb-3 text-xs text-muted">Columns: first_name, last_name, phone, email, stage, cash_value, next_follow_up (YYYY-MM-DD), source_tool. Headers are matched loosely; “Name” is split.</p>
        <div className="flex flex-wrap gap-2">
          <a className="btn-outline" href="/api/csv"><Icon name="download" size={14} /> Export CSV</a>
          <label className="btn-primary cursor-pointer">
            <Icon name="upload" size={14} /> Import CSV file
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) importCsv(await f.text()); e.target.value = ""; }} />
          </label>
        </div>
        <textarea className="input mt-3 min-h-[90px] font-mono text-xs" placeholder={"…or paste CSV here\nfirst_name,last_name,phone,stage\nJane,Doe,555-0100,Booked"} value={csv} onChange={(e) => setCsv(e.target.value)} />
        {csv.trim() && <button className="btn-outline mt-2" onClick={() => importCsv(csv)}>Import pasted CSV</button>}
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold">You</h2>
        <label className="label">Your name (fills {"{my_name}"} in snippets)</label>
        <div className="flex gap-2">
          <input className="input" value={name ?? settings?.my_name ?? ""} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary" disabled={name === null} onClick={saveName}>Save</button>
        </div>
        <p className="mt-2 text-xs text-muted">Workspace: <code>{settings?.workspace_id}</code></p>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold">Integrations</h2>
        <div className="space-y-3">
          {rows.map(([label, on, desc]) => (
            <div key={label} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${on ? "bg-green-500" : "bg-zinc-400"}`} />
              <div>
                <div className="text-sm">{label} <span className="text-xs text-muted">{on ? "configured" : "not set"}</span></div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="chip">Database: {settings?.database === "postgres" ? "Supabase / Postgres" : "local SQLite"}</span>
          <span className="chip">Password gate: {settings?.auth ? "on" : "off"}</span>
        </div>
        <p className="mt-3 text-xs text-muted">Locally: set keys in <code>.env</code> and restart. On Vercel: Project → Settings → Environment Variables, then redeploy.</p>
      </section>

      <section className="card p-4">
        <h2 className="mb-2 text-sm font-semibold">Chrome extension</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Open <code>chrome://extensions</code> and enable Developer mode.</li>
          <li>Click “Load unpacked” and pick the <code>extension/</code> folder.</li>
          <li>Open the extension, expand <b>Settings</b> and enter this app&apos;s URL (<code>{typeof window !== "undefined" ? window.location.origin : ""}</code>){settings?.auth ? " and your Setlo password" : ""}.</li>
          <li><span className="kbd">Alt ⇧ K</span> opens the snippet deck, <span className="kbd">Alt ⇧ S</span> saves the selection as a snippet, <span className="kbd">Alt ⇧ N</span> saves it as a note on the active lead.</li>
        </ol>
      </section>
    </div>
  );
}
