# Reusable parts — what we took from earlier builds (and what Tapika gives back)

Updated every build. "From" = where the original lives.

| From | Part | Used in Tapika as |
|---|---|---|
| Filix (`Websites/Renta de toro mechanico/filix`) | TanStack Start scaffold + `nitro()` in vite config (without it Vercel 404s every route) | `site/` skeleton |
| Filix `src/os/store.ts` | localStorage store via `useSyncExternalStore`; each mutation = one future backend call | `site/src/os/store.ts` |
| Filix `src/os/logic.ts` | today's priorities, dashboard summary, customer history | Command Center dashboard |
| Filix `src/os/checklistTemplate.ts` | generated per-job checklist | 9-step fulfilment checklist |
| Filix `src/os/auth.ts` + `/login` | demo login gate (NOT security — values ship in the JS) | owner login |
| Filix `os/components/Shell.tsx`, calendar w/ business timezone | admin shell, calendar | Command Center layout, delivery calendar |
| Filix `components/Calendar.tsx` | react-day-picker v10 themed via `--rdp-*` | delivery-date picker |
| Filix `StickyMobileBar.tsx` | mobile bar hidden until past hero | "Your gift · Rs total" bar |
| Filix booking wizard | step-by-step wizard, one field shape = one backend call | Gift Builder steps |
| Muze Merch `pages/drop/Checkout/Confirmation/OrderPage` | checkout → confirmation → status ladder | checkout, confirmation, Track Order |
| Muze Merch `pages/admin/sections.tsx` | dense ops tables, every figure derived | Command Center tables |
| Muze Merch `config/economics.ts` | one pricing config file | `config/pricing.ts` |
| Muze Merch `HeroPrint.tsx` | hand-drawn self-drawing SVG | gift-box preview / ribbon |
| Noree `src/lib/compressImage.ts` | canvas→WebP, with PNG-fallback bug fixed | collage photo upload |
| Noree e-commerce checklist | eager first 4 images, lazy rest; no substring category search | shop grid |
| Mehjabin Badhon guided tour | scripted customer→admin demo | "Play the demo" |
| n8n on VPS (`n8n.majedulhoqueshakil.com`) | webhook → Google Sheets | Phase B Sheets bridge |
| booking-crm-kit | Supabase RLS/RPC contract | only if Sheets is outgrown |

## New reusable parts this build creates
| Part | Reusable for |
|---|---|
| `builder/bom.ts` — any made-to-order item → bill of materials | hampers, florists, custom merch, catering |
| `os/procurement.ts` — aggregate BOM across open orders by date window | any "buy then assemble" shop |
| `os/sheetsSchema.ts` + `lib/csv.ts` — store ↔ Google Sheets tabs | any client who wants Sheets as their database |
| `builder/recommend.ts` — deterministic quiz → top 3 | "help me choose" on any catalogue |
