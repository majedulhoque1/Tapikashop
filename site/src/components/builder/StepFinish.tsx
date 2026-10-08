// Builder steps 6-7: Preview (itemised list with edit links) and Delivery (city, date, window). Used by routes/build.tsx.
import type { Pricing } from '../../cart/pricing'
import type { BuilderState } from '../../cart/types'
import { WINDOW_LABEL } from '../../cart/types'
import { CardPaper } from '../CardPaper'
import { DeliveryPicker } from '../DeliveryPicker'
import { Itemised } from '../Itemised'
import { OCCASION_LABEL, RECIPIENT_LABEL } from '../labels'
import { GiftPreview } from './GiftPreview'
import type { BuilderView } from './Summary'

export type StepId = 'who' | 'occasion' | 'format' | 'items' | 'customise' | 'preview' | 'delivery'

export function StepPreview({
  state,
  view,
  pricing,
  goto,
}: {
  state: BuilderState
  view: BuilderView
  pricing: Pricing
  goto: (s: StepId) => void
}) {
  const edit = 'font-semibold text-brand-text underline underline-offset-4'
  return (
    <div className="flex flex-col gap-8">
      {/* On desktop the side panel already shows the big preview; on phones show it here. */}
      <div className="lg:hidden">
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
        ) : null}
      </div>

      <dl className="grid gap-x-8 gap-y-3 text-base sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">For</dt>
          <dd>
            {state.recipient ? RECIPIENT_LABEL[state.recipient] : 'Not chosen'} <button type="button" className={edit} onClick={() => goto('who')}>Change</button>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Occasion</dt>
          <dd>
            {state.occasion ? OCCASION_LABEL[state.occasion] : 'Not chosen'} <button type="button" className={edit} onClick={() => goto('occasion')}>Change</button>
          </dd>
        </div>
      </dl>

      <section>
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl">What is inside</h3>
          <button type="button" className={edit} onClick={() => goto('items')}>
            Edit items
          </button>
        </div>
        <div className="mt-3">
          {view.quote ? <Itemised lines={view.quote.lines} fx={pricing.fx} totals={view.quote.totals} /> : null}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl">Your message</h3>
          <button type="button" className={edit} onClick={() => goto('customise')}>
            Edit message
          </button>
        </div>
        <CardPaper className="mt-3" message={state.message} empty="No message yet." />
      </section>
    </div>
  )
}

export function StepDelivery({
  state,
  pricing,
  onChange,
  errors,
}: {
  state: BuilderState
  pricing: Pricing
  onChange: (s: BuilderState) => void
  errors: { city?: string; date?: string }
}) {
  return (
    <div className="flex flex-col gap-6">
      <DeliveryPicker
        city={state.city}
        date={state.date}
        window={state.window}
        leadDays={pricing.leadDays}
        fees={pricing.fees}
        errors={errors}
        onChange={(patch) => onChange({ ...state, ...patch })}
      />
      <p className="text-sm text-muted">
        {state.window !== 'any' ? `We aim for: ${WINDOW_LABEL[state.window]}. ` : ''}You add your recipient's address at checkout.
      </p>
    </div>
  )
}
