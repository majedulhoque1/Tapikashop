// /policies: delivery, refunds, terms and privacy as short placeholder sections (anchors #delivery #refunds #terms #privacy), flagged for the owner to confirm.
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { usePricing } from '../cart/pricing'
import { BUSINESS } from '../config/business'
import { Container, PageHead, PlaceholderNote } from '../components/ui'

export const Route = createFileRoute('/policies')({
  head: () => ({ meta: [{ title: 'Policies - Tapika' }] }),
  component: Policies,
})

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t-2 border-dashed border-muted/55 py-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-lg text-muted">{children}</div>
    </section>
  )
}

function Policies() {
  const { leadDays } = usePricing()
  return (
    <main>
      <PageHead eyebrow="Policies" title="The fine print, in plain words." />
      <Container className="pb-16">
        <div className="max-w-3xl">
          <PlaceholderNote>All wording on this page is a draft until the owner confirms it, including refunds on food.</PlaceholderNote>
          <Section id="delivery" title="Delivery">
            <p>
              We deliver by hand in {BUSINESS.cities.join(', ')}. We need {leadDays} days between ordering and the delivery date. The delivery fee depends on the city and is shown before you pay.
            </p>
            <p>If nobody is home we will contact the recipient to arrange another time.</p>
          </Section>
          <Section id="refunds" title="Refunds">
            <p>If something arrives damaged or is not what you ordered, tell us within 24 hours with a photo and we will make it right.</p>
            <p>Food and personalised items (such as a photo frame) cannot be returned once made, unless there is a fault.</p>
          </Section>
          <Section id="terms" title="Terms">
            <p>
              An order is booked once we have checked your eSewa payment. Prices are in NPR and are set at the exchange rate shown at checkout. We may suggest a close match if an item becomes unavailable.
            </p>
          </Section>
          <Section id="privacy" title="Privacy">
            <p>
              We keep the names, phone numbers, addresses and photos you give us only to prepare and deliver your gift. We never show your photos or messages publicly without your written permission.
            </p>
          </Section>
        </div>
      </Container>
    </main>
  )
}
