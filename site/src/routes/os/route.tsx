// Layout for every /os page: session gate (redirects to /login) + the Shell. Children render only after the client-side auth check.
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Shell } from '../../os/components/Shell'
import { hasSession } from '../../os/auth'

export const Route = createFileRoute('/os')({
  head: () => ({ meta: [{ title: 'Tapika OS' }] }),
  component: OSLayout,
})

function OSLayout() {
  const navigate = useNavigate()
  // hasSession() reads localStorage, so it can only run client-side after mount.
  // SSR always renders the "checking" state, so real OS data never flashes before the check.
  const [status, setStatus] = useState<'checking' | 'authed'>('checking')

  useEffect(() => {
    if (hasSession()) setStatus('authed')
    else navigate({ to: '/login' })
  }, [navigate])

  if (status === 'checking') {
    return <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">Loading...</div>
  }

  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}
