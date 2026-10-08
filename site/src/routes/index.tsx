// / Home, bright airmail-parcel direction: mint hero stage with a photo collage and a rotating hand-delivered stamp, three plain steps straddling its edge,
// numbered ways to start, festival marquee, popular gifts, the scroll-driven Kathmandu-to-their-door route (signature moment), why Tapika, honest reviews note, closing ask.
import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { templatePriceAud } from '../builder/recommend'
import { availableTemplates, usePricing } from '../cart/pricing'
import { GiftTile } from '../components/GiftTile'
import { IconArrow } from '../components/Icons'
import { BTN_POP_DARK, BTN_POP_LIGHT, Container, Eyebrow } from '../components/ui'
import { BUSINESS } from '../config/business'
import { audToNpr } from '../config/pricing'
import { formatNpr } from '../lib/format'
import { EASE_OUT, gsap, reducedMotion, useGSAP, useReveal } from '../lib/motion'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Tapika - Send a little love to Australia' }] }),
  component: Home,
})

const IMG = '/img/products/'

/* ------------------------------------------------------------------ Hero */

const PRINT_ROTATE = [-4, 5, -3]
const PRINTS = [
  { src: `${IMG}rakhi-gift-box-ornate-rakhi.webp`, alt: 'Gift box tied with a yellow ribbon beside an ornate rakhi', cls: 'left-0 top-[13%] w-[56%]', z: 'z-20' },
  { src: `${IMG}dry-fruit-platter-mithai-garland.webp`, alt: 'Dry fruit platter and mithai box with a marigold garland and a thank-you card', cls: 'right-0 top-0 w-[40%]', z: 'z-10' },
  { src: `${IMG}red-teddy-bears-group.webp`, alt: 'A group of red teddy bears holding love hearts', cls: 'right-[1%] top-[49%] w-[39%]', z: 'z-30' },
]

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className={className}>
      <path d="M9 0 L11 7 L18 9 L11 11 L9 18 L7 11 L0 9 L7 7 Z" fill="currentColor" />
    </svg>
  )
}

function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-[1/1.1] w-full max-w-[560px]">
      <div className="hero-sun absolute left-[8%] top-[10%] aspect-square w-[84%] rounded-pill bg-accent" data-reveal="manual" aria-hidden="true" />
      {PRINTS.map((p) => (
        <figure key={p.src} className={`hero-print print absolute ${p.cls} ${p.z}`} data-reveal="manual">
          <img src={p.src} alt={p.alt} className="aspect-[4/5] w-full rounded-[12px] object-cover" loading="eager" decoding="async" />
        </figure>
      ))}

      {/* Stamp: turns as you scroll. */}
      <div className="hero-stamp absolute -left-[3%] -top-[3%] z-40 w-[27%] min-w-[96px]" data-reveal="manual" aria-hidden="true">
        <svg viewBox="0 0 120 120" className="hero-stamp-spin w-full drop-shadow-[3px_3px_0_#14191C]">
          <circle cx="60" cy="60" r="58" fill="#FF6B81" stroke="#14191C" strokeWidth="3" />
          <circle cx="60" cy="60" r="35" fill="none" stroke="#14191C" strokeWidth="2" strokeDasharray="3 5" />
          <defs>
            <path id="stamp-path" d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" />
          </defs>
          <text fontSize="11.6" fontWeight="800" letterSpacing="1.9" fill="#14191C" style={{ fontFamily: 'var(--tp-font-text)' }}>
            <textPath href="#stamp-path">HAND-DELIVERED · NEPAL TO AUSTRALIA ·</textPath>
          </text>
          <path d="M60 41 L65 55 L79 60 L65 65 L60 79 L55 65 L41 60 L55 55 Z" fill="#14191C" />
        </svg>
      </div>

      {/* Gift tag. The handwriting is the gift-message moment, so Kalam is allowed here. */}
      <div className="hero-tag absolute -bottom-[2%] left-[2%] z-40 origin-top" data-reveal="manual">
        <svg width="2" height="26" className="ml-8 block" aria-hidden="true">
          <line x1="1" y1="0" x2="1" y2="26" stroke="#14191C" strokeWidth="2" strokeDasharray="2 4" />
        </svg>
        <div className="relative rounded-[14px] border-2 border-ink bg-raised px-5 pb-3.5 pt-6 text-[#14191C] shadow-[4px_4px_0_0_#14191C]">
          <span className="absolute left-8 top-2 h-3 w-3 -translate-x-1/2 rounded-pill border-2 border-ink bg-minty" aria-hidden="true" />
          <p className="whitespace-nowrap font-note text-lg leading-snug md:text-xl">For Didi, in Melbourne.</p>
          <p className="whitespace-nowrap font-note text-lg leading-snug md:text-xl">Love from Kathmandu.</p>
        </div>
      </div>
    </div>
  )
}

