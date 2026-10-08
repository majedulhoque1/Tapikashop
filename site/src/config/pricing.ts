// The single place for money rules: FX rate, NPR rounding, delivery fees, price breakdown. Used by builder/, os/store.ts and checkout.
import type { OrderTotals } from '../types'

/** All numbers here are SAMPLE prices until the owner confirms real ones (shown as "sample prices" in the footer). */
export const PRICING = {
  /** 1 AUD in NPR. Editable in OS Settings; frozen onto each order at creation. */
  fxAudToNpr: 92,
  /** Shown at checkout: "Rate as of ...". */
  rateAsOf: '2026-10-08',
  /** NPR totals are rounded to the nearest multiple of this. */
  roundNprTo: 50,
  /** Delivery fee per AU city, in AUD. */
  deliveryFeesAud: {
    Sydney: 18,
    Melbourne: 15,
    Brisbane: 20,
    Perth: 28,
    Adelaide: 22,
    Canberra: 22,
  } as Record<string, number>,
}

export interface PricingSettings {
  fxAudToNpr: number
  deliveryFeesAud: Record<string, number>
}

/** Round to the nearest `step` (halves round up). 1224 -> 1200, 1225 -> 1250. */
export function roundNpr(npr: number, step: number = PRICING.roundNprTo): number {
  return Math.round(npr / step) * step
}

export function audToNpr(aud: number, fx: number = PRICING.fxAudToNpr): number {
  return roundNpr(aud * fx)
}

export function deliveryFeeAud(city: string, fees: Record<string, number> = PRICING.deliveryFeesAud): number {
  const fee = fees[city]
  if (fee === undefined) throw new Error(`No delivery fee configured for "${city}"`)
  return fee
}

/** Money to cents so float noise (0.1 + 0.2) never leaks into totals. */
export function roundAud(aud: number): number {
  return Math.round(aud * 100) / 100
}

/** Gift lines + city delivery fee -> AUD and NPR totals. */
export function priceOrder(
  giftAud: number,
  city: string,
  settings: PricingSettings = PRICING,
): OrderTotals {
  const gift = roundAud(giftAud)
  const delivery = deliveryFeeAud(city, settings.deliveryFeesAud)
  const totalAud = roundAud(gift + delivery)
  return {
    giftAud: gift,
    deliveryAud: delivery,
    totalAud,
    totalNpr: audToNpr(totalAud, settings.fxAudToNpr),
    fxRate: settings.fxAudToNpr,
  }
}
