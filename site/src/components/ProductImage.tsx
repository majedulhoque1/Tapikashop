// Product/template photo with a kraft-tile fallback (name on kraft) when the file is missing. Used by shop, gift detail, cart, builder.
import { useEffect, useRef, useState } from 'react'

import { imageFor } from './imageMap'

export function ProductImage({
  id,
  src,
  name,
  eager = false,
  className = '',
  ratio = '4 / 5',
  compact = false,
  imgClassName = '',
}: {
  /** Product or template id, used to look up a real photo override. */
  id?: string
  src: string
  name: string
  eager?: boolean
  className?: string
  ratio?: string
  compact?: boolean
  /** Extra classes on the <img> itself, e.g. a hover zoom driven by a parent `group`. */
  imgClassName?: string
}) {
  const resolved = imageFor(id, src)
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  // The image may have errored before React hydrated (so onError never fired): check once on mount.
  useEffect(() => {
    const el = ref.current
    if (el && el.complete && el.naturalWidth === 0) setFailed(true)
  }, [resolved])
  return (
    <div
      className={`relative overflow-hidden rounded-frame bg-wrap ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {failed ? (
        <div className={`flex h-full w-full items-end ${compact ? 'p-1.5' : 'p-3'}`}>
          <span className={`font-display leading-tight text-[#14191C] ${compact ? 'text-[11px]' : 'text-base'}`}>{name}</span>
        </div>
      ) : (
        <img
          ref={ref}
          src={resolved}
          alt={name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}
    </div>
  )
}
