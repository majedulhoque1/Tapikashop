// One-gift cart in localStorage (an order is one gift to one person). useSyncExternalStore, same pattern as os/store.ts. Used by gift detail, builder, cart, checkout and the header.
import { useSyncExternalStore } from 'react'

import type { CartGift } from './types'

const KEY = 'tapika_cart_v1'
const EMPTY: { gift: CartGift | null } = { gift: null }

let cached: { gift: CartGift | null } | null = null
const listeners = new Set<() => void>()

function read(): { gift: CartGift | null } {
  if (typeof window === 'undefined') return EMPTY
  if (cached) return cached
  try {
    const raw = window.localStorage.getItem(KEY)
    cached = raw ? (JSON.parse(raw) as { gift: CartGift | null }) : { gift: null }
  } catch {
    cached = { gift: null }
  }
  return cached
}

function write(next: { gift: CartGift | null }) {
  cached = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch (e) {
    // Quota exceeded (many photos): keep going in memory so the flow still works.
    console.warn('Tapika cart could not persist', e)
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** The gift in the cart, or null. Always null on the server and before hydration. */
export function useCart(): CartGift | null {
  return useSyncExternalStore(subscribe, () => read().gift, () => null)
}

export function setCartGift(gift: CartGift) {
  write({ gift })
}

export function patchCartGift(patch: Partial<CartGift>) {
  const cur = read().gift
  if (cur) write({ gift: { ...cur, ...patch } })
}

export function clearCart() {
  write({ gift: null })
}

// Orders this browser has placed or looked up successfully; /order/$id only shows details for these.
const VERIFIED_KEY = 'tapika_verified_orders'

export function markOrderVerified(orderId: string) {
  try {
    const list = JSON.parse(window.sessionStorage.getItem(VERIFIED_KEY) ?? '[]') as string[]
    if (!list.includes(orderId)) window.sessionStorage.setItem(VERIFIED_KEY, JSON.stringify([...list, orderId]))
  } catch {
    /* private mode: the buyer just re-enters the last 4 digits */
  }
}

export function isOrderVerified(orderId: string): boolean {
  try {
    return (JSON.parse(window.sessionStorage.getItem(VERIFIED_KEY) ?? '[]') as string[]).includes(orderId)
  } catch {
    return false
  }
}
