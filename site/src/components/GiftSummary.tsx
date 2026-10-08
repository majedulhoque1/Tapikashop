// Visual + itemised summary of the gift in the cart (illustrated preview for built gifts, photo for ready-made). Used by /cart and /checkout.
import { quote as makeQuote, type Pricing } from '../cart/pricing'
import type { CartGift } from '../cart/types'
import { getTemplate } from '../data/templates'
import type { OrderItem, OrderTotals } from '../types'
import { GiftPreview } from './builder/GiftPreview'
import { useBuilderView } from './builder/Summary'
import { BLANK_STATE } from './builder/state'
import { Itemised } from './Itemised'
import { ProductImage } from './ProductImage'

export function useGiftQuote(gift: CartGift, pricing: Pricing): { lines: OrderItem[]; totals: OrderTotals | null; giftAud: number } {
  const q = makeQuote(gift.blueprint, gift.city, pricing)
  return { lines: q.lines, totals: q.totals, giftAud: q.giftAud }
}

export function GiftVisual({ gift, pricing }: { gift: CartGift; pricing: Pricing }) {
  const view = useBuilderView(gift.builder ?? BLANK_STATE, pricing)
  if (gift.builder && gift.builder.formatId) {
    const b = gift.builder
    return (
      <GiftPreview
        formatId={b.formatId!}
        units={view.units}
        ribbon={b.ribbon}
        premiumWrap={b.premiumWrap}
        hasCard={!!b.card}
        message={b.message}
        heartFrame={!b.items.some((i) => i.product.includes('grid'))}
        collage={b.collage}
      />
    )
  }
  if (gift.blueprint.gift_type === 'ready-made') {
    const t = getTemplate(gift.blueprint.template_id)
    return <ProductImage id={t.id} src={t.image} name={t.name} eager ratio="4 / 3" />
  }
  return null
}

export function GiftLines({ gift, pricing }: { gift: CartGift; pricing: Pricing }) {
  const q = useGiftQuote(gift, pricing)
  return <Itemised lines={q.lines} fx={pricing.fx} totals={q.totals} city={gift.city} />
}
