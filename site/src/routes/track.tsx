// /track: Track order. Needs the order ID and last 4 digits of the sender's phone, then shows the status timeline.
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { OrderView } from '../components/OrderView'
import { TrackForm } from '../components/TrackForm'
import { PageHead } from '../components/ui'
import { findOrder, useOS } from '../os/store'

export const Route = createFileRoute('/track')({
  head: () => ({ meta: [{ title: 'Track your gift - Tapika' }] }),
  component: TrackPage,
})

function TrackPage() {
  const data = useOS()
  const [foundId, setFoundId] = useState<string | null>(null)
  // Re-read from the store so the status updates live when the owner moves the order along.
  const order = foundId ? findOrder(data, foundId) : undefined

  return (
    <main>
      <PageHead eyebrow="Track order" title="Where is my gift?" lead="Enter your order number and the last 4 digits of your phone." />
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-12">
        {order ? (
          <>
            <OrderView order={order} />
            <button type="button" className="mt-10 text-sm font-semibold text-brand-text underline underline-offset-4" onClick={() => setFoundId(null)}>
              Look up a different order
            </button>
          </>
        ) : (
          <TrackForm onFound={(o) => setFoundId(o.id)} />
        )}
      </div>
    </main>
  )
}
