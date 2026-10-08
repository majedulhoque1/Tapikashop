// /os/deliveries: upcoming deliveries grouped Overdue / Today / Tomorrow / This week / Later on the Melbourne calendar, with a city filter.
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { BUSINESS } from '../../config/business'
import { EmptyState, OrderList, PageHeader, Section } from '../../os/components/ui'
import { businessToday, formatDay, groupDeliveries } from '../../os/logic'
import { useOS } from '../../os/store'

export const Route = createFileRoute('/os/deliveries')({ component: Deliveries })

function Deliveries() {
  const data = useOS()
  const today = businessToday()
  const [city, setCity] = useState('')
  const [showDone, setShowDone] = useState(false)
  const groups = groupDeliveries(data.orders, today, { city: city || undefined, includeDelivered: showDone })
  const cities = [...BUSINESS.cities]

  const chip = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-pill border px-3 text-sm whitespace-nowrap ${active ? 'border-action bg-action text-on-action' : 'border-line bg-raised text-ink hover:bg-band'}`

  return (
    <>
      <PageHeader title="Deliveries" sub={`${formatDay(today)} · days follow Melbourne time`} />
      <div className="flex flex-col gap-5 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" aria-label="Filter by city">
            <button type="button" className={chip(city === '')} onClick={() => setCity('')} aria-pressed={city === ''}>
              All cities
            </button>
            {cities.map((c) => (
              <button key={c} type="button" className={chip(city === c)} onClick={() => setCity(c)} aria-pressed={city === c}>
                {c}
              </button>
            ))}
          </div>
          <label className="flex min-h-9 items-center gap-2 text-sm">
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="h-5 w-5 accent-[var(--tp-c-pine)]" />
            Show delivered
          </label>
        </div>

        {groups.length === 0 ? (
          <Section title="Deliveries">
            <EmptyState text={city ? `No deliveries to ${city}.` : 'No deliveries scheduled.'} />
          </Section>
        ) : (
          groups.map((g) => (
            <Section
              key={g.key}
              title={g.label}
              aside={
                <span className="text-xs text-muted tabular-nums">
                  {g.orders.length} order{g.orders.length === 1 ? '' : 's'}
                  {g.key === 'today' || g.key === 'tomorrow' ? ` · ${formatDay(g.orders[0].deliveryDate)}` : ''}
                </span>
              }
            >
              <OrderList data={data} orders={g.orders} today={today} />
            </Section>
          ))
        )}
      </div>
    </>
  )
}
