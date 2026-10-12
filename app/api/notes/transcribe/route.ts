import { hasDeepgram, transcribe, transcribeUrl } from "@/lib/ai";
import { json, fail, errMsg } from "@/lib/http";

export const maxDuration = 300;

// Accepts multipart `audio` (small files; Vercel caps request bodies at ~4.5MB) or JSON { url } for any size.
export async function POST(req: Request) {
  if (!hasDeepgram()) return fail("DEEPGRAM_API_KEY not set — paste the transcript instead.", 501);
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      const { url } = (await req.json()) as { url?: string };
      if (!url || !/^https?:\/\//.test(url)) return fail("Provide a public audio URL");
      return json({ transcript: await transcribeUrl(url) });
    }
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) return fail("No audio file");
    return json({ transcript: await transcribe(await file.arrayBuffer(), file.type) });
  } catch (e) {
    return fail(errMsg(e), 502);
  }
}
