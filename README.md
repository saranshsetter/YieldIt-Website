# Setlo

Calm sales pipeline for appointment setters.

- **Setlo Pipeline**: drag-and-drop kanban (9 stages, 3 swim lanes), lead drawer, "Follow up today", OKR header
- **Setlo Snippets** (Dispatch, reintegrated): snippet deck with variables, ⌘/Ctrl+K anywhere, clipboard capture, AI message writer, Chrome extension
- **Setlo Notes**: call audio/transcript → structured CRM notes → copy for GHL / draft follow-up text

Stack: Next.js 16 (App Router) + TypeScript + Tailwind 4. Database is **Supabase Postgres** when `DATABASE_URL` is set, otherwise a local **SQLite** file. Tables are created and seeded with demo leads automatically on first request.

---

## 1. Deploy to Vercel + Supabase (≈10 minutes)

### Step 1: Get the code onto `main`
The code is on the branch `claude/keen-johnson-j40ozo` in `saranshsetter/YieldIt-Website`.
On GitHub: open the repo → **Compare & pull request** for that branch → **Merge**. (Or skip this and deploy the branch as a Vercel *preview*.)

### Step 2: Create the Supabase database
1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a region near you and **save the database password**.
2. When it's ready, click **Connect** (top of the project page) → **Connection string** → **Transaction pooler**.
3. Copy the URI. It looks like:
   `postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   Replace `[YOUR-PASSWORD]` with your database password. That is your `DATABASE_URL`.

You don't need to run any SQL. Setlo creates its tables on first load. (`supabase/schema.sql` is there if you want to do it by hand.)

### Step 3: Create the Vercel project
1. [vercel.com/new](https://vercel.com/new) → **Import** `saranshsetter/YieldIt-Website`.
2. Framework preset: **Next.js** (auto-detected). Leave the build settings at their defaults.
3. Open **Environment Variables** and add:

| Name | Value | Needed? |
| --- | --- | --- |
| `DATABASE_URL` | Supabase transaction pooler URI from step 2 | **Required** |
| `SETLO_PASSWORD` | Any password you choose; it's what you'll type to log in | **Required** |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) | For AI notes + message writer |
| `DEEPGRAM_API_KEY` | From [console.deepgram.com](https://console.deepgram.com) | For audio transcription |
| `GHL_API_TOKEN`, `GHL_LOCATION_ID` | GHL private integration token + location | Optional (adapter is stubbed) |
| `SETLO_SEED` | `false` | Optional: start empty instead of demo leads |

4. Click **Deploy**. When it finishes, open the URL, sign in with `SETLO_PASSWORD`, and the demo pipeline is there.

**Check it's healthy:** `https://<your-app>.vercel.app/api/health` should return `{"ok":true,"database":"postgres","auth":true}`.

Changing env vars later: Vercel → Project → Settings → Environment Variables, then **Deployments → ⋯ → Redeploy**.

### Step 4: Install the Chrome extension (Setlo Snippets everywhere)
1. Download the repo (GitHub → **Code → Download ZIP**) and unzip it.
2. Chrome → `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → pick the `extension/` folder.
3. Pin it, click it, open **Settings** and enter:
   - **Setlo URL**: `https://<your-app>.vercel.app` (custom domains work too; Chrome will ask for permission once)
   - **Password**: your `SETLO_PASSWORD`
   - Click **Save**. Your snippets should appear.
4. Hotkeys (change them at `chrome://extensions/shortcuts`):
   - **Alt+Shift+K**: open the snippet deck, ↑↓ + Enter copies (filled for your active lead)
   - **Alt+Shift+S**: save the text selected on any page as a snippet
   - **Alt+Shift+N**: save the selected text as a note on the active lead

---

## 2. Run locally (no accounts needed)

```bash
npm install
cp .env.example .env     # everything optional; leave DATABASE_URL empty for SQLite
npm run dev              # http://localhost:3100
```

- Demo data lives in `data/setlo.db`. Reset with `npm run seed`, then restart.
- Point local dev at Supabase instead: put the same `DATABASE_URL` in `.env`.
- Smoke test against a running server: `npm run smoke` (if the password is on: `SETLO_PASSWORD=... npm run smoke`).
- Production check: `npm run build && npm start`.

---

## 3. Using it

| Where | What |
| --- | --- |
| **Pipeline** (`/`) | Drag cards between stages. Click a card to edit fields, set follow-ups (Today/+1d/+3d/+1w), add notes, see the timeline, draft a text, push to GHL. |
| **Follow up today** | Overdue first, then today, next 7 days, and leads with no date. "Done · +1d" snoozes. The OKR header goals are click-to-edit. |
| **Snippets** | Search, filter by category, click to copy with `{first_name}` etc. filled for the chosen lead. Create/edit, insert variables, AI message writer → save as snippet. |
| **Notes** | Pick a lead → upload audio (≤4 MB on Vercel), paste a recording URL, or paste a transcript → **Generate notes** → edit → **Save**, **Copy notes for GHL**, **Draft follow-up text**. |
| **Data & settings** | CSV import/export, your name for `{my_name}`, integration status, extension setup. |

**Hotkeys in the app:** **⌘/Ctrl+K** opens the snippet deck · **⌘/Ctrl+Shift+S** captures the selection/clipboard as a snippet or as a note on the active lead.
The **active lead** is the last lead you opened. Snippets, capture and the extension all use it.

**Variables:** `{first_name} {last_name} {full_name} {phone} {email} {stage} {cash_value} {follow_up} {my_name}`

**Without keys** everything still works: the message writer uses stage-based templates, notes use keyword extraction, audio upload is replaced by the paste box, and GHL buttons copy to the clipboard.

---

## 4. Project map

- `lib/brand.ts`: product name, module names, palette (rename the product here)
- `lib/stages.ts`: the 9 stages / 3 swim lanes
- `lib/db.ts`: Postgres (Supabase) or SQLite driver, schema, auto-seed. Every table has `workspace_id` (`SETLO_WORKSPACE_ID`)
- `lib/repo.ts`: all data access
- `lib/ai.ts`: Claude + Deepgram over plain `fetch`, with fallbacks
- `lib/ghl.ts`: GHL adapter interface + stub with TODOs pointing at the v2 docs
- `lib/auth.ts`, `proxy.ts`: password gate (cookie for the browser, `Bearer` for the extension)
- `app/api/*`: JSON API used by the UI and the extension
- `extension/`: Chrome extension (Manifest V3)

## Troubleshooting

- **Login page says "One more step"**: `SETLO_PASSWORD` isn't set in Vercel. Add it and redeploy.
- **`/api/health` shows an error**: check `DATABASE_URL`. Use the *Transaction pooler* URI (port 6543) and make sure the password has no unescaped special characters (URL-encode `@ # / ?`).
- **Extension says it can't reach Setlo**: check the URL (no trailing path) and password in its Settings.
- **Audio upload fails on Vercel**: files over ~4 MB exceed Vercel's request limit. Paste a public recording URL instead.
