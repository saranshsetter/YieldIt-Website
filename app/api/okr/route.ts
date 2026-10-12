import { okr } from "@/lib/repo";
import { setSetting } from "@/lib/db";
import { json, body } from "@/lib/http";

export async function GET() {
  return json(await okr());
}
export async function PUT(req: Request) {
  const b = await body<Record<string, unknown>>(req);
  for (const k of ["weekly_sets", "monthly_closes", "monthly_cash"]) {
    const v = Number(b[k]);
    if (b[k] !== undefined && Number.isFinite(v) && v >= 0) await setSetting(`goal_${k}`, String(v));
  }
  return json(await okr());
}
