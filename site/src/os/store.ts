// Demo data store: useSyncExternalStore + localStorage (Filix pattern). Every mutation mirrors a future backend call 1:1. Used by all OS screens and the checkout.
import { useSyncExternalStore } from 'react'

import { validateItems } from '../builder/capacity'
import { seedData } from './seed'
import { buildOrder, nextOrderId, nextStatus } from './orders'
import type { ChecklistItem, Customer, GiftBlueprint, OSData, Order, OrderItem, Product, Recipient, Settings } from '../types'

// All demo data lives in localStorage under one key. Swapping in a real
// backend later means replacing the bodies of the mutations below with API
// calls; nothing that calls them needs to change.
const STORAGE_KEY = 'tapika_os_v1'

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

// The SSR / pre-hydration snapshot must never touch localStorage and must be
// referentially stable. Real data only appears client-side, after mount.
const SERVER_SNAPSHOT: OSData = {
  products: [],
  customers: [],
  recipients: [],
  orders: [],
  orderItems: [],
  checklistItems: [],
  settings: { ownerName: 'Eva', fxAudToNpr: 0, rateAsOf: '', leadDays: 3, deliveryFeesAud: {} },
}

let cached: OSData | null = null
const listeners = new Set<() => void>()

function readRaw(): OSData {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = seedData()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    return JSON.parse(raw) as OSData
  } catch {
    return seedData()
  }
}

function getClientSnapshot(): OSData {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT
  if (!cached) cached = readRaw()
  return cached
}

