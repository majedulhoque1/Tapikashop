// /checkout: two steps. Details (sender in Nepal, recipient in Australia, date, message) then Pay with eSewa (instructions + screenshot) which creates the order and goes to /order/$id.
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { clearCart, markOrderVerified, patchCartGift, useCart } from '../cart/store'
import { quote as makeQuote, usePricing } from '../cart/pricing'
import { WINDOW_LABEL } from '../cart/types'
import { DeliveryPicker } from '../components/DeliveryPicker'
import { GiftLines, GiftVisual } from '../components/GiftSummary'
import { IconInfo, IconLock, IconUpload } from '../components/Icons'
import { relationshipLabel } from '../components/labels'
import { BTN_PRIMARY, BTN_SECONDARY, Field, PageHead, TextArea, TextInput, Twine } from '../components/ui'
import { earliestDeliveryDate } from '../config/business'
import { fileToSmallDataUrl } from '../lib/photo'
import { formatAud, formatNpr } from '../lib/format'
import { createOrderFromBuilder } from '../os/store'

export const Route = createFileRoute('/checkout')({
  head: () => ({ meta: [{ title: 'Checkout - Tapika' }] }),
  component: CheckoutPage,
})

const digits = (s: string) => s.replace(/\D/g, '')

type Errs = Record<string, string>

