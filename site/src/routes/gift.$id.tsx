// /gift/$id: one ready-made gift. Shows what is inside, card message, delivery date; Add to cart or Customise this gift (opens the builder pre-filled).
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { templatePriceAud } from '../builder/recommend'
import { setCartGift } from '../cart/store'
import { templateAvailable, usePricing } from '../cart/pricing'
import type { DeliveryWindow } from '../cart/types'
import { DeliveryPicker } from '../components/DeliveryPicker'
import { IconPen } from '../components/Icons'
import { CATEGORY_LABEL, OCCASION_LABEL } from '../components/labels'
import { Price } from '../components/Price'
import { ProductImage } from '../components/ProductImage'
import { BTN_PRIMARY, BTN_SECONDARY, Eyebrow, Field, TextArea, Twine } from '../components/ui'
import { audToNpr } from '../config/pricing'
import { getFormat } from '../data/formats'
import { productMap } from '../data/products'
import { TEMPLATES } from '../data/templates'
import { CardPaper } from '../components/CardPaper'

export const Route = createFileRoute('/gift/$id')({
  head: () => ({ meta: [{ title: 'Gift - Tapika' }] }),
  component: GiftPage,
})

function GiftPage() {
  const { id } = Route.useParams()
  const pricing = usePricing()
  const navigate = useNavigate()
  const t = TEMPLATES.find((x) => x.id === id)

  const [message, setMessage] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')
  const [win, setWin] = useState<DeliveryWindow>('any')

  if (!t) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 md:px-12">
        <h1 className="font-display text-3xl">We could not find that gift.</h1>
        <p className="mt-3 text-lg text-muted">It may have sold out or moved. Have a look at everything we have.</p>
        <Link to="/shop" className={`${BTN_PRIMARY} mt-6`}>
          Shop gifts
        </Link>
      </main>
    )
  }

  const map = productMap(pricing.products)
  const aud = templatePriceAud(t, pricing.products)
  const available = templateAvailable(t, pricing.products)
  const card = t.cardId ? map.get(t.cardId) : undefined
  const minFee = Math.min(...Object.values(pricing.fees))
  const format = getFormat(t.formatId)

  function add() {
    if (!t) return
    setCartGift({
      title: t.name,
      city,
      window: win,
      blueprint: {
        gift_type: 'ready-made',
        template_id: t.id,
        quantity: 1,
        occasion: t.occasions[0],
        recipient: t.recipients[0],
        packaging: { ribbon: false, premiumWrap: false },
        card: t.cardId,
        message: message.trim(),
        delivery_date: date,
      },
    })
    void navigate({ to: '/cart' })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-12 md:pt-12">
      <Link to="/shop" className="text-sm font-semibold text-brand-text underline underline-offset-4">
        All gifts
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16">
        <ProductImage id={t.id} src={t.image} name={t.name} eager ratio="4 / 5" className="lg:sticky lg:top-24 lg:self-start" />

        <div>
          <Eyebrow>
            {format.name} · {t.occasions.map((o) => OCCASION_LABEL[o]).join(', ')}
          </Eyebrow>
          <h1 className="mt-2 font-display text-3xl leading-[1.1] tracking-[-0.02em]">{t.name}</h1>
          <Price className="mt-3" size="lg" npr={audToNpr(aud, pricing.fx)} aud={aud} />
          <p className="mt-1 text-sm text-muted">Delivery from {`Rs ${Math.round(minFee * pricing.fx)}`}, depending on the city. Sample prices.</p>
          <p className="mt-5 max-w-[62ch] text-lg">{t.description}</p>

          {!available ? (
            <p role="status" className="mt-5 rounded-field bg-band px-4 py-3">
              One of the things in this gift is out of stock right now. You can still build something similar.
            </p>
          ) : null}

          <Twine className="my-8" />

          <h2 className="font-display text-xl">What is inside</h2>
          <ul className="mt-3 divide-y divide-dashed divide-muted/40">
            {t.components.map((c) => {
              const p = map.get(c.productId)
              return (
                <li key={c.productId} className="flex items-baseline justify-between gap-4 py-2">
                  <span>
                    {p?.name ?? c.productId}
                    {c.qty > 1 ? <span className="text-muted"> × {c.qty}</span> : null}
                  </span>
                  <span className="text-sm text-muted">{p ? CATEGORY_LABEL[p.category] : ''}</span>
                </li>
              )
            })}
            <li className="flex items-baseline justify-between gap-4 py-2">
              <span>{format.name} packing</span>
              <span className="text-sm text-muted">Included</span>
            </li>
            {card ? (
              <li className="flex items-baseline justify-between gap-4 py-2">
                <span>{card.name}</span>
                <span className="text-sm text-muted">Included</span>
              </li>
            ) : null}
          </ul>

          <Twine className="my-8" />

          <div className="flex flex-col gap-6">
            <div>
              <Field label="Message on the card" htmlFor="g-msg" hint="We write it by hand, just as you type it.">
                <TextArea id="g-msg" rows={3} maxLength={200} className="font-note text-xl leading-8" placeholder="Happy Birthday Sarah! Wish I could be there." value={message} onChange={(e) => setMessage(e.target.value)} />
              </Field>
              {message.trim() ? <CardPaper className="mt-3" message={message} /> : null}
            </div>
            <DeliveryPicker
              city={city}
              date={date}
              window={win}
              leadDays={pricing.leadDays}
              fees={pricing.fees}
              onChange={(p) => {
                if (p.city !== undefined) setCity(p.city)
                if (p.date !== undefined) setDate(p.date)
                if (p.window !== undefined) setWin(p.window)
              }}
            />
            <p className="-mt-3 text-sm text-muted">You can also choose the city and date at checkout.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className={BTN_PRIMARY} disabled={!available} onClick={add}>
              Add to cart
            </button>
            <Link to="/build" search={{ template: t.id }} className={BTN_SECONDARY}>
              <IconPen width={20} height={20} /> Customise this gift
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
