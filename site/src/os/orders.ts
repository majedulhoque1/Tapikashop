// Pure order helpers: status ladder, next order id, and buildOrder() which turns a blueprint into an Order + lines + checklist. Used by os/store.ts and os/seed.ts.
import { expandBom, linesTotalAud } from '../builder/bom'
import { BUSINESS } from '../config/business'
import { PRICING, priceOrder } from '../config/pricing'
import type { ChecklistItem, GiftBlueprint, Order, OrderItem, OrderStatus, PaymentCheck, Product, Settings } from '../types'
import { CHECKLIST_TEMPLATE } from './checklistTemplate'

/** The happy path, in order. ON_HOLD sits outside the ladder. */
export const STATUS_LADDER: OrderStatus[] = [
  'NEW',
  'PAYMENT_CONFIRMED',
  'TO_PURCHASE',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

export const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'New',
  PAYMENT_CONFIRMED: 'Payment confirmed',
  TO_PURCHASE: 'To purchase',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  ON_HOLD: 'On hold',
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = STATUS_LADDER.indexOf(status)
  return i >= 0 && i < STATUS_LADDER.length - 1 ? STATUS_LADDER[i + 1] : null
}

/** TP-1048 style ids. The demo seed ends at TP-1047, so the next new order is TP-1048. */
export function nextOrderId(orders: readonly Order[]): string {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.id.replace('TP-', '')) || 0), 1047)
  return `TP-${max + 1}`
}

export function defaultSettings(today: string = PRICING.rateAsOf): Settings {
  return {
    ownerName: BUSINESS.ownerName,
    fxAudToNpr: PRICING.fxAudToNpr,
    rateAsOf: today,
    leadDays: BUSINESS.leadDays,
    deliveryFeesAud: { ...PRICING.deliveryFeesAud },
  }
}

export interface BuiltOrder {
  order: Order
  items: OrderItem[]
  checklist: ChecklistItem[]
}

export function buildOrder(args: {
  id: string
  blueprint: GiftBlueprint
  customerId: string
  recipientId: string
  city: string
  now: string
  settings: Settings
  products: readonly Product[]
  status?: OrderStatus
  paymentCheck?: PaymentCheck
  paymentScreenshot?: string | null
}): BuiltOrder {
  const items = expandBom(args.id, args.blueprint, { products: args.products })
  const order: Order = {
    id: args.id,
    status: args.status ?? 'NEW',
    statusBeforeHold: null,
    paymentCheck: args.paymentCheck ?? 'awaiting',
    customerId: args.customerId,
    recipientId: args.recipientId,
    deliveryDate: args.blueprint.delivery_date,
    city: args.city,
    blueprint: args.blueprint,
    totals: priceOrder(linesTotalAud(items), args.city, args.settings),
    paymentScreenshot: args.paymentScreenshot ?? null,
    note: '',
    createdAt: args.now,
    updatedAt: args.now,
  }
  const checklist: ChecklistItem[] = CHECKLIST_TEMPLATE.map((t) => ({
    id: `${args.id}-c${t.sortOrder}`,
    orderId: args.id,
    label: t.label,
    sortOrder: t.sortOrder,
    done: false,
    doneAt: null,
  }))
  return { order, items, checklist }
}
