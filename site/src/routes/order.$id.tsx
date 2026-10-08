// /order/$id: confirmation after checkout ("Sarah's gift is being prepared") with the status timeline. Shows details only to a verified buyer.
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { isOrderVerified } from '../cart/store'
import { OrderView } from '../components/OrderView'
import { TrackForm } from '../components/TrackForm'
import { PageHead } from '../components/ui'
import { findOrder, useOS } from '../os/store'

export const Route = createFileRoute('/order/$id')({
  validateSearch: (s: Record<string, unknown>): { placed?: boolean } => ({ placed: s.placed === true || s.placed === 'true' ? true : undefined }),
  head: () => ({ meta: [{ title: 'Your gift order - Tapika' }] }),
  component: OrderPage,
})

function OrderPage() {
  const { id } = Route.useParams()
  const { placed } = Route.useSearch()
  const data = useOS()
  const [verified, setVerified] = useState<boolean | null>(null)
  useEffect(() => setVerified(isOrderVerified(id)), [id])
  const order = findOrder(data, id)

  return (
    <main>
      <PageHead title={placed ? 'Thank you.' : 'Your order'} />
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-12">
        {verified === null || data.orders.length === 0 ? (
          <p className="text-muted">One moment.</p>
        ) : !order ? (
          <div className="max-w-md">
            <p className="text-lg">We could not find order {id}.</p>
            <Link to="/track" className="mt-4 inline-block font-semibold text-brand-text underline underline-offset-4">
              Try the order tracker
            </Link>
          </div>
        ) : verified ? (
          <OrderView order={order} justPlaced={!!placed} />
        ) : (
          <div>
            <p className="mb-6 max-w-[62ch] text-lg text-muted">To keep your order private, please confirm the last 4 digits of your phone.</p>
            <TrackForm defaultId={id} onFound={() => setVerified(true)} />
          </div>
        )}
      </div>
    </main>
  )
}
