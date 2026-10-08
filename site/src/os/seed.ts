// Deterministic demo data: 10 fictional orders (TP-1038..TP-1047) across statuses and cities, so the next new order is TP-1048. Called by os/store.ts on first load and Reset demo.
import { BUSINESS } from '../config/business'
import { PRODUCTS } from '../data/products'
import { addDays, todayInZone } from '../lib/format'
import type { Customer, GiftBlueprint, OSData, OrderStatus, Recipient } from '../types'
import { buildOrder, defaultSettings, STATUS_LADDER } from './orders'

// 1x1 grey pixel standing in for uploaded photos in the seed.
const PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='

const CUSTOMERS: Customer[] = [
  { id: 'cus-01', name: 'Aarav Sharma', phone: '9800000001', email: 'aarav@demo.example', country: 'Nepal', createdAt: '2026-07-02T04:00:00.000Z' },
  { id: 'cus-02', name: 'Sita Gurung', phone: '9800000002', email: 'sita@demo.example', country: 'Nepal', createdAt: '2026-07-19T04:00:00.000Z' },
  { id: 'cus-03', name: 'Rajan Thapa', phone: '9800000003', email: 'rajan@demo.example', country: 'Nepal', createdAt: '2026-08-11T04:00:00.000Z' },
  { id: 'cus-04', name: 'Binita Shrestha', phone: '9800000004', email: 'binita@demo.example', country: 'Nepal', createdAt: '2026-09-03T04:00:00.000Z' },
  { id: 'cus-05', name: 'Prakash KC', phone: '9800000005', email: 'prakash@demo.example', country: 'Nepal', createdAt: '2026-09-20T04:00:00.000Z' },
]

const RECIPIENTS: Recipient[] = [
  { id: 'rec-01', customerId: 'cus-01', name: 'Sarah Sharma', city: 'Melbourne', suburb: 'Footscray', address: '12 Example St, Footscray VIC 3011', phone: '0400 000 001', relationship: 'Sister', importantDates: 'Birthday 14 Oct' },
  { id: 'rec-02', customerId: 'cus-01', name: 'Maya Karki', city: 'Sydney', suburb: 'Parramatta', address: '5 Sample Rd, Parramatta NSW 2150', phone: '0400 000 002', relationship: 'Cousin', importantDates: '' },
  { id: 'rec-03', customerId: 'cus-02', name: 'David Gurung', city: 'Sydney', suburb: 'Hurstville', address: '88 Demo Ave, Hurstville NSW 2220', phone: '0400 000 003', relationship: 'Brother', importantDates: 'Rakhi every year' },
  { id: 'rec-04', customerId: 'cus-03', name: 'Anju Thapa', city: 'Brisbane', suburb: 'Sunnybank', address: '3 Placeholder Ct, Sunnybank QLD 4109', phone: '0400 000 004', relationship: 'Wife', importantDates: 'Anniversary 2 Nov' },
  { id: 'rec-05', customerId: 'cus-04', name: 'Kiran Shrestha', city: 'Perth', suburb: 'Northbridge', address: '21 Fictional Ln, Northbridge WA 6003', phone: '0400 000 005', relationship: 'Mother', importantDates: '' },
  { id: 'rec-06', customerId: 'cus-05', name: 'Nisha KC', city: 'Adelaide', suburb: 'Prospect', address: '7 Mock St, Prospect SA 5082', phone: '0400 000 006', relationship: 'Friend', importantDates: '' },
  { id: 'rec-07', customerId: 'cus-02', name: 'Rina Gurung', city: 'Canberra', suburb: 'Belconnen', address: '14 Test Pl, Belconnen ACT 2617', phone: '0400 000 007', relationship: 'Sister', importantDates: '' },
]

type WithoutDate<T> = T extends unknown ? Omit<T, 'delivery_date'> : never

