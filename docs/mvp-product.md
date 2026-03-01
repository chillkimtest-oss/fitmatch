# MVP Product — FitMatch (Demand-First)

## What It Is

A curated trainer-matching directory with fit scoring. Users take a 6-question quiz and immediately see ranked, scored matches from a hand-curated pool of real trainers in their city. No trainer signup needed. No user account needed. Instant value.

The quiz completion IS the cold outreach to trainers. When a matched trainer receives "someone scored 85% fit with you," that email carries proof of demand — not a sales pitch.

## The Pain It Solves

**For users:** Finding a personal trainer means Googling "personal trainer near me," scrolling reviews, DMing strangers, and scheduling trial sessions with no idea if the coaching style fits. It's slow, uncertain, and expensive to get wrong.

**For trainers (the eventual buyer):** Every trial session with a bad-fit client is an hour of unpaid work. But trainers can't build demand-side tools — they're coaches, not growth marketers.

## The Wedge

Build the demand side first. Curate trainer profiles. Serve users instantly. Use each user match as proof of demand to the trainer: "We sent you a lead. Want more?" The trainer's first experience is a lead appearing in their inbox — not an onboarding form.

## Who It's For

**Users:** People in Toronto or New York looking for a personal trainer who matches their training style and goals.

**Trainers (eventual paying customer):** Independent personal trainers with a public web/Instagram presence. They don't need to know we exist at launch. They receive one cold email when a user matches them.

## What's In V0

- 6-question fit quiz (client side only)
- Curated trainer profiles: 25-30 for Toronto only at launch (New York added after first trainer responds), stored as a JSON file
- Instant results: ranked trainer matches with fit scores shown immediately after quiz
- Optional user email capture: "Let your top matches know you're interested"
- Trainer notification email: sent via n8n when score ≥ 60%, with or without user contact info

## What's Deferred

**After cold-email test (before code):**
- New York curation — validate Toronto first; add New York after first Toronto trainer responds

**V1 (first trainer responds):**
- "Claim your profile" self-service page — trainers correct their inferred answers, add booking link
- Trainer can see how many matches they've received
- Static trainer profile pages (/trainers/[id]) — deferred from V0 to avoid trainers discovering inferred profiles before Kim reaches out
- New York trainer profiles and city selector UI

**V2 (first trainer pays):**
- Premium placement / lead priority (monetization model)
- Additional cities beyond Toronto + NY
- Trainer dashboard (match history, conversion tracking)
- User-facing trainer reviews or social proof

**Never:**
- Consumer marketplace with two-sided matching
- Trainer certification verification
- In-app messaging or scheduling
- User accounts / match history

## Success Criteria

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Quiz completions | 50+ | 30 days |
| User email opt-in rate | 25%+ of completions | 30 days |
| Trainer email opens | 5+ unique trainers | 30 days |
| Trainer responses | 2+ want to claim profile | 30 days |

If 2+ trainers respond within 30 days, WTP conversation begins. If 0 respond after 50+ completions and 10+ trainer emails sent, the cold-email funnel assumption is wrong.

## Key Bets

1. **Users will choose a quiz over Google.** The bet: structured fit scoring feels more trustworthy than scrolling reviews. Could be wrong if users just want a list of names and prices.

2. **Trainers will respond to proof-of-demand emails.** The bet: "someone wanted you" is more compelling than any cold pitch. Could be wrong if trainers don't monitor email or dismiss unsolicited messages.

3. **Inferred quiz answers are good enough.** We assign trainer "answers" based on their public content (bio, specialty, Instagram). Could be wrong if inferred answers are systematically off and produce bad matches.

4. **20-30 profiles per city is enough to show value.** Could be wrong if users see results and think the pool is too small to be useful.

## Experiments to Run Before Building

These are **mandatory gates**, not optional warmup. If an experiment fails, rethink the plan before writing code.

1. **Trainer cold-email gate (1-2 hours, wait 7 days):** Write the trainer notification email. Send it manually to 3 real Toronto trainers found on Google Maps. Track opens and replies. If 0 respond after 1 week, the cold-email funnel assumption is wrong and no automation fixes it. Do not proceed to code if this fails.

2. **SMTP deliverability gate (30 minutes):** Trigger a test email send from n8n using the planned SMTP credentials. Verify delivery to a real inbox (Gmail, Outlook, iCloud). If n8n is on DigitalOcean, confirm SMTP ports are not blocked before proceeding — DigitalOcean blocks all SMTP ports (25, 465, 587) by default on new accounts. If blocked, set up Resend with a custom domain at least 48 hours before the build weekend (DNS propagation takes 24-48 hours).

3. **Profile quality gate (1 hour):** Manually curate 5 trainer profiles. Ask 3 people to take the quiz against those 5 profiles and rate whether the top match "feels right." If 2/3 say yes, inferred answers work.

4. **Threshold-firing gate (30 minutes):** Manually score 5 diverse simulated user answer sets against the 10 curated trainer profiles. Count how many trigger ≥60% match. If fewer than 3 of 5 trigger a match, the trainer pool needs more diversity or the threshold needs further adjustment before launch.

5. **User intent signal:** Post in a Toronto fitness Facebook group or subreddit: "Would you take a 2-minute quiz to get matched with a trainer based on style fit?" Count responses. If 5+ say yes, the demand signal exists.
