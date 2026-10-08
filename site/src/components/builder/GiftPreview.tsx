// Layered illustrated preview of the gift being built: box / hamper / platter / pouch / photo frame, items appear as labelled shapes. Used by the builder Preview step and the side panel.
import { useId } from 'react'

import type { Category, CollageInfo, FormatId } from '../../types'

export interface PreviewUnit {
  /** Product id (used for the shape variant and the enter animation key). */
  id: string
  name: string
  category: Category
  slots: number
}

const INK = '#14191C'
const KRAFT = '#DDBF98'
const KRAFT_D = '#B8925F'
const KRAFT_SOFT = '#F2E4D2'
const TISSUE = '#FFFBF9'
const BLUSH = '#F6C9CD'
const RAKHI = '#C42A3C'
const COCOA = '#4B2E24'
const NAVY = '#1C2B4B'
const MINT = '#62D2B5'
const GOLD = '#E3B04B'
const SW = 2.2

/** "Kaju Barfi Box (250g)" -> "Kaju Barfi". Short enough to sit on the box front. */
export function shortName(name: string): string {
  let n = name.replace(/\(.*?\)/g, '').replace(/["“”]/g, '').trim()
  const words = n.split(/\s+/)
  if (words.length > 2) n = words.slice(0, 2).join(' ')
  return n.length > 14 ? `${n.slice(0, 13)}…` : n
}

/** Word-wrap a message into at most `maxLines` short lines for the little card tag. */
function wrapWords(text: string, width: number, maxLines: number): string[] {
  const lines: string[] = []
  let cur = ''
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if ((cur + ' ' + w).trim().length > width && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines)
    cut[maxLines - 1] = `${cut[maxLines - 1].slice(0, width - 1)}…`
    return cut
  }
  return lines
}

function Shape({ unit }: { unit: PreviewUnit }) {
  const common = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  switch (unit.category) {
    case 'mithai':
      return (
        <g {...common}>
          <rect x={-27} y={-17} width={54} height={34} rx={6} fill={TISSUE} />
          <path d="M-14 0l7-8 7 8-7 8zM0 0l7-8 7 8-7 8z" fill="#FBE3AE" />
        </g>
      )
    case 'dry-fruit':
      return (
        <g {...common}>
          <rect x={-18} y={-16} width={36} height={40} rx={9} fill="#EBD9BE" />
          <rect x={-21} y={-26} width={42} height={11} rx={4} fill={COCOA} />
          <circle cx={-6} cy={2} r={4.5} fill={KRAFT} />
          <circle cx={6} cy={-3} r={4.5} fill={KRAFT} />
          <circle cx={3} cy={11} r={4.5} fill="#C7DDB0" />
        </g>
      )
    case 'chocolate':
      return /ferrero|truffle/.test(unit.id) ? (
        <g {...common}>
          <rect x={-26} y={-15} width={52} height={32} rx={6} fill={COCOA} />
          {[-14, 0, 14].flatMap((x) => [-6, 7].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={5.5} fill={GOLD} />))}
        </g>
      ) : (
        <g {...common}>
          <rect x={-14} y={-28} width={28} height={56} rx={4} fill={RAKHI} />
          <path d="M-14 -12h28M-14 4h28M-14 20h28M0 -28v56" fill="none" stroke={TISSUE} strokeWidth={1.6} />
        </g>
      )
    case 'teddy':
      return (
        <g {...common}>
          <circle cx={-15} cy={-24} r={7} fill="#B98255" />
          <circle cx={15} cy={-24} r={7} fill="#B98255" />
          <ellipse cx={0} cy={14} rx={17} ry={19} fill="#B98255" />
          <circle cx={-18} cy={10} r={6} fill="#B98255" />
          <circle cx={18} cy={10} r={6} fill="#B98255" />
          <circle cx={0} cy={-13} r={16} fill="#B98255" />
          <ellipse cx={0} cy={-8} rx={7} ry={5.5} fill="#E6C9A4" />
          <circle cx={-6} cy={-17} r={1.6} fill={INK} />
          <circle cx={6} cy={-17} r={1.6} fill={INK} />
          <circle cx={0} cy={-10} r={1.8} fill={INK} />
        </g>
      )
    case 'rakhi':
      return (
        <g {...common}>
          <circle cx={0} cy={-6} r={15} fill="none" stroke={RAKHI} strokeWidth={6} />
          <circle cx={0} cy={-21} r={7} fill="#F4A51C" />
          <path d="M-5 8l-4 18M0 9v20M5 8l4 18" fill="none" stroke={RAKHI} strokeWidth={2.4} />
        </g>
      )
    case 'fabric':
      return (
        <g {...common}>
          <path d="M-26 -14 4 -20 26 -8 22 18 -22 16z" fill={NAVY} />
          <path d="M-22 -2 22 4M-22 8 22 14" fill="none" stroke="#F4A51C" strokeWidth={3} />
        </g>
      )
    case 'branded-box':
      return (
        <g {...common}>
          <rect x={-21} y={-27} width={42} height={54} rx={5} fill={NAVY} />
          <rect x={-8} y={-12} width={16} height={26} rx={4} fill={MINT} />
          <rect x={-5} y={-19} width={10} height={7} rx={2} fill={TISSUE} />
        </g>
      )
    default:
      return (
        <g {...common}>
          <rect x={-22} y={-18} width={44} height={36} rx={6} fill={KRAFT} />
        </g>
      )
  }
}