type Spec = {
  n: number
  status: OrderStatus
  customerId: string
  recipientId: string
  deliveryOffset: number
  createdOffset: number
  blueprint: WithoutDate<GiftBlueprint>
  holdFrom?: OrderStatus
}

const NO_WRAP = { ribbon: false, premiumWrap: false }

const SPECS: Spec[] = [
  { n: 1038, status: 'DELIVERED', customerId: 'cus-01', recipientId: 'rec-02', deliveryOffset: -5, createdOffset: -14,
    blueprint: { gift_type: 'ready-made', template_id: 'tpl-festival-sweets', quantity: 1, occasion: 'festival', recipient: 'friend', packaging: { ribbon: true, premiumWrap: false }, card: null, message: 'Happy Dashain!' } },
  { n: 1039, status: 'OUT_FOR_DELIVERY', customerId: 'cus-02', recipientId: 'rec-03', deliveryOffset: 0, createdOffset: -9,
    blueprint: { gift_type: 'ready-made', template_id: 'tpl-rakhi-set', quantity: 1, occasion: 'rakhi', recipient: 'sibling', packaging: NO_WRAP, card: 'card-happy-rakhi', message: 'Dai, always with you.' } },
  { n: 1040, status: 'READY', customerId: 'cus-03', recipientId: 'rec-04', deliveryOffset: 1, createdOffset: -8,
    blueprint: { gift_type: 'ready-made', template_id: 'tpl-love-hamper', quantity: 1, occasion: 'anniversary', recipient: 'partner', packaging: { ribbon: true, premiumWrap: true }, card: 'card-i-love-you', message: 'Happy anniversary, maya.' } },
  { n: 1041, status: 'PREPARING', customerId: 'cus-04', recipientId: 'rec-05', deliveryOffset: 2, createdOffset: -6,
    blueprint: { gift_type: 'platter', items: [{ product: 'cashew-pack', quantity: 1 }, { product: 'pistachio-pack', quantity: 1 }, { product: 'walnut-pack', quantity: 2 }], occasion: 'thank-you', recipient: 'parent', packaging: { ribbon: true, premiumWrap: false }, card: 'card-thanks-for-everything', message: 'Thanks for everything, Aama.' } },
  { n: 1042, status: 'TO_PURCHASE', customerId: 'cus-05', recipientId: 'rec-06', deliveryOffset: 3, createdOffset: -4,
    blueprint: { gift_type: 'box', items: [{ product: 'kitkat-share-bag', quantity: 1 }, { product: 'ferrero-rocher-t8', quantity: 1 }, { product: 'teddy-small', quantity: 1 }], occasion: 'birthday', recipient: 'friend', packaging: NO_WRAP, card: 'card-happy-birthday', message: 'Happy birthday Nisha!' } },
  { n: 1043, status: 'PAYMENT_CONFIRMED', customerId: 'cus-01', recipientId: 'rec-01', deliveryOffset: 3, createdOffset: -3,
    blueprint: { gift_type: 'photo-frame', items: [{ product: 'collage-frame-heart', quantity: 1 }], occasion: 'birthday', recipient: 'sibling', packaging: { ribbon: false, premiumWrap: true }, card: 'card-happy-birthday', message: 'Happy birthday Didi!',
      collage: { photos: [PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL], names: 'Aarav & Sarah', date: '14 Oct 2026' } } },
  { n: 1044, status: 'PAYMENT_CONFIRMED', customerId: 'cus-02', recipientId: 'rec-07', deliveryOffset: 6, createdOffset: -2,
    blueprint: { gift_type: 'ready-made', template_id: 'tpl-dhaka-keepsake', quantity: 1, occasion: 'festival', recipient: 'parent', packaging: NO_WRAP, card: 'card-thanks-for-everything', message: 'From home, with love.' } },
  { n: 1045, status: 'NEW', customerId: 'cus-03', recipientId: 'rec-04', deliveryOffset: 8, createdOffset: -1,
    blueprint: { gift_type: 'hamper', items: [{ product: 'teddy-large', quantity: 1 }, { product: 'chocolate-truffle-box', quantity: 2 }, { product: 'cadbury-silk-bar', quantity: 2 }], occasion: 'love', recipient: 'partner', packaging: { ribbon: true, premiumWrap: false }, card: 'card-i-love-you', message: 'Miss you.' } },
  { n: 1046, status: 'NEW', customerId: 'cus-04', recipientId: 'rec-05', deliveryOffset: 5, createdOffset: 0,
    blueprint: { gift_type: 'photo-frame', items: [{ product: 'collage-frame-grid', quantity: 1 }], occasion: 'anniversary', recipient: 'parent', packaging: NO_WRAP, card: null, message: 'Happy anniversary, Aama and Buba.',
      collage: { photos: [PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL, PIXEL], names: 'Aama & Buba', date: '9 Nov 1994' } } },
  { n: 1047, status: 'ON_HOLD', holdFrom: 'PAYMENT_CONFIRMED', customerId: 'cus-05', recipientId: 'rec-06', deliveryOffset: 7, createdOffset: -2,
    blueprint: { gift_type: 'few-things', items: [{ product: 'soan-papdi-box', quantity: 1 }, { product: 'dhaka-pouch', quantity: 1 }], occasion: 'thank-you', recipient: 'friend', packaging: NO_WRAP, card: null, message: 'Waiting on address confirmation.' } },
]

