// /os/procurement: the shopping list. Today / This week tabs, lines aggregated across orders, each source line markable as bought (markPurchased) so totals update live.
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { formatAud } from '../../lib/format'
import { Icon, PageHeader, Section, Stat, btnSmall, btnSmallPrimary, cardCls, EmptyState } from '../../os/components/ui'
import { businessToday, inlineDay } from '../../os/logic'
import { buildProcurementList, type ProcurementLine, type ProcurementRange } from '../../os/procurement'
import { findOrder, findRecipient, markPurchased, useOS } from '../../os/store'
import type { OSData } from '../../types'

export const Route = createFileRoute('/os/procurement')({
  validateSearch: (s: Record<string, unknown>): { range?: ProcurementRange } => ({ range: s.range === 'week' ? 'week' : undefined }),
  component: Procurement,
})

function Sources({ data, line, today, bought }: { data: OSData; line: ProcurementLine; today: string; bought: boolean }) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {line.sources.map((s) => {
        const order = findOrder(data, s.orderId)
        const rec = order && findRecipient(data, order.recipientId)
        return (
          <li key={s.itemId} className="flex min-h-9 items-center gap-2 text-sm">
            <Link to="/os/orders/$id" params={{ id: s.orderId }} className="font-semibold text-brand-text tabular-nums hover:underline">{s.orderId}</Link>
            <span className="min-w-0 flex-1 truncate text-muted">
              ×{s.qty}
              {rec ? ` for ${rec.name}` : ''}
              {order ? ` · ${inlineDay(order.deliveryDate, today)}` : ''}
            </span>
            <button
              type="button"
              className={bought ? 'inline-flex min-h-9 items-center gap-1 rounded-pill px-2 text-xs font-semibold text-muted hover:bg-band' : btnSmall}
              onClick={() => markPurchased(s.itemId, !bought)}
              aria-label={`${bought ? 'Undo bought' : 'Mark bought'}: ${line.name} for ${s.orderId}`}
            >
              {bought ? <Icon name="undo" className="h-3.5 w-3.5" /> : <Icon name="check" className="h-3.5 w-3.5" />}
              {bought ? 'Undo' : 'Bought'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Procurement() {
  const data = useOS()
  const range: ProcurementRange = Route.useSearch().range ?? 'today'
  const navigate = useNavigate()
  const setRange = (r: ProcurementRange) => navigate({ to: '/os/procurement', search: r === 'week' ? { range: 'week' } : {}, replace: true })
  const today = businessToday()

  const args = { orders: data.orders, products: data.products, today, range, leadDays: data.settings.leadDays }
  const lines = buildProcurementList({ ...args, items: data.orderItems })
  // Bought lines on the same due orders: flip the flag in a copy so the same builder lists them.
  const boughtLines = buildProcurementList({
    ...args,
    items: data.orderItems.filter((i) => i.purchased).map((i) => ({ ...i, purchased: false })),
  })

  const units = lines.reduce((s, l) => s + l.qty, 0)
  const cost = Math.round(lines.reduce((s, l) => s + l.costAud, 0) * 100) / 100
  const orderCount = new Set(lines.flatMap((l) => l.sources.map((s) => s.orderId))).size
  const tab = (r: ProcurementRange) =>
    `inline-flex min-h-11 flex-1 items-center justify-center rounded-pill px-4 text-sm font-semibold md:flex-none ${range === r ? 'bg-action text-on-action' : 'text-ink hover:bg-band'}`

  return (
    <>
      <PageHeader title="Procurement" sub={`Orders are due for buying ${data.settings.leadDays} days before delivery. Only paid orders appear.`} />
      <div className="flex flex-col gap-5 px-4 py-5 md:px-8">
        <div role="tablist" aria-label="Shopping window" className="flex w-full gap-1 rounded-pill border border-line bg-raised p-1 md:w-fit">
          <button role="tab" type="button" aria-selected={range === 'today'} className={tab('today')} onClick={() => setRange('today')}>Today</button>
          <button role="tab" type="button" aria-selected={range === 'week'} className={tab('week')} onClick={() => setRange('week')}>This week</button>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Stat label="Items" value={lines.length} />
          <Stat label="Units" value={units} sub={`${orderCount} order${orderCount === 1 ? '' : 's'}`} />
          <Stat label="Est. spend" value={formatAud(cost)} />
        </div>

        <Section title="To buy">
          {lines.length === 0 ? (
            <EmptyState text={boughtLines.length ? 'Everything on this list is bought.' : 'Nothing to buy yet. Items appear once an order payment is confirmed.'} />
          ) : (
            <ul>
              {lines.map((l) => (
                <li key={l.productId} className="border-b border-line px-4 py-3 last:border-0">
                  <div className="flex min-h-9 items-center gap-3">
                    <span className="min-w-0 flex-1 truncate font-semibold">{l.name}</span>
                    <span className="font-display text-lg tabular-nums">×{l.qty}</span>
                    <span className="hidden w-20 text-right text-sm text-muted tabular-nums sm:inline">{formatAud(l.costAud)}</span>
                    {l.sources.length > 1 && (
                      <button type="button" className={btnSmallPrimary} onClick={() => l.sources.forEach((s) => markPurchased(s.itemId, true))}>
                        <Icon name="check" className="h-3.5 w-3.5" />
                        All bought
                      </button>
                    )}
                  </div>
                  <Sources data={data} line={l} today={today} bought={false} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        {boughtLines.length > 0 && (
          <section className={`${cardCls} bg-surface`}>
            <h2 className="border-b border-line px-4 py-2.5 font-display text-base">Already bought</h2>
            <ul>
              {boughtLines.map((l) => (
                <li key={l.productId} className="border-b border-line px-4 py-2.5 last:border-0">
                  <div className="flex items-center gap-3 text-sm">
                    <Icon name="check" className="h-4 w-4 text-success-text" />
                    <span className="min-w-0 flex-1 truncate text-muted">{l.name}</span>
                    <span className="tabular-nums text-muted">×{l.qty}</span>
                  </div>
                  <Sources data={data} line={l} today={today} bought />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
