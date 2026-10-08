// Order lookup form: order ID + last 4 digits of the sender's phone. Friendly refusal on a miss. Used by /track and by /order/$id when the visitor has not verified.
import { useId, useState } from 'react'

import { markOrderVerified } from '../cart/store'
import { lookupOrder, useOS } from '../os/store'
import type { Order } from '../types'
import { BTN_PRIMARY, Field, TextInput } from './ui'

export function TrackForm({ defaultId = '', onFound }: { defaultId?: string; onFound: (order: Order) => void }) {
  const data = useOS()
  const id = useId()
  const [orderId, setOrderId] = useState(defaultId)
  const [digits, setDigits] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId.trim() || digits.trim().length !== 4) {
      setError('Please add your order number and the last 4 digits of the phone number you ordered with.')
      return
    }
    const order = lookupOrder(data, orderId, digits)
    if (!order) {
      setError('We could not match that order number and those 4 digits. Please check them and try again. If you are stuck, message @tapika44 on Instagram and we will find it for you.')
      return
    }
    setError('')
    markOrderVerified(order.id)
    onFound(order)
  }

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-5" noValidate>
      <Field label="Order number" htmlFor={`${id}-o`} hint="It looks like TP-1048.">
        <TextInput id={`${id}-o`} value={orderId} onChange={(e) => setOrderId(e.target.value)} autoCapitalize="characters" autoComplete="off" placeholder="TP-1048" />
      </Field>
      <Field label="Last 4 digits of your phone" htmlFor={`${id}-p`} hint="The Nepal number you ordered with. This keeps your order private.">
        <TextInput id={`${id}-p`} value={digits} inputMode="numeric" maxLength={4} autoComplete="off" onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))} placeholder="0001" />
      </Field>
      {error ? (
        <p role="alert" className="rounded-field bg-danger-soft px-4 py-3 text-sm font-semibold text-on-danger-soft">
          {error}
        </p>
      ) : null}
      <button type="submit" className={`${BTN_PRIMARY} self-start`}>
        Track my gift
      </button>
    </form>
  )
}
