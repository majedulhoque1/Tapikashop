# Tapika Brand Guideline

Version 1.0, 2026-10-08. Visual version: `brand-guide.html`. Code: `tokens.css`, `tailwind-theme.css`. Logo files: `logo/`.

> **Logo SVG is an approximation rebuilt from a 150px avatar. Request the original file from the owner** and replace everything in `logo/` before print, packaging, signage or any large use. The wordmark here is a monoline redraw, not the real hand lettering.

---

## 1. Story and positioning

**What Tapika is.** A gifting service for people in Nepal who want to send something real to someone they love in Australia. The owner buys the gift, assembles it, wraps it and delivers it by hand in Australia. The buyer pays in Nepal through eSewa.

**Tagline.** Send a little love to Australia.
**Promise.** Choose a gift. Make it personal. We'll take care of the rest.

**Who it is for.** Nepali buyers, often diaspora families: a brother in Kathmandu choosing Rakhi for his didi in Melbourne, parents in Pokhara remembering a birthday in Sydney. Festivals carry the year: Rakhi, Teej, Dashain, Tihar.

**What makes it different.** It is one trusted person, not a warehouse. The personal touch (a photo-collage frame, a handwritten card, wrapping chosen with care) is the product. The signature item is the personalised photo-collage frame.

**Positioning line.** The hand that is there when you cannot be.

**Brand personality.** Warm, personal, giftable, trustworthy. Like a cousin who lives in Australia and happens to be very organised. Not a mega-store, not a corporate courier, not a cartoon.

**What we never claim.** Speed we cannot keep, stock we do not hold, reviews we did not receive, delivery to places the owner cannot reach. Honesty is the brand's main asset because the buyer is sending money to a stranger across borders.

---

## 2. Voice

English with Nepali warmth. Plain words, short sentences, "you" and "your". Nepali words appear where they are the natural word: Didi, Dai, Bahini, Bhai, Aama, Baba, Tika, Tihar, Dashain. Nepali script is used for greetings and short headings only (6 words or fewer), always with `lang="ne"`, and the owner or a native speaker reviews every Nepali string before it ships. Never machine-translate.

**Rules**
- One exclamation mark per page at most. No emoji anywhere (UI, copy, alt text).
- Say what happened and what to do next. Blame ourselves, never the sender.
- Verb-first buttons, one to three words. One label per intent across the whole site.
- No guilt about distance. Warmth, not pressure. Urgency only for a real cutoff date.
- Banned words: elevate, seamless, unleash, next-gen, revolutionary, "guys".
- No em dashes in copy. Use a full stop or a comma.
- Prices: NPR first, A$ second (the buyer pays in NPR).

**Sample lines**

| Where | Line |
|---|---|
| Hero | Send a little love to Australia. |
| Hero sub | Choose a gift. Make it personal. We'll take care of the rest. |
| Festival hero (Rakhi) | Rakhi is coming. Let her open a gift from you. |
| Festival hero (Teej) | Teej in Sydney can still feel like home. |
| Festival hero (Dashain) | Dashain feels bigger when someone remembers you. |
| Nepali greeting | शुभ दशैं / शुभ तिहार / माया पठाउनुहोस् (send your love) |
| Primary buttons | Choose a gift, Make it personal, Add your message, Pay with eSewa, I have paid, Track my gift |
| Never | Submit, Click here, Buy now |
| Empty basket | Nothing here yet. Start with someone you miss. |
| Empty orders | No gifts sent yet. Your first one is a few taps away. |
| Empty search | We could not find that gift. Try "rakhi" or "chocolate", or tell us who it is for and we will suggest something. |
| Empty Command Center | No orders waiting. A quiet day. |
| Confirmation | Your gift is booked. We'll message you when it is wrapped and again when it reaches their door. |
| Sign-off | With care, {owner_name} |
| Payment error | We could not confirm your eSewa payment yet. If the money has left your account, send your order number to @tapika44 on Instagram and we will sort it out. |
| Date error | That date is too soon for us to wrap and deliver with care. Please pick {earliest_date} or later. |
| Field error | Please add the recipient's suburb so we can plan the delivery. |
| Upload error | That photo is too large. Try a smaller one, or send a screenshot instead. |
| Generic error | Something went wrong on our side, not yours. Please try again in a moment. |

