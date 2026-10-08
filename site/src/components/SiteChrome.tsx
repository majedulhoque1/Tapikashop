// Wraps every page with Header + Footer, except the owner side (/os, /login). Used once, by routes/__root.tsx.
import { useRouterState } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'

import { Footer } from './Footer'
import { Header } from './Header'

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // Tell the <head> guard that the app hydrated, so [data-reveal] stays hidden only for pages that animate it.
  useEffect(() => document.documentElement.classList.add('motion-ready'), [])
  const ownerSide = pathname === '/os' || pathname.startsWith('/os/') || pathname === '/login'
  if (ownerSide) return <>{children}</>
  return (
    <div className="grain flex min-h-[100svh] flex-col">
      {/* Brand focus ring (Pine on light, Mint on dark) for every keyboard-focusable thing. */}
      <style>{':focus-visible{outline:3px solid var(--tp-focus);outline-offset:3px}html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}'}</style>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-action focus:px-4 focus:py-2 focus:text-on-action"
      >
        Skip to content
      </a>
      <Header />
      <div id="main" className="flex-1">
        {children}
      </div>
      <Footer flush={pathname === '/'} />
    </div>
  )
}
