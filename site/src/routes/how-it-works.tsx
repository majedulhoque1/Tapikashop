// /how-it-works: the four steps in more detail, plus timing and payment basics.
import { createFileRoute, Link } from '@tanstack/react-router'

import { usePricing } from '../cart/pricing'
import { BTN_PRIMARY, Container, PageHead, Twine } from '../components/ui'

export const Route = createFileRoute('/how-it-works')({
  head: () => ({ meta: [{ title: 'How it works - Tapika' }] }),
  component: HowItWorks,
})

function HowItWorks() {
  const { leadDays } = usePricing()
  const steps = [
    { t: 'Choose', d: 'Shop a ready-made gift, or use the Gift Builder: pick who it is for, the occasion, then a box, hamper, platter, photo frame or a few small things. Not sure? Help me choose gives you three ideas from five questions.' },
    { t: 'Personalise', d: 'Pick a card and write your message. We write it by hand. Add a ribbon or premium wrap. For a photo-collage frame, upload up to 12 photos and tell us the names and date for the frame.' },
    { t: 'We prepare', d: `Once your eSewa payment is confirmed, we buy everything, assemble the gift and wrap it. We need ${leadDays} days between your order and the delivery date.` },
    { t: 'We deliver', d: 'We deliver by hand to the address you give us in Sydney, Melbourne, Brisbane, Perth, Adelaide or Canberra, on the day you choose. You can track the gift with your order number.' },
  ]
  return (
    <main>
      <PageHead eyebrow="How it works" title="From your phone in Nepal to their door in Australia." />
      <Container className="pb-16">
        <ol className="max-w-3xl">
          {steps.map((s, i) => (
            <li key={s.t} className="grid grid-cols-[3rem_1fr] gap-4 border-t-2 border-dashed border-muted/55 py-8">
              <span className="font-display text-4xl tabular-nums text-brand-text">{i + 1}</span>
              <div>
                <h2 className="font-display text-2xl">{s.t}</h2>
                <p className="mt-2 max-w-[62ch] text-lg text-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <Twine />
        <section className="mt-10 max-w-3xl">
          <h2 className="font-display text-2xl">Paying</h2>
          <p className="mt-2 max-w-[62ch] text-lg text-muted">
            You pay in rupees with eSewa. At checkout we show the amount and the eSewa ID. After you send the money, you upload the screenshot and we check it before we buy anything.
          </p>
        </section>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/build" className={BTN_PRIMARY}>
            Build a gift
          </Link>
          <Link to="/faq" className="inline-flex min-h-12 items-center font-semibold text-brand-text underline underline-offset-4">
            Read the FAQ
          </Link>
        </div>
      </Container>
    </main>
  )
}