The confirmation line is a pattern. The build team must make sure the promise is true in the product (messages actually sent) before shipping it.

---

## 3. Naming rules

- Brand name in running text: **Tapika** (capital T, nothing else capitalised). Never TAPIKA, tapika (except inside the logo), Tapika Gifts, Tapika Shop, or "the Tapika".
- The wordmark is lowercase because it is a drawing. Do not typeset it.
- Instagram handle: **@tapika44**. Domain: tapika.shop.
- **Owner name is a configurable setting** (`owner_name`, site settings, currently `site/src/config/business.ts`). Never hard-code a name in copy, emails, PDFs, alt text or templates. Use the placeholder `{owner_name}`. The real owner name is not confirmed, so shipping with a fixed name is a defect.
- Products use plain names: rakhi and mithai set, dry-fruit platter, chocolate platter, photo-collage frame (signature), teddy and chocolate hamper, greeting card, gift box. Festival names are used as tags, not as product names.
- Command Center (owner side) is the name for the private screens. Gift Builder and Help Me Choose are the customer tools. Do not rename them in UI.

---

## 4. Colour system

> **v1.1, 2026-10-08, bright direction (supersedes the blush/navy/kraft look below where they conflict).** The site is **light-only** (`data-theme="light"` on `<html>`). Page is paper `#FFFDF8`. Mint is the hero stage and closing band, sun `#FFD23F` is the highlight and reading band (`#FFF2C2`), coral `#FF6B81` is stamps and stripes (fill, ink text only), blush `#FFE1E7` is the pink band, ink `#14191C` is text, marquee and footer. Sticker style: 2px ink outline plus a hard offset shadow on hero buttons, step cards and the route panel. Navy and kraft are retired from layout (kraft stays in photos and the parcel). Dark mode is switched off, not deleted.

Ink and mint are the identity (from the logo). Everything else is borrowed from the gift table: blush paper, kraft wrap, marigold garlands, rakhi red, card-stock navy. The palette avoids the cream-and-brass default, and uses the pink-tinted petal and mint on ink instead.

All values are in `tokens.css`. Components use **semantic** tokens (`--tp-bg`, `--tp-text`), never raw colours.

### Raw palette

| Name | Hex | Role |
|---|---|---|
| Ink | `#14191C` | Logo black, all text, primary button. Never pure black. |
| Mint | `#62D2B5` | Logo mint. Fills, highlights, logo on dark. Never text on light. |
| Mint soft | `#D3F1E8` | Success banner, signature badge |
| Pine | `#0D6A5A` | Mint's text-safe twin on light: links, brand text, focus ring |
| Petal | `#FDF5F1` | Page background (light) |
| Tissue | `#FFFBF9` | Raised surfaces: inputs, sheets, panels |
| Kraft | `#DDBF98` | Wrapping paper. Decorative fill, ink text only |
| Kraft soft | `#F2E4D2` | Reading bands, packaging-style sections |
| Cocoa | `#4B2E24` | Chocolate brown, secondary headings |
| Cocoa muted | `#6A4D42` | Muted body text, captions, helper text |
| Marigold | `#F4A51C` | The one warm accent. Festivals and one highlight per screen. Fill only. |
| Marigold ink | `#8A5200` | Marigold as text on light |
| Marigold soft | `#FBE3AE` | Festival badge fill |
| Rakhi | `#C42A3C` | Errors and urgent. Also the ribbon red in photos. |
| Rakhi deep | `#A31F30` | Error text on Rakhi soft |
| Rakhi soft | `#FADDDF` | Error banner fill |
| Navy | `#1C2B4B` | Card-stock deep section |
| Night | `#0E1315` | Dark-mode page |
| Night raised | `#171E21` | Dark-mode inputs and sheets |
| Navy raised | `#1E2C4D` | Dark-mode deep band |
| Moon | `#F4EDE8` | Dark-mode text |
| Moon muted | `#B9ADA6` | Dark-mode muted text |
| Rakhi light | `#FF8F9B` | Dark-mode error text |

