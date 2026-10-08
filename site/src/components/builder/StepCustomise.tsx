// Builder step 5: wrap, card style, handwritten message and (for photo frames) up to 12 photos with names and date. Used by routes/build.tsx.
import { useRef, useState } from 'react'

import { PREMIUM_WRAP_ID, RIBBON_ID, productMap } from '../../data/products'
import { fileToSmallDataUrl, MAX_COLLAGE_PHOTOS } from '../../lib/photo'
import { nprExact, type Pricing } from '../../cart/pricing'
import type { BuilderState } from '../../cart/types'
import { CardPaper } from '../CardPaper'
import { IconClose, IconUpload } from '../Icons'
import { OCCASION_LABEL } from '../labels'
import { Price } from '../Price'
import { Field, TextInput } from '../ui'

export const MESSAGE_MAX = 200

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-dashed border-muted/55 pt-6 first:border-0 first:pt-0">
      <h3 className="font-display text-xl">{title}</h3>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Check({ checked, onChange, label, price }: { checked: boolean; onChange: (v: boolean) => void; label: string; price: React.ReactNode }) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-field border-2 px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
        checked ? 'border-ink bg-band' : 'border-line bg-raised'
      }`}
    >
      <span className="flex items-center gap-3">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[var(--tp-action-bg)]" />
        <span className="font-semibold">{label}</span>
      </span>
      {price}
    </label>
  )
}

export function StepCustomise({
  state,
  pricing,
  onChange,
}: {
  state: BuilderState
  pricing: Pricing
  onChange: (s: BuilderState) => void
}) {
  const map = productMap(pricing.products)
  const ribbon = map.get(RIBBON_ID)
  const wrap = map.get(PREMIUM_WRAP_ID)
  const cards = pricing.products.filter((p) => p.category === 'card' && p.inStock)
  const sortedCards = [...cards].sort(
    (a, b) => Number(!!state.occasion && b.occasions.includes(state.occasion)) - Number(!!state.occasion && a.occasions.includes(state.occasion)),
  )
  const isFrame = state.formatId === 'photo-frame'
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')

  async function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return
    setPhotoError('')
    setBusy(true)
    const room = MAX_COLLAGE_PHOTOS - state.collage.photos.length
    const next: string[] = []
    let failed = 0
    for (const f of Array.from(files).slice(0, room)) {
      try {
        next.push(await fileToSmallDataUrl(f))
      } catch {
        failed += 1
      }
    }
    setBusy(false)
    if (failed) setPhotoError('That photo is too large or could not be read. Try a smaller one, or send it to us on Instagram instead.')
    if (files.length > room) setPhotoError(`A frame holds ${MAX_COLLAGE_PHOTOS} photos, so we added the first ${room}.`)
    if (next.length) onChange({ ...state, collage: { ...state.collage, photos: [...state.collage.photos, ...next] } })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-8">
      <Section title="Wrapping" hint="Your gift always comes in its own box, tray or pouch. Add a little more if you like.">
        <div className="flex flex-col gap-3">
          {ribbon ? (
            <Check
              checked={state.ribbon}
              onChange={(v) => onChange({ ...state, ribbon: v })}
              label="Red ribbon"
              price={<Price npr={nprExact(ribbon.priceAud, pricing.fx)} aud={ribbon.priceAud} size="sm" prefix="+" />}
            />
          ) : null}
          {wrap ? (
            <Check
              checked={state.premiumWrap}
              onChange={(v) => onChange({ ...state, premiumWrap: v })}
              label="Premium wrap"
              price={<Price npr={nprExact(wrap.priceAud, pricing.fx)} aud={wrap.priceAud} size="sm" prefix="+" />}
            />
          ) : null}
        </div>
      </Section>

      <Section title="Card" hint={state.occasion ? `Cards that suit a ${OCCASION_LABEL[state.occasion].toLowerCase()} come first.` : undefined}>
        <fieldset>
          <legend className="sr-only">Card style</legend>
          <div className="flex flex-col gap-3">
            {[{ id: null as string | null, name: 'No card', priceAud: 0 }, ...sortedCards].map((c) => {
              const on = state.card === c.id
              return (
                <label
                  key={c.id ?? 'none'}
                  className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-field border-2 px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                    on ? 'border-ink bg-band' : 'border-line bg-raised'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="card" checked={on} onChange={() => onChange({ ...state, card: c.id })} className="h-5 w-5 accent-[var(--tp-action-bg)]" />
                    <span className="font-semibold">{c.name}</span>
                  </span>
                  {c.id ? <Price npr={nprExact(c.priceAud, pricing.fx)} aud={c.priceAud} size="sm" prefix="+" /> : null}
                </label>
              )
            })}
          </div>
        </fieldset>
      </Section>

      <Section title="Your message" hint="We write it by hand on the card, just as you type it.">
        <Field label="Message" htmlFor="msg" hint={`${state.message.length} of ${MESSAGE_MAX}`}>
          <textarea
            id="msg"
            rows={4}
            maxLength={MESSAGE_MAX}
            value={state.message}
            onChange={(e) => onChange({ ...state, message: e.target.value })}
            placeholder="Happy Birthday Sarah! Wish I could be there."
            className="w-full rounded-field border border-field bg-raised px-3.5 py-3 font-note text-xl leading-8 text-ink placeholder:text-muted/70"
          />
        </Field>
        <p className="mb-2 mt-4 text-sm font-semibold">How it will look</p>
        <CardPaper message={state.message} />
        {!state.card && state.message.trim() ? <p className="mt-2 text-sm text-muted">Pick a card above so we have something to write it on.</p> : null}
      </Section>

      {isFrame ? (
        <Section title="Your photos" hint={`Up to ${MAX_COLLAGE_PHOTOS} photos for the collage. They stay on this device in the prototype.`}>
          <input ref={fileRef} id="photos" type="file" accept="image/*" multiple tabIndex={-1} aria-hidden="true" className="sr-only" onChange={(e) => void addPhotos(e.target.files)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border-2 border-ink px-5 font-bold text-ink hover:bg-band"
          >
            <IconUpload width={22} height={22} />
            {busy ? 'Adding photos' : 'Add photos'}
          </button>
          <span className="ml-3 text-sm text-muted" aria-live="polite">
            {state.collage.photos.length} of {MAX_COLLAGE_PHOTOS} added
          </span>
          {photoError ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-danger-text">
              {photoError}
            </p>
          ) : null}
          {state.collage.photos.length ? (
            <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {state.collage.photos.map((src, i) => (
                <li key={i} className="relative aspect-square overflow-hidden rounded-field bg-wrap">
                  <img src={src} alt={`Collage photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() => onChange({ ...state, collage: { ...state.collage, photos: state.collage.photos.filter((_, j) => j !== i) } })}
                    className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-pill bg-raised text-ink shadow-soft"
                  >
                    <IconClose width={16} height={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Names on the frame" htmlFor="fr-names">
              <TextInput id="fr-names" value={state.collage.names} maxLength={40} placeholder="Aarav & Sarah" onChange={(e) => onChange({ ...state, collage: { ...state.collage, names: e.target.value } })} />
            </Field>
            <Field label="Date on the frame" htmlFor="fr-date">
              <TextInput id="fr-date" value={state.collage.date} maxLength={24} placeholder="14 Feb 2024" onChange={(e) => onChange({ ...state, collage: { ...state.collage, date: e.target.value } })} />
            </Field>
          </div>
        </Section>
      ) : null}
    </div>
  )
}
