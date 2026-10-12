"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lead } from "@/lib/types";
import { BRAND } from "@/lib/brand";
import { api } from "@/lib/client";
import { Logo } from "./Logo";
import { Icon } from "./Icons";
import LeadDrawer from "./LeadDrawer";
import SnippetDeck from "./SnippetDeck";
import CaptureModal from "./CaptureModal";

export type Settings = {
  workspace_id: string;
  database: "postgres" | "sqlite";
  auth: boolean;
  my_name: string;
  active_lead: Lead | null;
  integrations: { anthropic: boolean; deepgram: boolean; ghl: boolean };
};

type Ctx = {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  refreshLeads: () => Promise<void>;
  openLead: (id: number | null) => void;
  activeLead: Lead | null;
  settings: Settings | null;
  refreshSettings: () => Promise<void>;
  toast: (msg: string) => void;
  openDeck: () => void;
  openCapture: () => void;
  okrTick: number;
  bumpOkr: () => void;
};

const SetloCtx = createContext<Ctx | null>(null);
export const useSetlo = () => useContext(SetloCtx)!;

const NAV = [
  { href: "/", label: "Pipeline", icon: "board" },
  { href: "/follow-ups", label: "Follow up today", icon: "clock" },
  { href: "/snippets", label: "Snippets", icon: "bolt" },
  { href: "/notes", label: "Notes", icon: "mic" },
  { href: "/data", label: "Data & settings", icon: "db" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/login") return <>{children}</>;
  return <Shell path={path}>{children}</Shell>;
}

function Shell({ children, path }: { children: React.ReactNode; path: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [drawerId, setDrawerId] = useState<number | null>(null);
  const [deck, setDeck] = useState(false);
  const [capture, setCapture] = useState<false | { text: string }>(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [okrTick, setOkrTick] = useState(0);
  const [dark, setDark] = useState(false);

  const refreshLeads = useCallback(async () => setLeads(await api<Lead[]>("/api/leads")), []);
  const refreshSettings = useCallback(async () => setSettings(await api<Settings>("/api/settings")), []);
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  useEffect(() => {
    refreshLeads();
    refreshSettings();
    setDark(document.documentElement.classList.contains("dark"));
  }, [refreshLeads, refreshSettings]);

  const openLead = useCallback((id: number | null) => {
    setDrawerId(id);
    // The open lead becomes the "active lead" used by snippets, capture and the Chrome extension.
    if (id) api<Settings>("/api/settings", { method: "PUT", json: { active_lead_id: id } }).then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCapture(false);
        setDeck((d) => !d);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setDeck(false);
        // Read the selection now: focusing the capture textarea would clear it.
        setCapture({ text: window.getSelection()?.toString().trim() ?? "" });
      } else if (e.key === "Escape") {
        if (deck || capture) { setDeck(false); setCapture(false); }
        else if (drawerId) setDrawerId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck, capture, drawerId]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("setlo-theme", next ? "dark" : "light"); } catch {}
  };

  const activeLead = useMemo(() => {
    const id = drawerId ?? settings?.active_lead?.id;
    return leads.find((l) => l.id === id) ?? settings?.active_lead ?? null;
  }, [drawerId, settings, leads]);

  const ctx: Ctx = {
    leads, setLeads, refreshLeads, openLead, activeLead, settings, refreshSettings, toast,
    openDeck: () => setDeck(true), openCapture: () => setCapture({ text: "" }),
    okrTick, bumpOkr: () => setOkrTick((t) => t + 1),
  };

  return (
    <SetloCtx.Provider value={ctx}>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-bg px-3 py-4 md:flex">
          <div className="px-2 pb-6"><Logo /></div>
          <nav className="flex flex-col gap-0.5">
            {NAV.map((n) => {
              const on = n.href === "/" ? path === "/" : path.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${on ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-surface-2 hover:text-fg"}`}>
                  <Icon name={n.icon} /> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 space-y-1 px-2 text-xs text-muted">
            <button onClick={() => setDeck(true)} className="flex w-full items-center justify-between rounded-md py-1 hover:text-fg">
              Snippet deck <span className="kbd">⌘/Ctrl K</span>
            </button>
            <button onClick={() => setCapture({ text: "" })} className="flex w-full items-center justify-between rounded-md py-1 hover:text-fg">
              Capture <span className="kbd">⌘/Ctrl ⇧ S</span>
            </button>
          </div>
          <div className="mt-auto space-y-3">
            {activeLead && (
              <button onClick={() => openLead(activeLead.id)} className="w-full rounded-lg border border-line bg-surface p-2.5 text-left text-xs hover:border-accent">
                <div className="text-muted">Active lead</div>
                <div className="truncate font-medium text-fg">{activeLead.first_name} {activeLead.last_name}</div>
              </button>
            )}
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] text-muted">
                {BRAND.name} · {settings?.database === "postgres" ? "cloud" : "local"}
                {settings?.auth && <button className="ml-2 hover:text-fg" onClick={logout}>Sign out</button>}
              </span>
              <button onClick={toggleTheme} className="btn-ghost !p-1.5" title="Toggle theme"><Icon name={dark ? "sun" : "moon"} /></button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
            <Logo />
            <div className="flex gap-1">
              {NAV.map((n) => <Link key={n.href} href={n.href} className="btn-ghost !p-2"><Icon name={n.icon} /></Link>)}
              <button onClick={toggleTheme} className="btn-ghost !p-2"><Icon name={dark ? "sun" : "moon"} /></button>
            </div>
          </div>
          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>

      {drawerId && <LeadDrawer id={drawerId} onClose={() => setDrawerId(null)} />}

      {deck && (
        <Modal onClose={() => setDeck(false)}>
          <SnippetDeck mode="modal" onDone={() => setDeck(false)} />
        </Modal>
      )}
      {capture && (
        <Modal onClose={() => setCapture(false)}>
          <CaptureModal initial={capture.text} onDone={() => setCapture(false)} />
        </Modal>
      )}

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="rounded-full bg-fg px-4 py-2 text-sm text-bg shadow-soft">{t.msg}</div>
        ))}
      </div>
    </SetloCtx.Provider>
  );
}

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 px-4 pt-[12vh] backdrop-blur-[2px]" onMouseDown={onClose}>
      <div className="card w-full max-w-xl overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