Gold foil is a photography prop only. It is not a UI colour.

### Accent discipline

Marigold appears at most once per screen: a festival badge or one highlight. Mint is a fill or a logo colour. Buttons are ink (mint in dark mode). Rakhi means wrong or urgent and nothing else. If a screen has three coloured things, remove two.

### Which text on which surface (WCAG 2.x contrast)

Body text needs 4.5 or more. Large text (24px, or bold 19px) needs 3 or more.

| Surface | Allowed text colours (ratio) | Never |
|---|---|---|
| Petal `#FDF5F1` | Ink 16.5, Cocoa 11.4, Cocoa muted 7.1, Pine 6.1, Marigold ink 5.9, Rakhi 5.2 | Mint 1.7, Marigold 1.9, Kraft 1.6 |
| Tissue `#FFFBF9` | Ink 17.2, Cocoa muted 7.4, Pine 6.3, Marigold ink 6.2, Rakhi 5.5 | Mint, Marigold, Kraft |
| Kraft `#DDBF98` | Ink 10.1, Cocoa 7.0 | Pine 3.7, Rakhi, Marigold ink |
| Kraft soft `#F2E4D2` | Ink 14.2, Cocoa muted 6.1, Pine 5.2, Marigold ink 5.1 | Rakhi 4.49 (fails AA) |
| Navy `#1C2B4B` | Petal 13.0, Moon 12.1, Mint 7.6, Marigold 6.9 | Ink, Cocoa, Pine, Rakhi |
| Mint fill `#62D2B5` | Ink 9.6 | Petal 1.7, Pine 3.5 |
| Marigold fill `#F4A51C` | Ink 8.6 | Petal, Cocoa |
| Rakhi fill `#C42A3C` | Tissue 5.5, Petal 5.2 | Ink 3.2 |
| Mint soft `#D3F1E8` | Ink 14.8, Cocoa 10.2, Pine 5.4 | Mint |
| Marigold soft `#FBE3AE` | Ink 14.1, Marigold ink 5.1 | Mint, Marigold |
| Rakhi soft `#FADDDF` | Rakhi deep 5.9 | Rakhi 4.4 |
| Ink `#14191C` | Petal 16.5, Mint 9.6, Marigold 8.6 | Cocoa, Pine |
| Night `#0E1315` | Moon 16.2, Mint 10.2, Marigold 9.1, Rakhi light 8.6, Moon muted 8.5 | Cocoa, Pine, Rakhi |
| Night raised `#171E21` | Moon 14.6, Mint 9.2, Rakhi light 7.8, Moon muted 7.7 | same as Night |
| Navy raised `#1E2C4D` | Moon 11.9, Mint 7.5, Marigold 6.7, Moon muted 6.3 | Cocoa, Pine |

Non-text edges: input border light `#8A6F63` is 4.3 on Petal and 4.5 on Tissue; dark `#7F8F8A` is 5.5 on Night. Focus ring is Pine (light) or Mint (dark), 3px with a 3px gap.

### Dark mode

Follows the system unless `data-theme` is set. Mint becomes the primary button (Ink text on it). Links and brand text switch from Pine to Mint. Kraft becomes the secondary heading colour. Dark errors use Rakhi light. One theme per page: sections never invert mid-scroll, although Navy and Kraft soft are allowed as tinted bands inside either theme.

---

## 5. Typography

All fonts are Google Fonts.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display / headings | **Young Serif** | 400 (only weight) | Round, open and friendly, close to the hand-lettered logo. Latin only. |
| Text / UI / Nepali | **Mukta** | 400 to 800 | Latin and Devanagari drawn together by one foundry. Devanagari headings fall through from Young Serif to Mukta 800. |
| Gift message only | **Kalam** | 400, 700 | Handwriting with Devanagari. Card preview and sign-off. Never UI. |

