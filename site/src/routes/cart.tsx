// /cart: the gift you are about to send (one gift per order), with edit, remove and a clear next step to checkout.
import { createFileRoute, Link } from '@tanstack/react-router'

import { clearCart, patchCartGift, useCart } from '../cart/store'
import { usePricing } from '../cart/pricing'
import { CardPaper } from '../components/CardPaper'
import { formatLongDate } from '../components/DeliveryPicker'
import { GiftLines, GiftVisual } from '../components/GiftSummary'
import { IconMinus, IconPlus } from '../components/Icons'
import { WINDOW_LABEL } from '../cart/types'
import { BTN_PRIMARY, BTN_SECONDARY, PageHead } from '../components/ui'
import { getTemplate } from '../data/templates'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: 'Your gift - Tapika' }] }),
  component: CartPage,
})

function CartPage() {
  const gift = useCart()
  const pricing = usePricing()

  if (!gift) {
    return (
      <main>
        <PageHead title="Your gift basket is empty" lead="Nothing here yet. Start with someone you miss." />
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 pb-16 md:px-12">
          <Link to="/shop" className={BTN_PRIMARY}>
            Shop gifts
          </Link>
          <Link to="/build" className={BTN_SECONDARY}>
            Build a gift
          </Link>
        </div>
      </main>
    )
  }

  const bp = gift.blueprint
  const ready = bp.gift_type === 'ready-made' ? bp : null
  const editTo = ready ? { to: '/gift/$id' as const, params: { id: ready.template_id } } : { to: '/build' as const, search: { edit: true } }

  function setQty(q: number) {
    if (!ready) return
    patchCartGift({ blueprint: { ...ready, quantity: Math.min(5, Math.max(1, q)) } })
  }

  return (
    <main>
      <PageHead eyebrow="Your gift" title={ready ? getTemplate(ready.template_id).name : gift.title} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 md:px-12 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16">
        <div className="flex flex-col gap-8">
          <div className="max-w-xl">
            <GiftVisual gift={gift} pricing={pricing} />
          </div>
          {ready ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">How many?</span>
              <div className="flex items-center gap-1" role="group" aria-label="Quantity">
                <button type="button" aria-label="One fewer" disabled={ready.quantity <= 1} onClick={() => setQty(ready.quantity - 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-pill border border-field disabled:opacity-30">
                  <IconMinus width={20} height={20} />
                </button>
                <span className="w-8 text-center text-base font-semibold tabular-nums" aria-live="polite">{ready.quantity}</span>
                <button type="button" aria-label="One more" disabled={ready.quantity >= 5} onClick={() => setQty(ready.quantity + 1)} className="inline-flex h-11 w-11 items-center justify-center rounded-pill border border-field disabled:opacity-30">
                  <IconPlus width={20} height={20} />
                </button>
              </div>
            </div>
          ) : null}
          <section>
            <h2 className="font-display text-xl">Your message</h2>
            <CardPaper className="mt-3 max-w-xl" message={bp.message} empty="No message yet. You can add one at checkout." />
          </section>
          <section>
            <h2 className="font-display text-xl">Delivery</h2>
            <p className="mt-2">
              {gift.city || 'City to choose at checkout'}
              {bp.delivery_date ? `, ${formatLongDate(bp.delivery_date)}` : ', date to choose at checkout'}
              <br />
              <span className="text-muted">{WINDOW_LABEL[gift.window]}</span>
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Order summary">
          <h2 className="font-display text-xl">What you pay</h2>
          <div className="mt-3">
            <GiftLines gift={gift} pricing={pricing} />
          </div>
          <p className="mt-3 text-xs text-muted">Rate: 1 A$ = Rs {pricing.fx} as of {pricing.settings.rateAsOf || 'today'} · Sample prices</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/checkout" className={BTN_PRIMARY}>
              Go to checkout
            </Link>
            <Link {...editTo} className={BTN_SECONDARY}>
              Change this gift
            </Link>
            <button type="button" onClick={clearCart} className="min-h-11 self-start px-2 text-sm font-semibold text-brand-text underline underline-offset-4">
              Remove gift
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
