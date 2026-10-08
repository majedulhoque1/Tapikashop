// /os/orders: all orders with status filter chips (URL ?status=) and search. Table on desktop, cards on phones.
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Icon, OrderList, PageHeader, EmptyState, cardCls, inputCls } from '../../../os/components/ui'
import { businessToday, countByStatus } from '../../../os/logic'
import { STATUS_LABEL, STATUS_LADDER } from '../../../os/orders'
import { findCustomer, findRecipient, useOS } from '../../../os/store'
import type { OrderStatus } from '../../../types'

const ALL_STATUSES: OrderStatus[] = [...STATUS_LADDER, 'ON_HOLD']

export const Route = createFileRoute('/os/orders/')({
  validateSearch: (s: Record<string, unknown>): { status?: OrderStatus } => ({
    status: ALL_STATUSES.includes(s.status as OrderStatus) ? (s.status as OrderStatus) : undefined,
  }),
  component: Orders,
})

function Orders() {
  const data = useOS()
  const { status } = Route.useSearch()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const today = businessToday()
  const counts = countByStatus(data.orders)
  const needle = q.trim().toLowerCase()

  const orders = data.orders
    .filter((o) => !status || o.status === status)
    .filter((o) => {
      if (!needle) return true
      const hay = [o.id, o.city, findCustomer(data, o.customerId)?.name, findRecipient(data, o.recipientId)?.name].join(' ').toLowerCase()
      return hay.includes(needle)
    })
    .sort((a, b) => b.id.localeCompare(a.id))

  const chip = (active: boolean) =>
    `inline-flex min-h-9 items-center gap-2 rounded-pill border px-3 text-sm whitespace-nowrap ${active ? 'border-action bg-action text-on-action' : 'border-line bg-raised text-ink hover:bg-band'}`

  return (
    <>
      <PageHeader title="Orders" sub={`${data.orders.length} orders in total`} />
      <div className="flex flex-col gap-4 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            <Link to="/os/orders" search={{}} className={chip(!status)}>
              All <span className="font-semibold tabular-nums">{data.orders.length}</span>
            </Link>
            {ALL_STATUSES.map((st) => (
              <Link key={st} to="/os/orders" search={{ status: st }} className={chip(status === st)}>
                {STATUS_LABEL[st]} <span className="font-semibold tabular-nums">{counts[st]}</span>
              </Link>
            ))}
          </div>
          <label className="relative block md:w-64">
            <span className="sr-only">Search orders</span>
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order, name or city"
              className={`${inputCls} pl-9`}
              onKeyDown={(e) => e.key === 'Escape' && setQ('')}
            />
          </label>
        </div>

        <div className={`${cardCls} overflow-hidden`}>
          {orders.length === 0 ? (
            <EmptyState
              text="No orders match."
              action={
                (status || q) && (
                  <button type="button" className="text-sm font-semibold text-brand-text hover:underline" onClick={() => { setQ(''); navigate({ to: '/os/orders', search: {} }) }}>
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <OrderList data={data} orders={orders} today={today} />
          )}
        </div>
      </div>
    </>
  )
}
