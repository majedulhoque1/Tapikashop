// /os/customers: buyers in Nepal with order count, total spent, last order and how many recipients they send to.
import { Link, createFileRoute } from '@tanstack/react-router'

import { formatAud, formatNpr } from '../../../lib/format'
import { EmptyState, PageHeader, cardCls } from '../../../os/components/ui'
import { customerStats, formatInstant } from '../../../os/logic'
import { useOS } from '../../../os/store'

export const Route = createFileRoute('/os/customers/')({ component: Customers })

function Customers() {
  const data = useOS()
  const rows = data.customers
    .map((c) => ({ c, s: customerStats(data, c), recipients: data.recipients.filter((r) => r.customerId === c.id).length }))
    .sort((a, b) => b.s.totalAud - a.s.totalAud)

  return (
    <>
      <PageHeader title="Customers" sub={`${data.customers.length} buyers in Nepal`} />
      <div className="px-4 py-5 md:px-8">
        <div className={`${cardCls} overflow-hidden`}>
          {rows.length === 0 ? (
            <EmptyState text="No customers yet. They appear with the first order." />
          ) : (
            <>
              <table className="hidden w-full text-sm md:table">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
                    <th className="px-4 py-2 font-semibold">Customer</th>
                    <th className="px-2 py-2 font-semibold">Phone</th>
                    <th className="px-2 py-2 text-right font-semibold">Orders</th>
                    <th className="px-2 py-2 text-right font-semibold">Recipients</th>
                    <th className="px-2 py-2 text-right font-semibold">Total spent</th>
                    <th className="px-4 py-2 font-semibold">Last order</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ c, s, recipients }) => (
                    <tr key={c.id} className="relative h-12 border-b border-line last:border-0 hover:bg-band/60">
                      <td className="px-4">
                        <Link to="/os/customers/$id" params={{ id: c.id }} className="font-semibold after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-focus">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-2 text-muted tabular-nums">{c.phone}</td>
                      <td className="px-2 text-right tabular-nums">{s.orders.length}</td>
                      <td className="px-2 text-right tabular-nums">{recipients}</td>
                      <td className="px-2 text-right whitespace-nowrap tabular-nums">
                        {formatAud(s.totalAud)} <span className="text-muted">· {formatNpr(s.totalNpr)}</span>
                      </td>
                      <td className="px-4 whitespace-nowrap text-muted tabular-nums">{s.lastOrderDate ? formatInstant(s.lastOrderDate) : 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="md:hidden">
                {rows.map(({ c, s, recipients }) => (
                  <li key={c.id} className="border-b border-line last:border-0">
                    <Link to="/os/customers/$id" params={{ id: c.id }} className="flex flex-col gap-1 px-4 py-3 active:bg-band">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-sm font-semibold tabular-nums">{formatAud(s.totalAud)}</span>
                      </div>
                      <div className="text-xs text-muted tabular-nums">
                        {s.orders.length} order{s.orders.length === 1 ? '' : 's'} · {recipients} recipient{recipients === 1 ? '' : 's'} · {formatNpr(s.totalNpr)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  )
}
