// Pure helpers for the Command Center screens: business-timezone dates, dashboard numbers, delivery grouping, customer stats. Used by routes/os/* only (no React).
import { BUSINESS } from '../config/business'
import { addDays, todayInZone } from '../lib/format'
import type { ChecklistItem, Customer, OSData, Order, OrderStatus, Product } from '../types'
import { STATUS_LADDER } from './orders'
import { buildProcurementList } from './procurement'

/** "Today" on the Melbourne calendar, not the owner's device (Nepal is +5:45). */
export function businessToday(now: Date = new Date()): string {
  return todayInZone(BUSINESS.businessTimeZone, now)
}

/** Format a YYYY-MM-DD business date, e.g. "Fri 9 Oct". Uses noon UTC so the zone shift never moves the day. */
export function formatDay(ymd: string, withWeekday = true): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: BUSINESS.businessTimeZone,
    weekday: withWeekday ? 'short' : undefined,
    day: 'numeric',
    month: 'short',
  }).format(d)
}

/** "Today", "Tomorrow", "Yesterday", else "Fri 9 Oct". */
export function relativeDay(ymd: string, today: string): string {
  if (ymd === today) return 'Today'
  if (ymd === addDays(today, 1)) return 'Tomorrow'
  if (ymd === addDays(today, -1)) return 'Yesterday'
  return formatDay(ymd)
}

/** Order created/updated instants are UTC ISO strings; show them on the business calendar. */
export function formatInstant(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: BUSINESS.businessTimeZone,
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export const isOpen = (o: Order) => o.status !== 'DELIVERED'

export function countByStatus(orders: readonly Order[]): Record<OrderStatus, number> {
  const out = Object.fromEntries([...STATUS_LADDER, 'ON_HOLD'].map((s) => [s, 0])) as Record<OrderStatus, number>
  for (const o of orders) out[o.status] += 1
  return out
}

export function checklistProgress(items: readonly ChecklistItem[]): { done: number; total: number; pct: number } {
  const done = items.filter((i) => i.done).length
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 }
}

export function marginPct(p: Pick<Product, 'costAud' | 'priceAud'>): number {
  return p.priceAud > 0 ? Math.round(((p.priceAud - p.costAud) / p.priceAud) * 100) : 0
}

export interface DashboardSummary {
  today: string
  counts: Record<OrderStatus, number>
  openCount: number
  awaitingCheck: Order[]
  pendingNpr: number
  pendingAud: number
  /** Money on orders whose payment screenshot Eva has not checked yet. */
  uncheckedNpr: number
  overdue: Order[]
  dueToday: Order[]
  dueTomorrow: Order[]
  shopping: { lines: number; units: number; costAud: number; top: { name: string; qty: number }[]; orderCount: number }
}

export function dashboardSummary(data: OSData, today: string = businessToday()): DashboardSummary {
  const open = data.orders.filter(isOpen)
  const byDate = (a: Order, b: Order) => a.deliveryDate.localeCompare(b.deliveryDate) || a.id.localeCompare(b.id)
  const awaitingCheck = open.filter((o) => o.paymentCheck === 'awaiting').sort(byDate)
  const list = buildProcurementList({
    orders: data.orders,
    items: data.orderItems,
    products: data.products,
    today,
    range: 'today',
    leadDays: data.settings.leadDays,
  })
  const orderIds = new Set(list.flatMap((l) => l.sources.map((s) => s.orderId)))
  return {
    today,
    counts: countByStatus(data.orders),
    openCount: open.length,
    awaitingCheck,
    pendingNpr: open.reduce((s, o) => s + o.totals.totalNpr, 0),
    pendingAud: Math.round(open.reduce((s, o) => s + o.totals.totalAud, 0) * 100) / 100,
    uncheckedNpr: awaitingCheck.reduce((s, o) => s + o.totals.totalNpr, 0),
    overdue: open.filter((o) => o.deliveryDate < today).sort(byDate),
    dueToday: open.filter((o) => o.deliveryDate === today).sort(byDate),
    dueTomorrow: open.filter((o) => o.deliveryDate === addDays(today, 1)).sort(byDate),
    shopping: {
      lines: list.length,
      units: list.reduce((s, l) => s + l.qty, 0),
      costAud: Math.round(list.reduce((s, l) => s + l.costAud, 0) * 100) / 100,
      top: [...list].sort((a, b) => b.qty - a.qty).slice(0, 4).map((l) => ({ name: l.name, qty: l.qty })),
      orderCount: orderIds.size,
    },
  }
}

export interface DeliveryGroup {
  key: string
  label: string
  orders: Order[]
}

/** Group undelivered orders for the Deliveries screen: Overdue, Today, Tomorrow, This week (next 5 days), Later. */
export function groupDeliveries(orders: readonly Order[], today: string, opts: { city?: string; includeDelivered?: boolean } = {}): DeliveryGroup[] {
  const tomorrow = addDays(today, 1)
  const weekEnd = addDays(today, 6)
  const filtered = orders
    .filter((o) => (opts.includeDelivered ? true : isOpen(o)))
    .filter((o) => !opts.city || o.city === opts.city)
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.id.localeCompare(b.id))
  const groups: DeliveryGroup[] = [
    { key: 'overdue', label: 'Overdue', orders: filtered.filter((o) => isOpen(o) && o.deliveryDate < today) },
    { key: 'today', label: 'Today', orders: filtered.filter((o) => o.deliveryDate === today) },
    { key: 'tomorrow', label: 'Tomorrow', orders: filtered.filter((o) => o.deliveryDate === tomorrow) },
    { key: 'week', label: 'This week', orders: filtered.filter((o) => o.deliveryDate > tomorrow && o.deliveryDate <= weekEnd) },
    { key: 'later', label: 'Later', orders: filtered.filter((o) => o.deliveryDate > weekEnd) },
    { key: 'done', label: 'Delivered earlier', orders: filtered.filter((o) => !isOpen(o) && o.deliveryDate < today) },
  ]
  return groups.filter((g) => g.orders.length > 0)
}

export interface CustomerStats {
  orders: Order[]
  totalNpr: number
  totalAud: number
  lastOrderDate: string | null
}

export function customerStats(data: OSData, customer: Customer): CustomerStats {
  const orders = data.orders.filter((o) => o.customerId === customer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return {
    orders,
    totalNpr: orders.reduce((s, o) => s + o.totals.totalNpr, 0),
    totalAud: Math.round(orders.reduce((s, o) => s + o.totals.totalAud, 0) * 100) / 100,
    lastOrderDate: orders[0]?.createdAt ?? null,
  }
}

/** Human occasion label: "new-baby" -> "New baby". */
export function titleCase(slug: string): string {
  const s = slug.replace(/-/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Mid-sentence day: "today", "tomorrow", else "Fri 9 Oct" (dates keep their capitals). */
export function inlineDay(ymd: string, today: string): string {
  const d = relativeDay(ymd, today)
  return d === 'Today' || d === 'Tomorrow' || d === 'Yesterday' ? d.toLowerCase() : d
}

/** "Today · Thu 8 Oct" for near days, plain "Tue 13 Oct" otherwise (never repeats the date). */
export function dayLabel(ymd: string, today: string): string {
  const rel = relativeDay(ymd, today)
  return rel === formatDay(ymd) ? rel : `${rel} · ${formatDay(ymd)}`
}
