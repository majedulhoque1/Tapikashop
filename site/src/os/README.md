# os/
Eva's Command Center logic.
- `store.ts`: localStorage data + every mutation (create order, confirm payment, mark purchased...).
- `orders.ts`: status ladder, order ids, buildOrder().
- `procurement.ts`: what to buy today / this week.
- `seed.ts`: demo data (next new order is TP-1048). `checklistTemplate.ts`: 9 fulfilment steps. `auth.ts`: demo login gate.
- `logic.ts`: pure helpers for the OS screens (business-timezone dates, dashboard summary, delivery grouping, customer stats). `components/`: OS UI.
