// Site header: logo, main links, cart count, mobile menu. Rendered by SiteChrome on every customer page.
import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useCart } from '../cart/store'
import { IconBag, IconClose, IconMenu } from './Icons'
import { LogoLockup } from './Logo'

const LINKS = [
  { to: '/shop', label: 'Shop gifts' },
  { to: '/build', label: 'Build a gift' },
  { to: '/help', label: 'Help me choose' },
  { to: '/how-it-works', label: 'How it works' },
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const cart = useCart()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => setOpen(false), [pathname])

  const linkCls = (to: string) =>
    `draw-line mx-3 py-1 text-sm font-semibold ${pathname === to ? 'text-brand-text' : 'text-ink'}`

  return (
    <header className="sticky top-0 z-30 border-b border-dashed border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-12">
        <Link to="/" aria-label="Tapika, home" className="text-ink">
          <LogoLockup className="h-9 w-auto md:h-10" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={`${linkCls(l.to)} ${l.to === '/build' ? 'lg:hidden' : ''}`} aria-current={pathname === l.to ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <Link to="/track" className={linkCls('/track')}>
            Track order
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/build" className="mr-2 hidden min-h-10 items-center rounded-pill bg-action px-4 text-sm font-bold text-on-action transition-[background-color,transform] duration-150 hover:bg-action-hover active:scale-[.98] lg:inline-flex">
            Build a gift
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-11 items-center gap-2 rounded-pill px-3 text-sm font-semibold text-ink hover:text-brand-text"
            aria-label={cart ? 'Your gift, 1 item' : 'Your gift, empty'}
          >
            <IconBag />
            <span className="hidden sm:inline">Your gift</span>
            {cart ? <span className="h-2 w-2 rounded-pill bg-action" aria-hidden="true" /> : null}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-line bg-surface px-4 pb-5 pt-2 md:hidden">
          <ul className="flex flex-col">
            {[...LINKS, { to: '/track', label: 'Track order' }].map((l) => (
              <li key={l.to} className="border-b border-dashed border-line last:border-0">
                <Link to={l.to} className="block py-3 font-display text-xl text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
