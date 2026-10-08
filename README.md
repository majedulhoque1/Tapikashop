# Tapika — gifting site + Command Center (prototype)

Tapika lets people in Nepal send gifts to loved ones in Australia. This repo is a working
prototype: a customer site (shop, Gift Builder, Help Me Choose, checkout) and the owner's
**Command Center** (orders, procurement, deliveries) — all running in the browser, no backend yet.

## Folder map
| Folder | What lives here | Shipped to the website? |
|---|---|---|
| `Tapika.md` | The original business blueprint (don't edit) | No |
| `docs/` | Plan, decisions, reusable-parts list, glossary, demo script | No |
| `brand/` | Brand guideline, colour/type tokens, logo SVGs | Tokens + logo yes |
| `assets/instagram/` | Photos pulled from @tapika44 + `inventory.md` (raw/ is gitignored) | No |
| `site/` | The actual app (TanStack Start + React + Tailwind) | Yes |

## Inside `site/src/`
| Folder | Job | Open this when you want to… |
|---|---|---|
| `routes/` | One file = one page/URL | change a page |
| `components/` | Shared UI pieces (header, product card…) | change something used on many pages |
| `builder/` | Gift Builder logic: capacity rules, BOM, recommendations | change how gifts are built |
| `os/` | Command Center: data store, procurement, seed data, login | change what the owner sees |
| `data/` | Product catalogue, gift templates, formats | **add a product or change a price** |
| `config/` | Exchange rate, delivery fees, lead time, cities, owner name | change business rules |
| `lib/` | Small helpers (image compression, CSV, IndexedDB) | rarely |


## Where do I change X?
| I want to… | File |
|---|---|
| Add/remove a product or change its price | `site/src/data/products.ts` |
| Change the AUD→NPR rate or delivery fees | `site/src/config/pricing.ts` |
| Change lead time, cities, owner name | `site/src/config/business.ts` |
| Change brand colours/fonts | `brand/tokens.css` |
| Understand how one order flows through the code | `docs/HOW-IT-FITS.md` |

## Run it
```
cd site
npm install
npm run dev      # site on http://localhost:3000
```
