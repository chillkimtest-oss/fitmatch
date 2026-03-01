# MVP Architecture — FitMatch (Demand-First)

## Guiding Constraint

V0 must be deployable in a weekend and cost $0/month to run. No database. No auth. No backend server. Trainer profiles live in a JSON file checked into the repo. The only "backend" is Kim's existing self-hosted n8n instance, which handles trainer notification emails via webhook.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15.2+ (static export) | Static pages for each trainer profile, no server needed, Tailwind v4 default |
| Styling | Tailwind CSS v4 | Mobile-first, fast to build. Installed automatically by `create-next-app --tailwind` on 15.2+ |
| Language | TypeScript | Catches answer-key encoding bugs at build time — directly relevant to the scoring function |
| Hosting | Netlify free tier | Permits commercial use. Vercel Hobby ToS prohibits commercial use. |
| Trainer data | `src/data/trainers.json` | Flat file, checked into repo, no DB needed for 25-30 Toronto profiles at launch |
| Email delivery | n8n webhook (Kim's self-hosted) | Kim already has this running. Sends to arbitrary trainer emails. No per-trainer account setup. No Formspree limitations. |
| Static assets | Hosted on Netlify or hotlinked from trainer websites | Trainer photos in V0 |

No database. No server. No auth. No Docker. n8n replaces all backend email routing complexity from round 1.

---

## Why n8n Solves the Email Problem

The round-1 MVP failed because Formspree cannot route to arbitrary trainer emails on the free plan, and per-trainer Formspree accounts add onboarding friction.

Kim has a self-hosted n8n instance. n8n can:
- Receive a webhook from the browser (via a Netlify serverless function proxy, since n8n can't be called directly from browser JS due to CORS)
- Iterate over matched trainer IDs
- Send SMTP email to each trainer's email address directly

This removes all Formspree limitations. No per-trainer setup. No monthly cost. One n8n workflow handles all cities and all trainers.

---

## Trainer Data Schema

```typescript
// src/data/trainers.ts (or generated from trainers.json)

interface TrainerProfile {
  id: string;              // URL-safe slug, e.g. "sarah-chen-toronto"
  name: string;
  city: "toronto" | "new-york";
  area: string;            // Neighborhood, e.g. "Downtown Toronto"
  specialty: string;       // One-line, e.g. "Strength coach · 8 years"
  bio: string;             // 1-3 sentences from their public profile
  email: string;           // For n8n notification — not shown to users
  instagram?: string;      // Handle only, no URL needed
  website?: string;
  photo_url?: string;      // Hotlinked or Netlify-hosted
  answers: {
    goal: "strength" | "fat-loss" | "endurance" | "health";
    style: "push" | "sustainable";
    feedback: "direct" | "nurturing";
    structure: "strict" | "flexible";
    checkins: "daily" | "few" | "weekly" | "sessions-only";
  };
}
```

Total: 25-30 Toronto profiles at launch. New York profiles added after first Toronto trainer responds. The JSON file is edited directly when Kim curates or updates profiles.

---

## System Architecture

```
[User Browser]
    │
    ├─ selects city
    ├─ takes 6-question quiz
    │
    │        [trainers.json bundled at build time]
    │                │
    ├─ JS scores answers against all trainers in selected city
    ├─ sees ranked results immediately (client-side, no network call)
    │
    └─ (optional) submits name + email
                    │
             POST /api/notify   ← Netlify serverless function
                    │
             POST to n8n webhook (server-side, avoids CORS)
                    │
             n8n workflow:
               for each trainer where score ≥ 70%:
                 send SMTP email to trainer.email
                    │
             [Trainer inbox]
             "Someone scored X% fit with you. Want to connect?"
```

The Netlify serverless function (`/api/notify`) is a thin proxy — it receives the browser POST, validates inputs, and forwards to n8n. This keeps the n8n webhook URL out of client-side JS (where it could be abused for spam).

---

## n8n Workflow Design

**Trigger:** Webhook node (HTTP POST)

**Payload received:**
```json
{
  "userCity": "toronto",
  "userName": "Alex",
  "userEmail": "alex@example.com",
  "matches": [
    { "trainerId": "sarah-chen-toronto", "score": 87 },
    { "trainerId": "mike-roberts-toronto", "score": 72 }
  ]
}
```

**Workflow steps:**
1. Webhook receives payload
2. Filter: keep only matches where `score >= 60` (lowered from 70% to reduce risk of threshold never firing with a small trainer pool; raise to 70% once score distributions are understood)
3. For each filtered match:
   - Trainer email is included in the payload from the Netlify function (which imports trainers.json server-side — emails are never in browser JS)
   - Send SMTP email to trainer email
4. Log to n8n execution log for Kim to review — check score distribution for every webhook call, not just those that triggered emails

**Email template (n8n Send Email node):**
```
Subject: Someone in {{city}} scored {{score}}% fit with your training style

Hi {{trainerName}},

Someone in {{city}} took a trainer matching quiz and scored {{score}}% fit with your training style.

They're looking for a trainer focused on {{userGoal}} with a {{userStyle}} approach.

{{#if userEmail}}They left their contact: {{userName}} — {{userEmail}}{{/if}}

To connect or update your profile, reply to this email.

— FitMatch
```

**SMTP:** Kim's existing email (via n8n SMTP credentials). Two important pre-build steps:
1. If using Gmail: generate a Gmail App Password (not the regular account password) — Google blocked regular-password SMTP access in May 2022. Requires 2FA to be enabled first.
2. If Kim's n8n is on DigitalOcean: DigitalOcean blocks all SMTP ports (25, 465, 587) by default on new accounts. Submit a support ticket to unblock, or switch to Resend (see below).

**Resend (recommended alternative):** Resend free tier provides 3,000 emails/month with proper SPF/DKIM authentication — significantly better inbox placement than personal Gmail. Requirements: register a custom domain (e.g., fitmatch.co), add DNS records (SPF + DKIM). DNS propagation takes 24-48 hours — must be configured before the build weekend. Use the Resend HTTP Request node in n8n (or official community node) instead of the SMTP node.

---

## Netlify Serverless Function

```typescript
// netlify/functions/notify.ts

import type { Handler } from "@netlify/functions";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL; // set in Netlify env vars

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const body = JSON.parse(event.body || "{}");

  // Basic validation — don't forward if missing required fields
  if (!body.userCity || !body.matches?.length) {
    return { statusCode: 400, body: "Missing required fields" };
  }

  const response = await fetch(N8N_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return {
    statusCode: response.ok ? 200 : 502,
    body: response.ok ? "OK" : "Upstream error",
  };
};
```

N8N_WEBHOOK_URL is set in Netlify's environment variables — never exposed to the browser.

---

## Scoring Logic (Client-Side, TypeScript)

```typescript
// src/lib/score.ts

const WEIGHTS = { goal: 30, style: 20, feedback: 20, structure: 20, checkins: 10 };

type UserAnswers = {
  goal: string;
  style: string;
  feedback: string;
  structure: string;
  checkins: string;
  experience: string; // informational only, not scored
};

type TrainerAnswers = Omit<UserAnswers, "experience">;

export function calculateScore(trainer: TrainerAnswers, user: UserAnswers): number {
  let score = 0;
  if (trainer.goal === user.goal)           score += WEIGHTS.goal;
  if (trainer.style === user.style)         score += WEIGHTS.style;
  if (trainer.feedback === user.feedback)   score += WEIGHTS.feedback;
  if (trainer.structure === user.structure) score += WEIGHTS.structure;
  if (trainer.checkins === user.checkins)   score += WEIGHTS.checkins;
  return score; // 0-100
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "Strong fit";
  if (score >= 50) return "Decent fit";
  return "Different styles";
}
```

Experience (Q6) is passed to n8n as context for the trainer email but is not factored into the score.

---

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Toronto-only stub in V0 (or redirect directly to /quiz). City selector added in V1. |
| `/quiz` | `QuizPage` | 6-question quiz, city stored in React state (no URL param needed) |
| `/results` | `ResultsPage` | Ranked trainer cards, optional email capture, n8n webhook trigger |

**Deferred to V1:** `/trainers/[id]` static profile pages. Trainer cards in V0 link directly to trainer's external website. Rationale: trainers discovering inferred profiles before Kim has contacted them creates a bad first impression. Build these once trainers are aware of and comfortable with the product.

Total: 3 page types in V0. No dynamic routes requiring a server. No API routes except the Netlify function.

---

## Open Technical Questions (Resolved)

1. **n8n trainer lookup:** Resolved. The Netlify function imports `trainers.json` at build time, looks up each trainer's email from the payload's trainer IDs, and sends trainer emails as part of the payload to n8n. Trainer emails are never exposed in browser JS — the browser sends only trainer IDs and scores.

2. **Photo hosting:** Hotlinking trainer photos from Instagram/websites may break. Download and host photos on Netlify alongside the static site before launch. Low effort, eliminates the most common 404 source in the results page.

3. **n8n CORS:** Resolved by Netlify function proxy. The browser calls `/api/notify` (same-origin). Pre-launch: confirm n8n webhook is reachable from a public IP (not just Kim's local network) by triggering it via curl from a cloud shell or similar.

4. **n8n webhook URL routing:** The Netlify function calls `/api/notify` but Netlify deploys functions to `/.netlify/functions/notify`. Add a `netlify.toml` rewrite to redirect `/api/*` to `/.netlify/functions/:splat`. Without this, the email form silently 404s on the deployed site.

5. **next/image compatibility:** `next/image` requires a live server for image optimization, which is not available in a static export. Add `images: { unoptimized: true }` to `next.config.ts` when scaffolding. Use `<img>` tags directly or this config setting — not the default `next/image` optimization.

6. **Email deliverability:** Personal Gmail SMTP cold-sending to unknown trainers is a spam risk. Use Resend (with custom domain) for proper SPF/DKIM authentication. At 2-10 trainer emails/week, personal SMTP is technically functional but inbox placement is poor. Resend eliminates this risk and is free for this volume.

---

## Infrastructure and Cost

| Service | Cost |
|---------|------|
| Netlify free tier | $0/month |
| n8n (self-hosted, Kim already runs) | $0/month additional |
| Custom domain | $12/year (optional, not needed for V0) |
| Trainer profile photos (Netlify storage) | $0 (well within free tier) |

**Total V0 infrastructure cost: $0/month.**

---

## Build Order (Shipping in a Weekend)

### 1-2 Weeks Before Build Weekend (Mandatory Gates)

- [ ] **Cold-email gate:** Write trainer notification email. Send to 3 real Toronto trainers manually. Wait 7 days. If 0 respond, rethink before building.
- [ ] **SMTP gate:** Confirm Kim's n8n can send email. If DigitalOcean: check SMTP port availability (25, 465, 587 are blocked by default — submit support ticket or set up Resend). If Resend: register custom domain, add DNS records (SPF + DKIM). Allow 24-48 hours for DNS propagation.
- [ ] **n8n webhook reachability:** Curl the n8n webhook URL from a public IP (not Kim's local network). Verify n8n logs the request.
- [ ] **Profile quality gate:** Curate 5 trainer profiles, ask 3 people to quiz against them. 2/3 say top match feels right → proceed.
- [ ] **Threshold-firing gate:** Score 5 simulated user profiles against 10 curated trainers. At least 3 trigger ≥60% → proceed.

### Before Writing Any Code (2-3 hours, build weekend)

- [ ] Curate 25-30 trainer profiles for Toronto only. Fill `trainers.json`. Skip trainers without a publicly findable email. Expect 8-12 minutes per profile (not 5-10) — gym-employed trainers often have no individual email.
- [ ] Set up n8n webhook + email workflow. Test by triggering the webhook manually and verifying SMTP delivery.
- [ ] Create Netlify project connected to GitHub repo.
- [ ] Set `N8N_WEBHOOK_URL` environment variable in Netlify.
- [ ] Add `netlify.toml` with rewrite rule: `from = "/api/*"` → `to = "/.netlify/functions/:splat"` with `status = 200`.

### Phase 1: Core Data + Scoring (45 min)

1. `npx create-next-app@latest fitmatch --typescript --tailwind --app` — Next.js 15.2+ (Tailwind v4 default, no manual upgrade)
2. Add `images: { unoptimized: true }` to `next.config.ts` — required for static export compatibility
3. Add `src/data/trainers.json` with curated profiles
4. Build `src/lib/score.ts` with `calculateScore()` and `scoreLabel()`
5. Write one unit test: given a known trainer + user answer pair, verify the score. Run it before proceeding.

### Phase 2: Quiz + Results (60 min)

6. Build `QuizPage` — 6 questions, one per screen, city stored in React state (no URL params, no Suspense boundary needed)
7. Build `ResultsPage` — calculates scores against all city trainers, renders ranked cards, links to trainer external websites
8. Wire optional email form → POST to `/api/notify` → show success/error state

### Phase 3: Netlify Function (30 min, no trainer pages in V0)

9. Build `netlify/functions/notify.ts` — validate payload, look up trainer emails from trainers.json import, forward to n8n with trainer emails in payload
10. Build `HomePage` stub (or redirect to /quiz for Toronto-only launch)

### Phase 4: Deploy and Smoke Test (20 min)

11. `git push` → Netlify auto-deploys
12. End-to-end test: complete quiz → submit email → verify n8n execution log shows webhook received → verify trainer email arrives in test inbox
13. Spot-check email deliverability: trigger notification to Kim's own inbox, confirm it lands in inbox not spam
14. Review n8n execution log: verify score distribution is visible for every webhook call

**Total estimated build time (code only): ~2.5 hours.**
**Total including curation: ~5-6 hours across a weekend (curation is the real time sink — expect 8-12 min/profile).**

---

## V1 Additions (When First Trainer Responds)

| Addition | Implementation |
|----------|---------------|
| Static trainer profile pages `/trainers/[id]` | Add `generateStaticParams()` from `trainers.json`. Gives trainers a landing page to claim. |
| "Claim your profile" page | Typeform or Google Form first (manual). Then a simple `/claim` page with a form that emails Kim. |
| Trainer match count visibility | Kim exports n8n execution log manually. No dashboard needed in V1. |
| City selector + New York profiles | Add `"city": "new-york"` profiles to `trainers.json`. Update homepage to show city selector. No other code changes required. |

## V2 Additions (When First Trainer Pays)

| Addition | Implementation |
|----------|---------------|
| Trainer accounts | Supabase Auth (free tier) + PostgreSQL |
| Trainer dashboard | New `/dashboard` route, protected by Supabase session |
| Premium placement | Paid trainers sorted first within their score tier |
| Payments | Stripe Billing, implemented only when first trainer asks to pay |
| Additional cities | Add profiles to `trainers.json`. No code changes required. |
