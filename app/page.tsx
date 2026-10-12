"use client";

import { useState } from "react";
import { LANES, STAGES, type StageId } from "@/lib/stages";
import { BRAND } from "@/lib/brand";
import { api, money } from "@/lib/client";
import type { Lead } from "@/lib/types";
import { useSetlo } from "@/components/AppShell";
import OkrHeader from "@/components/OkrHeader";
import LeadCard from "@/components/LeadCard";
import { Icon } from "@/components/Icons";

export default function PipelinePage() {
  const { leads, setLeads, openLead, toast, bumpOkr } = useSetlo();
  const [over, setOver] = useState<StageId | null>(null);
  const [q, setQ] = useState("");

  const visible = q
    ? leads.filter((l) => `${l.first_name} ${l.last_name} ${l.phone} ${l.email} ${l.source_tool}`.toLowerCase().includes(q.toLowerCase()))
    : leads;

  const move = async (id: number, stage: StageId) => {
    const prev = leads.find((l) => l.id === id);
    if (!prev || prev.stage === stage) return;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)));
    try {
      const r = await api<{ lead: Lead }>(`/api/leads/${id}`, { method: "PATCH", json: { stage } });
      setLeads((ls) => ls.map((l) => (l.id === id ? r.lead : l)));
      toast(`${prev.first_name} → ${STAGES[stage].label}`);
      bumpOkr();
    } catch (e) {
      setLeads((ls) => ls.map((l) => (l.id === id ? prev : l)));
      toast((e as Error).message);
    }
  };

  const newLead = async () => {
    const lead = await api<Lead>("/api/leads", { method: "POST", json: { first_name: "New", last_name: "Lead", source_tool: "Manual" } });
    setLeads((ls) => [...ls, lead]);
    openLead(lead.id);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{BRAND.modules.pipeline}</h1>
          <p className="text-sm text-muted">Drag cards between stages. Click a card to open it.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon name="search" className="absolute left-2.5 top-2.5 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter leads" className="input !w-52 !pl-8" />
          </div>
          <button onClick={newLead} className="btn-primary"><Icon name="plus" /> New lead</button>
        </div>
      </div>

      <OkrHeader />

      <div className="space-y-6">
        {LANES.map((lane) => {
          const laneLeads = visible.filter((l) => lane.stages.includes(l.stage));
          return (
            <section key={lane.id}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{lane.label}</h2>
                <span className="text-xs text-muted">{laneLeads.length} · {money(laneLeads.reduce((s, l) => s + l.cash_value, 0))}</span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${lane.stages.length}, minmax(220px, 1fr))`, overflowX: "auto" }}>
                {lane.stages.map((sid) => {
                  const col = visible.filter((l) => l.stage === sid);
                  return (
                    <div key={sid}
                      onDragOver={(e) => { e.preventDefault(); setOver(sid); }}
                      onDragLeave={() => setOver((o) => (o === sid ? null : o))}
                      onDrop={(e) => { e.preventDefault(); setOver(null); move(Number(e.dataTransfer.getData("text/lead")), sid); }}
                      className={`flex min-h-[140px] flex-col rounded-xl border p-2 transition-colors ${over === sid ? "border-accent bg-accent-soft" : "border-transparent bg-surface-2/70"}`}>
                      <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <span className="h-2 w-2 rounded-full" style={{ background: STAGES[sid].dot }} />{STAGES[sid].label}
                        </span>
                        <span className="text-[11px] tabular-nums text-muted">{col.length} · {money(col.reduce((s, l) => s + l.cash_value, 0))}</span>
                      </div>
                      <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
                        {col.map((l) => (
                          <LeadCard key={l.id} lead={l} onOpen={() => openLead(l.id)}
                            onDragStart={(e) => { e.dataTransfer.setData("text/lead", String(l.id)); e.dataTransfer.effectAllowed = "move"; }} />
                        ))}
                        {!col.length && <div className="px-2 py-6 text-center text-xs text-muted">Drop leads here</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