function CheckoutPage() {
  const gift = useCart()
  const pricing = usePricing()
  const navigate = useNavigate()

  const [step, setStep] = useState<'details' | 'pay'>('details')
  const [sender, setSender] = useState({ name: '', phone: '', email: '' })
  const [rec, setRec] = useState({ name: '', phone: '', address: '', suburb: '' })
  const [message, setMessage] = useState<string | null>(null)
  const [errs, setErrs] = useState<Errs>({})
  const [shot, setShot] = useState<string | null>(null)
  const [shotErr, setShotErr] = useState('')
  const [instaInstead, setInstaInstead] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const topRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    topRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [step])

  if (!gift) {
    return (
      <main>
        <PageHead title="Nothing to check out yet" lead="Nothing here yet. Start with someone you miss." />
        <div className="mx-auto flex max-w-7xl gap-3 px-4 pb-16 md:px-12">
          <Link to="/shop" className={BTN_PRIMARY}>Shop gifts</Link>
          <Link to="/build" className={BTN_SECONDARY}>Build a gift</Link>
        </div>
      </main>
    )
  }

  const g = gift
  const bp = g.blueprint
  const msg = message ?? bp.message
  const date = bp.delivery_date
  const q = makeQuote({ ...bp, message: msg, delivery_date: date }, g.city, pricing)
  const totalNpr = q.totals?.totalNpr ?? 0
  const set = (k: string, v: string) => setErrs((e) => ({ ...e, [k]: v }))

  function validate(): Errs {
    const e: Errs = {}
    if (!sender.name.trim()) e.sName = 'Please add your name.'
    if (digits(sender.phone).length < 7) e.sPhone = 'Please add the phone number you use in Nepal, so we can find your order later.'
    if (!/^\S+@\S+\.\S+$/.test(sender.email.trim())) e.sEmail = 'Please add an email address for your receipt.'
    if (!rec.name.trim()) e.rName = "Please add the recipient's name."
    if (digits(rec.phone).length < 8) e.rPhone = "Please add the recipient's phone number in Australia."
    if (!rec.address.trim()) e.rAddress = "Please add the street address."
    if (!rec.suburb.trim()) e.rSuburb = "Please add the recipient's suburb so we can plan the delivery."
    if (!g.city) e.city = 'Please choose the delivery city.'
    if (!date) e.date = 'Pick the day it should arrive.'
    else if (date < earliestDeliveryDate(pricing.leadDays)) e.date = `That date is too soon for us to wrap and deliver with care. Please pick ${earliestDeliveryDate(pricing.leadDays)} or later.`
    return e
  }

  function toPay() {
    const e = validate()
    setErrs(e)
    if (Object.keys(e).length) {
      window.setTimeout(() => document.querySelector<HTMLElement>('[data-err="1"]')?.scrollIntoView({ block: 'center' }), 30)
      return
    }
    patchCartGift({ blueprint: { ...bp, message: msg } })
    setStep('pay')
  }

  async function onShot(files: FileList | null) {
    const f = files?.[0]
    if (!f) return
    setShotErr('')
    try {
      setShot(await fileToSmallDataUrl(f, 900, 0.7))
    } catch {
      setShotErr('That photo is too large or could not be read. Try a smaller one, or send a screenshot on Instagram instead.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function place() {
    if (!shot && !instaInstead) {
      setShotErr('Please upload your eSewa payment screenshot, or tick the box to send it on Instagram.')
      return
    }
    setSubmitting(true)
    setSubmitErr('')
    try {
      const relationship = relationshipLabel(g.builder?.recipient ?? bp.recipient)
      const { orderId } = createOrderFromBuilder({
        blueprint: { ...bp, message: msg.trim(), delivery_date: date },
        customer: { name: sender.name.trim(), phone: sender.phone.trim(), email: sender.email.trim() },
        recipient: { name: rec.name.trim(), city: g.city, suburb: rec.suburb.trim(), address: rec.address.trim(), phone: rec.phone.trim(), relationship },
        paymentScreenshot: shot,
        deliveryWindow: WINDOW_LABEL[g.window],
      })
      markOrderVerified(orderId)
      clearCart()
      void navigate({ to: '/order/$id', params: { id: orderId }, search: { placed: true } })
    } catch (err) {
      setSubmitting(false)
      setSubmitErr(`Something went wrong on our side, not yours. Please try again in a moment.${err instanceof Error ? ` (${err.message})` : ''}`)
    }
  }

  const err = (k: string) => (errs[k] ? { 'data-err': '1' } : {})

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-10 md:px-12 md:pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-text">Step {step === 'details' ? 1 : 2} of 2</p>
        <h1 ref={topRef} tabIndex={-1} className="mt-2 font-display text-3xl leading-[1.1] tracking-[-0.02em] focus-visible:outline-none">
          {step === 'details' ? 'Who is it from, and who is it for?' : 'Pay with eSewa'}
        </h1>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-6 md:px-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <div>
          <details className="mb-8 rounded-frame border border-line bg-raised px-4 py-3 lg:hidden">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between font-semibold">
              <span>Order summary</span>
              <span className="tabular-nums">{q.totals ? formatNpr(totalNpr) : formatNpr(q.giftNpr)}</span>
            </summary>
            <div className="mt-4">
              <GiftLines gift={{ ...g, blueprint: { ...bp, message: msg } }} pricing={pricing} />
            </div>
          </details>

          {step === 'details' ? (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                toPay()
              }}
              className="flex flex-col gap-10"
            >
              <fieldset className="flex flex-col gap-5">
                <legend className="font-display text-2xl">From you (in Nepal)</legend>
                <div {...err('sName')}>
                  <Field label="Your name" htmlFor="s-name" error={errs.sName}>
                    <TextInput id="s-name" autoComplete="name" value={sender.name} onChange={(e) => { setSender({ ...sender, name: e.target.value }); set('sName', '') }} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div {...err('sPhone')}>
                    <Field label="Your phone" htmlFor="s-phone" error={errs.sPhone} hint="We use the last 4 digits to protect your order.">
                      <TextInput id="s-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" value={sender.phone} onChange={(e) => { setSender({ ...sender, phone: e.target.value }); set('sPhone', '') }} />
                    </Field>
                  </div>
                  <div {...err('sEmail')}>
                    <Field label="Your email" htmlFor="s-email" error={errs.sEmail}>
                      <TextInput id="s-email" type="email" autoComplete="email" value={sender.email} onChange={(e) => { setSender({ ...sender, email: e.target.value }); set('sEmail', '') }} />
                    </Field>
                  </div>
                </div>
              </fieldset>

              <Twine />

              <fieldset className="flex flex-col gap-5">
                <legend className="font-display text-2xl">For them (in Australia)</legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div {...err('rName')}>
                    <Field label="Recipient's name" htmlFor="r-name" error={errs.rName}>
                      <TextInput id="r-name" value={rec.name} onChange={(e) => { setRec({ ...rec, name: e.target.value }); set('rName', '') }} />
                    </Field>
                  </div>
                  <div {...err('rPhone')}>
                    <Field label="Recipient's phone" htmlFor="r-phone" error={errs.rPhone}>
                      <TextInput id="r-phone" type="tel" inputMode="tel" placeholder="04XX XXX XXX" value={rec.phone} onChange={(e) => { setRec({ ...rec, phone: e.target.value }); set('rPhone', '') }} />
                    </Field>
                  </div>
                </div>
                <div {...err('rAddress')}>
                  <Field label="Street address" htmlFor="r-addr" error={errs.rAddress}>
                    <TextInput id="r-addr" autoComplete="street-address" value={rec.address} onChange={(e) => { setRec({ ...rec, address: e.target.value }); set('rAddress', '') }} />
                  </Field>
                </div>
                <div {...err('rSuburb')}>
                  <Field label="Suburb" htmlFor="r-sub" error={errs.rSuburb}>
                    <TextInput id="r-sub" value={rec.suburb} onChange={(e) => { setRec({ ...rec, suburb: e.target.value }); set('rSuburb', '') }} />
                  </Field>
                </div>
                <div {...err(errs.city ? 'city' : 'date')}>
                  <DeliveryPicker
                    city={g.city}
                    date={date}
                    window={g.window}
                    leadDays={pricing.leadDays}
                    fees={pricing.fees}
                    errors={{ city: errs.city, date: errs.date }}
                    onChange={(patch) => {
                      const { date: d, ...rest } = patch
                      patchCartGift({ ...rest, ...(d !== undefined ? { blueprint: { ...bp, delivery_date: d } } : {}) })
                      setErrs((e) => ({ ...e, ...(patch.city !== undefined ? { city: '' } : {}), ...(d !== undefined ? { date: '' } : {}) }))
                    }}
                  />
                </div>
              </fieldset>

              <Twine />

              <Field label="Message on the card" htmlFor="c-msg" hint="We write it by hand, just as you type it.">
                <TextArea id="c-msg" rows={3} maxLength={200} className="font-note text-xl leading-8" value={msg} onChange={(e) => setMessage(e.target.value)} />
              </Field>

              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className={BTN_PRIMARY}>
                  Continue to payment
                </button>
                <Link to="/cart" className="min-h-11 px-2 py-2 text-sm font-semibold text-brand-text underline underline-offset-4">
                  Back to my gift
                </Link>
              </div>
              {Object.keys(errs).some((k) => errs[k]) ? (
                <p role="alert" className="text-sm font-semibold text-danger-text">
                  A few things need your attention above.
                </p>
              ) : null}
            </form>
          ) : (
            <div className="flex max-w-xl flex-col gap-8">
              <section className="rounded-frame bg-band p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-text">Send this amount</p>
                <p className="mt-1 font-display text-4xl tabular-nums">{formatNpr(totalNpr)}</p>
                <p className="text-sm text-muted">
                  {formatAud(q.totals?.totalAud ?? 0)} at 1 A$ = Rs {pricing.fx}, rate as of {pricing.settings.rateAsOf || 'today'}
                </p>
                <dl className="mt-5 grid gap-1 text-base">
                  <div className="flex gap-3"><dt className="w-32 text-muted">eSewa ID</dt><dd className="font-semibold">tapika (sample)</dd></div>
                </dl>
              </section>

              <ol className="list-decimal space-y-2 pl-5 text-base marker:font-semibold">
                <li>Open eSewa on your phone and choose Send Money.</li>
                <li>Send exactly {formatNpr(totalNpr)} to the eSewa ID above.</li>
                <li>In the remarks, write your name.</li>
                <li>Take a screenshot of the success screen and upload it here.</li>
              </ol>
              <p className="flex items-start gap-2 text-sm text-muted">
                <IconInfo className="mt-0.5 shrink-0" width={20} height={20} />
                This prototype does not take real payments. The eSewa ID above is a sample. In the live shop we check your screenshot against eSewa before we buy anything.
              </p>

              <section>
                <h2 className="font-display text-xl">Payment screenshot</h2>
                <input ref={fileRef} type="file" accept="image/*" tabIndex={-1} aria-hidden="true" className="sr-only" onChange={(e) => void onShot(e.target.files)} />
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <button type="button" className={BTN_SECONDARY} onClick={() => fileRef.current?.click()}>
                    <IconUpload width={22} height={22} /> {shot ? 'Replace screenshot' : 'Upload screenshot'}
                  </button>
                  {shot ? <img src={shot} alt="Your payment screenshot" className="h-24 w-auto rounded-field border border-line" /> : null}
                </div>
                <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-base">
                  <input type="checkbox" checked={instaInstead} onChange={(e) => { setInstaInstead(e.target.checked); setShotErr('') }} className="h-5 w-5 accent-[var(--tp-action-bg)]" />
                  I will send the screenshot on Instagram (@tapika44) instead.
                </label>
                {shotErr ? <p role="alert" className="mt-3 text-sm font-semibold text-danger-text">{shotErr}</p> : null}
              </section>

              {submitErr ? <p role="alert" className="rounded-field bg-danger-soft px-4 py-3 text-sm font-semibold text-on-danger-soft">{submitErr}</p> : null}

              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className={BTN_PRIMARY} disabled={submitting} onClick={place}>
                  <IconLock width={20} height={20} /> {submitting ? 'Booking your gift' : 'I have paid'}
                </button>
                <button type="button" className="min-h-11 px-2 text-sm font-semibold text-brand-text underline underline-offset-4" onClick={() => setStep('details')}>
                  Back to details
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden lg:block" aria-label="Order summary">
          <div className="sticky top-24 flex flex-col gap-5">
            <GiftVisual gift={g} pricing={pricing} />
            <GiftLines gift={{ ...g, blueprint: { ...bp, message: msg } }} pricing={pricing} />
          </div>
        </aside>
      </div>
    </main>
  )
}