Fallback after Mukta for Devanagari: Noto Sans Devanagari.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Kalam:wght@400;700&family=Mukta:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

In production, self-host the same files with `font-display: swap`.

### Scale (fluid)

| Token | Size | Use |
|---|---|---|
| display | 44 to 76px (clamp) | One hero line per page |
| 3xl | 36 to 60px | Section titles |
| 2xl | 28 to 40px | Product names, big prices |
| xl | 22 to 28px | Card headings |
| lg | 20px | Lead paragraphs |
| base | 17px | Body (Mukta runs small, so base is 17, not 16) |
| sm | 15px | Helper text, captions |
| xs | 13px | Badges. Nothing smaller. |

Line height: display 1.04, headings 1.2, body 1.6, **Devanagari never below 1.65 (token 1.75)**. Tracking: -2% on Young Serif display, 0 on Mukta and on any Devanagari, never letter-spaced Devanagari. Reading measure 62ch. Inputs are at least 16px so iOS does not zoom.

Specimen: Young Serif "Send love." Mukta "माया पठाउनुहोस्". Festival words: रक्षाबन्धन, तीज, दशैं, तिहार, उपहार (gift). All Nepali needs native review.

---

## 6. Spacing, radius, shadow, motion

**Spacing.** 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Phone gutter 16px (grows to 48px on desktop). Sections breathe at 56 to 104px. Max page width 80rem.

**Radius, one rule.**
- Pill (999px): things you press. Buttons, badges, chips.
- Field (12px): things you type into.
- Frame (20px): things that hold a picture or a panel.
Never mix: no square buttons, no pill photos, no 4px radii.

**Cards.** Last resort. Group with space and a dashed "twine" rule (2px dashed Cocoa muted at 55% opacity) first. The twine is Tapika's one signature line: wrapping string.

**Shadow.** Tinted Cocoa (`75 46 36`), never grey-black. Only on lifted things: hovered buttons, sheets.

**Motion.** Things arrive like a parcel set down gently.
- Arrival and reveal: `cubic-bezier(0.16, 1, 0.3, 1)`. Travel: `cubic-bezier(0.65, 0, 0.35, 1)`. Spring `cubic-bezier(0.34, 1.56, 0.64, 1)` for one tiny confirmation only.
- Durations: 150ms hover and press, 250ms fields and toggles, 500ms reveals, 800ms one hero entrance per page. Stagger 70ms.
- Animate `transform` and `opacity` only. Press state: `translateY(1px) scale(.98)`.
- Everything collapses to its end state under `prefers-reduced-motion`. No looping animation except a loading skeleton. One marquee per page maximum, and only if it serves content.

---

## 7. Iconography

One family: **Phosphor Icons, Light weight**, 24px, current text colour, one stroke weight across the product. Never mix families, never emoji, never hand-drawn icons. The gift-box mark in the logo is the only custom drawing. Icons support a label, they never replace one. Status always uses icon plus text, never colour alone.

---

## 8. Photography

- **Product first.** One gift per frame, sharp, at true colour and scale. Wrapping and the card are visible because the personal touch is the product.
- **Natural light.** Window daylight, soft side light, daylight white balance. No flash, no heavy filters. Rakhi red and marigold must read true.
- **Props from the table.** Kraft paper, blush linen, navy card stock, marigold garland at one edge, gold foil, chocolate. Nothing from another brand in frame.
- **Crops.** 4:5 for Instagram and product pages, 1:1 for grid and cart thumbnails, 16:9 for hero banners. Compose for the ratio; never crop the product to fit.
- **No overlays.** No text, price tags, pills or badges laid over photos. Captions go outside the image.
- **Performance.** Compress at upload, lazy-load below the fold, keep the original master.
- **No stock strangers.** No airport-hug stock photography.

### Privacy rules (non-negotiable)

