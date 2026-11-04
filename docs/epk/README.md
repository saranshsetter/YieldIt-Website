# Saransh EPK (route: `/epk`)

Lives inside the Next.js app. A scroll-scrubbed video hero (`components/ui/scroll-locked-video-hero.tsx`) opens the page; the page unlocks once the video finishes and re-locks if you scroll back to the top.

- **Edit content:** `lib/epk-content.ts` (bio, releases, rider, contact, hero video path).
- **Layout/components:** `components/epk/epk-site.tsx`, styles in `app/epk/epk.css` (scoped under `.epk`).
- **Assets:** `public/epk/` (`hero.mp4` scrub video, `assets/*.svg` artwork, `assets/og.png` share image).
- **Run locally:** `npm install && npm run dev`, then open http://localhost:3000/epk
- **Deploy:** push to GitHub; the connected Vercel projects build automatically. Production URL = `<your-domain>/epk`.
- **Hero video tip:** scrubbing is smoothest with all-intra video: `ffmpeg -i in.mp4 -c:v libx264 -g 1 -crf 27 -an out.mp4`.
- **PDFs:** "Download Press Kit" / "Download Tech Rider" use the browser print dialog (Save as PDF).
- **Swap in Higgsfield renders:** replace files in `public/epk/` and update paths in `lib/epk-content.ts`.
