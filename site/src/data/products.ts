// The product catalogue (gifts, packaging, cards). Edit prices/stock here; read by builder/, os/seed.ts and the shop. All prices are SAMPLE until the owner confirms.
import type { Category, Occasion, Product, ProductFlags } from '../types'

const GIFT: ProductFlags = { builderEligible: true, readyMade: true, addOn: false, packaging: false }
const BUILD_ONLY: ProductFlags = { builderEligible: true, readyMade: false, addOn: false, packaging: false }
const CARD: ProductFlags = { builderEligible: false, readyMade: false, addOn: true, packaging: false }
const PACK: ProductFlags = { builderEligible: false, readyMade: false, addOn: false, packaging: true }

interface Spec {
  id: string
  name: string
  category: Category
  cost: number
  price: number
  flags?: ProductFlags
  occasions?: Occasion[]
  tags?: string[]
  slots?: number
}

// Real Instagram photos (see ../../assets/instagram/inventory.md). Products not listed fall back to a kraft tile.
const PHOTO: Record<string, string> = {
  'teddy-small': 'red-teddy-bears-group',
  'teddy-large': 'teddy-gold-rose-galaxy-box',
  'mixed-dry-fruit-jar': 'dry-fruit-mix-tub',
  'ferrero-rocher-t8': 'rakhi-ferrero-rocher-gift-box',
  'soan-papdi-box': 'rakhi-soan-papdi-teddy-gift',
  'kaju-barfi-box': 'rakhi-mithai-box-silver-rakhi',
  'collage-frame-grid': 'magnetic-fridge-photo-frame',
  'card-i-love-you': 'valentine-note-card',
  'card-thanks-for-everything': 'thank-you-card-gift-box',
  'rakhi-classic-thread': 'rakhi-gift-box-ornate-rakhi',
  'perfume-gift-set': 'mens-grooming-chocolate-box',
  'cadbury-silk-bar': 'chocolate-hamper-cadbury-favourites',
  'chocolate-truffle-box': 'rakhi-chocolate-navy-box',
  'kitkat-share-bag': 'birthday-box-kitkat-roses',
}

function mk(s: Spec): Product {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    costAud: s.cost,
    priceAud: s.price,
    flags: s.flags ?? GIFT,
    inStock: true,
    image: `/img/products/${PHOTO[s.id] ?? s.id}.webp`,
    occasions: s.occasions ?? [],
    tags: s.tags ?? [],
    slots: s.slots ?? 1,
  }
}

