// Builder side panel pieces: quote hook, capacity meter ("3 of 6 spaces used"), budget meter, live preview. Used by routes/build.tsx and the step components.
import { useMemo } from 'react'

import { Price } from '../Price'
import { getFormat } from '../../data/formats'
import { productMap } from '../../data/products'
import { slotsUsed } from '../../builder/capacity'
import { formatNpr } from '../../lib/format'
import { quote as makeQuote, type Pricing, type Quote } from '../../cart/pricing'
import type { BuilderState } from '../../cart/types'
import { GiftPreview, type PreviewUnit } from './GiftPreview'
import { toBlueprint } from './state'

export interface BuilderView {
  quote: Quote | null
  units: PreviewUnit[]
  used: number
  capacity: number
}

export function useBuilderView(state: BuilderState, pricing: Pricing): BuilderView {
  return useMemo(() => {
    const format = state.formatId ? getFormat(state.formatId) : null
    const map = productMap(pricing.products)
    const units: PreviewUnit[] = []
    for (const it of state.items) {
      const p = map.get(it.product)
      if (!p) continue
      for (let n = 0; n < it.quantity; n++) units.push({ id: p.id, name: p.name, category: p.category, slots: p.slots })
    }
    const bp = toBlueprint(state)
    let quote: Quote | null = null
    if (bp) {
      try {
        quote = makeQuote(bp, state.city, pricing)
      } catch {
        quote = null
      }
    }
    return { quote, units, used: slotsUsed(state.items, pricing.products), capacity: format?.capacity ?? 0 }
  }, [state, pricing])
}

export function CapacityMeter({ used, capacity }: { used: number; capacity: number }) {
  if (!capacity) return null
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold text-ink">
          {used} of {capacity} {capacity === 1 ? 'space' : 'spaces'} used
        </span>
        {used >= capacity ? <span className="text-muted">Full</span> : <span className="text-muted">{capacity - used} left</span>}
      </div>
      <div className="mt-2 flex gap-1" role="img" aria-label={`${used} of ${capacity} spaces used`}>
        {Array.from({ length: capacity }, (_, i) => (
          <span key={i} className={`h-2.5 flex-1 rounded-pill ${i < used ? 'bg-action' : 'border border-field bg-transparent'}`} />
        ))}
      </div>
    </div>
  )
}

export function BudgetMeter({
  budgetNpr,
  giftNpr,
  onBudget,
}: {
  budgetNpr: number | null
  giftNpr: number
  onBudget?: (n: number | null) => void
}) {
  const over = budgetNpr !== null && giftNpr > budgetNpr
  const pct = budgetNpr ? Math.min(100, Math.round((giftNpr / budgetNpr) * 100)) : 0
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <label htmlFor="budget" className="font-semibold text-ink">
          Your budget (optional)
        </label>
        {onBudget ? (
          <span className="flex items-center gap-1.5">
            <span className="text-muted">Rs</span>
            <input
              id="budget"
              inputMode="numeric"
              className="w-24 rounded-field border border-field bg-raised px-2.5 py-1.5 text-right text-base tabular-nums text-ink"
              value={budgetNpr ?? ''}
              placeholder="e.g. 9000"
              onChange={(e) => {
                const n = Number(e.target.value.replace(/\D/g, ''))
                onBudget(n > 0 ? n : null)
              }}
            />
          </span>
        ) : null}
      </div>
      {budgetNpr ? (
        <>
          <div className="mt-2 h-2.5 overflow-hidden rounded-pill border border-field" role="img" aria-label={`${pct}% of budget used`}>
            <div className="h-full bg-action transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-sm tabular-nums">
            <div>
              <dt className="text-muted">Budget</dt>
              <dd className="font-semibold">{formatNpr(budgetNpr)}</dd>
            </div>
            <div>
              <dt className="text-muted">Gift</dt>
              <dd className="font-semibold">{formatNpr(giftNpr)}</dd>
            </div>
            <div>
              <dt className="text-muted">{over ? 'Over by' : 'Remaining'}</dt>
              <dd className={`font-semibold ${over ? 'text-danger-text' : ''}`}>{formatNpr(Math.abs(budgetNpr - giftNpr))}</dd>
            </div>
          </dl>
        </>
      ) : null}
    </div>
  )
}

/** Preview + meters + running total: the desktop side panel and the inline mobile block. */
export function SummaryPanel({
  state,
  view,
  pricing,
  onBudget,
  showBudget = true,
}: {
  state: BuilderState
  view: BuilderView
  pricing: Pricing
  onBudget: (n: number | null) => void
  showBudget?: boolean
}) {
  const { quote } = view
  const total = quote?.totals?.totalNpr ?? quote?.giftNpr ?? 0
  const totalAud = quote?.totals?.totalAud ?? quote?.giftAud ?? 0
  return (
    <div className="flex flex-col gap-5">
      {state.formatId ? (
        <GiftPreview
          formatId={state.formatId}
          units={view.units}
          ribbon={state.ribbon}
          premiumWrap={state.premiumWrap}
          hasCard={!!state.card}
          message={state.message}
          heartFrame={!state.items.some((i) => i.product.includes('grid'))}
          collage={state.collage}
        />
      ) : (
        <div className="flex aspect-[21/17] items-center justify-center rounded-frame bg-band px-6 text-center font-display text-xl text-muted">
          Your gift will appear here as you build it.
        </div>
      )}
      <CapacityMeter used={view.used} capacity={view.capacity} />
      {showBudget ? <BudgetMeter budgetNpr={state.budgetNpr} giftNpr={quote?.giftNpr ?? 0} onBudget={onBudget} /> : null}
      <div className="flex items-baseline justify-between border-t-2 border-dashed border-muted/55 pt-4">
        <span className="text-sm font-semibold">{quote?.totals ? 'Total with delivery' : 'Your gift so far'}</span>
        <Price npr={total} aud={totalAud} size="lg" />
      </div>
      <p className="sr-only" aria-live="polite">
        Gift total {formatNpr(total)}
      </p>
      <p className="-mt-3 text-xs text-muted">Rate: 1 A$ = Rs {pricing.fx} · Sample prices</p>
    </div>
  )
}
