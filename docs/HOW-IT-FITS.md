# How one order flows through the code (TP-1048)

Aarav in Kathmandu builds a birthday box for his sister Sarah in Melbourne.

1. **Builder page** — `site/src/routes/build.tsx`
   Steps: who → occasion → format → items → customise → preview → delivery.
   Every "+ Add" asks `builder/capacity.ts` whether the box still has room.
2. **Cart** — `site/src/cart/` holds the finished gift as a *blueprint* (the JSON in `Tapika.md` §"data model").
3. **Checkout** — `site/src/routes/checkout.tsx` collects sender (Nepal), recipient (Australia), date, window, and the eSewa screenshot (`lib/photo.ts` shrinks it), then calls `createOrderFromBuilder()` in `os/store.ts`.
4. **Store** — `os/store.ts` finds or creates the customer (by phone) and the recipient, then calls `buildOrder()` in `os/orders.ts`, which:
   - expands the blueprint into parts with `builder/bom.ts` (Ferrero ×1, cashews ×1, teddy ×1, gift box ×1, premium wrap ×1, birthday card ×1),
   - prices it with `config/pricing.ts` (A$ → Rs, rounded to Rs 50, plus the Melbourne delivery fee),
   - attaches the 9-step checklist from `os/checklistTemplate.ts`,
   - gives it the next id → **TP-1048**, status NEW, payment "awaiting".
   Everything is saved in the browser (localStorage).
5. **Confirmation + Track** — `routes/order.$id.tsx`, `routes/track.tsx` read the same store.
6. **Owner logs in** — `routes/login.tsx` → `routes/os/index.tsx` (dashboard) shows "1 awaiting payment check".
7. **Order detail** — `routes/os/orders/$id.tsx`: confirm payment → status ladder (`os/orders.ts` STATUS_LADDER) → tick checklist.
8. **Procurement** — `routes/os/procurement.tsx` calls `os/procurement.ts`, which adds up unbought parts from every paid order due within the lead time (`config/business.ts`). "Mark bought" flips `purchased` on each order line, so totals never double-count.

**To swap in Google Sheets later:** only the bodies of the functions in `os/store.ts` change. Pages don't.
