export type StageId =
  | "text_blasted"
  | "replied_not_booked"
  | "booked"
  | "no_show"
  | "rescheduled"
  | "call_completed"
  | "nurturing"
  | "closed_won"
  | "closed_lost";

export const STAGES: Record<StageId, { label: string; dot: string }> = {
  text_blasted: { label: "Text Blasted", dot: "#94A3B8" },
  replied_not_booked: { label: "Replied Not Booked", dot: "#60A5FA" },
  booked: { label: "Booked", dot: "#5B5BFF" },
  no_show: { label: "No Show", dot: "#F59E0B" },
  rescheduled: { label: "Rescheduled", dot: "#A78BFA" },
  call_completed: { label: "Call Completed", dot: "#22D3EE" },
  nurturing: { label: "Nurturing", dot: "#F472B6" },
  closed_won: { label: "Closed Won", dot: "#22C55E" },
  closed_lost: { label: "Closed Lost (Payment Failed)", dot: "#EF4444" },
};

export const LANES: { id: string; label: string; stages: StageId[] }[] = [
  { id: "outreach", label: "Outreach", stages: ["text_blasted", "replied_not_booked"] },
  { id: "calls", label: "Calls", stages: ["booked", "no_show", "rescheduled", "call_completed"] },
  { id: "close", label: "Close", stages: ["nurturing", "closed_won", "closed_lost"] },
];

export const STAGE_IDS = Object.keys(STAGES) as StageId[];
export const CLOSED: StageId[] = ["closed_won", "closed_lost"];

export function toStageId(v: string | null | undefined): StageId | null {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if ((STAGE_IDS as string[]).includes(s)) return s as StageId;
  const hit = STAGE_IDS.find((id) => STAGES[id].label.toLowerCase() === s || STAGES[id].label.toLowerCase().startsWith(s));
  return hit ?? null;
}
