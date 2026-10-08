// Small shared UI pieces for the Command Center: icons, buttons, chips, page header, stat, order list. Used by every routes/os/* screen.
import { Link } from '@tanstack/react-router'

import { formatAud, formatNpr } from '../../lib/format'
import type { OSData, Order, OrderStatus } from '../../types'
import { findCustomer, findRecipient } from '../store'
import { STATUS_LABEL } from '../orders'
import { dayLabel, relativeDay } from '../logic'

export type IconName =
  | 'home' | 'orders' | 'cart' | 'truck' | 'tag' | 'users' | 'gear' | 'logout' | 'menu' | 'close'
  | 'check' | 'search' | 'alert' | 'back' | 'gift' | 'chevron' | 'pause' | 'play' | 'undo'

export function Icon({ name, className = 'h-[18px] w-[18px]' }: { name: IconName; className?: string }) {
  const p = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }
  switch (name) {
    case 'home': return <svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>
    case 'orders': return <svg {...p}><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5M8.5 12.5h7M8.5 16h5" /></svg>
    case 'cart': return <svg {...p}><path d="M3 4h2.5l2 11h10l2-8H7" /><circle cx="9" cy="19" r="1.3" /><circle cx="17" cy="19" r="1.3" /></svg>
    case 'truck': return <svg {...p}><path d="M2 6h11v10H2zM13 10h4.5l3 3v3H13" /><circle cx="6.5" cy="17.5" r="1.7" /><circle cx="17" cy="17.5" r="1.7" /></svg>
    case 'tag': return <svg {...p}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.2" /></svg>
    case 'users': return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.3" /><path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8" /></svg>
    case 'gear': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 13a8 8 0 0 0 0-2l2-1.5-2-3.5-2.4.7a8 8 0 0 0-1.7-1L14.8 3H9.2l-.5 2.7a8 8 0 0 0-1.7 1l-2.4-.7-2 3.5L4.6 11a8 8 0 0 0 0 2l-2 1.5 2 3.5 2.4-.7a8 8 0 0 0 1.7 1l.5 2.7h5.6l.5-2.7a8 8 0 0 0 1.7-1l2.4.7 2-3.5-2-1.5Z" /></svg>
    case 'logout': return <svg {...p}><path d="M15 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h9" /><path d="M11 12h9m0 0-3-3m3 3-3 3" /></svg>
    case 'menu': return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
    case 'close': return <svg {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
    case 'check': return <svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
    case 'alert': return <svg {...p}><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4.5M12 17.2v.1" /></svg>
    case 'back': return <svg {...p}><path d="M15 5l-7 7 7 7" /></svg>
    case 'chevron': return <svg {...p}><path d="m9 5 7 7-7 7" /></svg>
    case 'pause': return <svg {...p}><path d="M8 5v14M16 5v14" /></svg>
    case 'play': return <svg {...p}><path d="M7 4.5v15l12-7.5-12-7.5Z" /></svg>
    case 'undo': return <svg {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
    case 'gift':
      return <svg {...p}><path d="M4 11h16v3H4zM5.5 14v6h13v-6M12 11v9" /><path d="M12 11C9 11 7 9.8 7 8s1.2-2.2 2.4-1.9C11 6.5 12 8.8 12 11Zm0 0c3 0 5-1.2 5-3s-1.2-2.2-2.4-1.9C13 6.5 12 8.8 12 11Z" /></svg>
  }
}

// ---------------------------------------------------------------------------
// Class recipes (kept as strings so every screen presses and focuses the same way)
// ---------------------------------------------------------------------------

const BTN =
  'inline-flex items-center justify-center gap-2 rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50'
export const btnPrimary = `${BTN} min-h-11 bg-action text-on-action hover:bg-action-hover`
export const btnSecondary = `${BTN} min-h-11 border border-field bg-raised text-ink hover:bg-band`
export const btnDanger = `${BTN} min-h-11 bg-danger text-on-danger hover:opacity-90`
export const btnSmall = `${BTN} min-h-9 border border-field bg-raised px-3 text-ink hover:bg-band`
export const btnSmallPrimary = `${BTN} min-h-9 bg-action px-3 text-on-action hover:bg-action-hover`
export const inputCls =
  'min-h-11 w-full rounded-field border border-field bg-raised px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus'
export const cardCls = 'rounded-frame border border-line bg-raised'

// ---------------------------------------------------------------------------
// Layout bits
// ---------------------------------------------------------------------------

export function PageHeader({
  title,
  sub,
  action,
  back,
}: {
  title: string
  sub?: React.ReactNode
  action?: React.ReactNode
  back?: { to: string; label: string }
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 pt-5 pb-4 md:px-8">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink">
            <Icon name="back" className="h-3.5 w-3.5" />
            {back.label}
          </Link>
        )}
        <h1 className="font-display text-xl leading-tight text-ink md:text-2xl">{title}</h1>
        {sub && <div className="mt-0.5 text-sm text-muted">{sub}</div>}
      </div>
      {action}
    </header>
  )
}

