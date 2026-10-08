// Business rules that are not money: owner name, lead time, delivery cities, timezone. Used by procurement, the date picker and the OS.
import { addDays, todayInZone } from '../lib/format'

export const BUSINESS = {
  /** Display name only; the real name is unconfirmed, so it is a setting. */
  ownerName: 'Eva',
  /** Days Eva needs between ordering and delivery (buy, assemble, wrap). */
  leadDays: 3,
  /** AU "today" is computed in this zone, not the buyer's (Nepal is +5:45). */
  businessTimeZone: 'Australia/Melbourne',
  cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra'] as const,
}

export type City = (typeof BUSINESS.cities)[number]

/** Earliest AU delivery date a buyer may pick today. */
export function earliestDeliveryDate(leadDays: number = BUSINESS.leadDays, now: Date = new Date()): string {
  return addDays(todayInZone(BUSINESS.businessTimeZone, now), leadDays)
}

export function isDeliveryDateAllowed(date: string, leadDays: number = BUSINESS.leadDays, now: Date = new Date()): boolean {
  return date >= earliestDeliveryDate(leadDays, now)
}