export const PRODUCTS: Product[] = [
  // Rakhi
  mk({ id: 'rakhi-classic-thread', name: 'Classic Rakhi Thread', category: 'rakhi', cost: 2, price: 6, occasions: ['rakhi', 'festival'], tags: ['rakhi', 'festive', 'sibling'] }),
  mk({ id: 'rakhi-bhaiya-bhabhi-pair', name: 'Bhaiya-Bhabhi Rakhi Pair', category: 'rakhi', cost: 4, price: 11, occasions: ['rakhi', 'festival'], tags: ['rakhi', 'festive', 'sibling'] }),
  mk({ id: 'rakhi-kids-cartoon', name: 'Kids Cartoon Rakhi', category: 'rakhi', cost: 2.5, price: 7, occasions: ['rakhi', 'festival'], tags: ['rakhi', 'festive', 'kids'] }),

  // Mithai
  mk({ id: 'kaju-barfi-box', name: 'Kaju Barfi Box (250g)', category: 'mithai', cost: 7, price: 16, occasions: ['rakhi', 'festival', 'birthday', 'wedding'], tags: ['sweets', 'mithai', 'festive'] }),
  mk({ id: 'soan-papdi-box', name: 'Soan Papdi Box (250g)', category: 'mithai', cost: 5, price: 12, occasions: ['rakhi', 'festival', 'thank-you'], tags: ['sweets', 'mithai', 'festive'] }),
  mk({ id: 'motichoor-laddoo-box', name: 'Motichoor Laddoo Box (250g)', category: 'mithai', cost: 6, price: 14, occasions: ['festival', 'new-baby', 'wedding'], tags: ['sweets', 'mithai', 'festive'] }),

  // Dry fruit
  mk({ id: 'cashew-pack', name: 'Cashew Pack (200g)', category: 'dry-fruit', cost: 6, price: 14, occasions: ['festival', 'thank-you', 'birthday'], tags: ['dry-fruit', 'healthy'] }),
  mk({ id: 'pistachio-pack', name: 'Pistachio Pack (200g)', category: 'dry-fruit', cost: 8, price: 18, occasions: ['festival', 'thank-you', 'anniversary'], tags: ['dry-fruit', 'healthy'] }),
  mk({ id: 'walnut-pack', name: 'Walnut Pack (200g)', category: 'dry-fruit', cost: 5, price: 12, occasions: ['festival', 'thank-you'], tags: ['dry-fruit', 'healthy'] }),
  mk({ id: 'mixed-dry-fruit-jar', name: 'Mixed Dry Fruit Jar (500g)', category: 'dry-fruit', cost: 11, price: 24, slots: 2, occasions: ['festival', 'thank-you', 'wedding'], tags: ['dry-fruit', 'healthy', 'premium'] }),

  // Chocolate
  mk({ id: 'kitkat-share-bag', name: 'KitKat Share Bag', category: 'chocolate', cost: 4, price: 9, occasions: ['birthday', 'thank-you', 'love'], tags: ['chocolate', 'kids'] }),
  mk({ id: 'ferrero-rocher-t8', name: 'Ferrero Rocher (8 pcs)', category: 'chocolate', cost: 6, price: 13, occasions: ['love', 'anniversary', 'birthday', 'thank-you'], tags: ['chocolate', 'premium'] }),
  mk({ id: 'cadbury-silk-bar', name: 'Cadbury Silk Bar', category: 'chocolate', cost: 3, price: 7, occasions: ['birthday', 'love', 'thank-you'], tags: ['chocolate'] }),
  mk({ id: 'chocolate-truffle-box', name: 'Chocolate Truffle Box', category: 'chocolate', cost: 7, price: 15, occasions: ['love', 'anniversary', 'birthday'], tags: ['chocolate', 'premium'] }),

  // Personalised photo frames (signature item)
  mk({ id: 'collage-frame-heart', name: 'Heart Collage Frame', category: 'photo-frame', cost: 14, price: 38, flags: BUILD_ONLY, occasions: ['love', 'anniversary', 'birthday', 'wedding'], tags: ['photos', 'personalised', 'love', 'couple'] }),
  mk({ id: 'collage-frame-grid', name: 'Grid Collage Frame (12 photos)', category: 'photo-frame', cost: 18, price: 48, flags: BUILD_ONLY, occasions: ['anniversary', 'birthday', 'wedding', 'new-baby'], tags: ['photos', 'personalised', 'family'] }),

  // Teddy
  mk({ id: 'teddy-small', name: 'Teddy Bear (small)', category: 'teddy', cost: 6, price: 16, occasions: ['love', 'birthday', 'new-baby'], tags: ['teddy', 'cuddly', 'kids'] }),
  mk({ id: 'teddy-large', name: 'Teddy Bear (large)', category: 'teddy', cost: 14, price: 34, slots: 2, occasions: ['love', 'birthday', 'anniversary'], tags: ['teddy', 'cuddly', 'love'] }),

  // Boxed sets
  mk({ id: 'perfume-gift-set', name: 'Perfume Gift Set', category: 'branded-box', cost: 20, price: 42, slots: 2, occasions: ['birthday', 'anniversary', 'love'], tags: ['premium', 'perfume'] }),

  // Dhaka / fabric
  mk({ id: 'dhaka-pouch', name: 'Dhaka Fabric Pouch', category: 'fabric', cost: 5, price: 12, occasions: ['festival', 'thank-you', 'wedding'], tags: ['dhaka', 'nepali', 'handmade'] }),
  mk({ id: 'dhaka-scarf', name: 'Dhaka Scarf', category: 'fabric', cost: 9, price: 22, occasions: ['festival', 'thank-you', 'anniversary'], tags: ['dhaka', 'nepali', 'handmade'] }),

  // Cards (picked in the Customise step, not in the item list)
  mk({ id: 'card-i-love-you', name: '"I love you" Card', category: 'card', cost: 1.2, price: 4, flags: CARD, occasions: ['love', 'anniversary'], tags: ['card', 'love'] }),
  mk({ id: 'card-thanks-for-everything', name: '"Thanks for everything" Card', category: 'card', cost: 1.2, price: 4, flags: CARD, occasions: ['thank-you'], tags: ['card', 'thanks'] }),
  mk({ id: 'card-happy-birthday', name: 'Happy Birthday Card', category: 'card', cost: 1.2, price: 4, flags: CARD, occasions: ['birthday'], tags: ['card', 'birthday'] }),
  mk({ id: 'card-happy-rakhi', name: 'Happy Rakhi Card', category: 'card', cost: 1.2, price: 4, flags: CARD, occasions: ['rakhi', 'festival'], tags: ['card', 'rakhi'] }),

  // Packaging (added automatically by format, or as wrap options)
  mk({ id: 'pkg-gift-box', name: 'Gift Box', category: 'packaging', cost: 3, price: 6, flags: PACK }),
  mk({ id: 'pkg-hamper-basket', name: 'Hamper Basket', category: 'packaging', cost: 6, price: 12, flags: PACK }),
  mk({ id: 'pkg-platter-tray', name: 'Platter Tray', category: 'packaging', cost: 4, price: 9, flags: PACK }),
  mk({ id: 'pkg-ribbon', name: 'Ribbon', category: 'packaging', cost: 0.5, price: 2, flags: PACK }),
  mk({ id: 'pkg-premium-wrap', name: 'Premium Wrap', category: 'packaging', cost: 2, price: 6, flags: PACK }),
  mk({ id: 'pkg-frame-sleeve', name: 'Frame Protective Sleeve', category: 'packaging', cost: 1.5, price: 3, flags: PACK }),
  mk({ id: 'pkg-kraft-pouch', name: 'Kraft Pouch', category: 'packaging', cost: 0.8, price: 2, flags: PACK }),
]

/** Packaging ids used by builder/bom.ts for the optional wrap choices. */
export const RIBBON_ID = 'pkg-ribbon'
export const PREMIUM_WRAP_ID = 'pkg-premium-wrap'

export function productMap(products: readonly Product[] = PRODUCTS): Map<string, Product> {
  return new Map(products.map((p) => [p.id, p]))
}
