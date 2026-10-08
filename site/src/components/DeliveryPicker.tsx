// City + AU delivery date (lead-time-disabled days) + time window, as one controlled group. Used by gift detail, the builder's Delivery step and checkout.
import { useId, useState } from 'react'

import { BUSINESS, earliestDeliveryDate } from '../config/business'
import { formatAud } from '../lib/format'
import { WINDOW_LABEL, type DeliveryWindow } from '../cart/types'
import { Calendar } from './Calendar'
import { IconCalendar } from './Icons'
import { Field, Select } from './ui'

export function formatLongDate(ymd: string): string {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-').map(Number)
  return new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  )
}

export function DeliveryPicker({
  city,
  date,
  window: win,
  leadDays,
  fees,
  onChange,
  errors = {},
  showWindow = true,
}: {
  city: string
  date: string
  window: DeliveryWindow
  leadDays: number
  fees: Record<string, number>
  onChange: (patch: { city?: string; date?: string; window?: DeliveryWindow }) => void
  errors?: { city?: string; date?: string }
  showWindow?: boolean
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const earliest = earliestDeliveryDate(leadDays)
  const tooSoon = date !== '' && date < earliest

  return (
    <div className="flex flex-col gap-5">
      <Field label="Delivery city" htmlFor={`${id}-city`} error={errors.city}>
        <Select id={`${id}-city`} value={city} onChange={(e) => onChange({ city: e.target.value })}>
          <option value="">Choose a city</option>
          {BUSINESS.cities.map((c) => (
            <option key={c} value={c}>
              {c} (delivery {fees[c] !== undefined ? formatAud(fees[c]) : 'to confirm'})
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex flex-col gap-1.5">
        <span id={`${id}-date-l`} className="text-sm font-semibold text-ink">
          Delivery date in Australia
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-labelledby={`${id}-date-l ${id}-date-v`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-12 items-center justify-between gap-3 rounded-field border border-field bg-raised px-3.5 py-3 text-left text-base text-ink"
        >
          <span id={`${id}-date-v`}>{date ? formatLongDate(date) : 'Pick a date'}</span>
          <IconCalendar />
        </button>
        <p className="text-sm text-muted">
          We need {leadDays} days to buy, wrap and deliver with care. Earliest date: {formatLongDate(earliest)}.
        </p>
        {open ? (
          <div className="mt-1 w-fit max-w-full overflow-x-auto rounded-frame border border-line bg-raised p-3">
            <Calendar
              value={date}
              earliest={earliest}
              onChange={(d) => {
                onChange({ date: d })
                setOpen(false)
              }}
            />
          </div>
        ) : null}
        {tooSoon ? (
          <p role="alert" className="text-sm font-semibold text-danger-text">
            That date is too soon for us to wrap and deliver with care. Please pick {formatLongDate(earliest)} or later.
          </p>
        ) : null}
        {errors.date ? (
          <p role="alert" className="text-sm font-semibold text-danger-text">
            {errors.date}
          </p>
        ) : null}
      </div>

      {showWindow ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">Time of day</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(WINDOW_LABEL) as DeliveryWindow[]).map((w) => (
              <label
                key={w}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-pill border px-4 text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                  win === w ? 'border-ink bg-action text-on-action' : 'border-field bg-raised text-ink'
                }`}
              >
                <input type="radio" name={`${id}-win`} value={w} checked={win === w} onChange={() => onChange({ window: w })} className="sr-only" />
                {WINDOW_LABEL[w]}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  )
}
