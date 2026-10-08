// Price display: NPR first (large), A$ second (small, muted). Used wherever a money amount is shown.
import { formatAud, formatNpr } from '../lib/format'

export function Price({
  npr,
  aud,
  className = '',
  size = 'base',
  prefix,
}: {
  npr: number
  aud?: number
  className?: string
  size?: 'sm' | 'base' | 'lg'
  prefix?: string
}) {
  const main = size === 'lg' ? 'text-2xl font-display' : size === 'sm' ? 'text-sm font-semibold' : 'text-base font-semibold'
  return (
    <span className={`inline-flex items-baseline gap-2 tabular-nums ${className}`}>
      {prefix ? <span className="text-sm font-normal text-muted">{prefix}</span> : null}
      <span className={main}>{formatNpr(npr)}</span>
      {aud !== undefined ? <span className="text-xs text-muted">{formatAud(aud)}</span> : null}
    </span>
  )
}