function Bow({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={SW} strokeLinejoin="round">
      <path d="M0 0C-10-18-34-14-30 0-34 12-10 12 0 0z" fill={RAKHI} />
      <path d="M0 0C10-18 34-14 30 0 34 12 10 12 0 0z" fill={RAKHI} />
      <circle cx={0} cy={0} r={6} fill={RAKHI} />
    </g>
  )
}

/** Cells fill from the middle of the heart outwards, so the first few photos sit where the heart is widest. */
const HEART_ORDER = [5, 6, 1, 2, 9, 10, 4, 7, 0, 3, 8, 11]

const HEART = 'M50 92C8 62-2 38 0 22A23 23 0 0 1 50 16 23 23 0 0 1 100 22C102 38 92 62 50 92Z'

function FrameArt({ heart, collage }: { heart: boolean; collage: CollageInfo }) {
  const uid = useId().replace(/:/g, '')
  const photos = collage.photos
  const cols = 4
  const rows = 3
  const cells = Array.from({ length: 12 }, (_, i) => i)
  const x0 = 120
  const y0 = 46
  const w = 180
  const h = 150
  const cw = w / cols
  const ch = h / rows
  const label = [collage.names, collage.date].filter(Boolean).join('  ·  ')
  const heartT = `translate(${x0 - 14} ${y0 - 14}) scale(${(w + 28) / 100} ${(h + 38) / 92})`
  return (
    <g>
      <defs>
        <clipPath id={`heart-${uid}`}>
          <path d={HEART} transform={heartT} />
        </clipPath>
      </defs>
      <rect x={96} y={20} width={228} height={262} rx={8} fill="#B88A5A" stroke={INK} strokeWidth={SW} />
      <rect x={108} y={32} width={204} height={238} rx={3} fill={TISSUE} stroke={INK} strokeWidth={1.4} />
      <g clipPath={heart ? `url(#heart-${uid})` : undefined}>
        {cells.map((i) => {
          const cx = x0 + (i % cols) * cw
          const cy = y0 + Math.floor(i / cols) * ch
          const src = photos[heart ? HEART_ORDER.indexOf(i) : i]
          return src ? (
            <image key={i} href={src} x={cx} y={cy} width={cw} height={ch} preserveAspectRatio="xMidYMid slice" />
          ) : (
            <rect key={i} x={cx + 1} y={cy + 1} width={cw - 2} height={ch - 2} fill={i % 2 ? KRAFT : KRAFT_SOFT} />
          )
        })}
      </g>
      {heart ? <path d={HEART} transform={heartT} fill="none" stroke={RAKHI} strokeWidth={2} /> : null}
      <text x={210} y={250} textAnchor="middle" fontSize={17} fill={COCOA} style={{ fontFamily: 'var(--tp-font-note)' }}>
        {label ? (label.length > 30 ? `${label.slice(0, 29)}…` : label) : 'Names and date go here'}
      </text>
    </g>
  )
}

