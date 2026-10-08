// Customer-side pricing helpers: live settings with safe fallbacks, blueprint -> lines -> totals. Used by shop, gift detail, builder, cart, checkout.
import { useMemo } from 'react'

import { expandBom, linesTotalAud } from '../builder/bom'
import { BUSINESS } from '../config/business'
import { PRICING, audToNpr, priceOrder } from '../config/pricing'
import { PRODUCTS } from '../data/products'
import { TEMPLATES } from '../data/templates'
import { useOS } from '../os/store'
import type { GiftBlueprint, GiftTemplate, OrderItem, OrderTotals, Product, Settings } from '../types'

export interface Pricing {
  products: Product[]
  settings: Settings
  fx: number
  leadDays: number
  fees: Record<string, number>
}

/** Live settings from the demo store; before hydration (empty server snapshot) falls back to the config defaults. */
export function usePricing(): Pricing {
  const data = useOS()
  return useMemo(() => {
    const s = data.settings
    const fx = s.fxAudToNpr > 0 ? s.fxAudToNpr : PRICING.fxAudToNpr
    const fees = Object.keys(s.deliveryFeesAud).length ? s.deliveryFeesAud : PRICING.deliveryFeesAud
    return { products: data.products.length ? data.products : PRODUCTS, settings: s, fx, leadDays: s.leadDays || BUSINESS.leadDays, fees }
  }, [data])
}

/** Exact NPR for one line (not rounded to Rs 50; only the order total is). */
export function nprExact(aud: number, fx: number): number {
  return Math.round(aud * fx)
}

export function linesFor(bp: GiftBlueprint, products: readonly Product[]): OrderItem[] {
  return expandBom('PREVIEW', bp, { products })
}

export interface Quote {
  lines: OrderItem[]
  giftAud: number
  giftNpr: number
  /** Null until a city is chosen. */
  totals: OrderTotals | null
}

export function quote(bp: GiftBlueprint, city: string, p: Pricing): Quote {
  const lines = linesFor(bp, p.products)
  const giftAud = linesTotalAud(lines)
  const settings = { fxAudToNpr: p.fx, deliveryFeesAud: p.fees }
  const totals = city && p.fees[city] !== undefined ? priceOrder(giftAud, city, settings) : null
  return { lines, giftAud, giftNpr: audToNpr(giftAud, p.fx), totals }
}

/** True if every component of a template is in stock. */
export function templateAvailable(t: GiftTemplate, products: readonly Product[]): boolean {
  const stock = new Map(products.map((x) => [x.id, x.inStock]))
  return t.components.every((c) => stock.get(c.productId) !== false)
}

export function availableTemplates(products: readonly Product[]): GiftTemplate[] {
  return TEMPLATES.filter((t) => templateAvailable(t, products))
}