- **Never show a customer's face, name, date or message from a personalised frame without their written consent.** This covers the website, Instagram, ads, emails, and the Command Center demo data.
- Show frames with the owner's own sample prints, a blank mat, or a softly blurred image.
- **Reviews are real text from real customers, anonymised** ("A customer in Sydney"), never invented, never with names or profile photos.
- Alt text describes the product ("Photo-collage frame in oak with a blush mat"), never a person.
- Recipient faces: hands holding a gift are welcome, faces are not, unless consent is written and kept.

---

## 9. Logo

**Description.** A lowercase, hand-lettered "tapika" beside a small gift box with sparkle lines. Seen on Instagram as a mint mark on a black circle. The circle remains the avatar.

**Files** (`logo/`): `tapika-lockup.svg` (mark + wordmark), `tapika-mark.svg`, `tapika-wordmark.svg`, `favicon.svg` (mint mark on an Ink circle, fixed colours). The first three use `currentColor`: set `color` on the element or inline the SVG and let the text colour drive it.

**Colours.** One colour only: Ink on light surfaces, Mint on Ink or Navy, Petal on Navy or Ink, Ink on Mint or Kraft. Mint on a light surface is banned (1.7:1).

**Clear space.** x on every side, where x = the height of the letter "a" (about one third of the lockup height).

**Minimum size.** Lockup 96px wide on screen, 25mm in print. Below that, use the mark alone. Mark alone 20px minimum. Favicon and avatars: mint mark on an Ink circle.

**Placement.** Nav: lockup at 120px wide, left. Footer: lockup 104px. Packaging: Ink on Kraft.

**Do**
- Use the supplied file unmodified.
- Keep it to a single colour from the list above.
- Use the mark alone when small.

**Don't**
- Stretch, squash, tilt or animate it.
- Put Mint on a light surface, or recolour it to marigold, red or any festival colour.
- Add shadows, outlines, glows or gradients.
- Retype it in capitals or any font.
- Crop the sparkle lines.
- Place it on a busy photo without a scrim.
- Pair it with a second badge or tagline lockup.

---

## 10. Do and don't summary

**Do**
- Lead with the gift and the person it is for.
- Use Ink buttons, Pine links, one marigold highlight at most.
- Write Nepali words where they are the natural word, with native review.
- Show NPR first, A$ second.
- Use real photos of real products in natural light.
- Give every error a next step.
- Keep `owner_name` a setting.

**Don't**
- Don't show customers' faces, names or dates without written consent.
- Don't invent reviews, stock counts, urgency or delivery promises.
- Don't use mint or marigold as text on light surfaces.
- Don't use more than one accent colour on a screen.
- Don't use emoji, em dashes, or a second icon set.
- Don't put text or badges on photos.
- Don't use square buttons, pill photos or any radius outside the three.
- Don't build the page from identical rounded cards in a grid.
- Don't typeset the wordmark.

---

## 11. Notes for the build team

1. Load `tokens.css` first. In the Tailwind v4 entry file: `@import "tailwindcss"; @import "../brand/tokens.css"; @import "../brand/tailwind-theme.css";`. `tailwind-theme.css` only maps Tailwind names to the `--tp-*` variables (via `@theme inline`), so dark mode needs no `dark:` classes. It also clears Tailwind's default colour palette, so only brand colours exist as utilities.
2. Utilities that exist: `bg-surface bg-raised bg-band bg-deep bg-action bg-brand bg-accent`, `text-ink text-muted text-brand-text text-accent-text text-danger-text`, `border-line border-field`, `font-display font-text font-note`, `rounded-field rounded-frame rounded-pill`, `shadow-soft shadow-lift`.
3. Use `text-brand-text` and `text-accent-text` for text. `bg-brand` and `bg-accent` are fills, with `text-ink` / `text-on-accent` on top.
4. Put `lang="ne"` on every Nepali string so the Devanagari line height applies.
5. The logo is an approximation (see the top of this file). Swap in the owner's original before print.
6. Nepali copy in this document is a draft for native review.
