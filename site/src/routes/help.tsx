// /help: Help Me Choose. Five quick questions, then builder/recommend.ts gives the top 3 gifts with a "why". Open one in the builder or add it to the cart.
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BUDGET_LIMITS, recommend } from '../builder/recommend'
import { usePricing } from '../cart/pricing'
import { setCartGift } from '../cart/store'
import { audToNpr } from '../config/pricing'
import { IconArrow } from '../components/Icons'
import { OCCASIONS, OCCASION_LABEL, RECIPIENTS, RECIPIENT_LABEL } from '../components/labels'
import { Price } from '../components/Price'
import { ProductImage } from '../components/ProductImage'
import { BTN_PRIMARY, BTN_SECONDARY, Eyebrow, PageHead } from '../components/ui'
import { formatNpr } from '../lib/format'
import type { BudgetBand, Occasion, RecipientKind } from '../types'

export const Route = createFileRoute('/help')({
  head: () => ({ meta: [{ title: 'Help me choose - Tapika' }] }),
  component: HelpPage,
})

const TREATS: { label: string; tag: string }[] = [
  { label: 'Chocolate', tag: 'chocolate' },
  { label: 'Mithai', tag: 'sweets' },
  { label: 'Dry fruit', tag: 'dry-fruit' },
  { label: 'Nothing sweet', tag: '' },
]
const TOUCHES: { label: string; tag: string }[] = [
  { label: 'Photos and personal touches', tag: 'photos' },
  { label: 'Something premium', tag: 'premium' },
  { label: 'A taste of home', tag: 'nepali' },
  { label: 'Something cuddly', tag: 'teddy' },
]

