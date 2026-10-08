# Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-10-08 | Brand is **Tapika**; owner name is a setting (default "Eva") | Blueprint said "Eva's Gift Shop"; Instagram + domain say Tapika; real owner name unconfirmed |
| 2026-10-08 | Working prototype on one URL, not Figma | The Builder → BOM → procurement "aha" can't be shown in a click-through |
| 2026-10-08 | Data in localStorage + IndexedDB; store functions mirror future Sheets calls 1:1 | Phase B swaps only the data layer |
| 2026-10-08 | **NPR first, A$ second** | Buyers are in Nepal and pay via eSewa |
| 2026-10-08 | eSewa = instructions + payment-screenshot upload; owner confirms in Command Center | That's how she works today; real eSewa ePay is Phase B |
| 2026-10-08 | Customer faces/names/dates from photo frames never used on the site | Customers' private moments, no consent |
| 2026-10-08 | Reviews: real text from her IG highlight, anonymised; no invented reviews | Honesty guardrail |
| 2026-10-08 | `noindex` on the prototype URL | Avoid sample prices being indexed under her brand |
| 2026-10-08 | Demo runs on one device | localStorage doesn't sync across devices |
| 2026-10-08 | **Scope = functioning prototype, Filix-level** (localStorage demo, demo login, real flows). Dropped: automated tests, Sheets schema/CSV export, IndexedDB, festival cutoffs | User call — it's a pitch prototype, not production |
