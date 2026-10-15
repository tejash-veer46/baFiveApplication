# baFive

**Meet someone worth logging off for.** baFive is a Hinge-inspired dating app for people who work hard:
rich profiles, likes on the exact photo or prompt that caught your eye, a daily rose, and real-time chat.

Backend API: [tejash-veer46/backendBaFive](https://github.com/tejash-veer46/backendBaFive)

## Features

- **Landing & auth** — animated, cursor-reactive photo collage; sign up / sign in
- **Onboarding** — 6 animated steps: name & birthday (18+), gender & who you want to meet, work & height,
  photo upload (resized in the browser, drag to reorder), prompts, interests & bio
- **Discover** — Hinge-style scrolling profile (photos interleaved with prompts and vitals); tap ♥ on any
  photo or prompt to like it with a comment or send your daily 🌹 rose; pass with ✕ / `←` / `X`, undo a pass;
  shared interests highlighted
- **It's a match!** — confetti celebration that jumps straight into chat
- **Likes You** — see what each person liked and their comment; roses pinned on top; match back or remove
- **Matches & chat** — new-match bubbles, "Your turn" indicators, unread badges, live polling,
  suggested openers based on their profile, seen receipts, unmatch
- **Profile** — preview exactly how others see you, completeness ring with tips, full profile editor,
  account deletion
- Light & dark themes, responsive from phones (bottom tab bar) to wide desktops (sidebar), live
  notification badges and toasts

## Stack

React 18 + TypeScript, Vite, React Router, Framer Motion, lucide-react icons. Hand-written CSS with
design tokens (`src/styles/global.css`): warm cream / deep aubergine surfaces, coral → violet gradient
accent, Fraunces serif headings with Plus Jakarta Sans.

## Run locally

Start the backend first (see its README — `npm install && npm run dev` serves `http://localhost:5000`), then:

```bash
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:5000
npm run dev                  # http://localhost:5173
npm run build                # type-check + production build into dist/
```

## Deploying

The site is deployed as a Render static site alongside the API — see
[DEPLOYMENT.md in backendBaFive](https://github.com/tejash-veer46/backendBaFive/blob/master/DEPLOYMENT.md).
Set `VITE_API_URL` to the API's public URL at build time. On free hosting the API naps when idle;
the app shows a "waking up" banner while the first request is slow.

## Project layout

```
src/
  api.ts                 typed API client
  context/auth.tsx       session (token in localStorage)
  context/ui.tsx         theme, toasts, live badge summary
  components/            AppShell, ProfileView, LikeComposer, MatchCelebration, Modal, ProfileFields, Logo
  pages/                 Landing, Onboarding, Discover, Likes, Matches (incl. chat), MyProfile, EditProfile
  styles/                global tokens + shared component styles
```
