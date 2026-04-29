# NILPro · Incentive System Implementation Brief

**Audience:** Claude Code
**Scope:** Build the local perks system, the engineered first-week perk drip, and the Verified Athlete digital card
**Status:** Phase 2 build (after core MVP — assumes athlete signup, dashboard, and verification flow already exist)

---

## What this document covers

Three tightly interlocked features:

1. **Local Perks Network** — pool of perk partners per market, athlete-to-perk matching, redemption flow
2. **First-Week Perk Drip** — engineered delivery of 3 perks on day 2, day 4, and day 8 after signup
3. **Verified Athlete Card** — generated digital card, downloadable as Instagram Story / TikTok (9:16) and Instagram Post (4:5)

These features depend on each other and should be built as a unit, not in isolation. The card unlocks the perks. The perks deliver the first-week drip. The drip drives engagement and shares of the card.

---

## Core principle: language and integrity

Before any code: there is one piece of product discipline that must hold across this entire system.

**Local perks are NOT sponsorships.** They are real, NILPro-negotiated discounts from local businesses, but they are categorically different from brand sponsorship deals. The dashboard, notifications, and emails must visually and verbally distinguish them.

- ✅ "Congrats! You just received 20% off at Tony's Pizza."
- ✅ "Local deal added: 15% off Joe's Sporting Goods."
- ✅ Dashboard section: **"Local Deals"** (separate from "Sponsorships")
- ❌ "You scored a deal!" (with no qualifier)
- ❌ "You have an offer!" ("offer" = sponsorship language, reserved)
- ❌ Mixing perks and sponsorships in the same dashboard section

Sponsorship language ("offer," "sponsorship," "signed") is reserved for actual brand deals from the cold outreach pipeline. Perk language ("perk," "local deal," "received X% off") is for the discount network. **This separation is a hard product rule, not a styling preference.**

---

## 1. Local Perks Network

### Database schema

```sql
-- Perk partner businesses (e.g., Tony's Pizza, Joe's Sporting Goods)
CREATE TABLE perk_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'food', 'apparel', 'fitness', 'services', etc.
  market TEXT NOT NULL, -- e.g., 'cincinnati-oh', 'austin-tx' (slug format)
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  -- Offer terms
  discount_description TEXT NOT NULL, -- e.g., "20% off any meal", "Free first cut"
  discount_short_label TEXT NOT NULL, -- e.g., "20% off", "Free first cut" (notification-friendly)
  redemption_instructions TEXT, -- "Show this screen at checkout"
  fine_print TEXT, -- "Cannot combine with other offers", "Dine-in only", etc.
  -- Capacity
  monthly_redemption_cap INT DEFAULT 50, -- max athletes who can redeem per month
  current_month_redemptions INT DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'churned'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  -- Metadata
  notes TEXT, -- internal ops notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_perk_partners_market_status ON perk_partners(market, status);
CREATE INDEX idx_perk_partners_category ON perk_partners(category);

-- Athlete-to-perk assignments (the rotation log)
CREATE TABLE athlete_perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id),
  partner_id UUID NOT NULL REFERENCES perk_partners(id),
  -- Lifecycle
  assigned_at TIMESTAMPTZ DEFAULT NOW(), -- when system matched athlete to perk
  scheduled_delivery_at TIMESTAMPTZ NOT NULL, -- when notification fires
  delivered_at TIMESTAMPTZ, -- when notification actually sent
  redeemed_at TIMESTAMPTZ, -- when athlete redeemed in-store
  -- Redemption tracking
  redemption_code TEXT UNIQUE, -- generated short code, e.g., "NLP-K3X9"
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'delivered', 'redeemed', 'expired'
  -- Source
  source TEXT NOT NULL, -- 'first_week_drip', 'manual_grant', 'milestone_reward'
  drip_day INT, -- 2, 4, or 8 for first-week drip
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_athlete_perks_athlete ON athlete_perks(athlete_id);
CREATE INDEX idx_athlete_perks_partner ON athlete_perks(partner_id);
CREATE INDEX idx_athlete_perks_scheduled ON athlete_perks(scheduled_delivery_at, status) WHERE status = 'scheduled';

-- Redemption log (separate from assignments because one perk can theoretically be redeemed once but the event is its own record)
CREATE TABLE perk_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_perk_id UUID NOT NULL REFERENCES athlete_perks(id),
  athlete_id UUID NOT NULL REFERENCES athletes(id),
  partner_id UUID NOT NULL REFERENCES perk_partners(id),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  redemption_method TEXT, -- 'qr_scan', 'code_entry', 'manual_partner_report'
  notes TEXT
);

CREATE INDEX idx_perk_redemptions_partner_month ON perk_redemptions(partner_id, redeemed_at);
```

