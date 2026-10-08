// One ready-made gift in the shop / home / help results: photo, name, what it is, NPR price first. Editorial tile (no card chrome). Used by /, /shop and /help.
import { Link } from '@tanstack/react-router'

import { type Pricing } from '../cart/pricing'
import { audToNpr } from '../config/pricing'
import { getFormat } from '../data/formats'
import { templatePriceAud } from '../builder/recommend'
import type { GiftTemplate } from '../types'
import { Price } from './Price'
import { ProductImage } from './ProductImage'

export function thingCount(t: GiftTemplate): number {
  return t.components.reduce((s, c) => s + c.qty, 0)
}

export function GiftTile({
  t,
  pricing,
  eager = false,
  ratio,
  size = 'base',
}: {
  t: GiftTemplate
  pricing: Pricing
  eager?: boolean
  ratio?: string
  size?: 'base' | 'lg'
}) {
  const aud = templatePriceAud(t, pricing.products)
  const n = thingCount(t)
  return (
    <Link to="/gift/$id" params={{ id: t.id }} className="group block">
      <ProductImage
        id={t.id}
        src={t.image}
        name={t.name}
        eager={eager}
        ratio={ratio}
        className="shadow-soft transition-shadow duration-500 ease-out group-hover:shadow-lift"
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      <h3 className={`mt-4 font-display leading-snug ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
        <span className="draw-line">{t.name}</span>
      </h3>
      <p className="text-sm text-muted">
        {getFormat(t.formatId).name} · {n} {n === 1 ? 'thing' : 'things'}
      </p>
      <Price className="mt-1" npr={audToNpr(aud, pricing.fx)} aud={aud} />
    </Link>
  )
}
