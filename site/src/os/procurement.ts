// Builds the shopping list: unpurchased lines on paid orders whose (delivery date - lead days) has arrived. Called by the OS Procurement page and dashboard.
import { addDays } from '../lib/format'
import type { Order, OrderItem, Product } from '../types'

export type ProcurementRange = 'today' | 'week'

export interface ProcurementLine {
  productId: string
  name: string
  qty: number
  /** Estimated spend in AUD (cost x qty). */
  costAud: number
  /** The order lines behind this total, so each can be ticked off individually. */
  sources: { orderId: string; itemId: string; qty: number }[]
}

const PURCHASE_STATUSES: Order['status'][] = ['PAYMENT_CONFIRMED', 'TO_PURCHASE']

/**
 * An order is due for buying once deliveryDate - leadDays <= the window end.
 * Overdue orders stay in (no lower bound). 'week' = today + 6 days.
 * Purchased is tracked per line, so a purchased line never counts twice.
 */
export function buildProcurementList(args: {
  orders: readonly Order[]
  items: readonly OrderItem[]
  products: readonly Product[]
  today: string
  range: ProcurementRange
  leadDays: number
}): ProcurementLine[] {
  const { orders, items, products, today, range, leadDays } = args
  const windowEnd = range === 'today' ? today : addDays(today, 6)
  const due = new Set(
    orders
      .filter((o) => PURCHASE_STATUSES.includes(o.status) && addDays(o.deliveryDate, -leadDays) <= windowEnd)
      .map((o) => o.id),
  )
  const cost = new Map(products.map((p) => [p.id, p.costAud]))
  const byProduct = new Map<string, ProcurementLine>()

  for (const it of items) {
    if (!due.has(it.orderId) || it.purchased || it.type === 'task') continue
    const line =
      byProduct.get(it.productId) ??
      { productId: it.productId, name: it.name, qty: 0, costAud: 0, sources: [] }
    line.qty += it.qty
    line.costAud = Math.round((line.costAud + (cost.get(it.productId) ?? 0) * it.qty) * 100) / 100
    line.sources.push({ orderId: it.orderId, itemId: it.id, qty: it.qty })
    byProduct.set(it.productId, line)
  }
  return [...byProduct.values()].sort((a, b) => a.name.localeCompare(b.name))
}
