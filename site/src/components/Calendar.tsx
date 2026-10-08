// Delivery-date calendar (react-day-picker v10) themed with brand tokens; days before the earliest date are disabled. Used by DeliveryPicker.
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

function toDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function toYmd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function Calendar({
  value,
  earliest,
  onChange,
}: {
  /** YYYY-MM-DD (AU local date) or ''. */
  value: string
  /** Earliest allowed YYYY-MM-DD; everything before it is disabled. */
  earliest: string
  onChange: (ymd: string) => void
}) {
  const min = toDate(earliest)
  return (
    <DayPicker
      mode="single"
      selected={value ? toDate(value) : undefined}
      onSelect={(d) => d && onChange(toYmd(d))}
      defaultMonth={value ? toDate(value) : min}
      startMonth={min}
      disabled={{ before: min }}
      showOutsideDays
      className="tp-calendar text-ink"
      style={
        {
          '--rdp-accent-color': 'var(--tp-action-bg)',
          '--rdp-accent-background-color': 'var(--tp-bg-band)',
          '--rdp-today-color': 'var(--tp-text-brand)',
          '--rdp-day_button-border-radius': '999px',
          '--rdp-day-height': '2.75rem',
          '--rdp-day-width': '2.75rem',
          '--rdp-day_button-height': '2.6rem',
          '--rdp-day_button-width': '2.6rem',
          '--rdp-outside-opacity': '0.35',
          '--rdp-disabled-opacity': '0.3',
        } as React.CSSProperties
      }
    />
  )
}
