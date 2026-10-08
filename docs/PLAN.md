# Tapika: gifting site + Command Center prototype (v2, audited)

## Context
Tapika (`@tapika44`, 57 posts, 420 followers) sends gifts from Nepal to people in Australia. Today the whole business runs through Instagram DMs. Bio: "Problem solved!! Send quality gifts all over Australia from Nepal. Esewa accepted". `tapika.shop` is linked from the bio but **doesn't resolve** (2026-10-08), so we're starting from zero.

`Tapika.md` is the blueprint. It calls the business "Eva's Gift Shop", but the brand is **Tapika**. The owner's display name is a setting (`config/business.ts → ownerName`, default "Eva") because the real name is unconfirmed. The blueprint's demo story is: Aarav (Kathmandu) builds a birthday box for Sarah (Melbourne) → Eva logs in and sees the BOM and the procurement list. Its target architecture is: Command Center = the screens Eva uses, Google Sheets = where the data lives, and a backend in between.

**What she really sells (IG grid). This drives the catalogue, not the blueprint's mug/candle examples:**
- Rakhi + mithai sets (barfi, Soan Papdi)
- Dry-fruit and chocolate platters (cashew, pistachio, walnut, KitKat, Ferrero)
- **Personalised photo-collage frames** (couple + date + heart centrepiece). This is her signature item.
- Teddy + chocolate hampers, "I love you" and "Thanks for everything" cards
- Branded gift boxes (Adidas, perfume), dhaka/fabric pieces
- IG highlights: **Customer reviews** and **Rakhi**. Festivals (Rakhi, Teej, Dashain/Tihar) are seasonal peaks.

