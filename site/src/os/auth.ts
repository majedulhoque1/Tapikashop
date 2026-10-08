// Demo login gate for the Command Center, NOT security: VITE_* values are inlined into the client bundle. Used by /login and the /os route guard (copied from Filix).

const SESSION_KEY = 'tapika_os_session'

// Built-in demo login so the prototype works on any deploy; VITE_OS_EMAIL / VITE_OS_PASSWORD override it.
export const DEMO_CREDENTIALS = {
  email: import.meta.env.VITE_OS_EMAIL || 'demo@tapika.shop',
  password: import.meta.env.VITE_OS_PASSWORD || 'tapika-demo',
}

export function checkCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() && password === DEMO_CREDENTIALS.password
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
