// /os/orders/$id: one order in full. Buyer vs recipient, gift composition (BOM), message, collage, payment proof + Confirm payment, status ladder, hold/resume, fulfilment checklist.
import { Link, createFileRoute } from '@tanstack/react-router'

import { formatAud, formatNpr } from '../../../lib/format'
import { Icon, PageHeader, PaymentChip, Section, StatusChip, btnPrimary, btnSecondary, cardCls } from '../../../os/components/ui'
import { businessToday, checklistProgress, dayLabel, formatInstant, titleCase } from '../../../os/logic'
import { STATUS_LABEL, STATUS_LADDER, nextStatus } from '../../../os/orders'
import {
  advanceOrderStatus,
  checklistFor,
  confirmPayment,
  findCustomer,
  findOrder,
  findRecipient,
  holdOrder,
  itemsFor,
  resumeOrder,
  tickChecklistItem,
  useOS,
} from '../../../os/store'
import type { OrderItemType, OrderStatus } from '../../../types'

export const Route = createFileRoute('/os/orders/$id')({ component: OrderDetail })

const TYPE_LABEL: Record<OrderItemType, string> = { gift: 'Gift', packaging: 'Packaging', card: 'Card', task: 'Task' }

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 text-sm last:border-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-ink">{children}</dd>
    </div>
  )
}

