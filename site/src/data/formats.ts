// The five gift formats (box, hamper, platter, photo frame, few things) with capacity and allowed categories. Read by builder/capacity.ts and builder/bom.ts.
import type { Category, Format, FormatId } from '../types'

const FOOD: Category[] = ['mithai', 'dry-fruit', 'chocolate']

export const FORMATS: Format[] = [
  {
    id: 'box',
    name: 'Gift Box',
    description: 'A neat box of 3 to 6 favourites.',
    capacity: 6,
    allowedCategories: [...FOOD, 'rakhi', 'teddy', 'fabric', 'branded-box'],
    autoPackaging: [{ productId: 'pkg-gift-box', qty: 1 }],
  },
  {
    id: 'hamper',
    name: 'Hamper',
    description: 'A fuller basket with room for a teddy.',
    capacity: 8,
    allowedCategories: [...FOOD, 'rakhi', 'teddy', 'fabric'],
    autoPackaging: [{ productId: 'pkg-hamper-basket', qty: 1 }],
  },
  {
    id: 'platter',
    name: 'Platter',
    description: 'Sweets, dry fruit and chocolate on a tray.',
    capacity: 6,
    allowedCategories: FOOD,
    autoPackaging: [{ productId: 'pkg-platter-tray', qty: 1 }],
  },
  {
    id: 'photo-frame',
    name: 'Photo Frame',
    description: 'A personalised collage frame, up to 12 photos.',
    capacity: 1,
    allowedCategories: ['photo-frame'],
    autoPackaging: [{ productId: 'pkg-frame-sleeve', qty: 1 }],
  },
  {
    id: 'few-things',
    name: 'Just a few things',
    description: 'One to three small things in a kraft pouch.',
    capacity: 3,
    allowedCategories: [...FOOD, 'rakhi', 'fabric'],
    autoPackaging: [{ productId: 'pkg-kraft-pouch', qty: 1 }],
  },
]

export function getFormat(id: FormatId, formats: readonly Format[] = FORMATS): Format {
  const f = formats.find((x) => x.id === id)
  if (!f) throw new Error(`Unknown format "${id}"`)
  return f
}
