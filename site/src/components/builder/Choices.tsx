// Builder steps 1-3: Who it is for, Occasion, Format. Radio-based so arrow keys and Tab work. Used by routes/build.tsx.
import { FORMATS } from '../../data/formats'
import type { FormatId, GiftTemplate, Occasion, RecipientKind } from '../../types'
import { OCCASIONS, OCCASION_LABEL, RECIPIENTS, RECIPIENT_LABEL } from '../labels'

function Pills<T extends string>({
  name,
  legend,
  options,
  labels,
  value,
  onChange,
}: {
  name: string
  legend: string
  options: T[]
  labels: Record<T, string>
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => {
          const on = value === o
          return (
            <label
              key={o}
              className={`inline-flex min-h-12 cursor-pointer items-center rounded-pill border-2 px-5 font-display text-lg transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                on ? 'border-ink bg-action text-on-action' : 'border-field bg-raised text-ink hover:bg-band'
              }`}
            >
              <input type="radio" name={name} value={o} checked={on} onChange={() => onChange(o)} className="sr-only" />
              {labels[o]}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function StepWho({
  value,
  onChange,
  starters,
  onStarter,
}: {
  value: RecipientKind | null
  onChange: (v: RecipientKind) => void
  starters: GiftTemplate[]
  onStarter: (t: GiftTemplate) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <Pills name="who" legend="Who is this gift for?" options={RECIPIENTS} labels={RECIPIENT_LABEL} value={value} onChange={onChange} />
      <div className="border-t-2 border-dashed border-muted/55 pt-6">
        <p className="font-display text-xl">In a hurry? Start from a favourite.</p>
        <p className="mt-1 text-sm text-muted">We fill the gift for you. You can change every item afterwards.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {starters.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onStarter(t)}
              className="inline-flex min-h-11 items-center rounded-pill border border-field px-4 text-sm font-semibold text-ink hover:bg-band"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StepOccasion({ value, onChange }: { value: Occasion | null; onChange: (v: Occasion) => void }) {
  return <Pills name="occasion" legend="What is the occasion?" options={OCCASIONS} labels={OCCASION_LABEL} value={value} onChange={onChange} />
}

export function StepFormat({ value, onChange, notice }: { value: FormatId | null; onChange: (v: FormatId) => void; notice: string }) {
  return (
    <fieldset>
      <legend className="sr-only">Choose a format</legend>
      <ul className="flex flex-col gap-3">
        {FORMATS.map((f) => {
          const on = value === f.id
          return (
            <li key={f.id}>
              <label
                className={`flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-frame border-2 px-5 py-4 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                  on ? 'border-ink bg-band' : 'border-line bg-raised hover:bg-band'
                }`}
              >
                <input type="radio" name="format" value={f.id} checked={on} onChange={() => onChange(f.id)} className="sr-only" />
                <span>
                  <span className="block font-display text-xl">{f.name}</span>
                  <span className="block text-sm text-muted">{f.description}</span>
                </span>
                <span className="shrink-0 text-right text-sm text-muted">
                  Holds <strong className="font-semibold text-ink">{f.capacity}</strong> {f.capacity === 1 ? 'space' : 'spaces'}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      {notice ? (
        <p role="status" className="mt-4 rounded-field bg-band px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      ) : null}
    </fieldset>
  )
}
