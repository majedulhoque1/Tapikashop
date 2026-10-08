// Shared shapes for the customer side: delivery window, builder draft, cart gift. Used by cart/, components/builder and the checkout.
import type { CollageInfo, FormatId, GiftBlueprint, Occasion, RecipientKind } from '../types'

export type DeliveryWindow = 'any' | 'morning' | 'afternoon' | 'evening'

export const WINDOW_LABEL: Record<DeliveryWindow, string> = {
  any: 'Any time that day',
  morning: 'Morning (9am to 12pm)',
  afternoon: 'Afternoon (12pm to 4pm)',
  evening: 'Evening (4pm to 7pm)',
}

/** Everything the Gift Builder collects. Saved in the cart so "Edit gift" restores it. */
export interface BuilderState {
  recipient: RecipientKind | null
  occasion: Occasion | null
  formatId: FormatId | null
  items: { product: string; quantity: number }[]
  ribbon: boolean
  premiumWrap: boolean
  card: string | null
  message: string
  collage: CollageInfo
  /** Optional budget in NPR; only drives the budget meter. */
  budgetNpr: number | null
  city: string
  date: string
  window: DeliveryWindow
  /** Template the builder was started from, if any. */
  startedFrom: string | null
}

export interface CartGift {
  blueprint: GiftBlueprint
  /** Human title, e.g. "Gift Box" or "Heart Collage Frame". */
  title: string
  city: string
  window: DeliveryWindow
  /** Present when the gift came from the Gift Builder (so it can be edited). */
  builder?: BuilderState
}