**Important:** the `athletes` table needs a `market` field to power matching. If it doesn't already, add it. The market should derive from the school's location (you can do this either by (a) hard-coding a market mapping per school, or (b) deriving from school's city/state). Start with a manual school→market mapping table since you'll have a small number of schools at first.

### Matching algorithm

When an athlete signs up and is verified, the system needs to assign 3 perks for the first-week drip.

```typescript
async function assignFirstWeekPerks(athleteId: string): Promise<void> {
  const athlete = await getAthlete(athleteId);

  // 1. Get all active perk partners in the athlete's market
  //    that are NOT at their monthly cap
  const eligiblePartners = await db.query(`
    SELECT p.*
    FROM perk_partners p
    WHERE p.market = $1
      AND p.status = 'active'
      AND p.current_month_redemptions < p.monthly_redemption_cap
    ORDER BY (
      -- Prefer partners with fewer recent assignments (load balancing)
      SELECT COUNT(*) FROM athlete_perks ap
      WHERE ap.partner_id = p.id
        AND ap.assigned_at > NOW() - INTERVAL '7 days'
    ) ASC,
    -- Tiebreaker: random
    RANDOM()
    LIMIT 10
  `, [athlete.market]);

  if (eligiblePartners.length < 3) {
    // Fallback: if market doesn't have enough partners, log this for ops attention
    await logOpsAlert('insufficient_perks_for_market', {
      athleteId,
      market: athlete.market,
      availableCount: eligiblePartners.length
    });
    // Still proceed with whatever's available — better some than none
  }

  // 2. Pick top 3 (or fewer if not enough)
  const selectedPartners = eligiblePartners.slice(0, 3);

  // 3. Schedule deliveries for day 2, day 4, day 8
  const deliveryDays = [2, 4, 8];
  const signupTime = athlete.created_at;

  for (let i = 0; i < selectedPartners.length; i++) {
    const partner = selectedPartners[i];
    const day = deliveryDays[i];
    const scheduledAt = addDays(signupTime, day);

    await db.query(`
      INSERT INTO athlete_perks (
        athlete_id, partner_id, scheduled_delivery_at,
        redemption_code, status, source, drip_day
      ) VALUES ($1, $2, $3, $4, 'scheduled', 'first_week_drip', $5)
    `, [
      athleteId,
      partner.id,
      scheduledAt,
      generateRedemptionCode(), // e.g., "NLP-K3X9"
      day
    ]);
  }
}

function generateRedemptionCode(): string {
  // Short, non-confusing code. No 0/O, no 1/I/L
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const code = Array.from({length: 4}, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `NLP-${code}`;
}
```

**Rationale for the algorithm:**
- Filters by market so athletes only get perks they can actually use
- Excludes partners at cap so no business gets overwhelmed
- Load-balances based on recent assignment volume (newer partners and less-used partners get priority)
- Random tiebreaker ensures variety across athletes

### Delivery cron

A cron job runs every 15 minutes to deliver scheduled perks:

```typescript
async function deliverScheduledPerks(): Promise<void> {
  const due = await db.query(`
    SELECT ap.*, a.email, a.first_name, p.business_name, p.discount_short_label
    FROM athlete_perks ap
    JOIN athletes a ON a.id = ap.athlete_id
    JOIN perk_partners p ON p.id = ap.partner_id
    WHERE ap.status = 'scheduled'
      AND ap.scheduled_delivery_at <= NOW()
    LIMIT 100
  `);

  for (const perk of due) {
    await sendNotification(perk);
    await db.query(`
      UPDATE athlete_perks
      SET status = 'delivered', delivered_at = NOW()
      WHERE id = $1
    `, [perk.id]);
  }
}
```

### Notification copy

The notification copy is deliberately calibrated based on which day of the drip:

**Day 2 (first perk — celebrate):**
- Push / email subject: "🎉 Congrats! You just received {discount} at {business}"
- Email body opener: "Your first local deal is live! As a verified NILPro athlete in {city}, you've got 20% off at Tony's Pizza. Show this screen next time you're there to redeem."

**Day 4 (second perk — informational):**
- Push / email subject: "New: {discount} at {business}"
- Email body opener: "Another local deal just dropped into your dashboard — {discount} at {business}."

**Day 8 (third perk — informational):**
- Push / email subject: "Added: {discount} at {business}"
- Email body opener: "Your third local deal is in: {discount} at {business}. That's 3 active deals in your first week."

The first one celebrates. The next two inform. This avoids fanfare fatigue while keeping the value visible.

### Redemption flow (athlete-side)

In the athlete's dashboard, the "Local Deals" section shows:

1. **Active perks** — currently redeemable
2. **Used perks** — already redeemed, show date

When athlete taps a perk:
- Full-screen redemption view
- Shows: business name, discount, fine print, address/map link
- Shows: redemption code (large, scannable QR encoding the code)
- Shows: athlete's verified badge + name (so cashier can confirm identity)
- Button: "Mark as redeemed" (athlete self-reports — see below for why)

### Redemption tracking

There are two tracking modes — start with self-report, layer in partner-side reporting later:

**v1 (launch): Athlete self-reports.**
- Athlete taps "Mark as redeemed" after using
- Creates a `perk_redemptions` row
- Increments `perk_partners.current_month_redemptions`
- Honor system, but adequate for initial trust-building

**v2 (later): Partner-confirms via simple web form.**
- Each partner gets a magic link to a "confirm redemption" page
- They enter the redemption code shown by the athlete
- This gives you cleaner data for the monthly partner report

**v3 (eventually): QR scan via partner-side mobile experience.**
- Out of scope for this build

### Monthly counter reset

A monthly cron resets `current_month_redemptions` to 0 on the 1st of each month. Simple, but critical — without it, partners will all hit cap and never get refreshed.

### Partner monthly report

Once a month, send each active partner an email summary:

> Hi {contact_name},
>
> Here's your NILPro perk partner summary for {month}:
>
> - Athletes who redeemed: {count}
> - Most recent redemption: {date}
>
> Thanks for being part of the network. Reply to this email if you'd like to adjust your offer or pause for a while.
>
> — NILPro Team

This should be automated. It's the single most important touchpoint for partner retention.

---

## 2. First-Week Perk Drip

The drip is implemented entirely through the matching algorithm + delivery cron above. There's no separate system — the `scheduled_delivery_at` field drives everything.

### Trigger

`assignFirstWeekPerks(athleteId)` is called immediately after an athlete completes verification (not at signup — verification gates everything).

### Delivery cadence

- **Day 2** after verification → first perk notification
- **Day 4** after verification → second perk notification
- **Day 8** after verification → third perk notification

### Day 7 recap email

On day 7 (between perks 2 and 3), send a recap email:

> Subject: Your first week with NILPro
>
> Hi {first_name},
>
> Quick recap of your first week:
>
> ✅ 2 local deals unlocked: {deal_1}, {deal_2}
> ✅ {outreach_count} sponsorship pitches sent on your behalf
> ✅ {open_count} brands have opened your pitch
>
> One more local deal drops tomorrow. Sponsorship outreach continues — this is the slow part, but every email opens a door.
>
> View your dashboard → {dashboard_url}
>
> — NILPro Team

This sets the narrative: perks are immediate value, sponsorships are the long game, both are happening.

### Edge case: no perks available in athlete's market

If `assignFirstWeekPerks()` finds fewer than 3 eligible partners:

1. Schedule whatever's available (1 or 2 perks)
2. Log an ops alert
3. Send the athlete a slightly different day-7 email acknowledging "we're still building our partner network in your area"
4. Backfill assignments when new partners join the market — re-run a "catch up" assignment for athletes in markets that just gained partners

This is critical: **never leave an athlete with zero day-1 wins**. If a market has zero local partners, there should be a fallback to "national" perks (digital-only — student streaming discounts, etc.) so the drip still has something to deliver.

---

## 3. Verified Athlete Card

### Spec

Two output formats:

| Format | Dimensions | Aspect | Use case |
|--------|------------|--------|----------|
| Story / TikTok | 1080 × 1920 | 9:16 | Instagram Story, TikTok post |
| Instagram Post | 1080 × 1350 | 4:5 | Instagram feed post |

The 4:5 IG Post format is preferred over 1:1 because it takes more screen real estate in feeds and gets higher engagement.

### Fields on the card

Pulled from athlete data:

1. Athlete photo (athlete-uploaded; fallback: branded initials avatar)
2. First name (large)
3. Last name (large, accent color)
4. School name
5. Sport + position (e.g., "Basketball • Point Guard")
6. Class year ("Class of 2027")
7. Hometown ("Austin, TX") — for HS athletes, consider state-only as a privacy default with an opt-in to show city
8. Verified badge (shield icon)
9. NILPro logo + "Verified Athlete" wordmark
10. Athlete ID (e.g., "01842" — zero-padded to 5 digits)
11. Member year ("2026 Member")
12. QR code → links to public profile URL `nilpro.com/a/{athlete_id}`
13. Profile URL text under QR
14. Tagline: "YOUR HOMETOWN. YOUR DEALS." (lock-up at bottom)

**Do NOT include on card:** stats, follower counts, tier label, sponsor logos, billing info, birthdate, contact info.

### Generation pipeline

Use **Satori + Sharp** for server-side image generation. Both are mature, fast, and run well on Vercel/Node.

```bash
npm install satori sharp
```

Architecture:

```
[Card template (React/JSX)]
         ↓
[Satori → SVG]
         ↓
[Sharp → PNG (1080×1920 or 1080×1350)]
         ↓
[Save to Supabase Storage]
         ↓
[Return signed URL to athlete]
```

```typescript
// /api/cards/generate.ts
import satori from 'satori';
import sharp from 'sharp';
import { CardTemplate } from '@/components/cards/CardTemplate';
import { uploadToStorage } from '@/lib/storage';

export async function generateAthleteCard(
  athleteId: string,
  format: 'story' | 'post'
): Promise<string> {
  const athlete = await getAthleteWithCardData(athleteId);

  const dimensions = format === 'story'
    ? { width: 1080, height: 1920 }
    : { width: 1080, height: 1350 };

  // Render React component to SVG via Satori
  const svg = await satori(
    <CardTemplate athlete={athlete} format={format} />,
    {
      width: dimensions.width,
      height: dimensions.height,
      fonts: await loadFonts() // load brand fonts
    }
  );

  // Convert SVG to PNG via Sharp
  const png = await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toBuffer();

  // Upload to Supabase Storage
  const path = `cards/${athleteId}/${format}-${Date.now()}.png`;
  const url = await uploadToStorage('athlete-cards', path, png);

  return url;
}
```

### Photo handling

Athletes upload their own photo. Real-world photos vary wildly in quality. Build the template to handle:

1. **Crop to portrait aspect ratio** before applying. Use Sharp:
   ```typescript
   const cropped = await sharp(uploadedBuffer)
     .resize(720, 960, { fit: 'cover', position: 'top' })
     .toBuffer();
   ```
2. **Fallback to initials avatar** when no photo: green circle with white initials, no broken-image placeholder
3. **Size limit on upload:** 10MB max, auto-downscale to 2000px on longest dimension before storing

### Fonts

Use a free, athletic-feeling display font. Recommendations:
- **Anton** (Google Fonts) — heavy condensed, very athletic
- **Bebas Neue** (Google Fonts) — slimmer condensed, modern
- **Oswald** (Google Fonts) — classic athletic

Body / labels: **Inter** or **Barlow** for clean readability.

Bundle the .ttf or .otf files locally — Satori needs the font files, not Google Fonts URLs.

### Card template component

Build as a single React component that takes athlete data + format. The template is JSX that Satori can render. Constraints:

- No CSS animations, no JavaScript runtime
- Inline styles or limited Tailwind subset (Satori supports a subset)
- Background images via base64 or absolute URLs

Reference design: see attached card mockups (Jalen Carter / Devin Marshall). Use Image 1 (Jalen) as the primary template structure.

### Customization in v1

Athletes can customize:
- ✅ Their photo
- ✅ Their displayed sport (if multi-sport)
- ✅ Their displayed name (preferred name vs. legal name)

Athletes cannot customize (in v1):
- ❌ Card colors / theme
- ❌ Layout
- ❌ Fonts
- ❌ Tagline

Why: keeps every card visually consistent on social, reinforces the NILPro brand, easier to maintain. Later you can introduce premium card variants as a Champion-tier perk.

### Sharing flow

After verification, athlete is taken directly to "Your card is ready" screen. They see:

1. The Story/TikTok card preview (vertical, 9:16)
2. Toggle to switch to IG Post preview (4:5)
3. **Download** button — downloads the current format as PNG
4. **Share to Instagram Story** button — opens IG Story share sheet (mobile only) with the image pre-loaded
5. **Copy caption** button — copies a pre-filled caption: "Officially verified with @nilpro 🏆"

### Public profile page

The QR on the card links to `nilpro.com/a/{athlete_id}` — a public profile page showing:

- Athlete name, photo, school, sport, class year, hometown
- Verified badge
- Member since {year}
- (Eventually: link to highlight reel, list of sponsors with permission)

This page is **public, indexable, lightweight**. It serves as social proof when anyone scans the card.

---

## Implementation order

Build in this order to minimize blocked dependencies:

### Phase A: Schema + admin (week 1)

1. Migrations for `perk_partners`, `athlete_perks`, `perk_redemptions` tables
2. Add `market` field to `athletes` table
3. School → market mapping table (small, manually maintained)
4. Internal admin page to CRUD perk partners (create / edit / pause / delete)
5. Internal admin page to view athletes' assigned perks and redemption history

### Phase B: Card generation (week 1–2)

1. Set up Satori + Sharp pipeline
2. Build CardTemplate React component matching attached design
3. Card generation API endpoint
4. Athlete photo upload + cropping flow
5. Fallback initials avatar
6. Public profile page at `/a/{athlete_id}`

### Phase C: Perk assignment + delivery (week 2)

1. `assignFirstWeekPerks(athleteId)` function — called after verification
2. Delivery cron (every 15 min) to fire scheduled notifications
3. Email notification templates (3 versions: day 2, day 4, day 8)
4. Day 7 recap email
5. Monthly counter reset cron
6. Ops alert when market has insufficient partners

### Phase D: Athlete-facing redemption (week 2–3)

1. "Local Deals" dashboard section
2. Active vs. used perks
3. Full-screen redemption view (code, QR, fine print)
4. "Mark as redeemed" self-report
5. Card "Share to Story" / "Download" flow integrated into post-verification screen

### Phase E: Partner-facing (week 3)

1. Monthly partner summary email (automated)
2. Magic-link redemption confirmation page (v2 redemption tracking)
3. Partner-facing "pause my participation" page

---

## Notification copy reference

For consistency, here are the exact copy lines to use:

### Day 2 push notification
- **Title:** "🎉 First local deal unlocked"
- **Body:** "Congrats! You just received {discount} at {business}. Tap to see how to redeem."

### Day 2 email
- **Subject:** "Congrats! You just received {discount} at {business}"
- **Pre-header:** "Your first NILPro local deal is live."
- **Opener:** "Hey {first_name}, your first local deal just dropped. As a verified NILPro athlete in {city}, you've got {discount} at {business}."

### Day 4 push notification
- **Title:** "New local deal added"
- **Body:** "{discount} at {business}. Open the app to see details."

### Day 4 email
- **Subject:** "New: {discount} at {business}"
- **Pre-header:** "Another local deal just hit your dashboard."

### Day 8 push notification
- **Title:** "Local deal added"
- **Body:** "{discount} at {business}. That's 3 deals in your first week."

### Day 8 email
- **Subject:** "Added: {discount} at {business}"
- **Pre-header:** "Your third local deal of the week."

### Day 7 recap email
- **Subject:** "Your first week with NILPro"
- **Pre-header:** "{deal_count} local deals + {outreach_count} sponsorship pitches sent."

### Sponsorship offer (separate, do NOT use perk language)
- **Title:** "🏆 Sponsorship offer received"
- **Body:** "{brand} replied — they want to talk about a deal. Open to see details."

### Sponsorship signed (separate)
- **Title:** "Deal signed 💸"
- **Body:** "You just closed a sponsorship with {brand}."

---

## Testing checklist

Before launching to real athletes:

- [ ] Sign up a test athlete in a market with 5+ partners → confirm 3 perks assigned at correct times
- [ ] Sign up a test athlete in a market with 0 partners → confirm graceful fallback
- [ ] Sign up a test athlete in a market with 2 partners → confirm 2 perks scheduled, alert logged
- [ ] Mark perk redeemed → confirm partner counter increments, redemption logged
- [ ] Run monthly reset cron manually → confirm counters reset to 0
- [ ] Generate cards for athletes with photo → confirm both formats render
- [ ] Generate cards for athletes without photo → confirm initials fallback
- [ ] Generate cards across sports (basketball, football, softball, track) → confirm template adapts
- [ ] Athlete with very long name → confirm name fits or truncates cleanly
- [ ] Public profile page loads at `/a/{athlete_id}` → matches QR destination
- [ ] Share to Instagram Story → confirm image arrives at correct dimensions

---

## Open questions for product

Items that need a product/business decision before or during build:

1. **Market definition.** Is "Austin, TX" one market or does it split into multiple zones? Start: one market = one metro area. Refine later.
2. **National fallback perks.** What digital-only deals do we offer when local partners are unavailable? (Streaming services? Athletic gear sites with student discounts?)
3. **Photo moderation.** Do we manually approve photos or rely on automated NSFW detection? Start: automated + flagged review queue.
4. **Annual card refresh.** When does the "2026 Member" card update to "2027"? Start: automatically on January 1, regenerate all active member cards as a batch.
5. **Card removal on subscription cancellation.** When an athlete cancels, the public profile page should redirect to a "membership ended" state. Card downloads previously taken stay in the wild — that's fine and expected.
