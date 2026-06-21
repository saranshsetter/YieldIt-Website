# YieldIt Website

Marketing site for **YieldIt** — AI-powered marketing for HVAC contractors.
Built with [Next.js](https://nextjs.org) (App Router), React, and Tailwind CSS.

---

## ⚠️ Important: this is a Next.js app, not a plain HTML site

You **cannot** open this with VS Code's "Live Server" extension — that only works
for static `.html` files. This project has to be run by Next.js. Use the steps below.

---

## 👀 View the site locally (in VS Code)

1. Open this folder in VS Code.
2. Open the terminal (**Terminal → New Terminal**).
3. The first time only, install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open **http://localhost:3000** in your browser.

The page auto-refreshes as you edit files. Press `Ctrl + C` in the terminal to stop it.

---

## 🚀 Push changes to GitHub

This folder is connected to https://github.com/saranshsetter/YieldIt-Website.
Whenever you make changes, push them with three commands:

```bash
git add -A
git commit -m "Describe what you changed"
git push
```

> Don't upload files through the GitHub website anymore — that's what caused the
> earlier mess. Always edit here in VS Code and push with the commands above.

---

## 🌐 Deploy it live (recommended: Vercel)

The easiest way to put this online is [Vercel](https://vercel.com/new):

1. Go to https://vercel.com/new and sign in with GitHub.
2. Import the **YieldIt-Website** repository.
3. Click **Deploy** — Vercel auto-detects Next.js. No config needed.

Every future `git push` will then redeploy the live site automatically.

---

## 📁 Project structure

```
app/            Pages & layout (app/page.tsx is the homepage)
components/     Section components (Hero, Services, Testimonials, Pricing, …)
lib/            Shared helpers
public/         Static assets (images, icons)
app/globals.css Global styles & animations
```
