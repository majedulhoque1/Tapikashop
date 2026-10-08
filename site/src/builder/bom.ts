// Expands a gift blueprint (builder output or ready-made template) into order lines: items + packaging + card + tasks. Called by os/store.ts and the builder price preview.
import { FORMATS, getFormat } from '../data/formats'
import { PREMIUM_WRAP_ID, PRODUCTS, RIBBON_ID, productMap } from '../data/products'
import { TEMPLATES, getTemplate } from '../data/templates'
import type { GiftBlueprint, OrderItem, Product } from '../types'

export const PRINT_COLLAGE_TASK_ID = 'task-print-collage'

interface Deps {
  products?: readonly Product[]
}

type RawLine = Omit<OrderItem, 'id' | 'orderId' | 'purchased'>

/** Merge lines with the same product + type so "2 x cashew" is one line. */
function pushLine(lines: RawLine[], line: RawLine) {
  const existing = lines.find((l) => l.productId === line.productId && l.type === line.type)
  if (existing) existing.qty += line.qty
  else lines.push({ ...line })
}

/**
 * Pure: blueprint in, order lines out. Ready-made gifts expand to their
 * components (never "Birthday Box x1"), so procurement sees real parts.
 */
export function expandBom(orderId: string, blueprint: GiftBlueprint, deps: Deps = {}): OrderItem[] {
  const products = productMap(deps.products ?? PRODUCTS)
  const lines: RawLine[] = []
  const add = (productId: string, qty: number, type: RawLine['type']) => {
    const p = products.get(productId)
    if (!p) throw new Error(`Unknown product "${productId}"`)
    pushLine(lines, { productId, name: p.name, qty, priceAud: p.priceAud, type })
  }

  const ready = blueprint.gift_type === 'ready-made' ? blueprint : null
  const copies = ready ? ready.quantity : 1
  let formatId
  if (ready) {
    const tpl = getTemplate(ready.template_id, TEMPLATES)
    formatId = tpl.formatId
    for (const c of tpl.components) add(c.productId, c.qty * copies, 'gift')
  } else if (blueprint.gift_type !== 'ready-made') {
    formatId = blueprint.gift_type
    for (const it of blueprint.items) add(it.product, it.quantity, 'gift')
  }
  if (!formatId) throw new Error('Blueprint has no format')

  const format = getFormat(formatId, FORMATS)
  for (const pk of format.autoPackaging) add(pk.productId, pk.qty * copies, 'packaging')
  if (blueprint.packaging.ribbon) add(RIBBON_ID, copies, 'packaging')
  if (blueprint.packaging.premiumWrap) add(PREMIUM_WRAP_ID, copies, 'packaging')
  if (blueprint.card) add(blueprint.card, copies, 'card')

  if (blueprint.collage && blueprint.collage.photos.length > 0) {
    const n = blueprint.collage.photos.length
    pushLine(lines, {
      productId: PRINT_COLLAGE_TASK_ID,
      name: `Print collage (${n} photo${n === 1 ? '' : 's'})`,
      qty: 1,
      priceAud: 0,
      type: 'task',
    })
  }

  return lines.map((l, i) => ({
    ...l,
    id: `${orderId}-${String(i + 1).padStart(2, '0')}`,
    orderId,
    purchased: false,
  }))
}

/** Sum of qty x unit price across all lines, in AUD. */
export function linesTotalAud(lines: readonly OrderItem[]): number {
  return Math.round(lines.reduce((sum, l) => sum + l.qty * l.priceAud, 0) * 100) / 100
}