function Ladder({ status, before }: { status: OrderStatus; before: OrderStatus | null }) {
  const held = status === 'ON_HOLD'
  const at = STATUS_LADDER.indexOf(held ? (before ?? 'NEW') : status)
  return (
    <div>
      <ol className="flex gap-1" aria-label="Order progress">
        {STATUS_LADDER.map((st, i) => (
          <li
            key={st}
            aria-current={i === at ? 'step' : undefined}
            className="min-w-0 flex-1"
          >
            <div className={`h-1.5 rounded-pill ${held && i === at ? 'bg-danger' : i < at ? 'bg-action' : i === at ? 'bg-brand' : 'bg-band'}`} />
            <div className={`mt-1.5 hidden text-xs leading-tight md:block ${i === at ? 'font-semibold text-ink' : 'text-muted'}`}>{STATUS_LABEL[st]}</div>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm md:hidden">
        <span className="text-muted tabular-nums">
          Step {at + 1} of {STATUS_LADDER.length}:{' '}
        </span>
        <span className="font-semibold">{held ? `On hold (was ${STATUS_LABEL[before ?? 'NEW']})` : STATUS_LABEL[status]}</span>
      </p>
    </div>
  )
}

function OrderDetail() {
  const { id } = Route.useParams()
  const data = useOS()
  const order = findOrder(data, id)
  const today = businessToday()

  if (!order) {
    return (
      <>
        <PageHeader title="Order not found" back={{ to: '/os/orders', label: 'All orders' }} />
        <p className="px-4 py-10 text-sm text-muted md:px-8">There is no order {id}. It may have been removed by Reset demo data.</p>
      </>
    )
  }

  const customer = findCustomer(data, order.customerId)
  const recipient = findRecipient(data, order.recipientId)
  const items = itemsFor(data, order.id)
  const checklist = checklistFor(data, order.id)
  const progress = checklistProgress(checklist)
  const bp = order.blueprint
  const next = nextStatus(order.status)
  const held = order.status === 'ON_HOLD'
  const awaiting = order.paymentCheck === 'awaiting'
  const late = order.deliveryDate < today && order.status !== 'DELIVERED'
  const toBuy = items.filter((i) => i.type !== 'task' && !i.purchased).length

  return (
    <>
      <PageHeader
        back={{ to: '/os/orders', label: 'All orders' }}
        title={order.id}
        sub={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Placed {formatInstant(order.createdAt)}</span>
            <StatusChip status={order.status} />
            <PaymentChip order={order} />
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {awaiting && (
              <button type="button" className={btnPrimary} onClick={() => confirmPayment(order.id)}>
                <Icon name="check" className="h-4 w-4" />
                Confirm payment
              </button>
            )}
            {held ? (
              <button type="button" className={btnPrimary} onClick={() => resumeOrder(order.id)}>
                <Icon name="play" className="h-4 w-4" />
                Resume order
              </button>
            ) : (
              <>
                {next && (
                  <button type="button" className={awaiting ? btnSecondary : btnPrimary} disabled={awaiting} onClick={() => advanceOrderStatus(order.id)}>
                    Advance: {STATUS_LABEL[next]}
                  </button>
                )}
                {order.status !== 'DELIVERED' && (
                  <button type="button" className={btnSecondary} onClick={() => holdOrder(order.id)}>
                    <Icon name="pause" className="h-4 w-4" />
                    Hold
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-5 px-4 py-5 md:px-8">
        {awaiting && (
          <p className="flex items-center gap-2 rounded-field border border-accent bg-accent/15 px-3 py-2.5 text-sm" role="status">
            <Icon name="alert" className="h-4 w-4 shrink-0 text-accent-text" />
            Check the eSewa screenshot against {formatNpr(order.totals.totalNpr)}, then confirm payment. The order cannot move forward until then.
          </p>
        )}
        {held && (
          <p className="flex items-center gap-2 rounded-field bg-danger-soft px-3 py-2.5 text-sm text-on-danger-soft" role="status">
            <Icon name="pause" className="h-4 w-4 shrink-0" />
            On hold. Resume puts it back to {STATUS_LABEL[order.statusBeforeHold ?? 'NEW']}.
          </p>
        )}

        <div className={`${cardCls} px-4 py-4`}>
          <Ladder status={order.status} before={order.statusBeforeHold} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <Section title="Gift composition" aside={<span className="text-xs text-muted tabular-nums">{toBuy > 0 ? `${toBuy} line${toBuy === 1 ? '' : 's'} still to buy` : 'All bought'}</span>}>
              <ul>
                {items.map((it) => (
                  <li key={it.id} className="flex min-h-12 items-center gap-3 border-b border-line px-4 py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{it.name}</div>
                      <div className="text-xs text-muted">
                        {TYPE_LABEL[it.type]}
                        {it.type === 'task' ? '' : it.purchased ? ' · bought' : ' · to buy'}
                      </div>
                    </div>
                    <span className="w-10 text-right font-semibold tabular-nums">×{it.qty}</span>
                    <span className="w-20 text-right tabular-nums text-muted">{it.type === 'task' ? '' : formatAud(it.qty * it.priceAud)}</span>
                  </li>
                ))}
              </ul>
              <dl className="px-4 py-2">
                <Fact label="Gift items"><span className="tabular-nums">{formatAud(order.totals.giftAud)}</span></Fact>
                <Fact label={`Delivery to ${order.city}`}><span className="tabular-nums">{formatAud(order.totals.deliveryAud)}</span></Fact>
                <Fact label="Total">
                  <span className="font-semibold tabular-nums">{formatAud(order.totals.totalAud)}</span>
                  <span className="text-muted tabular-nums"> · {formatNpr(order.totals.totalNpr)}</span>
                </Fact>
                <Fact label="Rate used"><span className="tabular-nums">A$1 = Rs {order.totals.fxRate}</span></Fact>
              </dl>
            </Section>

            <Section title="Gift message">
              <div className="px-4 py-4">
                <p className="font-note text-xl leading-snug text-ink">{bp.message || 'No message.'}</p>
                <p className="mt-2 text-xs text-muted">
                  {titleCase(bp.occasion)} for a {bp.recipient}
                  {bp.packaging.ribbon ? ' · ribbon' : ''}
                  {bp.packaging.premiumWrap ? ' · premium wrap' : ''}
                </p>
              </div>
            </Section>

            {bp.collage && (
              <Section title="Photo collage" aside={<span className="text-xs text-muted tabular-nums">{bp.collage.photos.length} photos</span>}>
                <div className="px-4 py-3">
                  <dl>
                    <Fact label="Names on frame">{bp.collage.names || 'None'}</Fact>
                    <Fact label="Date on frame">{bp.collage.date || 'None'}</Fact>
                  </dl>
                  <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {bp.collage.photos.map((src, i) => (
                      <li key={i} className="aspect-square overflow-hidden rounded-field border border-line bg-band">
                        <img src={src} alt={`Collage photo ${i + 1}`} className="h-full w-full object-cover" />
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>
            )}

            <Section title="Fulfilment checklist" aside={<span className="text-xs font-semibold text-muted tabular-nums">{progress.done} of {progress.total}</span>}>
              <div className="px-4 pt-3">
                <div className="h-1.5 overflow-hidden rounded-pill bg-band" role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
                  <div className="h-full bg-action transition-[width]" style={{ width: `${progress.pct}%` }} />
                </div>
              </div>
              <ul className="py-1">
                {checklist.map((c) => (
                  <li key={c.id}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 px-4 text-sm hover:bg-band/60">
                      <input type="checkbox" checked={c.done} onChange={(e) => tickChecklistItem(c.id, e.target.checked)} className="h-5 w-5 shrink-0 accent-[var(--tp-c-pine)]" />
                      <span className={c.done ? 'text-muted line-through' : ''}>{c.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Section title="Delivery">
              <dl className="px-4 py-2">
                <Fact label="Date">
                  <span className={`tabular-nums ${late ? 'font-semibold text-danger-text' : ''}`}>
                    {dayLabel(order.deliveryDate, today)}
                  </span>
                </Fact>
                <Fact label="City">{order.city}</Fact>
                <Fact label="Window">{order.deliveryWindow || 'Not chosen (any time that day)'}</Fact>
                <Fact label="Address">{recipient ? recipient.address : 'Unknown'}</Fact>
              </dl>
            </Section>

            <Section title="People">
              <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-1">
                <div className="bg-raised px-4 py-3">
                  <div className="text-xs font-semibold tracking-wide text-muted uppercase">Buyer · Nepal</div>
                  {customer ? (
                    <>
                      <Link to="/os/customers/$id" params={{ id: customer.id }} className="mt-1 block font-semibold text-ink hover:underline">{customer.name}</Link>
                      <div className="text-sm text-muted tabular-nums">{customer.phone}</div>
                      <div className="text-sm text-muted">{customer.email}</div>
                    </>
                  ) : <div className="mt-1 text-sm text-muted">Unknown</div>}
                </div>
                <div className="bg-raised px-4 py-3">
                  <div className="text-xs font-semibold tracking-wide text-muted uppercase">Recipient · Australia</div>
                  {recipient ? (
                    <>
                      <div className="mt-1 font-semibold">{recipient.name} <span className="font-normal text-muted">· {recipient.relationship}</span></div>
                      <div className="text-sm text-muted">{recipient.suburb}, {recipient.city}</div>
                      <div className="text-sm text-muted tabular-nums">{recipient.phone}</div>
                      {recipient.importantDates && <div className="mt-1 text-xs text-muted">{recipient.importantDates}</div>}
                    </>
                  ) : <div className="mt-1 text-sm text-muted">Unknown</div>}
                </div>
              </div>
            </Section>

            <Section title="Payment proof (eSewa)">
              <div className="px-4 py-3">
                {order.paymentScreenshot ? (
                  <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-field border border-line bg-band">
                    <img src={order.paymentScreenshot} alt={`eSewa payment screenshot for ${order.id}`} className="mx-auto max-h-80 min-h-24 w-full object-contain" />
                  </a>
                ) : (
                  <p className="text-sm text-muted">{awaiting ? 'No screenshot was uploaded.' : 'Payment confirmed. No screenshot on file.'}</p>
                )}
                <p className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted">Expected</span>
                  <span className="font-semibold tabular-nums">{formatNpr(order.totals.totalNpr)}</span>
                </p>
                {awaiting && (
                  <button type="button" className={`${btnPrimary} mt-3 w-full`} onClick={() => confirmPayment(order.id)}>
                    <Icon name="check" className="h-4 w-4" />
                    Confirm payment
                  </button>
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </>
  )
}
