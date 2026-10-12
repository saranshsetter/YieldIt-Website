import type { Db } from "./db";
import type { StageId } from "./stages";
import { addDays, startOfWeek } from "./dates";

type SeedLead = [string, string, StageId, number, number | null, string, number];
// first, last, stage, cash, follow-up offset (days from today), source, days since stage change

const LEADS: SeedLead[] = [
  ["Marcus", "Reed", "text_blasted", 3000, 0, "GHL Text Blast", 1],
  ["Priya", "Shah", "text_blasted", 3000, 1, "GHL Text Blast", 1],
  ["Dylan", "Ortiz", "text_blasted", 2500, -1, "GHL Text Blast", 2],
  ["Hannah", "Kim", "text_blasted", 3000, 2, "Instagram DM", 0],
  ["Owen", "Fletcher", "replied_not_booked", 4500, 0, "GHL Text Blast", 2],
  ["Sofia", "Alvarez", "replied_not_booked", 3000, -2, "Facebook Ad", 4],
  ["Jamal", "Wright", "replied_not_booked", 6000, 0, "Instagram DM", 1],
  ["Emily", "Novak", "booked", 5000, 1, "Website Form", 1],
  ["Trevor", "Banks", "booked", 4500, 2, "GHL Text Blast", 0],
  ["Aisha", "Mensah", "booked", 7500, 3, "Referral", 2],
  ["Liam", "Carter", "booked", 3000, 0, "Facebook Ad", 3],
  ["Grace", "Holloway", "no_show", 4500, -1, "GHL Text Blast", 2],
  ["Noah", "Patel", "no_show", 3000, 0, "Cold Call", 1],
  ["Chloe", "Bennett", "rescheduled", 5000, 2, "Instagram DM", 1],
  ["Ethan", "Brooks", "rescheduled", 6000, -3, "Website Form", 5],
  ["Maya", "Lindqvist", "call_completed", 7500, 0, "Referral", 1],
  ["Ryan", "Doyle", "call_completed", 4500, 1, "Facebook Ad", 0],
  ["Zoe", "Harper", "nurturing", 3000, 5, "GHL Text Blast", 9],
  ["Caleb", "Nguyen", "nurturing", 5000, -4, "Cold Call", 12],
  ["Isabella", "Rossi", "nurturing", 4500, 0, "Instagram DM", 6],
  ["Lucas", "Meyer", "closed_won", 6000, 14, "Referral", 3],
  ["Ava", "Thompson", "closed_won", 4500, 21, "GHL Text Blast", 1],
  ["Benjamin", "Clarke", "closed_won", 7500, 30, "Website Form", 6],
  ["Mia", "Okafor", "closed_won", 3000, null, "Facebook Ad", 15],
  ["Henry", "Vasquez", "closed_lost", 4500, 7, "Instagram DM", 2],
  ["Ella", "Fischer", "closed_lost", 3000, null, "Cold Call", 8],
];

const SNIPPETS: [string, string, string][] = [
  ["Openers", "Blast reply opener", "Hey {first_name}! Saw you replied to our text — are you still looking to get more booked calls this month?"],
  ["Openers", "Warm intro", "Hi {first_name}, it's {my_name}. Quick one: what made you reach out?"],
  ["Booking", "Send booking link", "Love it {first_name}. Here's my calendar — grab any slot that works: https://cal.example.com/{my_name}"],
  ["Booking", "Two-time close", "Does tomorrow at 11am or 2pm work better for a quick 20-min call, {first_name}?"],
  ["Booking", "Confirm call", "You're locked in, {first_name}! I'll call you at {phone}. Reply YES to confirm."],
  ["No-show", "Missed you", "Hey {first_name}, looks like we missed each other today. No stress — want to grab another time this week?"],
  ["No-show", "Last try", "{first_name}, should I close out your file or are you still interested? Either answer is totally fine."],
  ["Follow-up", "Day-after check-in", "Hey {first_name}, following up from yesterday — any questions come up after our chat?"],
  ["Follow-up", "Bump", "Just bumping this up, {first_name} 🙂"],
  ["Objections", "Need to think", "Totally fair, {first_name}. What specifically do you want to think through? Happy to help you get clarity."],
  ["Objections", "Too expensive", "I hear you. If price weren't a factor, is this something you'd want to move forward with?"],
  ["Nurture", "Value drop", "Thought of you, {first_name} — here's a quick case study from someone in a similar spot. Worth 3 mins."],
  ["Payment", "Payment failed", "Hey {first_name}, looks like the payment didn't go through. Want me to resend the link so you can try another card?"],
];

export async function seed(db: Db, ws: string) {
  const iso = (daysAgo: number, hour = 10) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  // Keep "booked this week" activity inside the current week so the OKR header has data.
  const daysIntoWeek = Math.floor((Date.now() - startOfWeek().getTime()) / 86400000);

  const leadSql = `INSERT INTO leads (workspace_id,first_name,last_name,phone,email,stage,cash_value,next_follow_up,source_tool,created_at,updated_at,stage_changed_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
  const actSql = "INSERT INTO activities (workspace_id,lead_id,type,body,meta,created_at) VALUES (?,?,?,?,?,?)";
  for (const [i, [f, l, stage, cash, fu, src, ago]] of LEADS.entries()) {
    const changed = iso(ago, 9 + (i % 8));
    const created = iso(ago + 3 + (i % 5));
    const phone = `(555) ${String(200 + i * 7).padStart(3, "0")}-${String(1000 + i * 137).slice(-4)}`;
    const email = `${f}.${l}@example.com`.toLowerCase();
    const id = await db.insert(leadSql, [ws, f, l, phone, email, stage, cash, fu === null ? null : addDays(fu), src, created, changed, changed]);
    await db.run(actSql, [ws, id, "created", `Lead created from ${src}`, null, created]);
    const passedBooked = ["booked", "no_show", "rescheduled", "call_completed", "nurturing", "closed_won", "closed_lost"].includes(stage);
    if (passedBooked) {
      const bookedAgo = stage === "booked" ? ago : Math.min(ago + 1, daysIntoWeek + 3);
      await db.run(actSql, [ws, id, "stage_change", "Moved to Booked", JSON.stringify({ from: "replied_not_booked", to: "booked" }), iso(bookedAgo, 11)]);
    }
    if (stage !== "text_blasted" && stage !== "booked") {
      await db.run(actSql, [ws, id, "stage_change", `Moved to ${stage.replace(/_/g, " ")}`, JSON.stringify({ to: stage }), changed]);
    }
    if (i % 3 === 0) await db.run(actSql, [ws, id, "note", `${f} mentioned they're comparing a couple of options. Prefers texts after 5pm.`, null, iso(Math.max(ago - 1, 0), 15)]);
  }
  for (const [i, [cat, title, body]] of SNIPPETS.entries()) {
    await db.run("INSERT INTO snippets (workspace_id,title,body,category,uses,created_at) VALUES (?,?,?,?,?,?)", [ws, title, body, cat, (SNIPPETS.length - i) * 3, iso(20)]);
  }
  for (const [k, v] of [["my_name", "Alex"], ["goal_weekly_sets", "20"], ["goal_monthly_closes", "8"], ["goal_monthly_cash", "40000"]]) {
    await db.run("INSERT INTO settings (workspace_id,key,value) VALUES (?,?,?) ON CONFLICT (workspace_id,key) DO NOTHING", [ws, k, v]);
  }
}
