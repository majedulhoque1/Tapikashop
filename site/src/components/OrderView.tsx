// Customer order view: friendly headline, status timeline, what is inside, message, delivery. Shared by /order/$id (after checkout) and /track (after lookup).
import { Link } from '@tanstack/react-router'

import { findRecipient, itemsFor, useOS } from '../os/store'
import type { Order, OrderStatus } from '../types'
import { formatLongDate } from './DeliveryPicker'
import { CardPaper } from './CardPaper'
import { IconCheck } from './Icons'
import { Itemised } from './Itemised'
import { Twine } from './ui'

const STAGES: { label: string; done: string }[] = [
  { label: 'Order received', done: 'We have your order.' },
  { label: 'Payment confirmed', done: 'Your eSewa payment is confirmed.' },
  { label: 'Being prepared', done: 'We are buying and wrapping everything.' },
  { label: 'Ready to go', done: 'Wrapped and waiting for delivery day.' },
  { label: 'On its way', done: 'On its way to the door.' },
  { label: 'Delivered', done: 'It has arrived.' },
]

const STAGE_OF: Record<OrderStatus, number> = {
  NEW: 0,
  PAYMENT_CONFIRMED: 1,
  TO_PURCHASE: 2,
  PREPARING: 2,
  READY: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
  ON_HOLD: 0,
}

function stageOf(order: Order): number {
  return order.status === 'ON_HOLD' ? STAGE_OF[order.statusBeforeHold ?? 'NEW'] : STAGE_OF[order.status]
}

function headline(order: Order, first: string): string {
  const stage = stageOf(order)
  if (order.status === 'ON_HOLD') return `${first}'s gift is on hold for a moment`
  if (stage === 0) return `Your gift for ${first} is booked`
  if (stage <= 2) return `${first}'s gift is being prepared`
  if (stage === 3) return `${first}'s gift is wrapped and ready`
  if (stage === 4) return `${first}'s gift is on its way`
  return `${first}'s gift has been delivered`
}

export function OrderView({ order, justPlaced = false }: { order: Order; justPlaced?: boolean }) {
  const data = useOS()
  const recipient = findRecipient(data, order.recipientId)
  const first = recipient?.name.split(' ')[0] ?? 'Their'
  const lines = itemsFor(data, order.id)
  const stage = stageOf(order)
  const awaiting = order.paymentCheck === 'awaiting'

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-text">Order {order.id}</p>
        <h2 className="mt-2 max-w-xl font-display text-3xl leading-[1.1] tracking-[-0.02em]">{headline(order, first)}</h2>
        {justPlaced ? (
          <p className="mt-4 max-w-[62ch] text-lg text-muted">
            Keep your order number <strong className="font-semibold text-ink">{order.id}</strong> and the last 4 digits of your phone. You can check on {first}'s gift here any time.
          </p>
        ) : null}
        {order.status === 'ON_HOLD' ? (
          <p role="status" className="mt-4 rounded-field bg-band px-4 py-3 text-ink">
            We paused this order and will sort it out with you. Message @tapika44 on Instagram if you have a question.
          </p>
        ) : null}
        {awaiting && order.status !== 'ON_HOLD' ? (
          <p role="status" className="mt-4 rounded-field bg-band px-4 py-3 text-ink">
            We are checking your eSewa payment. This page will update once it is confirmed.
          </p>
        ) : null}

        <ol className="mt-8 max-w-xl" aria-label="Order progress">
          {STAGES.map((s, i) => {
            const done = i < stage || (i === stage && stage === STAGES.length - 1)
            const current = i === stage && !done
            return (
              <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0" aria-current={current ? 'step' : undefined}>
                {i < STAGES.length - 1 ? (
                  <span aria-hidden="true" className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] border-l-2 ${i < stage ? 'border-solid border-ink' : 'border-dashed border-muted/55'}`} />
                ) : null}
                <span
                  className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border-2 ${
                    done ? 'border-ink bg-action text-on-action' : current ? 'border-ink bg-raised text-ink' : 'border-field bg-surface text-muted'
                  }`}
                >
                  {done ? <IconCheck width={18} height={18} /> : <span className="text-sm font-semibold tabular-nums">{i + 1}</span>}
                </span>
                <div>
                  <p className={`font-display text-xl ${!done && !current ? 'text-muted' : ''}`}>{s.label}</p>
                  {done || current ? (
                    <p className="text-sm text-muted">
                      {i === 0 && awaiting && current ? 'Waiting for us to check your payment.' : current && i !== 5 ? 'This is where we are now.' : s.done}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-8">
        <section>
          <h3 className="font-display text-xl">Delivery</h3>
          <p className="mt-2 text-base">
            {order.deliveryDate ? formatLongDate(order.deliveryDate) : 'Date to confirm'}
            <br />
            <span className="text-muted">
              {recipient ? `${recipient.name}, ${recipient.suburb}, ` : ''}
              {order.city}
            </span>
          </p>
        </section>
        <Twine />
        <section>
          <h3 className="font-display text-xl">What is inside</h3>
          <div className="mt-3">
            <Itemised lines={lines} fx={order.totals.fxRate} totals={order.totals} city={order.city} />
          </div>
        </section>
        {order.blueprint.message ? (
          <section>
            <h3 className="font-display text-xl">Your message</h3>
            <CardPaper className="mt-3" message={order.blueprint.message} />
          </section>
        ) : null}
        <p className="text-sm text-muted">
          Questions? Message <a className="font-semibold text-brand-text underline underline-offset-4" href="https://www.instagram.com/tapika44/" target="_blank" rel="noopener noreferrer">@tapika44</a> on Instagram with your order number.{' '}
          <Link to="/track" className="font-semibold text-brand-text underline underline-offset-4">
            Track another order
          </Link>
        </p>
      </div>
    </div>
  )
}
