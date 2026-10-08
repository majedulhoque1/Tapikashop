// /faq: short answers to the questions buyers ask first. Placeholder wording the owner confirms; lead time and cities come from config.
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { usePricing } from '../cart/pricing'
import { BUSINESS } from '../config/business'
import { Container, PageHead, PlaceholderNote } from '../components/ui'

export const Route = createFileRoute('/faq')({
  head: () => ({ meta: [{ title: 'FAQ - Tapika' }] }),
  component: Faq,
})

function Faq() {
  const { leadDays } = usePricing()
  const items: [string, ReactNode][] = [
    ['Where do you deliver?', `We deliver by hand in ${BUSINESS.cities.join(', ')}. Delivery fees differ by city and are shown before you pay.`],
    ['How soon can a gift arrive?', `We need ${leadDays} days between your order and the delivery date. The calendar greys out days that are too soon.`],
    ['How do I pay?', 'With eSewa, in rupees. At checkout you send the amount to our eSewa ID and upload the screenshot. We check it before we buy anything.'],
    ['What is the exchange rate?', 'We show prices in rupees first and Australian dollars beside them. The rate and its date are shown at checkout, and your order keeps the rate it was placed at.'],
    ['Can I add my own photos?', 'Yes. Choose Photo Frame in the Gift Builder and upload up to 12 photos, plus names and a date for the frame.'],
    ['Can I track my gift?', 'Yes. Use Track order with your order number and the last 4 digits of the phone you ordered with.'],
    ['Can I change or cancel an order?', 'Message @tapika44 on Instagram with your order number as soon as you can. What we can change depends on how far along it is.'],
    ['What if something is out of stock?', 'Items we cannot get are hidden from the shop and the builder. If something goes wrong after you order, we will tell you and suggest a close match.'],
  ]
  return (
    <main>
      <PageHead eyebrow="FAQ" title="Questions people ask first." />
      <Container className="pb-16">
        <div className="max-w-3xl">
          <div className="divide-y divide-dashed divide-muted/50 border-y-2 border-dashed border-muted/55">
            {items.map(([q, a]) => (
              <details key={q} className="group py-1">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 font-display text-xl">
                  {q}
                  <span aria-hidden="true" className="text-2xl text-brand-text transition-transform duration-150 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-4 text-lg text-muted">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8">
            <PlaceholderNote>Answers about changes and cancellations are drafts until the owner confirms them.</PlaceholderNote>
          </div>
          <p className="mt-6 text-lg">
            Still stuck? Message{' '}
            <a className="font-semibold text-brand-text underline underline-offset-4" href="https://www.instagram.com/tapika44/" target="_blank" rel="noopener noreferrer">
              @tapika44
            </a>{' '}
            on Instagram, or{' '}
            <Link to="/help" className="font-semibold text-brand-text underline underline-offset-4">
              let us suggest a gift
            </Link>
            .
          </p>
        </div>
      </Container>
    </main>
  )
}
