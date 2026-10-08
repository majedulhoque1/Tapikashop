// Demo login gate for the Command Center, NOT security: VITE_* values are inlined into the client bundle. Used by /login and the /os route guard (copied from Filix).

const SESSION_KEY = 'tapika_os_session'

export function checkCredentials(email: string, password: string): boolean {
  const expectedEmail = import.meta.env.VITE_OS_EMAIL ?? ''
  const expectedPassword = import.meta.env.VITE_OS_PASSWORD ?? ''
  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword
}

export function setSession() {
  if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_KEY, '1')
}

export function clearSession() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY)
}

export function hasSession(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SESSION_KEY) === '1'
}
