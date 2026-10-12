"use client";

import type { Lead } from "@/lib/types";
import { STAGES } from "@/lib/stages";
import { money } from "@/lib/client";
import { prettyDate, ymd } from "@/lib/dates";

export function followTone(d: string | null) {
  if (!d) return "text-muted";
  const t = ymd();
  return d < t ? "text-danger" : d === t ? "text-accent" : "text-muted";
}

export default function LeadCard({ lead, onOpen, onDragStart }: { lead: Lead; onOpen: () => void; onDragStart?: (e: React.DragEvent) => void }) {
  const st = STAGES[lead.stage];
  return (
    <div draggable onDragStart={onDragStart} onClick={onOpen}
      className="group cursor-grab rounded-lg border border-line bg-surface p-3 shadow-soft transition hover:border-accent/60 active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <div className="truncate text-sm font-medium">{lead.first_name} {lead.last_name}</div>
        <div className="shrink-0 text-sm font-semibold tabular-nums">{money(lead.cash_value)}</div>
      </div>
      <div className="mt-0.5 text-xs text-muted tabular-nums">{lead.phone || "No phone"}</div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="chip"><span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />{st.label}</span>
        {lead.source_tool && <span className="chip">{lead.source_tool}</span>}
      </div>
      <div className={`mt-2 text-xs ${followTone(lead.next_follow_up)}`}>
        Follow-up: {prettyDate(lead.next_follow_up)}
      </div>
    </div>
  );
}
