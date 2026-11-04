# Saransh EPK

Static EPK site (HTML + CSS + vanilla JS). No build step.

- **Edit content:** everything lives in `content.js` (bio, releases, rider, contact).
- **Run locally:** `npx serve .` or `python3 -m http.server` inside this folder.
- **Deploy (Vercel):** import the repo, set **Root Directory = `epk`**, Framework = Other, no build command.
- **Deploy (Netlify/GitHub Pages):** publish the `epk` folder.
- **PDFs:** "Download Press Kit" / "Download Tech Rider" use the browser print dialog (Save as PDF) with print stylesheets.
- **Images:** current art is generated SVG in `assets/`. Replace with Higgsfield renders or real photos and update paths in `content.js`.
