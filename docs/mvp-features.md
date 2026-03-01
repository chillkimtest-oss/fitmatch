# MVP Features — FitMatch (Demand-First)

## V0 — Ship in a Weekend

The goal: prove that users will take the quiz AND that trainers will respond to a cold "someone matched with you" email. Everything below serves that hypothesis.

---

## Must-Have Features

### City Selection

V0 launches Toronto only. The city selector page is a stub or skipped entirely — users land directly in the Toronto quiz flow. The city selector UI is added when New York is ready (after first Toronto trainer responds).

Why: starting Toronto-only eliminates 1-2 hours of curation work and one UI screen while the core hypothesis is validated.

### The 6-Question Quiz

Same questions as before — both trainer profiles and user answers use the same dimensions:

| # | Question | Options |
|---|----------|---------|
| 1 | Primary training goal | Strength & muscle / Fat loss / Endurance / General health |
| 2 | Coaching style preference | Push me hard — I need accountability / Keep it sustainable — I need encouragement |
| 3 | Feedback style | Direct and blunt / Positive and nurturing |
| 4 | Programming style | Strict structure — I want a plan to follow / Flexible — I like to adapt |
| 5 | Check-in frequency between sessions | Daily / A few times a week / Weekly / Just at sessions |
| 6 | Training experience | New (under 1 year) / Some experience (1-3 years) / Experienced (3+ years) |

One question per screen. Tap to select, auto-advance. No back button needed in V0.

### Fit Score Calculation

Same scoring logic as before:

- Goal match (Q1): 30 points
- Style match (Q2 + Q3 + Q4): 20 points each (60 total)
- Logistics match (Q5): 10 points
- Q6 (experience) is informational only — shown to trainer, not scored

Score labels:
- 75-100: "Strong fit"
- 50-74: "Decent fit"
- Under 50: "Different styles"

### Results Page

After the final question: instant results. No loading state, no email gate.

Display: ranked list of trainer cards, ordered by fit score descending.

**Each trainer card shows:**
- Name
- Photo
- City neighborhood / area (e.g. "Downtown Toronto")
- One-line specialty (e.g. "Strength coach · 8 years")
- Fit score badge (e.g. "87% Match")
- Fit label ("Strong fit")
- Link to trainer profile or website (opens in new tab)

Users see all trainers in their selected city who score above 0. Top matches are visually distinct (larger card or score badge color).

### Optional Email Capture (Post-Results)

Below the trainer list, a soft CTA:

> "Want your top matches to know you're looking? Drop your email and we'll pass it along."

Two fields: name (optional), email (required to submit). Submit button: "Let them know."

**What happens on submit:**
- POST to n8n webhook with: user answers, city, name, email, and the list of trainer IDs + scores
- n8n sends a notification email to every trainer scoring ≥ 60%, including the user's email if provided
- User sees: "Done — we've notified your top matches."

**What happens if they don't submit:**
- Nothing. They still have access to the results. No pestering.
- Trainer notification emails are NOT sent if the user doesn't opt in (avoids spamming trainers for uninterested users)

**Threshold for notification:** ≥ 60% score. Lowered from the original 70% to increase notification volume during hypothesis testing and reduce the risk of the threshold never firing with a small trainer pool. Once score distributions are understood from real user data, the threshold can be raised.

If a user's top score is under 60%, no trainer is notified. User still sees results and can contact trainers directly.

### Trainer Profile Pages (Static, One Per Trainer) — Deferred to V1

Static `/trainers/[id]` pages are deferred from V0. Trainer cards in the results link directly to the trainer's external website.

Reason for deferral: trainers may Google their name and find an inferred-answer profile before Kim has reached out to them. Discovering an unapproved profile before the outreach conversation creates a bad first impression. These pages are valuable after the first trainer responds and claims their profile. In V1, they serve as the landing page for the claim-your-profile flow.

---

## User Flows

### Flow 1: User Finds a Trainer (Core)

1. Lands on `/` — sees "Find your trainer in Toronto or New York"
2. Taps city
3. Quiz: 6 questions, one per screen, tap to advance
4. Sees results: ranked trainer cards with fit scores
5. Taps a trainer card → opens trainer website in new tab
6. (Optional) Enters email → trainer notification sent

**Total time from landing to results: under 2 minutes.**

### Flow 2: Trainer Receives Cold Email (Outreach)

