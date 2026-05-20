# GitHub & Vercel Deployment Guide

## Step 1 — Initialize Git in your project

Open PowerShell in your project folder and run:

```powershell
git init
git add .
git commit -m "feat: initial commit — SkyWay Flight Web App"
```

## Step 2 — Create GitHub Repository

1. Go to https://github.com → Click "+" → "New repository"
2. Name: `Skyway-Flight-Web-App`
3. Set to **Public**
4. Do NOT initialize with README (you already have one)
5. Click "Create repository"

## Step 3 — Push to GitHub

GitHub will show you commands. Run these in PowerShell:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Skyway-Flight-Web-App.git
git push -u origin main
```

## Step 4 — Add more commits (for descriptive history)

After pushing, make a small change (e.g. update README) and commit:

```powershell
git add .
git commit -m "feat: add PWA manifest and offline fallback page"
git push
```

Suggested commit messages for history:
- `feat: add flight search with Supabase API`
- `feat: implement interactive seat map with Realtime`
- `feat: add booking flow with PNR generation`
- `feat: implement reschedule and cancel with 2-hour rule`
- `feat: add Zustand stores with persist middleware`
- `feat: configure next-pwa with cache strategies`
- `feat: add auth with sign up, sign in, demo user`

## Step 5 — Deploy on Vercel

1. Go to https://vercel.com → Sign in with GitHub
2. Click "New Project"
3. Find and import `Skyway-Flight-Web-App`
4. Under "Environment Variables" add:
   ```
   NEXT_PUBLIC_SUPABASE_URL      → your Supabase project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY → your Supabase anon key
   ```
5. Click "Deploy"
6. Wait ~2 minutes — your app is live!

## Step 6 — Update Supabase for production

In Supabase → Authentication → URL Configuration:
1. Site URL: `https://Skyway-Flight-Web-App.vercel.app`
2. Redirect URLs: add `https://Skyway-Flight-Web-App.vercel.app/**`

## Step 7 — Copy your production URL

Your app will be at something like:
`https://Skyway-Flight-Web-App-username.vercel.app`

Add this to your README:
```
## 🚀 Live Demo
Production URL: https://Skyway-Flight-Web-App-username.vercel.app
```

Then push:
```powershell
git add README.md
git commit -m "docs: add production Vercel URL to README"
git push
```
