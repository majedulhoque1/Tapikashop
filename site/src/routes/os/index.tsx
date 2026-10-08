// /os dashboard: greeting, status counts, payments to check, pending revenue, today's priorities and shopping summary. First screen after login.
import { Link, createFileRoute } from '@tanstack/react-router'

import { formatAud, formatNpr } from '../../lib/format'
import { Icon, PageHeader, Section, Stat, StatusChip, cardCls, btnSmall } from '../../os/components/ui'
import { dashboardSummary, formatDay, inlineDay, relativeDay } from '../../os/logic'
import { STATUS_LABEL, STATUS_LADDER } from '../../os/orders'
import { findRecipient, useOS } from '../../os/store'
import type { OSData, Order, OrderStatus } from '../../types'

export const Route = createFileRoute('/os/')({ component: Dashboard })

function greeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function MiniRow({ data, order, today, hint }: { data: OSData; order: Order; today: string; hint?: string }) {
  const r = findRecipient(data, order.recipientId)
  return (
    <li className="border-b border-line last:border-0">
      <Link to="/os/orders/$id" params={{ id: order.id }} className="flex min-h-12 items-center gap-3 px-4 py-2 hover:bg-band/60">
        <span className="w-16 shrink-0 font-semibold tabular-nums">{order.id}</span>
        <span className="min-w-0 flex-1 truncate text-sm">
          {r?.name ?? 'Unknown'} <span className="text-muted">· {order.city}</span>
        </span>
        <span className="hidden shrink-0 text-xs text-muted tabular-nums sm:inline">{hint ?? relativeDay(order.deliveryDate, today)}</span>
        <StatusChip status={order.status} />
      </Link>
    </li>
  )
}

function Group({ title, orders, data, today, hint }: { title: string; orders: Order[]; data: OSData; today: string; hint?: (o: Order) => string }) {
  if (orders.length === 0) return null
  return (
    <div>
      <div className="bg-band/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
        {title} <span className="tabular-nums">({orders.length})</span>
      </div>
      <ul>
        {orders.map((o) => (
          <MiniRow key={o.id} data={data} order={o} today={today} hint={hint?.(o)} />
        ))}
      </ul>
    </div>
  )
}

function Dashboard() {
  const data = useOS()
  const s = dashboardSummary(data)
  const nothing = s.awaitingCheck.length + s.overdue.length + s.dueToday.length + s.dueTomorrow.length === 0
  const statuses: OrderStatus[] = [...STATUS_LADDER.slice(0, -1), 'ON_HOLD', 'DELIVERED']

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${data.settings.ownerName}`}
        sub={`${formatDay(s.today)} · Melbourne time · ${s.openCount} open order${s.openCount === 1 ? '' : 's'}`}
      />

      <div className="flex flex-col gap-5 px-4 py-5 md:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Awaiting payment check" value={s.awaitingCheck.length} accent={s.awaitingCheck.length > 0} sub={s.awaitingCheck.length ? `${formatNpr(s.uncheckedNpr)} to verify` : 'All payments checked'} />
          <Stat label="Open orders" value={s.openCount} sub={`${s.counts.DELIVERED} delivered`} />
          <Stat label="Pending revenue" value={formatAud(s.pendingAud)} sub={formatNpr(s.pendingNpr)} />
          <Stat label="To buy now" value={s.shopping.units} sub={`${s.shopping.lines} item${s.shopping.lines === 1 ? '' : 's'} · ${formatAud(s.shopping.costAud)} est.`} />
        </div>

        <nav aria-label="Orders by status" className="flex flex-wrap gap-2">
          {statuses.map((st) => (
            <Link
              key={st}
              to="/os/orders"
              search={{ status: st }}
              className={`inline-flex min-h-9 items-center gap-2 rounded-pill border border-line bg-raised px-3 text-sm hover:bg-band ${s.counts[st] === 0 ? 'text-muted' : 'text-ink'}`}
            >
              {STATUS_LABEL[st]}
              <span className="font-semibold tabular-nums">{s.counts[st]}</span>
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Section title="Today's priorities" aside={<Link to="/os/deliveries" className="text-xs font-semibold text-brand-text hover:underline">Delivery calendar</Link>}>
            {nothing ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Nothing urgent. No deliveries today or tomorrow and every payment is checked.</p>
            ) : (
              <>
                <Group title="Overdue" orders={s.overdue} data={data} today={s.today} />
                <Group title="Payment to check" orders={s.awaitingCheck} data={data} today={s.today} hint={(o) => `Deliver ${inlineDay(o.deliveryDate, s.today)}`} />
                <Group title="Deliver today" orders={s.dueToday} data={data} today={s.today} />
                <Group title="Deliver tomorrow" orders={s.dueTomorrow} data={data} today={s.today} />
              </>
            )}
          </Section>

          <Section title="Today's shopping" aside={<Link to="/os/procurement" className="text-xs font-semibold text-brand-text hover:underline">Open list</Link>}>
            {s.shopping.lines === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Nothing to buy today. Confirm a payment and its items appear here.</p>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm">
                  <span className="font-semibold tabular-nums">{s.shopping.units}</span> units across{' '}
                  <span className="font-semibold tabular-nums">{s.shopping.lines}</span> items for{' '}
                  <span className="font-semibold tabular-nums">{s.shopping.orderCount}</span> order{s.shopping.orderCount === 1 ? '' : 's'}, about {formatAud(s.shopping.costAud)}.
                </p>
                <ul className="mt-2 divide-y divide-line">
                  {s.shopping.top.map((t) => (
                    <li key={t.name} className="flex min-h-10 items-center justify-between gap-3 text-sm">
                      <span className="truncate">{t.name}</span>
                      <span className="font-semibold tabular-nums">×{t.qty}</span>
                    </li>
                  ))}
                </ul>
                {s.shopping.lines > s.shopping.top.length && <p className="mt-1 text-xs text-muted">and {s.shopping.lines - s.shopping.top.length} more</p>}
                <Link to="/os/procurement" className={`${btnSmall} mt-3`}>
                  <Icon name="cart" className="h-4 w-4" />
                  Go shopping
                </Link>
              </div>
            )}
          </Section>
        </div>

        <p className={`${cardCls} px-4 py-3 text-xs text-muted`}>Demo data lives in this browser only. Reset it any time in Settings.</p>
      </div>
    </>
  )
}
