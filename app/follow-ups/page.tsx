"use client";

import type { Lead } from "@/lib/types";
import { CLOSED, STAGES } from "@/lib/stages";
import { addDays, prettyDate, ymd } from "@/lib/dates";
import { api, copyText, money } from "@/lib/client";
import { useSetlo } from "@/components/AppShell";
import OkrHeader from "@/components/OkrHeader";
import { followTone } from "@/components/LeadCard";
import { Icon } from "@/components/Icons";

export default function FollowUpsPage() {
  const { leads, setLeads, openLead, toast, openDeck } = useSetlo();
  const today = ymd();
  const open = leads.filter((l) => l.next_follow_up && !CLOSED.includes(l.stage));
  const byDate = (a: Lead, b: Lead) => a.next_follow_up!.localeCompare(b.next_follow_up!) || b.cash_value - a.cash_value;
  const overdue = open.filter((l) => l.next_follow_up! < today).sort(byDate);
  const due = open.filter((l) => l.next_follow_up === today).sort(byDate);
  const soon = open.filter((l) => l.next_follow_up! > today && l.next_follow_up! <= addDays(7)).sort(byDate);
  const noDate = leads.filter((l) => !l.next_follow_up && !CLOSED.includes(l.stage));

  const snooze = async (l: Lead, days: number) => {
    const r = await api<{ lead: Lead }>(`/api/leads/${l.id}`, { method: "PATCH", json: { next_follow_up: addDays(days) } });
    setLeads((ls) => ls.map((x) => (x.id === l.id ? r.lead : x)));
    toast(`${l.first_name}: next follow-up ${prettyDate(r.lead.next_follow_up)}`);
  };

  const Row = ({ l }: { l: Lead }) => (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
      <button onClick={() => openLead(l.id)} className="min-w-0 flex-1 text-left">
        <div className="truncate text-sm font-medium">{l.first_name} {l.last_name}</div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: STAGES[l.stage].dot }} />
          {STAGES[l.stage].label} · {l.source_tool} · {money(l.cash_value)}
        </div>
      </button>
      <div className={`w-24 text-xs ${followTone(l.next_follow_up)}`}>{prettyDate(l.next_follow_up)}</div>
      <div className="flex gap-1">
        {l.phone && <button className="btn-ghost !p-1.5" title="Copy phone" onClick={() => copyText(l.phone).then(() => toast("Phone copied"))}><Icon name="phone" /></button>}
        <button className="btn-ghost !p-1.5" title="Snippets for this lead (⌘K)" onClick={() => { openLead(l.id); openDeck(); }}><Icon name="bolt" /></button>
        <button className="btn-outline !px-2 !py-1 text-xs" onClick={() => snooze(l, 1)}>Done · +1d</button>
        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => snooze(l, 3)}>+3d</button>
        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => snooze(l, 7)}>+1w</button>
      </div>
    </div>
  );

  const Group = ({ title, items, tone = "" }: { title: string; items: Lead[]; tone?: string }) =>
    items.length ? (
      <section className="mb-6">
        <h2 className={`mb-2 text-sm font-semibold ${tone}`}>{title} <span className="font-normal text-muted">· {items.length}</span></h2>
        <div className="card divide-y divide-line overflow-hidden">{items.map((l) => <Row key={l.id} l={l} />)}</div>
      </section>
    ) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Follow up today</h1>
        <p className="text-sm text-muted">{overdue.length + due.length} to touch today · overdue first. Closed leads are hidden.</p>
      </div>
      <OkrHeader />
      {!overdue.length && !due.length && <div className="card mb-6 px-4 py-8 text-center text-sm text-muted">Inbox zero. Nothing due today 🎉</div>}
      <Group title="Overdue" items={overdue} tone="text-danger" />
      <Group title="Today" items={due} tone="text-accent" />
      <Group title="Next 7 days" items={soon} />
      <Group title="No follow-up set" items={noDate} />
    </div>
  );
}
