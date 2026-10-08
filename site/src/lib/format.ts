// Small pure helpers for money and AU-local dates (YYYY-MM-DD strings). Used by config/, os/ and every screen.

/** Rs 4,150 */
export function formatNpr(npr: number): string {
  return `Rs ${Math.round(npr).toLocaleString('en-US')}`
}

/** A$86.50 (cents only when needed) */
export function formatAud(aud: number): string {
  const hasCents = Math.round(aud * 100) % 100 !== 0
  return `A$${aud.toLocaleString('en-AU', { minimumFractionDigits: hasCents ? 2 : 0, maximumFractionDigits: 2 })}`
}

/** Today's date in a given IANA timezone as YYYY-MM-DD (so "today" in Melbourne, not in the browser). */
export function todayInZone(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function parseYmd(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Add whole days to a YYYY-MM-DD string. Pure calendar arithmetic, no timezone drift. */
export function addDays(ymd: string, days: number): string {
  const d = new Date(parseYmd(ymd) + days * 86_400_000)
  return d.toISOString().slice(0, 10)
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseYmd(b) - parseYmd(a)) / 86_400_000)
}
