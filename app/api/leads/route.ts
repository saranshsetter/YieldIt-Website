import { listLeads, createLead, type LeadInput } from "@/lib/repo";
import { json, body } from "@/lib/http";

export async function GET() {
  return json(await listLeads());
}
export async function POST(req: Request) {
  return json(await createLead(await body<LeadInput>(req)), 201);
}
