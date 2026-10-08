// Help Me Choose: deterministic tag scoring (recipient, occasion, budget, interests) -> top 3 templates with a "why" line. No AI. Called by the Help Me Choose route.
import { PRODUCTS } from '../data/products'
import { TEMPLATES } from '../data/templates'
import type { BudgetBand, GiftTemplate, Occasion, Product, RecipientKind } from '../types'
import { expandBom, linesTotalAud } from './bom'

export interface Answers {
  recipient: RecipientKind
  occasion: Occasion
  budget: BudgetBand
  /** Free keywords that match template tags, e.g. ["chocolate", "photos"]. */
  interests: string[]
}

export interface Recommendation {
  template: GiftTemplate
  score: number
  priceAud: number
  why: string
}

/** Gift subtotal bands in AUD: low <= 55 < mid <= 75 < high. */
export const BUDGET_LIMITS = { lowMax: 55, midMax: 75 }
const BAND_ORDER: BudgetBand[] = ['low', 'mid', 'high']

export function budgetBand(priceAud: number): BudgetBand {
  if (priceAud <= BUDGET_LIMITS.lowMax) return 'low'
  if (priceAud <= BUDGET_LIMITS.midMax) return 'mid'
  return 'high'
}

/** AUD price of one ready-made copy of a template (components + packaging + default card). */
export function templatePriceAud(t: GiftTemplate, products: readonly Product[] = PRODUCTS): number {
  const lines = expandBom(
    'TMP',
    {
      gift_type: 'ready-made',
      template_id: t.id,
      quantity: 1,
      occasion: t.occasions[0],
      recipient: t.recipients[0],
      packaging: { ribbon: false, premiumWrap: false },
      card: t.cardId,
      message: '',
      delivery_date: '',
    },
    { products },
  )
  return linesTotalAud(lines)
}

const BANDS_TEXT: Record<BudgetBand, string> = { low: 'a smaller', mid: 'a mid-range', high: 'a generous' }

export function recommend(
  answers: Answers,
  opts: { templates?: readonly GiftTemplate[]; products?: readonly Product[] } = {},
): Recommendation[] {
  const templates = opts.templates ?? TEMPLATES
  const products = opts.products ?? PRODUCTS
  const stock = new Map(products.map((p) => [p.id, p.inStock]))

  const scored = templates
    .filter((t) => t.components.every((c) => stock.get(c.productId) !== false))
    .map((t) => {
      const priceAud = templatePriceAud(t, products)
      const reasons: string[] = []
      let score = 0

      if (t.occasions.includes(answers.occasion)) {
        score += 4
        reasons.push(`made for ${answers.occasion.replace('-', ' ')}`)
      }
      if (t.recipients.includes(answers.recipient)) {
        score += 3
        reasons.push(`a good fit for a ${answers.recipient}`)
      }
      const dist = Math.abs(BAND_ORDER.indexOf(budgetBand(priceAud)) - BAND_ORDER.indexOf(answers.budget))
      if (dist === 0) {
        score += 3
        reasons.push(`${BANDS_TEXT[answers.budget]} budget`)
      } else if (dist === 1) score += 1
      const hits = answers.interests.map((i) => i.toLowerCase()).filter((i) => t.tags.includes(i))
      score += hits.length * 2
      if (hits.length) reasons.push(`has the ${hits.join(' and ')} they like`)

      const why = reasons.length ? `Picked because it is ${reasons.join(', ')}.` : 'A popular all-round pick.'
      return { template: t, score, priceAud, why }
    })

  // Highest score first; ties break on template id so the result is stable.
  return scored.sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id)).slice(0, 3)
}
