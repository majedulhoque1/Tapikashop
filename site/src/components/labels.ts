// Customer-facing labels for occasions, recipients, categories and price bands. Used by shop filters, builder, help and detail pages.
import type { BudgetBand, Category, Occasion, RecipientKind } from '../types'

export const OCCASION_LABEL: Record<Occasion, string> = {
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  rakhi: 'Rakhi',
  festival: 'Festivals',
  love: 'Love',
  'thank-you': 'Thank you',
  'new-baby': 'New baby',
  wedding: 'Wedding',
}
export const OCCASIONS = Object.keys(OCCASION_LABEL) as Occasion[]

export const RECIPIENT_LABEL: Record<RecipientKind, string> = {
  partner: 'My partner',
  parent: 'Aama or Baba',
  sibling: 'Didi, Dai, Bahini or Bhai',
  friend: 'A friend',
  child: 'A little one',
  colleague: 'A colleague',
}
export const RECIPIENTS = Object.keys(RECIPIENT_LABEL) as RecipientKind[]

export const CATEGORY_LABEL: Record<Category, string> = {
  rakhi: 'Rakhi',
  mithai: 'Mithai',
  'dry-fruit': 'Dry fruit',
  chocolate: 'Chocolate',
  'photo-frame': 'Photo frames',
  teddy: 'Teddy bears',
  card: 'Cards',
  'branded-box': 'Boxed sets',
  fabric: 'Dhaka and fabric',
  packaging: 'Packaging',
}

export const BAND_LABEL: Record<BudgetBand, string> = {
  low: 'Smaller',
  mid: 'Mid-range',
  high: 'Generous',
}

export function relationshipLabel(r: RecipientKind | null): string {
  if (!r) return 'Friend'
  return { partner: 'Partner', parent: 'Parent', sibling: 'Sibling', friend: 'Friend', child: 'Child', colleague: 'Colleague' }[r]
}
