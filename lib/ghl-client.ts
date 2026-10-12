"use client";
import { api, copyText } from "./client";

// Calls the GHL adapter; when it isn't configured (or is stubbed) we copy to clipboard instead.
export async function ghlAction(action: "pushNote" | "updateStage", leadId: number, text = ""): Promise<string> {
  const r = await api<{ ok: boolean; fallback?: string; reason?: string }>("/api/ghl", { method: "POST", json: { action, leadId, text } });
  if (r.ok) return "Synced to GHL";
  await copyText(r.fallback || text);
  return r.reason || "Copied to clipboard";
}
