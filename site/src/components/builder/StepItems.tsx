// Builder step 4: pick items. Capacity-aware: "+" is disabled when the format is full or the item is not allowed. Used by routes/build.tsx.
import { canAdd } from '../../builder/capacity'
import { getFormat } from '../../data/formats'
import { nprExact, type Pricing } from '../../cart/pricing'
import type { BuilderState } from '../../cart/types'
import type { Category, Product } from '../../types'
import { IconMinus, IconPlus } from '../Icons'
import { CATEGORY_LABEL, OCCASION_LABEL } from '../labels'
import { Price } from '../Price'
import { ProductImage } from '../ProductImage'
import { qtyOf, setQty, slotsUsed } from './state'

export function StepItems({
  state,
  pricing,
  onChange,
}: {
  state: BuilderState
  pricing: Pricing
  onChange: (s: BuilderState) => void
}) {
  if (!state.formatId) return <p className="text-muted">Choose a format first.</p>
  const format = getFormat(state.formatId)
  const used = slotsUsed(state.items, pricing.products)
  const left = format.capacity - used

  const groups: { cat: Category; items: Product[] }[] = format.allowedCategories
    .map((cat) => ({
      cat,
      items: pricing.products
        .filter((p) => p.category === cat && p.flags.builderEligible && p.inStock)
        .sort((a, b) => Number(!!state.occasion && b.occasions.includes(state.occasion)) - Number(!!state.occasion && a.occasions.includes(state.occasion))),
    }))
    .filter((g) => g.items.length > 0)

  const gone = state.items
    .map((i) => pricing.products.find((p) => p.id === i.product))
    .filter((p): p is Product => !!p && !p.inStock)

  let imgIndex = 0

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted">
        A {format.name} holds {format.capacity} {format.capacity === 1 ? 'space' : 'spaces'}. Bigger things, like a large teddy, take two.
      </p>

      {gone.length ? (
        <div role="alert" className="rounded-field bg-danger-soft px-4 py-3 text-sm text-on-danger-soft">
          {gone.map((p) => p.name).join(', ')} {gone.length === 1 ? 'is' : 'are'} out of stock right now.{' '}
          <button type="button" className="font-semibold underline" onClick={() => onChange(gone.reduce((s, p) => setQty(s, p.id, 0), state))}>
            Remove {gone.length === 1 ? 'it' : 'them'}
          </button>
        </div>
      ) : null}

      {groups.map((g) => (
        <section key={g.cat} aria-labelledby={`cat-${g.cat}`}>
          <h3 id={`cat-${g.cat}`} className="font-display text-xl text-cocoa">
            {CATEGORY_LABEL[g.cat]}
          </h3>
          <ul className="mt-2 divide-y divide-dashed divide-muted/40">
            {g.items.map((p) => {
              const qty = qtyOf(state, p.id)
              const fits = canAdd(state.formatId!, state.items, p.id, { products: pricing.products })
              const idx = imgIndex++
              const popular = !!state.occasion && p.occasions.includes(state.occasion)
              return (
                <li key={p.id} className="flex items-center gap-4 py-3">
                  <ProductImage id={p.id} src={p.image} name={p.name} ratio="1 / 1" compact eager={idx < 4} className="w-16 shrink-0 sm:w-20" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-ink">{p.name}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {p.slots > 1 ? `${p.slots} spaces` : '1 space'}
                      {popular && state.occasion ? <span className="text-brand-text"> · Popular for {OCCASION_LABEL[state.occasion].toLowerCase()}</span> : null}
                    </p>
                    <Price npr={nprExact(p.priceAud, pricing.fx)} aud={p.priceAud} size="sm" className="mt-1" />
                    {!fits && qty === 0 ? (
                      <p className="mt-1 text-xs text-muted">{left <= 0 ? `${format.name} is full` : `Needs ${p.slots} spaces, ${left} left`}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`Quantity of ${p.name}`}>
                    <button
                      type="button"
                      aria-label={`Remove one ${p.name}`}
                      disabled={qty === 0}
                      onClick={() => onChange(setQty(state, p.id, qty - 1))}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-pill border border-field text-ink hover:bg-band disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <IconMinus width={20} height={20} />
                    </button>
                    <span className="w-6 text-center text-base font-semibold tabular-nums" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add one ${p.name}`}
                      disabled={!fits}
                      onClick={() => onChange(setQty(state, p.id, qty + 1))}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-action text-on-action hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-action"
                    >
                      <IconPlus width={20} height={20} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
