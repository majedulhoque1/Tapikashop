// Command Center chrome: desktop sidebar, mobile top bar + bottom tabs + menu sheet, logout. Wraps every /os route (see routes/os/route.tsx).
import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'

import { clearSession } from '../auth'
import { useOS } from '../store'
import { Icon, type IconName } from './ui'

const NAV = [
  { to: '/os', label: 'Dashboard', short: 'Home', icon: 'home', exact: true, primary: true },
  { to: '/os/orders', label: 'Orders', short: 'Orders', icon: 'orders', exact: false, primary: true },
  { to: '/os/procurement', label: 'Procurement', short: 'Buy', icon: 'cart', exact: false, primary: true },
  { to: '/os/deliveries', label: 'Deliveries', short: 'Deliver', icon: 'truck', exact: false, primary: true },
  { to: '/os/products', label: 'Products', short: 'Products', icon: 'tag', exact: false, primary: false },
  { to: '/os/customers', label: 'Customers', short: 'Customers', icon: 'users', exact: false, primary: false },
  { to: '/os/settings', label: 'Settings', short: 'Settings', icon: 'gear', exact: false, primary: false },
] as const satisfies readonly { to: string; label: string; short: string; icon: IconName; exact: boolean; primary: boolean }[]

type NavItem = (typeof NAV)[number]
const PRIMARY = NAV.filter((n) => n.primary)
const MENU = NAV.filter((n) => !n.primary)

function logout() {
  clearSession()
  window.location.href = '/login'
}

function Count({ n }: { n: number }) {
  if (n <= 0) return null
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-pill bg-accent px-1.5 text-xs font-bold text-on-accent tabular-nums" aria-label={`${n} to check`}>
      {n}
    </span>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const data = useOS()
  const [menuOpen, setMenuOpen] = useState(false)
  const awaiting = data.orders.filter((o) => o.status !== 'DELIVERED' && o.paymentCheck === 'awaiting').length

  const isActive = (n: NavItem) => (n.exact ? pathname === n.to || pathname === `${n.to}/` : pathname.startsWith(n.to))
  const inMenuPage = MENU.some(isActive)

  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-surface font-text text-ink">
      {/* Mobile top bar */}
      <div className="relative z-40 md:hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-brand text-ink">
              <Icon name="gift" className="h-[18px] w-[18px]" />
            </span>
            <span className="font-display text-base leading-none">Tapika OS</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className={`flex h-11 w-11 items-center justify-center rounded-pill ${inMenuPage || menuOpen ? 'bg-band' : 'hover:bg-band'}`}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
        {menuOpen && (
          <>
            <button type="button" aria-label="Close menu" tabIndex={-1} onClick={() => setMenuOpen(false)} className="fixed inset-0 -z-10 cursor-default bg-deep/40" />
            <div className="absolute inset-x-0 top-full border-b border-line bg-surface px-3 py-2 shadow-lift">
              {MENU.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex min-h-12 items-center gap-3 rounded-field px-3 text-sm font-semibold ${isActive(n) ? 'bg-action text-on-action' : 'text-ink active:bg-band'}`}
                >
                  <Icon name={n.icon} />
                  {n.label}
                </Link>
              ))}
              <div className="my-1.5 border-t border-line" />
              <button type="button" onClick={logout} className="flex min-h-12 w-full items-center gap-3 rounded-field px-3 text-left text-sm font-semibold text-muted active:bg-band">
                <Icon name="logout" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line px-4 py-6 md:flex">
          <div className="mb-6 flex items-center gap-2.5 px-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand text-ink">
              <Icon name="gift" className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-lg leading-none">Tapika OS</div>
              <span className="mt-1 inline-block rounded-pill bg-band px-2 py-0.5 text-xs font-semibold text-muted">Demo data</span>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5" aria-label="Command Center">
            {NAV.map((n) => {
              const active = isActive(n)
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-11 items-center gap-2.5 rounded-field px-3 text-sm font-semibold transition-colors ${active ? 'bg-action text-on-action' : 'text-muted hover:bg-band hover:text-ink'}`}
                >
                  <Icon name={n.icon} />
                  {n.label}
                  {n.to === '/os/orders' && <Count n={awaiting} />}
                </Link>
              )
            })}
          </nav>
          <button type="button" onClick={logout} className="mt-auto flex min-h-11 items-center gap-2.5 rounded-field px-3 text-left text-sm font-semibold text-muted hover:bg-band hover:text-ink">
            <Icon name="logout" />
            Log out
          </button>
        </aside>

        <main className="min-w-0 flex-1 pb-24 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 backdrop-blur-sm md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Command Center">
        {PRIMARY.map((n) => {
          const active = isActive(n)
          return (
            <Link key={n.to} to={n.to} aria-current={active ? 'page' : undefined} className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 ${active ? 'text-ink' : 'text-muted'}`}>
              <span className={`flex h-7 w-10 items-center justify-center rounded-pill ${active ? 'bg-brand' : ''}`}>
                <Icon name={n.icon} />
              </span>
              <span className="truncate text-xs leading-none font-semibold">{n.short}</span>
              {n.to === '/os/orders' && awaiting > 0 && (
                <span className="absolute top-1 right-[22%] inline-flex min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[11px] leading-4 font-bold text-on-accent tabular-nums">{awaiting}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
