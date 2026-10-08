// Checks chosen items against a format's slot capacity and allowed categories. Called by the builder Add Items step.
import { FORMATS, getFormat } from '../data/formats'
import { PRODUCTS, productMap } from '../data/products'
import type { Format, FormatId, Product } from '../types'

export type CapacityErrorCode = 'over-capacity' | 'category-not-allowed' | 'unknown-product' | 'not-builder-eligible' | 'out-of-stock' | 'empty'

export interface CapacityError {
  code: CapacityErrorCode
  productId?: string
  message: string
}

export interface CapacityResult {
  ok: boolean
  used: number
  capacity: number
  errors: CapacityError[]
}

interface Deps {
  products?: readonly Product[]
  formats?: readonly Format[]
}

type Item = { product: string; quantity: number }

export function slotsUsed(items: Item[], products: readonly Product[] = PRODUCTS): number {
  const map = productMap(products)
  return items.reduce((sum, it) => sum + (map.get(it.product)?.slots ?? 1) * it.quantity, 0)
}

export function validateItems(formatId: FormatId, items: Item[], deps: Deps = {}): CapacityResult {
  const format = getFormat(formatId, deps.formats ?? FORMATS)
  const map = productMap(deps.products ?? PRODUCTS)
  const errors: CapacityError[] = []

  if (items.length === 0) errors.push({ code: 'empty', message: 'Pick at least one item.' })

  let used = 0
  for (const it of items) {
    const p = map.get(it.product)
    if (!p) {
      errors.push({ code: 'unknown-product', productId: it.product, message: `Unknown product "${it.product}".` })
      continue
    }
    used += p.slots * it.quantity
    if (!p.flags.builderEligible) errors.push({ code: 'not-builder-eligible', productId: p.id, message: `${p.name} cannot be added to a custom gift.` })
    else if (!format.allowedCategories.includes(p.category)) errors.push({ code: 'category-not-allowed', productId: p.id, message: `${p.name} does not fit in a ${format.name}.` })
    if (!p.inStock) errors.push({ code: 'out-of-stock', productId: p.id, message: `${p.name} is out of stock.` })
  }
  if (used > format.capacity) {
    errors.push({ code: 'over-capacity', message: `${format.name} holds ${format.capacity} spaces; you have used ${used}.` })
  }
  return { ok: errors.length === 0, used, capacity: format.capacity, errors }
}

/** Would adding one more of productId still fit? Drives disabled "+" buttons. */
export function canAdd(formatId: FormatId, items: Item[], productId: string, deps: Deps = {}): boolean {
  const format = getFormat(formatId, deps.formats ?? FORMATS)
  const products = deps.products ?? PRODUCTS
  const p = productMap(products).get(productId)
  if (!p || !p.inStock || !p.flags.builderEligible || !format.allowedCategories.includes(p.category)) return false
  return slotsUsed(items, products) + p.slots <= format.capacity
}