1. User completes quiz and submits their email
2. n8n receives webhook, identifies trainers with score ≥ 60%
3. n8n sends email to each matched trainer:

```
Subject: Someone in [City] scored [X]% fit with your training style

Hi [Name],

Someone in [City] took a trainer matching quiz and scored [X]% fit with your training style.

They're looking for a trainer focused on [goal] with a [style] coaching approach.

They left their email: [user email]

If you'd like to connect with them — or want to receive future matches like this — reply to this email.

You can also update your profile at [URL] to improve your match accuracy.

— FitMatch
```

No action required from the trainer to receive future matches. The profile already exists; the email just alerts them to it.

### Flow 3: Trainer Claims Profile (V1, Not V0)

This flow doesn't exist in V0. Trainers who respond to the cold email are handled manually by Kim:
- Kim replies with a link to a Typeform or Google Form asking for their correct quiz answers, bio, and booking URL
- Kim updates `trainers.json` manually with corrected data
- V1 automates this with a self-service "claim your profile" page

---

## Trainer Profile Data (Curation Process)

**Not a user-facing feature — this is Kim's manual setup work.**

Each trainer profile is a JSON object, manually curated before launch:

| Field | Source |
|-------|--------|
| Name | Google Business / Instagram |
| City + neighborhood | Google Maps |
| Specialty | Website bio / Instagram bio |
| Email | Website contact page / Google Business |
| Photo URL | Website or Instagram (hotlinked or downloaded and hosted) |
| Instagram handle | Instagram |
| Website | Google Business / Instagram bio |
| Quiz answers (inferred) | Bio, specialty, Instagram content — Kim fills in manually |

**Time per profile:** 5-10 minutes.
**Total curation work:** 2-3 hours for 20-30 trainers per city.

Inferred answer guidelines:
- **Goal:** Match their stated specialty (strength coach → "Strength & muscle")
- **Style:** "Push me hard" for coaches who use words like accountability, discipline, results-focused; "Sustainable" for coaches emphasizing lifestyle, longevity, enjoyment
- **Feedback:** "Direct and blunt" for coaches who use words like honest, no excuses, results; "Positive and nurturing" for encouraging, supportive
- **Structure:** "Strict" for coaches who offer periodized programming, plans, or structured templates; "Flexible" for coaches who emphasize adaptability, personalization
- **Check-ins:** Use "A few times a week" as the default if not evident; adjust if bio mentions daily check-ins or session-only contact

---

## Out of Scope for V0

- Trainer signup, login, or self-service
- User accounts or match history
- Reviews or ratings
- Messaging within the app
- Calendly or booking integrations
- More than 1 city (Toronto only at launch; New York added after first trainer responds)
- Automated profile scraping
- Payment of any kind
- Mobile app
- Email marketing / nurture sequences
- Static trainer profile pages (/trainers/[id]) — deferred to V1

---

## Edge Cases That Matter

1. **User's top score is under 70%:** No trainer is notified. User sees results and can still visit trainer links. Consider showing a message: "No strong matches in [city] yet — we're growing our network."

2. **Trainer email bounces:** n8n logs the failed delivery. Kim reviews n8n execution log weekly and updates bounced email addresses in `trainers.json`.

3. **Trainer replies angrily to cold email:** Kim receives the reply (sent from Kim's email via n8n SMTP). Kim responds manually. This is a feature, not a bug — it's a conversation opener.

4. **User submits email twice:** n8n receives two webhooks. Trainer gets two emails. Mitigation: add a short cooldown (e.g., disable the submit button after one click). Don't build deduplication logic for V0.

5. **Trainer's public email is wrong:** User can't reach trainer through the platform-generated link. Profile page has a "Suggest a correction" mailto. Kim fixes in `trainers.json`.

---

## V1 — After First Trainer Responds

Only build after at least 2 trainers reply to the cold email and express interest.

- "Claim your profile" self-service page — trainer submits a form with their correct answers, bio, and booking URL
- Kim reviews and updates `trainers.json` (still manual approval in V1)
- Trainer gets a confirmation email: "Your profile has been updated"
- Trainer can see their match count (simple n8n log export, not a dashboard)

## V2 — After First Trainer Pays

- Premium placement (paid trainers appear first in results at same score tier)
- Trainer dashboard: match history, open rate, click-throughs
- Trainer self-service profile editing (no manual approval by Kim)
- Stripe billing ($X/month for premium placement or lead priority)
- Additional cities beyond Toronto + NY