/** How many of the 9 checklist steps are already ticked at each status. */
const TICKED: Partial<Record<OrderStatus, number>> = {
  TO_PURCHASE: 0,
  PREPARING: 3,
  READY: 6,
  OUT_FOR_DELIVERY: 7,
  DELIVERED: 9,
}

export function seedData(today: string = todayInZone(BUSINESS.businessTimeZone)): OSData {
  const settings = defaultSettings(today)
  const products = PRODUCTS.map((p) => ({ ...p, flags: { ...p.flags }, occasions: [...p.occasions], tags: [...p.tags] }))
  const data: OSData = {
    products,
    customers: CUSTOMERS.map((c) => ({ ...c })),
    recipients: RECIPIENTS.map((r) => ({ ...r })),
    orders: [],
    orderItems: [],
    checklistItems: [],
    settings,
  }

  for (const s of SPECS) {
    const recipient = RECIPIENTS.find((r) => r.id === s.recipientId)!
    const blueprint = { ...s.blueprint, delivery_date: addDays(today, s.deliveryOffset) } as GiftBlueprint
    const now = `${addDays(today, s.createdOffset)}T04:00:00.000Z`
    const built = buildOrder({
      id: `TP-${s.n}`,
      blueprint,
      customerId: s.customerId,
      recipientId: s.recipientId,
      city: recipient.city,
      now,
      settings,
      products,
      status: s.status,
      paymentCheck: s.status === 'NEW' ? 'awaiting' : 'confirmed',
      paymentScreenshot: s.status === 'NEW' ? PIXEL : null,
    })
    if (s.holdFrom) built.order.statusBeforeHold = s.holdFrom

    // Lines are purchased once the order reaches PREPARING; TO_PURCHASE has the first purchasable line done.
    const reached = STATUS_LADDER.indexOf(s.status)
    const purchasable = built.items.filter((i) => i.type !== 'task')
    for (const it of purchasable) {
      if (reached >= STATUS_LADDER.indexOf('PREPARING')) it.purchased = true
    }
    if (s.status === 'TO_PURCHASE' && purchasable[0]) purchasable[0].purchased = true

    const ticks = TICKED[s.status] ?? 0
    built.checklist.forEach((c, i) => {
      if (i < ticks) {
        c.done = true
        c.doneAt = now
      }
    })
    data.orders.push(built.order)
    data.orderItems.push(...built.items)
    data.checklistItems.push(...built.checklist)
  }
  return data
}
