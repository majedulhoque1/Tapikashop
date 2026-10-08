// /shop: ready-made gifts with filters for occasion, recipient and price band. Out-of-stock gifts (set in the OS) are hidden.
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { budgetBand, templatePriceAud, BUDGET_LIMITS } from '../builder/recommend'
import { availableTemplates, usePricing } from '../cart/pricing'
import { audToNpr } from '../config/pricing'
import { GiftTile } from '../components/GiftTile'
import { BAND_LABEL, OCCASIONS, OCCASION_LABEL, RECIPIENTS, RECIPIENT_LABEL } from '../components/labels'
import { PageHead, BTN_PRIMARY } from '../components/ui'
import { formatNpr } from '../lib/format'
import type { BudgetBand, Occasion, RecipientKind } from '../types'

export const Route = createFileRoute('/shop')({
  validateSearch: (s: Record<string, unknown>): { occasion?: string } => ({ occasion: typeof s.occasion === 'string' ? s.occasion : undefined }),
  head: () => ({ meta: [{ title: 'Shop gifts - Tapika' }] }),
  component: ShopPage,
})

function Chips<T extends string>({
  legend,
  all,
  options,
  labels,
  value,
  onChange,
}: {
  legend: string
  all: string
  options: T[]
  labels: Record<T, string>
  value: T | null
  onChange: (v: T | null) => void
}) {
  const chip = (on: boolean) =>
    `inline-flex min-h-11 items-center rounded-pill border px-4 text-sm font-semibold transition-colors duration-150 ${
      on ? 'border-ink bg-action text-on-action' : 'border-field bg-raised text-ink hover:bg-band'
    }`
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={value === null} className={chip(value === null)} onClick={() => onChange(null)}>
          {all}
        </button>
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} className={chip(value === o)} onClick={() => onChange(value === o ? null : o)}>
            {labels[o]}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function ShopPage() {
  const search = Route.useSearch()
  const pricing = usePricing()
  const initial = OCCASIONS.includes(search.occasion as Occasion) ? (search.occasion as Occasion) : null
  const [occasion, setOccasion] = useState<Occasion | null>(initial)
  const [recipient, setRecipient] = useState<RecipientKind | null>(null)
  const [band, setBand] = useState<BudgetBand | null>(null)

  const bandLabels = useMemo<Record<BudgetBand, string>>(() => {
    const lo = formatNpr(audToNpr(BUDGET_LIMITS.lowMax, pricing.fx))
    const hi = formatNpr(audToNpr(BUDGET_LIMITS.midMax, pricing.fx))
    return { low: `${BAND_LABEL.low}, up to ${lo}`, mid: `${BAND_LABEL.mid}, ${lo} to ${hi}`, high: `${BAND_LABEL.high}, over ${hi}` }
  }, [pricing.fx])

  const all = useMemo(() => availableTemplates(pricing.products), [pricing.products])
  const shown = useMemo(
    () =>
      all.filter(
        (t) =>
          (!occasion || t.occasions.includes(occasion)) &&
          (!recipient || t.recipients.includes(recipient)) &&
          (!band || budgetBand(templatePriceAud(t, pricing.products)) === band),
      ),
    [all, occasion, recipient, band, pricing.products],
  )

  return (
    <main>
      <PageHead eyebrow="Shop gifts" title="Ready to send, or make it your own." lead="Every gift can be changed in the Gift Builder. Prices are in rupees, with Australian dollars beside." />
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-12">
        <div className="flex flex-col gap-5 border-y-2 border-dashed border-muted/55 py-6 lg:grid lg:grid-cols-[1.1fr_1.1fr_1fr] lg:gap-8">
          <Chips legend="Occasion" all="All occasions" options={OCCASIONS} labels={OCCASION_LABEL} value={occasion} onChange={setOccasion} />
          <Chips legend="Who is it for?" all="Anyone" options={RECIPIENTS} labels={RECIPIENT_LABEL} value={recipient} onChange={setRecipient} />
          <Chips legend="Price" all="Any price" options={['low', 'mid', 'high'] as BudgetBand[]} labels={bandLabels} value={band} onChange={setBand} />
        </div>

        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'gift' : 'gifts'}
        </p>

        {shown.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((t, i) => (
              <li key={t.id}>
                <GiftTile t={t} pricing={pricing} eager={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 max-w-xl">
            <p className="font-display text-2xl">We could not find that gift.</p>
            <p className="mt-2 text-lg text-muted">Try fewer filters, or tell us who it is for and we will suggest something.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={BTN_PRIMARY} onClick={() => { setOccasion(null); setRecipient(null); setBand(null) }}>
                Clear filters
              </button>
              <Link to="/help" className="inline-flex min-h-12 items-center font-semibold text-brand-text underline underline-offset-4">
                Help me choose
              </Link>
            </div>
          </div>
        )}

        <div className="mt-16 rounded-frame bg-band p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div>
            <h2 className="font-display text-2xl">Do not see the right one?</h2>
            <p className="mt-1 text-muted">Build it from scratch. Choose a box, hamper or platter and fill it yourself.</p>
          </div>
          <Link to="/build" className={`${BTN_PRIMARY} mt-4 md:mt-0`}>
            Build a gift
          </Link>
        </div>
      </div>
    </main>
  )
}
