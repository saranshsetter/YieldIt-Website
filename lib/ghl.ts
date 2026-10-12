// GoHighLevel adapter. Interface is final; the implementation is a stub on purpose.
// Docs: https://highlevel.stoplight.io/docs/integrations (API v2, base https://services.leadconnectorhq.com)
import type { Lead } from "./types";
import type { StageId } from "./stages";

export interface GhlAdapter {
  configured: boolean;
  pushNote(lead: Lead, body: string): Promise<void>;
  updateStage(lead: Lead, stage: StageId): Promise<void>;
  importContacts(): Promise<Partial<Lead>[]>;
}

export class GhlNotImplemented extends Error {}

const token = process.env.GHL_API_TOKEN;
const locationId = process.env.GHL_LOCATION_ID;

export const ghl: GhlAdapter = {
  configured: !!(token && locationId),
  async pushNote() {
    // TODO(GHL v2): create a contact note. See "Contacts > Notes > Create Note" in the v2 docs.
    // Needs lead.ghl_contact_id (match by phone/email via contact search first), Bearer token, `Version` header.
    throw new GhlNotImplemented("pushNote not implemented yet");
  },
  async updateStage() {
    // TODO(GHL v2): update the opportunity's pipelineStageId. See "Opportunities > Update Opportunity".
    // Requires a mapping from Setlo StageId -> GHL pipelineStageId (store per workspace in settings).
    throw new GhlNotImplemented("updateStage not implemented yet");
  },
  async importContacts() {
    // TODO(GHL v2): page through contacts for locationId. See "Contacts > Search Contacts".
    throw new GhlNotImplemented("importContacts not implemented yet");
  },
};
