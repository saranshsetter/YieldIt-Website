import type { StageId } from "./stages";

export type Lead = {
  id: number;
  workspace_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  stage: StageId;
  cash_value: number;
  next_follow_up: string | null; // YYYY-MM-DD
  source_tool: string;
  created_at: string;
  updated_at: string;
  stage_changed_at: string;
};

export type Activity = {
  id: number;
  lead_id: number;
  type: "created" | "stage_change" | "note" | "follow_up" | "edit" | "ai_draft" | "call_notes" | "ghl";
  body: string;
  meta: string | null;
  created_at: string;
};

export type Snippet = {
  id: number;
  title: string;
  body: string;
  category: string;
  uses: number;
  created_at: string;
};

export type CallNote = {
  id: number;
  lead_id: number | null;
  transcript: string;
  summary: string;
  objections: string;
  commitments: string;
  next_step: string;
  resources: string;
  created_at: string;
};

export type StructuredNotes = Pick<CallNote, "summary" | "objections" | "commitments" | "next_step" | "resources">;
