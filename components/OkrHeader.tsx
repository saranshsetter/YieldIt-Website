"use client";

import { useEffect, useState } from "react";
import { api, money } from "@/lib/client";
import { useSetlo } from "./AppShell";

type Okr = { sets: number; booked: number; closed: number; cash: number; goals: { weekly_sets: number; monthly_closes: number; monthly_cash: number } };

export default function OkrHeader() {
  const { okrTick, leads } = useSetlo();
  const [o, setO] = useState<Okr | null>(null);
  const [editing, setEditing] = useState<keyof Okr["goals"] | null>(null);

  useEffect(() => { api<Okr>("/api/okr").then(setO).catch(() => {}); }, [okrTick, leads]);

  const saveGoal = async (k: keyof Okr["goals"], v: string) => {
    setEditing(null);
    setO(await api<Okr>("/api/okr", { method: "PUT", json: { [k]: Number(v.replace(/[^0-9.]/g, "")) } }));
  };

  if (!o) return <div className="mb-6 grid h-[92px] grid-cols-2 gap-3 lg:grid-cols-4" />;

  const tiles: { label: string; value: string; goal?: { key: keyof Okr["goals"]; v: number; fmt: (n: number) => string }; pct?: number; hint: string }[] = [
    { label: "Sets this week", value: String(o.sets), goal: { key: "weekly_sets", v: o.goals.weekly_sets, fmt: String }, pct: o.sets / (o.goals.weekly_sets || 1), hint: "Leads moved to Booked since Monday" },
    { label: "Booked", value: String(o.booked), hint: "Upcoming calls (Booked + Rescheduled)" },
    { label: "Closed this month", value: String(o.closed), goal: { key: "monthly_closes", v: o.goals.monthly_closes, fmt: String }, pct: o.closed / (o.goals.monthly_closes || 1), hint: "Closed Won this month" },
    { label: "Cash collected", value: money(o.cash), goal: { key: "monthly_cash", v: o.goals.monthly_cash, fmt: money }, pct: o.cash / (o.goals.monthly_cash || 1), hint: "Closed Won value this month" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="card px-4 py-3" title={t.hint}>
          <div className="text-xs text-muted">{t.label}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-semibold tabular-nums">{t.value}</span>
            {t.goal && (editing === t.goal.key ? (
              <input autoFocus defaultValue={t.goal.v} className="input !w-24 !px-2 !py-0.5 text-xs"
                onBlur={(e) => saveGoal(t.goal!.key, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditing(null); }} />
            ) : (
              <button onClick={() => setEditing(t.goal!.key)} className="text-xs text-muted hover:text-accent" title="Edit goal">
                / {t.goal.fmt(t.goal.v)}
              </button>
            ))}
          </div>
          {t.pct !== undefined && (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, t.pct * 100)}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
