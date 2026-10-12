// Thin wrappers over Anthropic + Deepgram REST APIs. No SDKs, and every caller handles "not configured".
import type { Lead, StructuredNotes } from "./types";
import { STAGES } from "./stages";

export const hasAnthropic = () => !!process.env.ANTHROPIC_API_KEY;
export const hasDeepgram = () => !!process.env.DEEPGRAM_API_KEY;
const MODEL = () => process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

async function claude(system: string, user: string, maxTokens = 1200): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: MODEL(), max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  return data.content.filter((c) => c.type === "text").map((c) => c.text).join("").trim();
}

export function leadContext(lead: Lead, recent: string[]): string {
  return [
    `Name: ${lead.first_name} ${lead.last_name}`,
    `Stage: ${STAGES[lead.stage].label}`,
    `Deal value: $${lead.cash_value}`,
    `Source: ${lead.source_tool}`,
    `Next follow-up: ${lead.next_follow_up ?? "none"}`,
    recent.length ? `Recent activity (newest first):\n- ${recent.join("\n- ")}` : "",
  ].filter(Boolean).join("\n");
}

export async function draftText(opts: { lead: Lead | null; context: string; kind: string; myName: string; extra?: string }): Promise<{ text: string; ai: boolean }> {
  const first = opts.lead?.first_name || "there";
  if (!hasAnthropic()) {
    const stage = opts.lead?.stage;
    const t =
      stage === "no_show" ? `Hey ${first}, looks like we missed each other. Want to grab a new time this week?`
      : stage === "closed_lost" ? `Hey ${first}, the payment didn't go through on our end. Want me to resend the link?`
      : stage === "call_completed" || stage === "nurturing" ? `Hey ${first}, great chatting with you. Any questions come up since our call?`
      : `Hey ${first}, it's ${opts.myName || "me"} — just following up. Still keen to chat this week?`;
    return { text: t, ai: false };
  }
  const text = await claude(
    "You write short SMS follow-ups for an appointment setter. Warm, human, no emojis unless natural, under 320 characters, no sign-off formalities, no placeholders. Output only the message text.",
    `Write a ${opts.kind} text message.\nSender name: ${opts.myName || "the setter"}\n\nLead context:\n${opts.context}${opts.extra ? `\n\nExtra context:\n${opts.extra}` : ""}`,
    400,
  );
  return { text: text.replace(/^"|"$/g, ""), ai: true };
}

function heuristicNotes(transcript: string): StructuredNotes {
  const sentences = transcript.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter((s) => s.length > 3);
  const pick = (re: RegExp) => sentences.filter((s) => re.test(s)).slice(0, 5).map((s) => `- ${s.trim()}`).join("\n");
  return {
    summary: sentences.slice(0, 3).join(" ") || "",
    objections: pick(/\b(but|expensive|price|cost|afford|think about|not sure|spouse|partner|later|busy|time)\b/i),
    commitments: pick(/\b(I will|I'll|we'll|we will|going to|promise|send you|by (monday|tuesday|wednesday|thursday|friday|tomorrow))\b/i),
    next_step: pick(/\b(next|follow up|call back|book|schedule|tomorrow|next week)\b/i).split("\n")[0]?.replace(/^- /, "") ?? "",
    resources: pick(/\b(send|link|video|case study|pdf|doc|email)\b/i),
  };
}

export async function structureNotes(transcript: string, context: string): Promise<{ notes: StructuredNotes; ai: boolean }> {
  if (!hasAnthropic()) return { notes: heuristicNotes(transcript), ai: false };
  const raw = await claude(
    `You turn sales call transcripts into concise CRM notes. Respond with ONLY a JSON object with string fields:
"summary" (2-4 sentences), "objections" (bullet list, one per line starting with "- "), "commitments" (bullets: who promised what), "next_step" (one sentence, include date/time if mentioned), "resources" (bullets: things to send the lead). Use "" for empty fields. No coaching or call scoring.`,
    `${context ? `Lead context:\n${context}\n\n` : ""}Transcript:\n${transcript.slice(0, 60000)}`,
    1500,
  );
  const m = raw.match(/\{[\s\S]*\}/);
  const j = JSON.parse(m ? m[0] : raw) as Partial<StructuredNotes>;
  const s = (v: unknown) => (Array.isArray(v) ? v.map((x) => `- ${x}`).join("\n") : String(v ?? ""));
  return {
    notes: { summary: s(j.summary), objections: s(j.objections), commitments: s(j.commitments), next_step: s(j.next_step), resources: s(j.resources) },
    ai: true,
  };
}

const DG_URL = "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&diarize=true&paragraphs=true";

export function transcribe(audio: ArrayBuffer, mime: string): Promise<string> {
  return deepgram({ "Content-Type": mime || "audio/mpeg" }, audio);
}
export function transcribeUrl(url: string): Promise<string> {
  return deepgram({ "Content-Type": "application/json" }, JSON.stringify({ url }));
}

async function deepgram(headers: Record<string, string>, body: BodyInit): Promise<string> {
  const res = await fetch(DG_URL, {
    method: "POST",
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, ...headers },
    body,
  });
  if (!res.ok) throw new Error(`Deepgram ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    results?: { channels?: { alternatives?: { transcript?: string; paragraphs?: { transcript?: string } }[] }[] };
  };
  const alt = data.results?.channels?.[0]?.alternatives?.[0];
  return (alt?.paragraphs?.transcript || alt?.transcript || "").trim();
}
