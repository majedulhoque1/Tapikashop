// /about: the story of Tapika. Placeholder copy until the owner confirms it; owner name comes from the OS setting, never hard-coded.
import { createFileRoute, Link } from '@tanstack/react-router'

import { BTN_PRIMARY, Container, PageHead, PlaceholderNote } from '../components/ui'
import { useOS } from '../os/store'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About Tapika' }] }),
  component: About,
})

function About() {
  const owner = useOS().settings.ownerName
  return (
    <main>
      <PageHead eyebrow="About" title="One trusted person between two countries." />
      <Container className="pb-16">
        <div className="max-w-[62ch] space-y-5 text-lg">
          <p>
            Tapika sends gifts from Nepal to people in Australia. When you cannot be there for a birthday, a Rakhi or a Tihar, we can. We buy the gift, wrap it with care and bring it to their door by hand.
          </p>
          <p>
            It is not a warehouse. It is one person, {owner}, who knows that a handwritten card and the right sweets matter more than a fast courier. The personal touch is the product, and our signature piece is the photo-collage frame made from your own pictures.
          </p>
          <p>You pay in rupees with eSewa, the way you already do. You see every price and the delivery date before you pay.</p>
          <PlaceholderNote>The story above is a draft written from the Instagram page. {owner} will confirm or rewrite it.</PlaceholderNote>
          <Link to="/shop" className={`${BTN_PRIMARY} mt-4`}>
            Shop gifts
          </Link>
        </div>
      </Container>
    </main>
  )
}