export function Section({
  title,
  aside,
  children,
  className = '',
}: {
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`${cardCls} ${className}`}>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <h2 className="font-display text-base text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Stat({ label, value, sub, accent = false }: { label: string; value: React.ReactNode; sub?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`${cardCls} min-w-0 px-3 py-3 md:px-4`}>
      <div className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</div>
      <div className={`mt-1 font-display text-xl leading-none md:text-2xl tabular-nums ${accent ? 'text-accent-text' : 'text-ink'}`}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted tabular-nums">{sub}</div>}
    </div>
  )
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-sm text-muted">
      <p>{text}</p>
      {action}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chips
// ---------------------------------------------------------------------------

const STATUS_TONE: Record<OrderStatus, string> = {
  NEW: 'bg-accent/25 text-ink',
  PAYMENT_CONFIRMED: 'bg-success-soft text-success-text',
  TO_PURCHASE: 'bg-band text-ink',
  PREPARING: 'bg-brand/30 text-ink',
  READY: 'bg-brand text-ink',
  OUT_FOR_DELIVERY: 'bg-deep text-on-deep',
  DELIVERED: 'border border-line text-muted',
  ON_HOLD: 'bg-danger-soft text-on-danger-soft',
}

export function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_TONE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export function PaymentChip({ order }: { order: Order }) {
  return order.paymentCheck === 'confirmed' ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap text-success-text">
      <Icon name="check" className="h-3.5 w-3.5" />
      Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-pill border border-accent px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-accent-text">
      Check payment
    </span>
  )
}

// ---------------------------------------------------------------------------
// Order list: table on md+, cards on phones. Used by dashboard, orders, deliveries, customer pages.
// ---------------------------------------------------------------------------

export interface OrderListProps {
  data: OSData
  orders: Order[]
  today: string
  /** Hide the buyer column (customer profile). */
  hideCustomer?: boolean
}

export function OrderList({ data, orders, today, hideCustomer = false }: OrderListProps) {
  const late = (o: Order) => o.deliveryDate < today && o.status !== 'DELIVERED'
  return (
    <>
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
            <th className="px-4 py-2 font-semibold">Order</th>
            {!hideCustomer && <th className="px-2 py-2 font-semibold">Buyer (Nepal)</th>}
            <th className="px-2 py-2 font-semibold">Recipient (Australia)</th>
            <th className="px-2 py-2 font-semibold">Deliver</th>
            <th className="px-2 py-2 text-right font-semibold">Total</th>
            <th className="px-2 py-2 font-semibold">Payment</th>
            <th className="px-4 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const c = findCustomer(data, o.customerId)
            const r = findRecipient(data, o.recipientId)
            return (
              <tr key={o.id} className="relative h-12 border-b border-line last:border-0 hover:bg-band/60">
                <td className="px-4">
                  <Link
                    to="/os/orders/$id"
                    params={{ id: o.id }}
                    className="font-semibold tabular-nums text-ink after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    {o.id}
                  </Link>
                </td>
                {!hideCustomer && <td className="px-2 text-ink">{c?.name ?? 'Unknown'}</td>}
                <td className="px-2 text-ink">
                  {r?.name ?? 'Unknown'} <span className="text-muted">· {o.city}</span>
                </td>
                <td className={`px-2 whitespace-nowrap tabular-nums ${late(o) ? 'font-semibold text-danger-text' : 'text-ink'}`}>
                  {relativeDay(o.deliveryDate, today)}
                </td>
                <td className="px-2 text-right whitespace-nowrap tabular-nums text-ink">
                  {formatAud(o.totals.totalAud)} <span className="text-muted">· {formatNpr(o.totals.totalNpr)}</span>
                </td>
                <td className="px-2">
                  <PaymentChip order={o} />
                </td>
                <td className="px-4">
                  <StatusChip status={o.status} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <ul className="md:hidden">
        {orders.map((o) => {
          const c = findCustomer(data, o.customerId)
          const r = findRecipient(data, o.recipientId)
          return (
            <li key={o.id} className="border-b border-line last:border-0">
              <Link to="/os/orders/$id" params={{ id: o.id }} className="flex flex-col gap-1.5 px-4 py-3 active:bg-band">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold tabular-nums text-ink">{o.id}</span>
                  <StatusChip status={o.status} />
                </div>
                <div className="text-sm text-ink">
                  {hideCustomer ? '' : `${c?.name ?? 'Unknown'} → `}
                  {r?.name ?? 'Unknown'} <span className="text-muted">· {o.city}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
                  <span className={late(o) ? 'font-semibold text-danger-text' : 'text-muted'}>
                    {dayLabel(o.deliveryDate, today)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-ink">{formatAud(o.totals.totalAud)}</span>
                    <PaymentChip order={o} />
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
