// Itemised price list (gift lines, packing, card, delivery, total in NPR with A$ beside). Used by builder Preview, cart, checkout and order pages.
import { nprExact } from '../cart/pricing'
import { formatAud, formatNpr } from '../lib/format'
import type { OrderItem, OrderTotals } from '../types'

export function Itemised({ lines, fx, totals, city }: { lines: OrderItem[]; fx: number; totals: OrderTotals | null; city?: string }) {
  const shown = lines.filter((l) => l.type !== 'task')
  const gifts = shown.filter((l) => l.type === 'gift')
  const extras = shown.filter((l) => l.type !== 'gift')
  const Row = ({ l }: { l: OrderItem }) => (
    <li className="flex items-baseline justify-between gap-4 py-2">
      <span className="min-w-0">
        <span className="text-ink">{l.name}</span>
        {l.qty > 1 ? <span className="text-muted"> × {l.qty}</span> : null}
        {l.type === 'packaging' ? <span className="text-muted"> (packing)</span> : null}
        {l.type === 'card' ? <span className="text-muted"> (card)</span> : null}
      </span>
      <span className="shrink-0 tabular-nums">
        {formatNpr(nprExact(l.qty * l.priceAud, fx))} <span className="text-xs text-muted">{formatAud(l.qty * l.priceAud)}</span>
      </span>
    </li>
  )
  const giftAud = totals?.giftAud ?? shown.reduce((s, l) => s + l.qty * l.priceAud, 0)
  return (
    <div>
      <ul className="divide-y divide-dashed divide-muted/40 text-base">
        {gifts.map((l) => (
          <Row key={l.id} l={l} />
        ))}
        {extras.map((l) => (
          <Row key={l.id} l={l} />
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 border-t-2 border-dashed border-muted/55 pt-3 tabular-nums">
        <div className="flex justify-between text-sm text-muted">
          <dt>Gift</dt>
          <dd>
            {formatNpr(nprExact(giftAud, fx))} <span className="text-xs">{formatAud(giftAud)}</span>
          </dd>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <dt>Delivery{city ? ` to ${city}` : ''}</dt>
          <dd>
            {totals ? (
              <>
                {formatNpr(nprExact(totals.deliveryAud, fx))} <span className="text-xs">{formatAud(totals.deliveryAud)}</span>
              </>
            ) : (
              'Choose a city'
            )}
          </dd>
        </div>
        {totals ? (
          <div className="flex items-baseline justify-between pt-2">
            <dt className="font-semibold">Total (to nearest Rs 50)</dt>
            <dd>
              <span className="font-display text-2xl">{formatNpr(totals.totalNpr)}</span> <span className="text-xs text-muted">{formatAud(totals.totalAud)}</span>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
