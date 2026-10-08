// Gift Builder state helpers: blank state, starter -> state, state -> blueprint, format-change cleanup. Used by routes/build.tsx and its step components.
import { canAdd, slotsUsed } from '../../builder/capacity'
import { getFormat } from '../../data/formats'
import { productMap } from '../../data/products'
import type { BuilderOutput, FormatId, GiftTemplate, Product } from '../../types'
import type { BuilderState } from '../../cart/types'

export const BLANK_STATE: BuilderState = {
  recipient: null,
  occasion: null,
  formatId: null,
  items: [],
  ribbon: false,
  premiumWrap: false,
  card: null,
  message: '',
  collage: { photos: [], names: '', date: '' },
  budgetNpr: null,
  city: '',
  date: '',
  window: 'any',
  startedFrom: null,
}

export function stateFromTemplate(t: GiftTemplate): BuilderState {
  return {
    ...BLANK_STATE,
    recipient: t.recipients[0] ?? null,
    occasion: t.occasions[0] ?? null,
    formatId: t.formatId,
    items: t.components.map((c) => ({ product: c.productId, quantity: c.qty })),
    card: t.cardId,
    startedFrom: t.id,
  }
}

export function toBlueprint(s: BuilderState): BuilderOutput | null {
  if (!s.formatId) return null
  return {
    gift_type: s.formatId,
    items: s.items.filter((i) => i.quantity > 0),
    occasion: s.occasion ?? 'birthday',
    recipient: s.recipient ?? 'friend',
    packaging: { ribbon: s.ribbon, premiumWrap: s.premiumWrap },
    card: s.card,
    message: s.message.trim(),
    delivery_date: s.date,
    ...(s.formatId === 'photo-frame' && s.collage.photos.length + s.collage.names.length + s.collage.date.length > 0 ? { collage: s.collage } : {}),
  }
}

/** Switch format; drop items that no longer fit and say what was removed. */
export function changeFormat(s: BuilderState, formatId: FormatId, products: readonly Product[]): { state: BuilderState; removed: string[] } {
  const format = getFormat(formatId)
  const map = productMap(products)
  const removed: string[] = []
  let kept = s.items.filter((it) => {
    const p = map.get(it.product)
    const ok = !!p && format.allowedCategories.includes(p.category)
    if (!ok && p) removed.push(p.name)
    return ok
  })
  // Over capacity: drop from the end until it fits.
  while (kept.length && slotsUsed(kept, products) > format.capacity) {
    const last = kept[kept.length - 1]
    const p = map.get(last.product)
    if (p) removed.push(p.name)
    kept = kept.slice(0, -1)
  }
  return { state: { ...s, formatId, items: kept }, removed }
}

export function qtyOf(s: BuilderState, productId: string): number {
  return s.items.find((i) => i.product === productId)?.quantity ?? 0
}

export function setQty(s: BuilderState, productId: string, qty: number): BuilderState {
  const exists = s.items.some((i) => i.product === productId)
  if (qty <= 0) return { ...s, items: s.items.filter((i) => i.product !== productId) }
  if (exists) return { ...s, items: s.items.map((i) => (i.product === productId ? { ...i, quantity: qty } : i)) }
  return { ...s, items: [...s.items, { product: productId, quantity: qty }] }
}

export { canAdd, slotsUsed }
