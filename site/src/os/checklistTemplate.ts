// The 9-step fulfilment checklist (blueprint 4.6) generated for every new order. Used by os/store.ts when an order is created.

export const CHECKLIST_TEMPLATE: { sortOrder: number; label: string }[] = [
  'Purchase products',
  'Confirm products',
  'Assemble gift',
  'Add card',
  'Wrap gift',
  'Photograph',
  'Confirm address',
  'Dispatch',
  'Mark delivered',
].map((label, i) => ({ sortOrder: i + 1, label }))