function HelpPage() {
  const pricing = usePricing()
  const navigate = useNavigate()
  const [q, setQ] = useState(0)
  const [recipient, setRecipient] = useState<RecipientKind | null>(null)
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [budget, setBudget] = useState<BudgetBand | null>(null)
  const [treats, setTreats] = useState<string[]>([])
  const [touches, setTouches] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const headRef = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headRef.current?.focus()
  }, [q, done])

  const lo = formatNpr(audToNpr(BUDGET_LIMITS.lowMax, pricing.fx))
  const hi = formatNpr(audToNpr(BUDGET_LIMITS.midMax, pricing.fx))

  const results = useMemo(
    () =>
      done && recipient && occasion && budget
        ? recommend({ recipient, occasion, budget, interests: [...treats, ...touches].filter(Boolean) }, { products: pricing.products })
        : [],
    [done, recipient, occasion, budget, treats, touches, pricing.products],
  )

  const toggle = (list: string[], set: (v: string[]) => void, tag: string) => set(list.includes(tag) ? list.filter((x) => x !== tag) : [...list, tag])

  const questions = [
    { title: 'Who is it for?', ok: !!recipient },
    { title: 'What is the occasion?', ok: !!occasion },
    { title: 'What feels right to spend?', ok: !!budget },
    { title: 'What treats do they love?', ok: true },
    { title: 'Anything special?', ok: true },
  ]
  const pill = (on: boolean) =>
    `inline-flex min-h-12 cursor-pointer items-center rounded-pill border-2 px-5 font-display text-lg has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
      on ? 'border-ink bg-action text-on-action' : 'border-field bg-raised text-ink hover:bg-band'
    }`

  function addToCart(id: string) {
    const r = results.find((x) => x.template.id === id)
    if (!r) return
    const t = r.template
    setCartGift({
      title: t.name,
      city: '',
      window: 'any',
      blueprint: {
        gift_type: 'ready-made',
        template_id: t.id,
        quantity: 1,
        occasion: occasion ?? t.occasions[0],
        recipient: recipient ?? t.recipients[0],
        packaging: { ribbon: false, premiumWrap: false },
        card: t.cardId,
        message: '',
        delivery_date: '',
      },
    })
    void navigate({ to: '/cart' })
  }

  if (done) {
    return (
      <main>
        <PageHead eyebrow="Help me choose" title="Here are three that fit." lead="Picked from your answers. Open one in the Gift Builder to change anything." />
        <div className="mx-auto max-w-7xl px-4 pb-20 md:px-12">
          <ol className="grid gap-12 md:grid-cols-3">
            {results.map((r, i) => (
              <li key={r.template.id} className="flex flex-col">
                <Eyebrow>{i === 0 ? 'Best match' : `Match ${i + 1}`}</Eyebrow>
                <ProductImage id={r.template.id} src={r.template.image} name={r.template.name} eager className="mt-2" />
                <h2 className="mt-3 font-display text-2xl">{r.template.name}</h2>
                <Price className="mt-1" npr={audToNpr(r.priceAud, pricing.fx)} aud={r.priceAud} />
                <p className="mt-3 text-base text-muted">{r.why}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link to="/build" search={{ template: r.template.id }} className={BTN_PRIMARY}>
                    Open in builder
                  </Link>
                  <button type="button" className={BTN_SECONDARY} onClick={() => addToCart(r.template.id)}>
                    Add to cart
                  </button>
                  <Link to="/gift/$id" params={{ id: r.template.id }} className="min-h-11 px-2 py-2 text-sm font-semibold text-brand-text underline underline-offset-4">
                    See what is inside
                  </Link>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="mt-12 text-sm font-semibold text-brand-text underline underline-offset-4" onClick={() => { setDone(false); setQ(0) }}>
            Start again
          </button>
        </div>
      </main>
    )
  }

  const cur = questions[q]
  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-12 md:pt-16">
        <Eyebrow>Help me choose · Question {q + 1} of 5</Eyebrow>
        <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-band">
          <div className="h-full bg-action transition-[width] duration-500 ease-out" style={{ width: `${((q + 1) / 5) * 100}%` }} />
        </div>
        <h1 ref={headRef} tabIndex={-1} className="mt-6 font-display text-3xl leading-[1.1] tracking-[-0.02em] focus-visible:outline-none">
          {cur.title}
        </h1>

        <div className="mt-8">
          {q === 0 ? (
            <fieldset>
              <legend className="sr-only">Who is it for?</legend>
              <div className="flex flex-wrap gap-3">
                {RECIPIENTS.map((r) => (
                  <label key={r} className={pill(recipient === r)}>
                    <input type="radio" name="q-who" className="sr-only" checked={recipient === r} onChange={() => setRecipient(r)} />
                    {RECIPIENT_LABEL[r]}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          {q === 1 ? (
            <fieldset>
              <legend className="sr-only">Occasion</legend>
              <div className="flex flex-wrap gap-3">
                {OCCASIONS.map((o) => (
                  <label key={o} className={pill(occasion === o)}>
                    <input type="radio" name="q-occ" className="sr-only" checked={occasion === o} onChange={() => setOccasion(o)} />
                    {OCCASION_LABEL[o]}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          {q === 2 ? (
            <fieldset>
              <legend className="sr-only">Budget</legend>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ['low', `Up to ${lo}`],
                    ['mid', `${lo} to ${hi}`],
                    ['high', `Over ${hi}`],
                  ] as [BudgetBand, string][]
                ).map(([b, label]) => (
                  <label key={b} className={pill(budget === b)}>
                    <input type="radio" name="q-bud" className="sr-only" checked={budget === b} onChange={() => setBudget(b)} />
                    {label}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted">This is for the gift. Delivery is added at checkout.</p>
            </fieldset>
          ) : null}
          {q === 3 ? (
            <fieldset>
              <legend className="sr-only">Treats they love. Choose any.</legend>
              <div className="flex flex-wrap gap-3">
                {TREATS.map((t) => {
                  const on = t.tag === '' ? treats.length === 0 : treats.includes(t.tag)
                  return (
                    <label key={t.label} className={pill(on)}>
                      <input type="checkbox" className="sr-only" checked={on} onChange={() => (t.tag === '' ? setTreats([]) : toggle(treats, setTreats, t.tag))} />
                      {t.label}
                    </label>
                  )
                })}
              </div>
              <p className="mt-3 text-sm text-muted">Choose as many as you like.</p>
            </fieldset>
          ) : null}
          {q === 4 ? (
            <fieldset>
              <legend className="sr-only">Anything special. Choose any.</legend>
              <div className="flex flex-wrap gap-3">
                {TOUCHES.map((t) => (
                  <label key={t.label} className={pill(touches.includes(t.tag))}>
                    <input type="checkbox" className="sr-only" checked={touches.includes(t.tag)} onChange={() => toggle(touches, setTouches, t.tag)} />
                    {t.label}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted">Choose as many as you like, or none.</p>
            </fieldset>
          ) : null}
        </div>

        <div className="mt-10 flex items-center gap-3">
          {q > 0 ? (
            <button type="button" className={BTN_SECONDARY} onClick={() => setQ(q - 1)}>
              Back
            </button>
          ) : null}
          <button type="button" className={BTN_PRIMARY} disabled={!cur.ok} onClick={() => (q === 4 ? setDone(true) : setQ(q + 1))}>
            {q === 4 ? 'Show my gifts' : 'Next'} <IconArrow width={20} height={20} />
          </button>
        </div>
      </div>
    </main>
  )
}
