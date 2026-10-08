// /login: demo gate for the Command Center (credentials from .env via os/auth.ts, not real security). Redirects to /os when signed in.
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { checkCredentials, hasSession, setSession } from '../os/auth'
import { Icon, inputCls } from '../os/components/ui'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Log in - Tapika OS' }] }),
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (checkCredentials(email, password)) {
      setSession()
      navigate({ to: '/os' })
    } else {
      setError(true)
    }
  }

  // Client-only check (localStorage) inside an effect: navigating during render would update the router mid-render.
  useEffect(() => {
    if (hasSession()) navigate({ to: '/os' })
  }, [navigate])

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-deep px-4 font-text">
      <div className="w-full max-w-sm rounded-frame bg-raised p-7 text-ink shadow-lift">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-pill bg-brand text-ink">
            <Icon name="gift" className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl leading-none">Tapika OS</h1>
          <p className="mt-2 text-sm text-muted">Sign in to run your orders.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email</span>
            <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(false) }} className={inputCls} autoComplete="username" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Password</span>
            <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(false) }} className={inputCls} autoComplete="current-password" />
          </label>
          {error && (
            <p role="alert" className="text-sm font-semibold text-danger-text">
              Email or password is not right. Try again.
            </p>
          )}
          <button type="submit" className="mt-1 inline-flex min-h-11 items-center justify-center rounded-pill bg-action px-4 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            Log in
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">Demo login. This is a prototype, not secure access.</p>
        <a href="/" className="mt-3 block text-center text-xs font-semibold text-muted hover:text-ink">
          Back to the shop
        </a>
      </div>
    </main>
  )
}
