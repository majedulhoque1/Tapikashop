// /build: the Gift Builder wizard (Who, Occasion, Format, Add items, Customise, Preview, Delivery) with live illustrated preview, capacity and budget meters.
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { validateItems } from '../builder/capacity'
import { setCartGift, useCart } from '../cart/store'
import { usePricing } from '../cart/pricing'
import type { BuilderState } from '../cart/types'
import { earliestDeliveryDate } from '../config/business'
import { getFormat } from '../data/formats'
import { TEMPLATES, getTemplate } from '../data/templates'
import { IconArrow, IconArrowLeft } from '../components/Icons'
import { StepFormat, StepOccasion, StepWho } from '../components/builder/Choices'
import { StepCustomise } from '../components/builder/StepCustomise'
import { StepDelivery, StepPreview, type StepId } from '../components/builder/StepFinish'
import { StepItems } from '../components/builder/StepItems'
import { BLANK_STATE, changeFormat, stateFromTemplate, toBlueprint } from '../components/builder/state'
import { SummaryPanel, useBuilderView } from '../components/builder/Summary'
import { BTN_PRIMARY, BTN_SECONDARY } from '../components/ui'
import { formatNpr } from '../lib/format'

export const Route = createFileRoute('/build')({
  validateSearch: (s: Record<string, unknown>): { template?: string; edit?: boolean } => ({
    template: typeof s.template === 'string' ? s.template : undefined,
    edit: s.edit === true || s.edit === 'true' ? true : undefined,
  }),
  head: () => ({ meta: [{ title: 'Build a gift - Tapika' }] }),
  component: BuildPage,
})

const STEPS: { id: StepId; short: string; heading: string; lead: string; skippable?: boolean }[] = [
  { id: 'who', short: 'Who', heading: 'Who is it for?', lead: 'This helps us suggest the right things.', skippable: true },
  { id: 'occasion', short: 'Occasion', heading: 'What are you celebrating?', lead: 'Pick the closest one.', skippable: true },
  { id: 'format', short: 'Format', heading: 'How should it come?', lead: 'Each one holds a different number of things.' },
  { id: 'items', short: 'Items', heading: 'Fill it with things they will love', lead: 'Add what you like. We show how much room is left.' },
  { id: 'customise', short: 'Personalise', heading: 'Make it personal', lead: 'The little touches are what they remember.', skippable: true },
  { id: 'preview', short: 'Preview', heading: 'Here is your gift', lead: 'Check everything. You can still change it.' },
  { id: 'delivery', short: 'Delivery', heading: 'When and where in Australia?', lead: 'Pick a city and the day it should arrive.' },
]

function BuildPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const pricing = usePricing()
  const cart = useCart()

  const [state, setState] = useState<BuilderState>(() => {
    if (search.template) {
      try {
        return stateFromTemplate(getTemplate(search.template))
      } catch {
        return BLANK_STATE
      }
    }
    return BLANK_STATE
  })
  const [step, setStep] = useState<StepId>(() => (search.template ? 'items' : 'who'))
  const [reached, setReached] = useState(() => (search.template ? 3 : 0))
  const [notice, setNotice] = useState('')
  const [errors, setErrors] = useState<{ city?: string; date?: string }>({})
  const [stepError, setStepError] = useState('')

  // "Edit gift" from the cart: restore the saved builder state once the cart is readable (client only).
  const restored = useRef(false)
  useEffect(() => {
    if (search.edit && cart?.builder && !restored.current) {
      restored.current = true
      setState(cart.builder)
      setStep('preview')
      setReached(6)
    }
  }, [search.edit, cart])

  const view = useBuilderView(state, pricing)
  const idx = STEPS.findIndex((s) => s.id === step)
  const cur = STEPS[idx]
  const starters = useMemo(() => TEMPLATES.filter((t) => t.starter), [])

  const headingRef = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [step])

  function go(id: StepId) {
    setStepError('')
    setStep(id)
    const i = STEPS.findIndex((s) => s.id === id)
    setReached((r) => Math.max(r, i))
  }

  function problem(from: StepId): string {
    if (from === 'format' && !state.formatId) return 'Choose a format to continue.'
    if (from === 'items') {
      if (!state.formatId) return 'Choose a format first.'
      const r = validateItems(state.formatId, state.items, { products: pricing.products })
      if (!r.ok) return r.errors[0].message
    }
    return ''
  }

  function next() {
    const p = problem(step)
    if (p) return setStepError(p)
    if (step === 'delivery') return finish()
    go(STEPS[idx + 1].id)
  }

  function finish() {
    const e: { city?: string; date?: string } = {}
    if (!state.city) e.city = 'Please choose the delivery city so we can plan the delivery.'
    if (!state.date) e.date = 'Pick the day it should arrive.'
    else if (state.date < earliestDeliveryDate(pricing.leadDays)) e.date = 'That date is too soon for us to wrap and deliver with care.'
    setErrors(e)
    if (e.city || e.date) return
    const bp = toBlueprint(state)
    if (!bp || !state.formatId) return
    setCartGift({ blueprint: bp, title: getFormat(state.formatId).name, city: state.city, window: state.window, builder: state })
    void navigate({ to: '/cart' })
  }

  const nextLabel =
    step === 'delivery' ? 'Add to cart' : step === 'items' ? 'Make it personal' : step === 'customise' ? 'See my gift' : step === 'preview' ? 'Choose delivery' : 'Next'
  const total = view.quote?.totals?.totalNpr ?? view.quote?.giftNpr ?? 0
  const [sheet, setSheet] = useState(false)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-12 md:pt-12 lg:pb-16">
      {/* progress */}
      <nav aria-label="Gift Builder steps" className="mb-8">
        <p className="text-sm font-semibold text-brand-text lg:hidden">
          Step {idx + 1} of {STEPS.length} · {cur.short}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-band lg:hidden">
          <div className="h-full bg-action transition-[width] duration-500 ease-out" style={{ width: `${((idx + 1) / STEPS.length) * 100}%` }} />
        </div>
        <ol className="hidden items-center gap-2 lg:flex">
          {STEPS.map((s, i) => {
            const clickable = i <= reached
            const here = i === idx
            return (
              <li key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!clickable}
                  aria-current={here ? 'step' : undefined}
                  onClick={() => go(s.id)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-pill px-3 text-sm font-semibold ${
                    here ? 'bg-action text-on-action' : clickable ? 'text-ink hover:bg-band' : 'text-muted/70'
                  }`}
                >
                  <span className="tabular-nums">{i + 1}</span>
                  {s.short}
                </button>
                {i < STEPS.length - 1 ? <span aria-hidden="true" className="h-px w-5 border-t-2 border-dashed border-muted/50" /> : null}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="font-display text-3xl leading-[1.1] tracking-[-0.02em] focus-visible:outline-none">
            {cur.heading}
          </h1>
          <p className="mt-2 text-lg text-muted">{cur.lead}</p>

          <div className="mt-8">
            {step === 'who' ? (
              <StepWho
                value={state.recipient}
                onChange={(recipient) => setState({ ...state, recipient })}
                starters={starters}
                onStarter={(t) => {
                  setState(stateFromTemplate(t))
                  setNotice('')
                  setReached(3)
                  go('items')
                }}
              />
            ) : null}
            {step === 'occasion' ? <StepOccasion value={state.occasion} onChange={(occasion) => setState({ ...state, occasion })} /> : null}
            {step === 'format' ? (
              <StepFormat
                value={state.formatId}
                notice={notice}
                onChange={(f) => {
                  if (f === state.formatId) return
                  const r = changeFormat(state, f, pricing.products)
                  setState(r.state)
                  setNotice(r.removed.length ? `We took out ${r.removed.join(', ')} because ${r.removed.length === 1 ? 'it does' : 'they do'} not fit in a ${getFormat(f).name}.` : '')
                }}
              />
            ) : null}
            {step === 'items' ? <StepItems state={state} pricing={pricing} onChange={setState} /> : null}
            {step === 'customise' ? <StepCustomise state={state} pricing={pricing} onChange={setState} /> : null}
            {step === 'preview' ? <StepPreview state={state} view={view} pricing={pricing} goto={go} /> : null}
            {step === 'delivery' ? <StepDelivery state={state} pricing={pricing} onChange={setState} errors={errors} /> : null}
          </div>

          {stepError ? (
            <p role="alert" className="mt-5 text-base font-semibold text-danger-text">
              {stepError}
            </p>
          ) : null}

          {/* Desktop navigation (phones use the sticky bar below) */}
          <div className="mt-10 hidden items-center gap-3 lg:flex">
            {idx > 0 ? (
              <button type="button" className={BTN_SECONDARY} onClick={() => go(STEPS[idx - 1].id)}>
                <IconArrowLeft width={20} height={20} /> Back
              </button>
            ) : null}
            <button type="button" className={BTN_PRIMARY} onClick={next}>
              {nextLabel} <IconArrow width={20} height={20} />
            </button>
            {cur.skippable ? (
              <button type="button" className="min-h-11 px-3 text-sm font-semibold text-brand-text underline underline-offset-4" onClick={() => go(STEPS[idx + 1].id)}>
                Skip for now
              </button>
            ) : null}
          </div>
        </div>

        <aside aria-label="Your gift so far" className="hidden lg:block">
          <div className="sticky top-24">
            <SummaryPanel state={state} view={view} pricing={pricing} onBudget={(n) => setState({ ...state, budgetNpr: n })} />
          </div>
        </aside>
      </div>

      {sheet ? (
        <div id="gift-sheet" role="region" aria-label="Your gift so far" className="fixed inset-x-0 bottom-[4.75rem] z-30 max-h-[70svh] overflow-y-auto rounded-t-frame border-t border-line bg-surface px-4 pb-6 pt-4 shadow-lift lg:hidden">
          <div className="mx-auto max-w-sm">
            <SummaryPanel state={state} view={view} pricing={pricing} onBudget={(n) => setState({ ...state, budgetNpr: n })} />
          </div>
        </div>
      ) : null}

      {/* Phone bar: running total + the one primary action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {idx > 0 ? (
            <button type="button" aria-label="Back" className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-pill border-2 border-ink text-ink" onClick={() => go(STEPS[idx - 1].id)}>
              <IconArrowLeft width={20} height={20} />
            </button>
          ) : null}
          <button
            type="button"
            aria-expanded={sheet}
            aria-controls="gift-sheet"
            onClick={() => setSheet((v) => !v)}
            className="min-w-0 flex-1 rounded-field py-1 text-left leading-tight"
          >
            <span className="block text-xs text-muted">
              Your gift{view.capacity ? ` · ${view.used} of ${view.capacity} spaces` : ''} · {sheet ? 'Hide' : 'See'}
            </span>
            <span className="block font-display text-xl tabular-nums">{formatNpr(total)}</span>
          </button>
          {cur.skippable ? (
            <button type="button" className="min-h-11 px-2 text-sm font-semibold text-brand-text underline underline-offset-4" onClick={() => go(STEPS[idx + 1].id)}>
              Skip
            </button>
          ) : null}
          <button type="button" className={`${BTN_PRIMARY} px-5`} onClick={next}>
            {step === 'delivery' ? 'Add to cart' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  )
}
