#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "📦 Staging all changes..."
git add -A

echo "✅ Committing..."
git commit -m "Add Services, BookCall (Calendly), polish Navbar

- Create components/Services.tsx (6-service grid)
- Create components/BookCall.tsx (Calendly inline embed)
- Update app/page.tsx to use BookCall instead of AuditForm
- Add 'Book a call' nav link to Navbar"

echo "🚀 Creating GitHub repo and pushing..."
gh repo create yieldit-website --public --source=. --remote=origin --push

echo ""
echo "✅ Done! Your repo is live."
echo "👉 Now go to https://vercel.com/new and import 'yieldit-website' to deploy."