const HERO_STEPS = [
  { title: 'Choose', text: 'A ready-made gift, or build your own box.' },
  { title: 'Pay in NPR', text: 'Send it on eSewa, upload the screenshot.' },
  { title: 'We deliver', text: `By hand, in ${BUSINESS.cities.length} Australian cities.` },
]

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const pricing = usePricing()
  const fromNpr = availableTemplates(pricing.products).reduce<number | null>((min, t) => {
    const npr = audToNpr(templatePriceAud(t, pricing.products), pricing.fx)
    return min === null || npr < min ? npr : min
  }, null)

  useGSAP(
    () => {
      if (reducedMotion()) {
        gsap.set('.hero-print', { autoAlpha: 1, rotate: (i) => PRINT_ROTATE[i] ?? 0 })
        gsap.set('.hero-tag, .hero-fade, .hero-stamp, .hero-sun', { autoAlpha: 1 })
        gsap.set('.hero-hl', { scaleX: 1 })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: EASE_OUT } })
      tl.from('.hero-line > span', { yPercent: 110, duration: 1.1, stagger: 0.09 })
        .fromTo('.hero-hl', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.out' }, 0.6)
        .fromTo('.hero-fade', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.4)
        .fromTo('.hero-sun', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.3, ease: 'back.out(1.3)' }, 0.1)
        .fromTo(
          '.hero-print',
          { autoAlpha: 0, y: -80, rotate: (i) => [-16, 14, -12][i] ?? 0, scale: 1.06 },
          { autoAlpha: 1, y: 0, rotate: (i) => PRINT_ROTATE[i] ?? 0, scale: 1, duration: 1.1, stagger: 0.12 },
          0.3,
        )
        .fromTo('.hero-stamp', { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(2)' }, 0.95)
        // The tag lands last and swings once on its string.
        .fromTo('.hero-tag', { autoAlpha: 0, rotate: -24 }, { autoAlpha: 1, rotate: 0, duration: 1.6, ease: 'elastic.out(1, 0.45)' }, 1.05)

      // Scroll-linked, desktop only: prints drift apart and the stamp turns. On phones the prints sit under the copy.
      if (window.matchMedia('(min-width: 1024px)').matches) {
        const st = { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
        gsap.to('.hero-print', { y: (i) => [-8, -26, 12][i] ?? 0, ease: 'none', scrollTrigger: st })
        gsap.to('.hero-stamp-spin', { rotate: 260, ease: 'none', scrollTrigger: st })
      }
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="relative">
      <div className="relative overflow-hidden bg-minty pb-24 md:pb-28">
        {/* Dot grid and sparkles: texture on the mint stage. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(255_255_255/0.55)_1.4px,transparent_1.6px)] [background-size:22px_22px]" />
        <Sparkle className="pointer-events-none absolute left-[46%] top-12 hidden h-7 w-7 text-[#14191C] lg:block" />
        <Sparkle className="pointer-events-none absolute bottom-24 left-[3%] hidden h-5 w-5 text-[#FFFDF8] lg:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-8 md:px-12 md:pt-14 lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:pt-16">
          <div>
            <p className="hero-fade" data-reveal="manual">
              <span className="inline-flex items-center gap-2 rounded-pill border-2 border-ink bg-raised px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-ink shadow-[3px_3px_0_0_#14191C]">
                <Sparkle className="h-3 w-3 text-[#FF6B81]" />
                <span className="sm:hidden">Nepal to Australia, by hand</span>
                <span className="hidden sm:inline">Gifts from Nepal, hand-delivered in Australia</span>
              </span>
            </p>

            <h1 className="mt-7 font-display text-[clamp(2.9rem,1.4rem+5.2vw,5.6rem)] leading-[1] tracking-[-0.025em] text-ink">
              <span className="hero-line block overflow-hidden pb-[0.06em]"><span className="block">Send a little</span></span>
              <span className="hero-line block overflow-hidden pb-[0.1em]">
                <span className="block">
                  <span className="relative inline-block px-[0.14em]">
                    <span aria-hidden="true" className="hero-hl absolute inset-x-0 bottom-[0.04em] top-[0.12em] origin-left -rotate-2 rounded-[0.16em] bg-accent" />
                    <span className="relative">love</span>
                  </span>{' '}
                  to
                </span>
              </span>
              <span className="hero-line block overflow-hidden pb-[0.06em]"><span className="block">Australia.</span></span>
            </h1>

            {/* The plain-words explanation: what it is, how you pay, who delivers. */}
            <p className="hero-fade mt-6 max-w-[36ch] text-lg font-medium leading-snug text-ink md:text-xl" data-reveal="manual">
              Order and pay here in Nepal with eSewa. We wrap it by hand and deliver it to their door in Australia.
            </p>
            <div className="hero-fade mt-8 flex flex-wrap items-center gap-x-4 gap-y-4" data-reveal="manual">
              <Link to="/build" className={`${BTN_POP_DARK} group`}>
                Build a gift <IconArrow width={20} height={20} className="transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
              <Link to="/shop" className={BTN_POP_LIGHT}>
                Shop gifts
              </Link>
              {fromNpr ? (
                <span className="basis-full text-sm text-ink">
                  Gifts from <strong className="font-bold">{formatNpr(fromNpr)}</strong>. Delivery fee shown before you pay.
                </span>
              ) : null}
            </div>
          </div>

          <HeroCollage />
        </div>
      </div>

      {/* Three plain steps, straddling the hero's lower edge. */}
      <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 md:-mt-16 md:px-12">
        <h2 className="sr-only">How it works in three steps</h2>
        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {HERO_STEPS.map((st, i) => (
            <li key={st.title} data-reveal className="flex items-start gap-4 rounded-frame border-2 border-ink bg-raised p-5 shadow-[5px_5px_0_0_#14191C]">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border-2 border-ink bg-accent font-display text-xl tabular-nums text-ink">{i + 1}</span>
              <div>
                <p className="font-display text-xl leading-tight">{st.title}</p>
                <p className="mt-1 text-muted">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- Three ways to start */

const PATHS = [
  { to: '/shop' as const, n: '01', title: 'Shop gifts', text: 'Ready-made gifts for birthdays, Rakhi, festivals and love.', img: 'rakhi-hamper-gift-basket.webp' },
  { to: '/build' as const, n: '02', title: 'Build a gift', text: 'Choose a box, fill it yourself, write your own message.', img: 'birthday-number-box-white-bg.webp' },
  { to: '/help' as const, n: '03', title: 'Help me choose', text: 'Five quick questions. Three gifts that fit.', img: 'valentine-note-card.webp' },
]

function ThreeWays() {
  return (
    <Container className="pb-6 pt-20 md:pt-28">
      <Eyebrow>Three ways to start</Eyebrow>
      <ul className="mt-6 border-t-2 border-dashed border-muted/55">
        {PATHS.map((p) => (
          <li key={p.to} className="border-b-2 border-dashed border-muted/55" data-reveal>
            <Link to={p.to} className="group relative flex items-center gap-5 overflow-hidden py-6 md:gap-10 md:py-8">
              {/* Yellow wash slides in from the left on hover. */}
              <span aria-hidden="true" className="absolute inset-0 -z-10 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <span className="w-10 font-display text-lg tabular-nums text-brand-text md:w-16 md:text-xl">{p.n}</span>
              <span className="flex-1 font-display text-[clamp(1.9rem,1.2rem+3vw,3.6rem)] leading-none tracking-[-0.02em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                {p.title}
              </span>
              <span className="hidden max-w-[30ch] text-muted transition-colors group-hover:text-ink lg:block">{p.text}</span>
              {/* A peek of a real gift, tilted like a print. Desktop hover only. */}
              <img
                src={`${IMG}${p.img}`}
                alt=""
                loading="lazy"
                className="pointer-events-none absolute right-[22%] top-1/2 hidden h-36 w-28 -translate-y-1/2 rotate-6 scale-75 rounded-[14px] border-2 border-ink object-cover opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:-rotate-3 group-hover:scale-100 group-hover:opacity-100 xl:block"
              />
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-pill border-2 border-ink bg-raised transition-colors duration-150 group-hover:bg-action group-hover:text-on-action md:h-14 md:w-14">
                <IconArrow width={22} height={22} className="transition-transform duration-300 ease-out group-hover:-rotate-45" />
              </span>
            </Link>
            <p className="-mt-3 pb-5 pl-[3.75rem] text-muted lg:hidden">{p.text}</p>
          </li>
        ))}
      </ul>
    </Container>
  )
}

/* ------------------------------------------------------- Festival marquee */

const FESTIVALS: { en: string; ne?: string }[] = [
  { en: 'Rakhi', ne: 'रक्षाबन्धन' },
  { en: 'Teej', ne: 'तीज' },
  { en: 'Dashain', ne: 'दशैं' },
  { en: 'Tihar', ne: 'तिहार' },
  { en: 'Birthdays' },
  { en: "Valentine's" },
  { en: 'Just because' },
]

function FestivalMarquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {FESTIVALS.map((f) => (
        <li key={f.en} className="flex items-center gap-4 px-6 md:gap-6 md:px-10">
          <span className="font-display text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] leading-none">{f.en}</span>
          {f.ne ? (
            <span lang="ne" className="text-xl font-bold text-minty md:text-2xl">
              {f.ne}
            </span>
          ) : null}
          <Sparkle className="ml-4 h-[18px] w-[18px] shrink-0 text-accent md:ml-8" />
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label="Occasions we wrap for" className="marquee mt-20 overflow-hidden bg-deep py-7 text-on-deep md:mt-28 md:py-9">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ Popular gifts */

function PopularGifts() {
  const pricing = usePricing()
  const popular = availableTemplates(pricing.products).filter((t) => t.starter).slice(0, 4)
  const [first, ...rest] = popular

  return (
    <Container className="pt-20 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
        <div>
          <Eyebrow>Popular gifts</Eyebrow>
          <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">Easy to say yes to.</h2>
        </div>
        <Link to="/shop" className="draw-line font-semibold text-brand-text">
          See all gifts
        </Link>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-12 lg:gap-y-12">
        {first ? (
          <li className="col-span-2 lg:col-span-6 lg:row-span-2" data-reveal>
            <GiftTile t={first} pricing={pricing} eager size="lg" ratio="4 / 4.4" />
          </li>
        ) : null}
        {rest.map((t, i) => (
          <li key={t.id} className={i === 2 ? 'col-span-2 lg:col-span-6' : 'lg:col-span-3'} data-reveal>
            <GiftTile t={t} pricing={pricing} ratio={i === 2 ? '16 / 9' : '4 / 5'} />
          </li>
        ))}
      </ul>
    </Container>
  )
}

/* ---------------------------------------- The journey (signature moment) */

const STEPS = [
  { title: 'Choose', place: 'Kathmandu, on your phone', text: 'Pick a ready-made gift, or build your own from a box, hamper or platter.' },
  { title: 'Personalise', place: 'Your words, your photos', text: 'Add a handwritten card, wrapping and, for frames, your own photos.' },
  { title: 'We prepare', place: 'Our table in Australia', text: 'We buy everything, assemble it and wrap it by hand.' },
  { title: 'We deliver', place: 'Their front door', text: 'We deliver it to their door in Australia on the day you choose.' },
]

// Three route legs through the four stops. Separate paths so each leg takes exactly a third of the scroll.
const LEGS = ['M90 96 C 230 10, 400 40, 450 160', 'M450 160 C 500 270, 250 220, 196 336', 'M196 336 C 140 450, 420 530, 556 462']
const STOPS = [
  [90, 96],
  [450, 160],
  [196, 336],
  [556, 462],
] as const
const LABEL_POS = [
  { x: 90, y: 140, anchor: 'middle' },
  { x: 470, y: 120, anchor: 'start' },
  { x: 170, y: 380, anchor: 'end' },
  { x: 556, y: 512, anchor: 'middle' },
] as const

function Journey() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      if (reducedMotion()) {
        setActive(3)
        gsap.set('.parcel', { x: STOPS[3][0] - 22, y: STOPS[3][1] - 22 })
        return
      }
      const legs = gsap.utils.toArray<SVGPathElement>('.leg-draw')
      legs.forEach((l) => {
        const len = l.getTotalLength()
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len })
      })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=2000',
          pin: '.journey-stage',
          scrub: 0.7,
          onUpdate: (self) => setActive(Math.min(3, Math.floor(self.progress * 3 + 0.04))),
        },
      })
      legs.forEach((l, i) => {
        tl.to(l, { strokeDashoffset: 0, duration: 1 }, i).to('.parcel', { duration: 1, motionPath: { path: l, align: l, alignOrigin: [0.5, 0.5], autoRotate: false } }, i)
      })
      tl.to('.parcel', { scale: 1.25, duration: 0.25, ease: 'back.out(3)' }, 3)
    },
    { scope: ref },
  )

  return (
    <section ref={ref} aria-labelledby="journey-title" className="relative mt-20 md:mt-28">
      <div className="journey-stage flex min-h-[100svh] items-center bg-band">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 md:px-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 id="journey-title" className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">
              From your phone to their door.
            </h2>

            {/* Desktop: the whole route as a list, the current stop open. */}
            <ol className="mt-10 hidden lg:block">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative border-t-2 border-dashed border-ink/30 py-5 pl-14 transition-opacity duration-500" style={{ opacity: i <= active ? 1 : 0.4 }}>
                  <span
                    className={`absolute left-0 top-5 inline-flex h-9 w-9 items-center justify-center rounded-pill border-2 border-ink font-display text-base tabular-nums transition-colors duration-300 ${i <= active ? 'bg-action text-on-action' : 'bg-raised'}`}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{s.place}</p>
                  <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
                  <p className={`mt-1 max-w-[42ch] text-muted transition-[max-height,opacity] duration-500 ${i === active ? 'max-h-24 opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>{s.text}</p>
                </li>
              ))}
            </ol>

            {/* Phone: only the current stop, so the pinned stage fits one screen. */}
            <div className="mt-5 min-h-[8.5rem] lg:hidden" aria-live="polite">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                Step {active + 1} of 4 · {STEPS[active]?.place}
              </p>
              <h3 className="mt-1 font-display text-2xl">{STEPS[active]?.title}</h3>
              <p className="mt-1 text-muted">{STEPS[active]?.text}</p>
            </div>
          </div>

          <figure className="relative rounded-frame border-2 border-ink bg-raised p-2 shadow-[6px_6px_0_0_#14191C] md:p-4">
            <svg viewBox="0 0 640 560" className="h-auto max-h-[46svh] w-full lg:max-h-[72svh]" role="img" aria-label="A parcel travels from Kathmandu, through your message and our table in Australia, to their front door.">
              {LEGS.map((d) => (
                <path key={`base-${d}`} d={d} fill="none" stroke="var(--tp-twine)" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round" opacity=".5" />
              ))}
              {LEGS.map((d) => (
                <path key={`draw-${d}`} className="leg-draw" d={d} fill="none" stroke="#FF6B81" strokeWidth="4" strokeLinecap="round" />
              ))}
              {STOPS.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={i === 3 ? 14 : 11} fill={i <= active ? (i === 3 ? '#FFD23F' : '#62D2B5') : '#FFFFFF'} stroke="#14191C" strokeWidth="2.5" style={{ transition: 'fill 300ms' }} />
                  <text x={LABEL_POS[i]?.x} y={LABEL_POS[i]?.y} textAnchor={LABEL_POS[i]?.anchor} fill="#14191C" style={{ fontFamily: 'var(--tp-font-display)', fontSize: 22 }}>
                    {STEPS[i]?.title}
                  </text>
                </g>
              ))}
              {/* The parcel: kraft box, twine cross, a mint bow. Starts at the first stop. */}
              <g className="parcel" transform={`translate(${STOPS[0][0] - 22} ${STOPS[0][1] - 22})`}>
                <rect x="0" y="6" width="44" height="38" rx="7" fill="#DDBF98" stroke="#14191C" strokeWidth="2.5" />
                <line x1="22" y1="6" x2="22" y2="44" stroke="#14191C" strokeWidth="2.5" strokeDasharray="3 3" />
                <line x1="0" y1="24" x2="44" y2="24" stroke="#14191C" strokeWidth="2.5" strokeDasharray="3 3" />
                <path d="M22 6 C 12 -4, 6 6, 22 6 C 38 6, 32 -4, 22 6 Z" fill="#62D2B5" stroke="#14191C" strokeWidth="2.2" />
              </g>
            </svg>
          </figure>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Why us */

const POSITIONING = 'The hand that is there when you cannot be.'

const WHY = [
  { title: 'One person, not a warehouse', text: 'We buy each gift, wrap it and deliver it by hand. Nothing sits on a shelf waiting.' },
  { title: 'Paid in rupees, the way you already do', text: 'Prices show in NPR first. You pay with eSewa and upload the screenshot.' },
  { title: 'Personal touches that matter', text: 'Handwritten cards and photo-collage frames made from your own pictures.' },
  { title: 'No surprises', text: 'You see the delivery fee, the earliest date and the exact total before you pay.' },
]

function WhyTapika() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.fromTo(
        '.why-word',
        { opacity: 0.2 },
        { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.why-line', start: 'top 80%', end: 'bottom 45%', scrub: true } },
      )
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="bg-blush py-20 md:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.08em] text-ink">
              <span aria-hidden="true" className="w-7 border-t-2 border-dashed border-current" />
              Why Tapika
            </p>
            <h2 className="why-line mt-5 font-display text-[clamp(2.6rem,1.4rem+5vw,5.6rem)] leading-[1.02] tracking-[-0.025em]">
              {POSITIONING.split(' ').map((w, i) => (
                <span key={i} className="why-word">
                  {w}{' '}
                </span>
              ))}
            </h2>
          </div>
          <figure data-reveal className="mx-auto w-full max-w-sm rotate-2 lg:mx-0">
            <div className="print">
              <img src={`${IMG}thank-you-card-gift-box.webp`} alt="Gift box with a Tapika thank-you card tucked inside" loading="lazy" className="aspect-[4/5] w-full rounded-[12px] object-cover" />
            </div>
            <figcaption className="mt-4 text-sm font-medium text-ink">Every gift leaves with a card. The words are yours.</figcaption>
          </figure>
        </div>

        <ul className="mt-16 grid gap-x-12 md:mt-24 md:grid-cols-2">
          {WHY.map((w, i) => (
            <li key={w.title} className="flex gap-5 border-t-2 border-dashed border-ink/30 py-7" data-reveal>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border-2 border-ink bg-raised font-display text-lg tabular-nums">{i + 1}</span>
              <div>
                <h3 className="font-display text-xl md:text-2xl">{w.title}</h3>
                <p className="mt-2 max-w-[44ch] text-ink/80">{w.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/* ---------------------------------------------- Reviews (honest) + eSewa */

function KindWordsAndPayment() {
  return (
    <Container className="grid gap-16 pt-20 md:pt-28 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
      <div data-reveal>
        <Eyebrow>Kind words</Eyebrow>
        <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">From people who have sent a gift.</h2>
        {/* An envelope still on its way. We only show real words, with permission and no names. */}
        <div className="relative mt-8 overflow-hidden rounded-frame border-2 border-ink bg-accent text-[#14191C] shadow-[6px_6px_0_0_#14191C]">
          <div aria-hidden="true" className="envelope-flap absolute inset-x-0 top-0 h-24 bg-[#F2B90F]" />
          <div className="relative px-6 pb-8 pt-28 md:px-10">
            <p className="font-display text-2xl">The letters are still in the post.</p>
            <p className="mt-2 max-w-[52ch]">
              We will only show words from real customers, with their permission and no names. Until then, read what people say on{' '}
              <a className="font-bold underline underline-offset-4" href="https://www.instagram.com/tapika44/" target="_blank" rel="noopener noreferrer">
                @tapika44
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <div data-reveal className="flex flex-col justify-end">
        <div className="flex items-start gap-6">
          {/* Postmark */}
          <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-12 text-[#14191C]" aria-hidden="true">
            <circle cx="60" cy="60" r="56" fill="#62D2B5" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
            <defs>
              <path id="pm" d="M60 60 m-50 0 a50 50 0 1 1 100 0 a50 50 0 1 1 -100 0" />
            </defs>
            <text fontSize="11.5" fontWeight="800" letterSpacing="2.4" fill="currentColor" style={{ fontFamily: 'var(--tp-font-text)' }}>
              <textPath href="#pm">PAID IN NEPAL · DELIVERED IN AUSTRALIA ·</textPath>
            </text>
            <text x="60" y="58" textAnchor="middle" fontSize="20" fill="currentColor" style={{ fontFamily: 'var(--tp-font-display)' }}>
              eSewa
            </text>
            <text x="60" y="76" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor" style={{ fontFamily: 'var(--tp-font-text)' }}>
              NPR
            </text>
          </svg>
          <div>
            <h2 className="font-display text-2xl">Pay with eSewa.</h2>
            <p className="mt-2 text-muted">
              Prices are shown in rupees first, with Australian dollars beside them. You send the money on eSewa and upload the screenshot at checkout.
            </p>
            <Link to="/faq" className="draw-line mt-4 inline-block font-semibold text-brand-text">
              Questions about paying
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}

/* ------------------------------------------------------------- Closing */

function ClosingAsk() {
  return (
    <section className="relative mt-24 overflow-hidden bg-minty md:mt-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(255_255_255/0.55)_1.4px,transparent_1.6px)] [background-size:22px_22px]" />
      <Container className="relative py-20 text-center md:py-28">
        <p lang="ne" className="text-xl font-bold text-ink" data-reveal>
          माया पठाउनुहोस्
        </p>
        <h2 className="mx-auto mt-3 max-w-[16ch] font-display text-[clamp(2.4rem,1.3rem+4.6vw,5rem)] leading-[1.02] tracking-[-0.025em] text-ink" data-reveal>
          Who are you thinking of today?
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-4" data-reveal>
          <Link to="/help" className={BTN_POP_DARK}>
            Help me choose
          </Link>
          <Link to="/shop" className={BTN_POP_LIGHT}>
            Shop gifts
          </Link>
        </div>
      </Container>
    </section>
  )
}

function Home() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <main ref={ref}>
      <Hero />
      <ThreeWays />
      <FestivalMarquee />
      <PopularGifts />
      <Journey />
      <WhyTapika />
      <KindWordsAndPayment />
      <ClosingAsk />
    </main>
  )
}
