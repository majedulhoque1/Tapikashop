// Site footer: story line, links, Instagram, policies, an unhighlighted Admin link and the prototype note. Rendered by SiteChrome.
import { Link } from '@tanstack/react-router'

import { IconInstagram } from './Icons'
import { LogoLockup } from './Logo'

export const INSTAGRAM_URL = 'https://www.instagram.com/tapika44/'

export function Footer({ flush = false }: { flush?: boolean }) {
  const col = 'flex flex-col gap-2 text-sm'
  const a = 'py-1 hover:underline underline-offset-4'
  return (
    <footer className={`${flush ? '' : 'mt-16'} bg-deep text-on-deep`}>
      <div className="airmail h-3" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <LogoLockup className="h-10 w-auto" />
            <p className="mt-4 max-w-xs font-display text-xl leading-snug">Send a little love to Australia.</p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-pill border border-on-deep/40 px-4 py-2 text-sm font-semibold hover:bg-on-deep hover:text-deep"
            >
              <IconInstagram width={20} height={20} />
              @tapika44
            </a>
          </div>
          <nav aria-label="Gifts" className={col}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] opacity-70">Gifts</p>
            <Link to="/shop" className={a}>Shop gifts</Link>
            <Link to="/build" className={a}>Build a gift</Link>
            <Link to="/help" className={a}>Help me choose</Link>
            <Link to="/cart" className={a}>Your gift</Link>
          </nav>
          <nav aria-label="Help" className={col}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] opacity-70">Help</p>
            <Link to="/track" className={a}>Track order</Link>
            <Link to="/how-it-works" className={a}>How it works</Link>
            <Link to="/faq" className={a}>FAQ</Link>
            <Link to="/about" className={a}>About Tapika</Link>
          </nav>
          <nav aria-label="Policies" className={col}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] opacity-70">Policies</p>
            <Link to="/policies" hash="delivery" className={a}>Delivery</Link>
            <Link to="/policies" hash="refunds" className={a}>Refunds</Link>
            <Link to="/policies" hash="terms" className={a}>Terms</Link>
            <Link to="/policies" hash="privacy" className={a}>Privacy</Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-on-deep/30 pt-5 text-xs opacity-80">
          <p>Prototype · sample prices</p>
          <p>Payments are made in NPR through eSewa.</p>
          <Link to="/os" className="opacity-70 hover:opacity-100">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
