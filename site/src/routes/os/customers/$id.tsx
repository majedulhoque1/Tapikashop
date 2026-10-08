// /os/customers/$id: one buyer (Nepal), their totals, the recipients they send to (buyer is not the recipient) with relationship + important dates, and their orders.
import { createFileRoute } from '@tanstack/react-router'

import { formatAud, formatNpr } from '../../../lib/format'
import { EmptyState, OrderList, PageHeader, Section, Stat } from '../../../os/components/ui'
import { businessToday, customerStats, formatInstant } from '../../../os/logic'
import { findCustomer, useOS } from '../../../os/store'

export const Route = createFileRoute('/os/customers/$id')({ component: CustomerProfile })

function CustomerProfile() {
  const { id } = Route.useParams()
  const data = useOS()
  const customer = findCustomer(data, id)

  if (!customer) {
    return (
      <>
        <PageHeader title="Customer not found" back={{ to: '/os/customers', label: 'All customers' }} />
        <p className="px-4 py-10 text-sm text-muted md:px-8">There is no customer {id}.</p>
      </>
    )
  }

  const stats = customerStats(data, customer)
  const recipients = data.recipients.filter((r) => r.customerId === customer.id)
  const today = businessToday()

  return (
    <>
      <PageHeader
        back={{ to: '/os/customers', label: 'All customers' }}
        title={customer.name}
        sub={
          <span className="tabular-nums">
            {customer.phone} · {customer.email} · {customer.country}
          </span>
        }
      />
      <div className="flex flex-col gap-5 px-4 py-5 md:px-8">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Stat label="Orders" value={stats.orders.length} />
          <Stat label="Total spent" value={formatAud(stats.totalAud)} sub={formatNpr(stats.totalNpr)} />
          <Stat label="Last order" value={<span className="text-lg">{stats.lastOrderDate ? formatInstant(stats.lastOrderDate).split(',')[0] : 'None'}</span>} />
        </div>

        <Section title="Recipients in Australia" aside={<span className="text-xs text-muted tabular-nums">{recipients.length}</span>}>
          {recipients.length === 0 ? (
            <EmptyState text="No recipients yet." />
          ) : (
            <ul>
              {recipients.map((r) => {
                const sent = data.orders.filter((o) => o.recipientId === r.id).length
                return (
                  <li key={r.id} className="flex flex-col gap-0.5 border-b border-line px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">
                        {r.name} <span className="font-normal text-muted">· {r.relationship}</span>
                      </div>
                      <div className="text-sm text-muted">
                        {r.suburb}, {r.city}
                      </div>
                    </div>
                    <div className="text-sm text-muted">{r.importantDates || 'No dates saved'}</div>
                    <div className="text-sm tabular-nums sm:w-24 sm:text-right">
                      {sent} gift{sent === 1 ? '' : 's'}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        <Section title="Orders">
          {stats.orders.length === 0 ? <EmptyState text="No orders yet." /> : <OrderList data={data} orders={stats.orders} today={today} hideCustomer />}
        </Section>
      </div>
    </>
  )
}