function commit(next: OSData) {
  cached = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (e) {
      // Quota exceeded (too many big photos): keep the in-memory state so the demo keeps working.
      console.warn('Tapika demo store could not persist to localStorage', e)
    }
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function mutate(fn: (data: OSData) => OSData) {
  commit(fn(getClientSnapshot()))
}

/** The read hook every OS screen and the public shop use. */
export function useOS(): OSData {
  return useSyncExternalStore(subscribe, getClientSnapshot, () => SERVER_SNAPSHOT)
}

export function getOSData(): OSData {
  return getClientSnapshot()
}

// ---------------------------------------------------------------------------
// Mutations (each is one future backend call)
// ---------------------------------------------------------------------------

export interface CheckoutInput {
  blueprint: GiftBlueprint
  customer: { name: string; phone: string; email: string }
  recipient: { name: string; city: string; suburb: string; address: string; phone: string; relationship: string }
  /** Compressed data URL of the eSewa payment screenshot. */
  paymentScreenshot: string | null
  /** Preferred delivery window chosen at checkout (optional). */
  deliveryWindow?: string
}

/** Called by checkout. Matches the customer by phone and the recipient by name + suburb. Order lands as NEW, awaiting payment check. */
export function createOrderFromBuilder(input: CheckoutInput): { orderId: string } {
  const data = getClientSnapshot()
  const bp = input.blueprint
  if (bp.gift_type !== 'ready-made') {
    const check = validateItems(bp.gift_type, bp.items, { products: data.products })
    if (!check.ok) throw new Error(check.errors[0].message)
  }

  const now = new Date().toISOString()
  const orderId = nextOrderId(data.orders)

  let customer = data.customers.find((c) => c.phone === input.customer.phone)
  const newCustomer: Customer | null = customer
    ? null
    : { id: uid('cus'), ...input.customer, country: 'Nepal', createdAt: now }
  customer = customer ?? newCustomer!

  let recipient = data.recipients.find(
    (r) => r.customerId === customer!.id && r.name === input.recipient.name && r.suburb === input.recipient.suburb,
  )
  const newRecipient: Recipient | null = recipient
    ? null
    : { id: uid('rec'), customerId: customer.id, importantDates: '', ...input.recipient }
  recipient = recipient ?? newRecipient!

  const built = buildOrder({
    id: orderId,
    blueprint: bp,
    customerId: customer.id,
    recipientId: recipient.id,
    city: recipient.city,
    now,
    settings: data.settings,
    products: data.products,
    paymentScreenshot: input.paymentScreenshot,
  })
  if (input.deliveryWindow) built.order.deliveryWindow = input.deliveryWindow

  commit({
    ...data,
    customers: newCustomer ? [...data.customers, newCustomer] : data.customers,
    recipients: newRecipient ? [...data.recipients, newRecipient] : data.recipients,
    orders: [...data.orders, built.order],
    orderItems: [...data.orderItems, ...built.items],
    checklistItems: [...data.checklistItems, ...built.checklist],
  })
  return { orderId }
}

function patchOrder(orderId: string, patch: (o: Order) => Order) {
  mutate((d) => ({ ...d, orders: d.orders.map((o) => (o.id === orderId ? patch(o) : o)) }))
}

/** Eva taps "Confirm payment": the order moves NEW -> PAYMENT_CONFIRMED. */
export function confirmPayment(orderId: string) {
  patchOrder(orderId, (o) => ({
    ...o,
    paymentCheck: 'confirmed',
    status: o.status === 'NEW' ? 'PAYMENT_CONFIRMED' : o.status,
    updatedAt: new Date().toISOString(),
  }))
}

/** Move one step along the ladder. Returns false if blocked (payment not confirmed, on hold, or already delivered). */
export function advanceOrderStatus(orderId: string): boolean {
  const order = getClientSnapshot().orders.find((o) => o.id === orderId)
  if (!order) return false
  const next = nextStatus(order.status)
  if (!next || order.paymentCheck !== 'confirmed') return false
  patchOrder(orderId, (o) => ({ ...o, status: next, updatedAt: new Date().toISOString() }))
  return true
}

export function holdOrder(orderId: string) {
  patchOrder(orderId, (o) =>
    o.status === 'ON_HOLD' || o.status === 'DELIVERED'
      ? o
      : { ...o, statusBeforeHold: o.status, status: 'ON_HOLD', updatedAt: new Date().toISOString() },
  )
}

export function resumeOrder(orderId: string) {
  patchOrder(orderId, (o) =>
    o.status === 'ON_HOLD'
      ? { ...o, status: o.statusBeforeHold ?? 'NEW', statusBeforeHold: null, updatedAt: new Date().toISOString() }
      : o,
  )
}

/** Mark one order line bought (or un-bought). Procurement counts per line, so nothing double-counts. */
export function markPurchased(itemId: string, purchased = true) {
  mutate((d) => ({ ...d, orderItems: d.orderItems.map((i) => (i.id === itemId ? { ...i, purchased } : i)) }))
}

export function tickChecklistItem(itemId: string, done: boolean) {
  mutate((d) => ({
    ...d,
    checklistItems: d.checklistItems.map((i) =>
      i.id === itemId ? { ...i, done, doneAt: done ? new Date().toISOString() : null } : i,
    ),
  }))
}

/** The OS Products toggle. Out-of-stock products disappear from the shop and builder. */
export function setInStock(productId: string, inStock: boolean) {
  mutate((d) => ({ ...d, products: d.products.map((p) => (p.id === productId ? { ...p, inStock } : p)) }))
}

export function updateSettings(patch: Partial<Settings>) {
  mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
}

export function resetDemoData() {
  commit(seedData())
}

// ---------------------------------------------------------------------------
// Read helpers (no React dependency)
// ---------------------------------------------------------------------------

export function findOrder(data: OSData, id: string): Order | undefined {
  return data.orders.find((o) => o.id === id)
}

export function findCustomer(data: OSData, id: string): Customer | undefined {
  return data.customers.find((c) => c.id === id)
}

export function findRecipient(data: OSData, id: string): Recipient | undefined {
  return data.recipients.find((r) => r.id === id)
}

export function itemsFor(data: OSData, orderId: string): OrderItem[] {
  return data.orderItems.filter((i) => i.orderId === orderId)
}

export function checklistFor(data: OSData, orderId: string): ChecklistItem[] {
  return data.checklistItems.filter((i) => i.orderId === orderId).sort((a, b) => a.sortOrder - b.sortOrder)
}

/** Products currently shown in the shop / builder. */
export function inStockProducts(data: OSData): Product[] {
  return data.products.filter((p) => p.inStock)
}

/** Track Order lookup: needs the order id AND the last 4 digits of the sender's phone. */
export function lookupOrder(data: OSData, orderId: string, phoneLast4: string): Order | null {
  const order = findOrder(data, orderId.trim().toUpperCase())
  const customer = order && findCustomer(data, order.customerId)
  if (!order || !customer || phoneLast4.trim().length !== 4) return null
  return customer.phone.replace(/\D/g, '').endsWith(phoneLast4.trim()) ? order : null
}
