# Glossary

- **BOM (bill of materials)** — the list of physical things one order needs: products + box + ribbon + card + tasks like "print collage". Made by `builder/bom.ts`.
- **Procurement** — the shopping list: all BOM lines from paid orders due soon, added up ("Chocolate ×6"). Made by `os/procurement.ts`.
- **Lead time** — days the owner needs between payment and delivery. Dates closer than this can't be picked.
- **Format** — the physical shape of a gift: box, hamper, platter, photo frame, "just a few things". Each has a capacity.
- **Template / Quick Build** — a ready-made gift that can be opened in the builder and changed.
- **Command Center (OS)** — the owner's private screens at `/os`.
- **Store** — the in-browser database (`os/store.ts`); later replaced by Google Sheets.
- **Seed** — fake demo data loaded on first visit or after "Reset demo".
- **Payment check** — order paid by eSewa screenshot, waiting for the owner to confirm.
