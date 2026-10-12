import type { Lead } from "./types";
import { STAGES } from "./stages";

export const VARIABLES = ["first_name", "last_name", "full_name", "phone", "email", "stage", "cash_value", "follow_up", "my_name"];

export function fillSnippet(body: string, lead: Lead | null | undefined, myName = ""): string {
  const v: Record<string, string> = {
    my_name: myName,
    first_name: lead?.first_name ?? "",
    last_name: lead?.last_name ?? "",
    full_name: lead ? `${lead.first_name} ${lead.last_name}`.trim() : "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    stage: lead ? STAGES[lead.stage]?.label ?? lead.stage : "",
    cash_value: lead ? `$${Number(lead.cash_value || 0).toLocaleString()}` : "",
    follow_up: lead?.next_follow_up ?? "",
  };
  // Unknown or empty variables stay visible as {name} so nothing silently disappears.
  return body.replace(/\{(\w+)\}/g, (m, k: string) => (v[k] ? v[k] : m));
}