## Audit: gaps found in v1 of this plan, and how v2 closes them
| # | Gap | Fix in v2 |
|---|---|---|
| 1 | **Currency backwards.** Buyers are in Nepal and pay NPR via eSewa, but v1 showed A$ first. | NPR shown first everywhere, A$ secondary. One `config/pricing.ts` holds the base A$ cost, FX rate, rounding (nearest Rs 50) and the "rate as of" date shown at checkout |
| 2 | **Demo only works in one browser.** localStorage won't sync phone ↔ laptop | Stated in the demo script: run the whole meeting demo on one device. A "Reset demo" button in the OS footer and `?demo=1` seed so the demo order is always **TP-1048** |
| 3 | **Uploaded collage photos would overflow localStorage (~5 MB)** | Photos are compressed (reusing Noree's `compressImage`, 1200px) and stored in **IndexedDB**; orders keep only the key. Max 12 photos per frame |
| 4 | **The builder had no rules**: unlimited items in a small platter, frames inside a hamper | `data/formats.ts` gives each format a capacity (slot count), allowed categories, and auto-added packaging. The preview shows "3 of 6 spaces used". Out-of-stock items are hidden from shop and builder, driven live by the OS Products toggle (same Settings→site loop as Filix) |
| 5 | **BOM incomplete.** Packaging, card, ribbon and personalisation tasks weren't derived | `builder/bom.ts` (pure function) expands an order into products + format packaging + wrap + card + a "Print collage (12 photos)" task line. Ready-made gifts expand through their template's components, so procurement sees parts, never "Birthday Box ×1" |
| 6 | **"Today's procurement" undefined** | Procurement = items on orders in PAYMENT CONFIRMED / TO PURCHASE whose **delivery date − lead time ≤ selected day**. Marking a line purchased is tracked per order line, so a total never double-counts or forgets. Tabs: Today / This week |
| 7 | **No lead time, cutoffs or timezones.** Customer is in NPT (+5:45), delivery is in AU | `config/business.ts`: lead days (default 3), per-festival cutoffs (Rakhi), delivery cities + fees, AU business timezone. The date picker disables dates that are too soon. Dates are stored as AU local dates (Filix timezone fix reused) |
| 8 | **Payment flow unrealistic.** A mock "paid" hides how eSewa actually works today | Checkout ends with eSewa instructions + an **"upload payment screenshot"** step (her real current flow). Order lands as NEW + "awaiting payment check", and Eva taps **Confirm payment** in the OS. Real eSewa ePay is Phase B |
| 9 | **Fabricated social proof risk** (honesty guardrails in memory) | Reviews strip uses only real review text from her IG highlight, anonymised ("— customer in Kathmandu"). Seed prices carry a small "sample prices" label in the footer. All seed people are fictional, with `.example` emails |
| 10 | **Prototype could get indexed under her brand** | `noindex` meta + `robots.txt` disallow on the Vercel URL. Real SEO/OG (`seo-architect`) is done at launch, OG image added now so shared links look right |
| 11 | **Track Order leaks data** if only the order ID is required | Lookup needs order ID + sender phone's last 4 digits |
| 12 | **Customer/recipient duplicates** | Customer matched by phone, recipient by name + suburb under that customer. Repeat buyers show the "Send again to Sarah?" chip on the OS customer page |
| 13 | **Contact fallback missing.** Some buyers will still want to DM | Floating "Ask Tapika" goes to an Instagram DM link + WhatsApp (number TBD) with the cart summary prefilled |
| 14 | **Help Me Choose had no logic** | `builder/recommend.ts`: tag-scored (recipient, occasion, budget band, interests) against templates. Returns the top 3 with a "why this" line. Deterministic, no AI |
| 15 | **Logo is a 150px avatar.** An SVG rebuild is a guess | Rebuild as SVG for the prototype, marked "approximation, request original file" in `BRAND.md` |
| 16 | **Devanagari not covered by fonts** (Nepali touches, names) | Pick a type pairing with a Devanagari companion (e.g. Mukta/Noto Sans Devanagari) in `tokens.css` |
| 17 | **Instagram scraping risks** | Run in the user's logged-in Chrome, read-only (no likes/follows/DMs). CDN URLs are signed and expire, so download right away. Reels: save the cover frame only. Pace requests, and stop to ask if IG shows a challenge |
| 18 | **No git, raw images could be pushed** | `git init`, private GitHub repo. `assets/instagram/raw/` is gitignored (only the chosen WebPs ship). `.env` is gitignored with an `.env.example` |
| 19 | **No tests on the logic that matters** | Vitest unit tests for `bom.ts`, `procurement.ts`, `pricing.ts`, `recommend.ts`, written test-first |
| 20 | **Accessibility** | Builder fully keyboard-operable, live-region announcement of the total, alt text from the inventory, `prefers-reduced-motion` respected |
| 21 | **Sheets Phase B mapping undefined** | Store types and CSV export use **exactly** the 8 Sheets tab names + column headers, kept in `os/sheetsSchema.ts`. The future bridge is then a 1:1 mapping (schema-check lesson from n8n memory) |
| 22 | **Hosting caveat** | Vercel Hobby is fine for the pitch. Flag that paid client work needs Pro or Cloudflare Pages (Noholi precedent). DNS for tapika.shop comes after approval |

## Deliverable (owned decision, same as Filix/Muze)
**Working prototype on one Vercel URL**, not Figma. Data lives in localStorage + IndexedDB. Every store mutation mirrors a future Sheets-backend call 1:1, so Phase B only changes the data layer.
Stack: **TanStack Start + React 19 + Tailwind v4 + Vitest**, Filix scaffold (`nitro()` in vite config). Location: `d:\EXPERIUS\Websites\tapika.shop\site\`

## ♻️ Reusable from what we've built (updated every time)
| From | What | Reuse in Tapika |
|---|---|---|
| **Filix** `Renta de toro mechanico/filix/` | TanStack Start scaffold, `vite.config.ts` with `nitro()` | Skeleton + deploy config |
| Filix `src/os/store.ts` | `useSyncExternalStore` + localStorage; mutations mirror backend 1:1 | `createOrderFromBuilder`, `confirmPayment`, `advanceOrderStatus`, `markPurchased`, `tickChecklistItem`, `resetDemoData` |
| Filix `src/os/logic.ts` | `todayPriorities`, `dashboardSummary`, `customerHistory`, `checklistProgress` | Dashboard priorities, customer totals, fulfilment progress |
| Filix `src/os/checklistTemplate.ts` | Generated per-record checklist | 9-step fulfilment checklist |
| Filix `src/os/auth.ts` + `/login` | `VITE_OS_EMAIL/PASSWORD` demo gate, footer "Admin" link | Eva login (**demo gate, not security**) |
| Filix `os/components/Shell.tsx`, `routes/os/*` | OS shell; folder `index.tsx`+`$id.tsx` routes; business-timezone calendar | Orders, detail, Delivery calendar, Customers |
| Filix `components/Calendar.tsx` | react-day-picker v10 via `--rdp-*` | Delivery date picker with disabled dates |
| Filix `StickyMobileBar.tsx`, route-aware Header | Hidden-until-scrolled CTA bar; header contrast fix | Mobile "Your gift · Rs total" bar |
| **Muze** `pages/drop/Checkout.tsx`, `Confirmation.tsx`, `OrderPage.tsx` | Checkout → confirmation → status ladder | Checkout, confirmation timeline, Track Order |
| Muze `pages/admin/sections.tsx` | Dense console: 44px rows, tabular figures, all derived | Command Center tables |
| Muze `config/economics.ts` | Single pricing config | `config/pricing.ts` |
| Muze `HeroPrint.tsx` | Hand-authored self-drawing SVG | Gift-box preview illustration, ribbon draw-on |
| **Noree** `src/lib/compressImage.ts` | Canvas→WebP with PNG-fallback fix | Collage photo upload, admin product images |
| Noree e-com checklist | Eager first 4 / lazy rest; no substring category search | Shop grid + filters |
| **Mehjabin** guided demo tour | Scripted customer→admin walkthrough | "Play the demo" (Aarav→Sarah) |
| **Filix** booking wizard step pattern | Multi-step wizard, one field shape = one backend call | Builder step machine |
| **n8n on VPS** + Sheets schema-check memory | Webhook → Sheets nodes | Phase B bridge |
| booking-crm-kit | RLS/RPC contract | Only if Sheets is outgrown → Supabase |

## Execution order
**Step 0: Instagram photos (approved).** Open all 57 posts + carousel slides in Chrome → save full-res images to `assets/instagram/raw/` right away (signed URLs expire). Write `assets/instagram/inventory.md` with post date, caption gist, category, usable/skip + reason, and alt text. Skip or blur real customers' faces/names/dates on collage frames, and anonymise review screenshots. Pick ~25 → WebP 1400px q82 → `site/public/img/products/`. Note which products have **no** usable photo.

**Step 1: Brand guideline** (run `owning-design-decisions` + `design-taste-frontend` first; colour taken from the logo's mint-on-black + photo palette of marigold, rakhi red, kraft).
`brand/BRAND.md` covers story, positioning line, voice (EN with Nepali warmth: "Namaste", "maya"), do/don't, photo rules, and the logo approximation flag. `brand/tokens.css` holds colour, type (incl. Devanagari), spacing, radius, shadow, motion. `brand/logo/` has an SVG mark + wordmark in light/dark, plus favicon. `brand/brand-guide.html` is a visual guideline page published as an Artifact. The site imports `tokens.css`, so there is one source of truth.

**Step 2: Learnable file organisation**
```
tapika.shop/
  README.md            ← folder map + "Where do I change X?" table
  Tapika.md            ← original blueprint (unchanged)
  docs/                ← PLAN.md, DECISIONS.md, REUSABLE.md, DEMO-SCRIPT.md, HOW-IT-FITS.md, GLOSSARY.md (BOM, procurement, lead time…)
  brand/               ← guideline, tokens, logo
  assets/instagram/    ← raw downloads (gitignored) + inventory.md
  site/
    src/
      routes/          ← one file = one URL
      components/      ← shared UI
      builder/         ← steps, preview, budget, bom.ts, recommend.ts
      os/              ← Command Center: store, logic, procurement.ts, sheetsSchema.ts, seed, auth
      data/            ← products.ts, templates.ts, formats.ts (edit catalogue here)
      config/          ← pricing.ts, business.ts (FX, fees, lead time, cities, owner name)
      lib/             ← compressImage, idb, format, csv
    tests/             ← vitest for bom / procurement / pricing / recommend
```
Each folder has a `README.md`. Each file opens with a 1–2 line header comment saying what it does and who calls it. `docs/HOW-IT-FITS.md` traces TP-1048 through the files, from builder click to procurement line.

**Step 3: Logic first, test-first.** Types, data, `formats`, `pricing`, `bom`, `procurement`, `recommend` + Vitest, before any UI.

**Step 4: Customer screens** (mobile-first)
1. Home: "Send a little love to Australia." Shop / Build / Help Me Choose paths; popular gifts; How it works; Why Tapika; real reviews; eSewa badge; festival banner (next Rakhi/Tihar cutoff).
2. Shop: filters for occasion (Birthday, Anniversary, Rakhi & Festivals, Love, Thank You, New Baby, Wedding), recipient, NPR price band.
3. Product detail: includes-list, card message/style, delivery date, **Customise this gift** → builder pre-filled.
4. **Gift Builder**: Who → Occasion → Format (Box / Hamper / Platter / Photo Frame / Just a few things) → Add items (capacity-aware) → Customise (wrap, card, message, collage upload + names + date) → Preview → Delivery. Layered SVG/cut-out preview, no emoji. Budget meter. Starters: Rakhi Set, Birthday Box, Love Hamper, Thank You Platter.
5. Help Me Choose: 5 questions → top 3 with "why this".
6. Cart → Checkout (Sender NP / Recipient AU / date + window / message / eSewa instructions + screenshot upload) → Confirmation **TP-1048** with timeline → Track Order (ID + phone last 4).
7. How it works, About, FAQ, Delivery, Refund, Terms, Privacy (placeholder copy, flagged in-page for the owner to replace).

**Step 5: Command Center** (`/os`)
- Dashboard: greeting with `ownerName`, counts by status, **awaiting payment check**, pending revenue (NPR + A$), today's priorities, procurement summary
- Orders list + detail: BOM, status ladder NEW → PAYMENT CONFIRMED → TO PURCHASE → PREPARING → READY → OUT FOR DELIVERY → DELIVERED (+ ON HOLD), payment screenshot, collage photos + names/date, checklist
- Procurement: Today / This week, aggregated, mark purchased per line
- Delivery calendar by AU city (business timezone)
- Products (flags, cost/margin, in-stock toggle feeding the site live), Customers, Recipients (important dates)
- Settings (FX rate, lead days, fees, owner name) + Data page (8 Sheets tabs, CSV export with exact headers) + Reset demo

**Step 6: Polish + ship.** a11y pass, noindex, OG image, git init + private repo, Vercel deploy, `docs/DEMO-SCRIPT.md`.

## Not built in Phase A (scope contract)
Real eSewa ePay, Google Sheets bridge, email/WhatsApp notifications, customer accounts, multi-device sync, AI recommendations, drag-and-drop/3D builder, inventory counts, Nepali full translation, real domain/DNS.

## Open items for the owner (don't block the build)
Real name; original logo file; AU cities + delivery fees; real prices + costs; lead time + festival cutoffs; eSewa merchant vs personal; where frames are printed; WhatsApp number; permission to show her review screenshots; policy wording (refunds on perishables).

## Verification
- `npm test` (Vitest) green: BOM expansion incl. packaging/templates, procurement date window + no double count, NPR rounding, recommend top-3
- `npm run build` clean, `tsc` 0 errors
- Playwright demo story: Sarah's birthday box → capacity limit hit and respected → checkout with screenshot → TP-1048 → Track Order (wrong phone digits refused) → `/os` shows "awaiting payment check" → Confirm payment → BOM exact → Procurement includes its lines → mark purchased → checklist → DELIVERED → Track Order reflects it → Reset demo restores the seed
- Toggle a product out of stock in OS → gone from shop + builder
- 390px mobile pass (Home, Builder, Checkout, OS dashboard), no horizontal scroll, keyboard-only builder run
- Vercel: SSR routes return 200, `noindex` present

## After build
- Memories: `tapika-gifting-site.md` (project facts) + feedback "list reusable assets from prior builds every time" → MEMORY.md
- Bugs → `tapika-bugs.md` per the bug-fix rule
- Update `docs/REUSABLE.md` with anything new this build produces (e.g. `bom.ts`/`procurement.ts` become reusable for any made-to-order shop)