export function GiftPreview({
  formatId,
  units,
  ribbon,
  premiumWrap,
  hasCard,
  message,
  heartFrame = true,
  collage,
}: {
  formatId: FormatId
  units: PreviewUnit[]
  ribbon: boolean
  premiumWrap: boolean
  hasCard: boolean
  message: string
  heartFrame?: boolean
  collage: CollageInfo
}) {
  const W = 420
  const H = 340
  const isFrame = formatId === 'photo-frame'
  const isPlatter = formatId === 'platter'
  const isPouch = formatId === 'few-things'
  const isHamper = formatId === 'hamper'
  const isBox = formatId === 'box'

  // Lay units out left to right, each taking `slots` cells, centred on the container.
  const used = units.reduce((s, u) => s + u.slots, 0)
  const span = isPlatter ? 280 : isPouch ? 190 : 296
  const cell = Math.max(46, Math.min(84, span / Math.max(used, 3)))
  const totalW = used * cell
  let cursor = W / 2 - totalW / 2
  const itemY = isPlatter ? 226 : isPouch ? 156 : 166
  const crowded = totalW > span
  const placed = units.map((u, i) => {
    const w = u.slots * cell
    const x = cursor + w / 2
    cursor += w
    const scale = Math.min(1.12, (cell / 56) * (u.slots === 2 ? 1.2 : 1))
    return { u, i, x, y: itemY - (crowded && i % 2 ? 14 : 0), scale }
  })
  const seen = new Map<string, number>()
  const keyed = placed.map((p) => {
    const n = (seen.get(p.u.id) ?? 0) + 1
    seen.set(p.u.id, n)
    return { ...p, key: `${p.u.id}-${n}` }
  })

  const labelY = isPlatter ? 306 : isPouch ? 250 : 232
  const aria = isFrame
    ? 'Illustration of a personalised photo frame'
    : `Illustration of your ${formatId.replace('-', ' ')} with ${units.length === 0 ? 'nothing in it yet' : units.map((u) => u.name).join(', ')}`
  const msg = message.trim()
  const cardLines = wrapWords(msg || 'Your note', 13, 3)

  return (
    <div className="overflow-hidden rounded-frame" style={{ background: KRAFT_SOFT }}>
      <style>{`@media (prefers-reduced-motion:no-preference){.tp-drop{animation:tp-drop .55s cubic-bezier(.34,1.56,.64,1) both}@keyframes tp-drop{from{opacity:0;transform:translateY(-26px)}to{opacity:1;transform:none}}}`}</style>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="block h-auto w-full">
        <ellipse cx={210} cy={322} rx={150} ry={11} fill="#4B2E24" opacity={0.14} />

        {isFrame ? (
          <g>
            {premiumWrap ? (
              <path d="M90 270C110 300 170 312 210 300 260 312 320 300 330 270z" fill={BLUSH} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            ) : null}
            <FrameArt heart={heartFrame} collage={collage} />
            {ribbon ? <Bow x={210} y={22} s={0.9} /> : null}
          </g>
        ) : (
          <g>
            {/* BACK LAYER */}
            {isHamper ? <path d="M72 196C72 36 348 36 348 196" fill="none" stroke="#8B5E3C" strokeWidth={7} strokeLinecap="round" /> : null}
            {isBox || isHamper ? <path d="M62 176h296l12 22H50z" fill={KRAFT_D} stroke={INK} strokeWidth={SW} strokeLinejoin="round" /> : null}
            {premiumWrap && !isPlatter ? (
              <path
                d={
                  isPouch
                    ? 'M100 196 112 126 140 160 168 108 200 156 234 104 266 156 296 118 314 150 322 196z'
                    : 'M66 196 80 128 120 160 150 112 190 156 230 106 270 156 310 116 340 160 356 134 358 196z'
                }
                fill={BLUSH}
                stroke={INK}
                strokeWidth={SW}
                strokeLinejoin="round"
              />
            ) : null}
            {isPlatter ? (
              <g stroke={INK} strokeWidth={SW}>
                <ellipse cx={210} cy={254} rx={176} ry={46} fill={KRAFT} />
                <ellipse cx={210} cy={250} rx={152} ry={34} fill={KRAFT_SOFT} />
              </g>
            ) : null}

            {/* ITEMS */}
            {keyed.map((p) => (
              <g key={p.key} transform={`translate(${p.x} ${p.y})`}>
                <g className="tp-drop">
                  <g transform={`scale(${p.scale})`}>
                    <Shape unit={p.u} />
                  </g>
                </g>
              </g>
            ))}

            {/* FRONT LAYER */}
            {isBox || isHamper ? (
              <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
                <rect x={50} y={196} width={320} height={106} rx={10} fill={isHamper ? '#C9A271' : KRAFT} />
                <rect x={50} y={196} width={320} height={14} rx={6} fill={isHamper ? '#B38A58' : KRAFT_D} />
                {isHamper ? (
                  <path d="M70 224h280M70 250h280M70 276h280M100 212v88M150 212v88M200 212v88M250 212v88M300 212v88M340 212v88" fill="none" strokeWidth={1.2} opacity={0.4} />
                ) : null}
              </g>
            ) : null}
            {isPouch ? (
              <path
                d="M104 192l12-9 12 9 12-9 12 9 12-9 12 9 12-9 12 9 12-9 12 9 12-9 12 9 12-9 12 9 6 4 16 98q1 8-7 8H92q-8 0-7-8l14-98z"
                fill={KRAFT}
                stroke={INK}
                strokeWidth={SW}
                strokeLinejoin="round"
              />
            ) : null}
            {ribbon && !isPlatter ? (
              <g>
                <rect x={198} y={isPouch ? 196 : 196} width={24} height={isPouch ? 104 : 106} fill={RAKHI} stroke={INK} strokeWidth={SW} />
                <Bow x={210} y={198} />
              </g>
            ) : null}
            {ribbon && isPlatter ? <Bow x={92} y={262} s={0.8} /> : null}
            {premiumWrap && isPlatter ? (
              <path d="M44 252C44 70 376 70 376 252" fill="#ffffff" fillOpacity={0.28} stroke={INK} strokeWidth={1.6} strokeDasharray="4 6" />
            ) : null}

            {/* LABELS on the front */}
            {keyed.map((p) => (
              <g key={`l-${p.key}`} transform={`translate(${p.x} ${labelY + (p.i % 2 ? 22 : 0)})`}>
                <rect x={-38} y={-13} width={76} height={22} rx={11} fill={TISSUE} stroke={INK} strokeWidth={1.4} />
                <text x={0} y={2.5} textAnchor="middle" fontSize={11.5} fill={INK} style={{ fontFamily: 'var(--tp-font-text)', fontWeight: 600 }}>
                  {shortName(p.u.name)}
                </text>
              </g>
            ))}
            {units.length === 0 ? (
              <text x={210} y={labelY + 6} textAnchor="middle" fontSize={15} fill={COCOA} style={{ fontFamily: 'var(--tp-font-text)', fontWeight: 600 }}>
                Add items to fill it
              </text>
            ) : null}
          </g>
        )}

        {hasCard ? (
          <g transform={`translate(${isFrame ? 330 : 312} ${isFrame ? 196 : 272}) rotate(8)`}>
            <rect x={-8} y={-20} width={92} height={66} rx={5} fill={TISSUE} stroke={INK} strokeWidth={SW} />
            <circle cx={0} cy={-12} r={2.5} fill={KRAFT_D} />
            {cardLines.map((l, i) => (
              <text key={i} x={5} y={3 + i * 15} fontSize={13} fill={COCOA} style={{ fontFamily: 'var(--tp-font-note)' }}>
                {l}
              </text>
            ))}
          </g>
        ) : null}
      </svg>
    </div>
  )
}
