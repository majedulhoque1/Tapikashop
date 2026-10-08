// Every shared data shape in the app (Product, Format, Order...). Imported by data/, builder/, os/ and the future UI.

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export type Category =
  | 'rakhi'
  | 'mithai'
  | 'dry-fruit'
  | 'chocolate'
  | 'photo-frame'
  | 'teddy'
  | 'card'
  | 'branded-box'
  | 'fabric'
  | 'packaging'

export type Occasion =
  | 'birthday'
  | 'anniversary'
  | 'rakhi'
  | 'festival'
  | 'love'
  | 'thank-you'
  | 'new-baby'
  | 'wedding'

export interface ProductFlags {
  /** Can be picked in the Gift Builder as a main item. */
  builderEligible: boolean
  /** Sold as-is in the shop (no building needed). */
  readyMade: boolean
  /** Offered as an extra at the end (cards, add-on chocolates). */
  addOn: boolean
  /** Packaging material: added automatically, never picked as a gift item. */
  packaging: boolean
}

export interface Product {
  id: string
  name: string
  category: Category
  /** What Eva pays to buy/make one, in AUD. Drives margin in the OS. */
  costAud: number
  /** What the customer pays for one, in AUD (before FX/delivery). */
  priceAud: number
  flags: ProductFlags
  inStock: boolean
  /** Path under /public, e.g. /img/products/kaju-katli-box.webp (file may not exist yet). */
  image: string
  occasions: Occasion[]
  tags: string[]
  /** How many format-capacity slots one unit uses (default 1; a big teddy takes 2). */
  slots: number
}

export interface TemplateComponent {
  productId: string
  qty: number
}

export type RecipientKind = 'partner' | 'parent' | 'sibling' | 'friend' | 'child' | 'colleague'
export type BudgetBand = 'low' | 'mid' | 'high'

export interface GiftTemplate {
  id: string
  name: string
  description: string
  formatId: FormatId
  /** Starter shown in the builder (Rakhi Set, Birthday Box...) vs. a plain ready-made gift. */
  starter: boolean
  occasions: Occasion[]
  recipients: RecipientKind[]
  /** Interest keywords matched by Help Me Choose (e.g. "chocolate", "sweets", "photos"). */
  tags: string[]
  /** Default card product, if any. */
  cardId: string | null
  components: TemplateComponent[]
  image: string
}

export type FormatId = 'box' | 'hamper' | 'platter' | 'photo-frame' | 'few-things'

export interface Format {
  id: FormatId
  name: string
  description: string
  /** Number of slots available (sum of product.slots * qty must fit). */
  capacity: number
  allowedCategories: Category[]
  /** Packaging lines added automatically for this format. */
  autoPackaging: TemplateComponent[]
}

// ---------------------------------------------------------------------------
// Builder output (the "blueprint JSON" saved on an order)
// ---------------------------------------------------------------------------

export interface PackagingChoice {
  ribbon: boolean
  premiumWrap: boolean
}

export interface CollageInfo {
  /** Small compressed data URLs (~600px, see lib/photo.ts). Max 12. */
  photos: string[]
  names: string
  /** Free-text or ISO date shown on the frame, e.g. "14 Feb 2024". */
  date: string
}

interface GiftCommon {
  occasion: Occasion
  recipient: RecipientKind
  packaging: PackagingChoice
  /** Product id of the chosen card, or null for no card. */
  card: string | null
  message: string
  /** AU local date, YYYY-MM-DD. */
  delivery_date: string
  collage?: CollageInfo
}

export interface BuilderOutput extends GiftCommon {
  gift_type: FormatId
  items: { product: string; quantity: number }[]
}

export interface ReadyMadeOutput extends GiftCommon {
  gift_type: 'ready-made'
  template_id: string
  quantity: number
}

export type GiftBlueprint = BuilderOutput | ReadyMadeOutput

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface Customer {
  id: string
  name: string
  /** Nepal phone, used to match repeat buyers. */
  phone: string
  email: string
  country: string
  createdAt: string
}

export interface Recipient {
  id: string
  customerId: string
  name: string
  city: string
  suburb: string
  address: string
  phone: string
  relationship: string
  /** e.g. "Birthday 14 Mar" */
  importantDates: string
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'NEW'
  | 'PAYMENT_CONFIRMED'
  | 'TO_PURCHASE'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'ON_HOLD'

export type PaymentCheck = 'awaiting' | 'confirmed'

export interface OrderTotals {
  /** Gift lines (items + packaging + card) in AUD. */
  giftAud: number
  deliveryAud: number
  totalAud: number
  /** totalAud x fxRate, rounded to the nearest Rs 50. */
  totalNpr: number
  /** FX rate frozen at order time. */
  fxRate: number
}

export interface Order {
  id: string
  status: OrderStatus
  /** Where an ON_HOLD order resumes to. */
  statusBeforeHold: OrderStatus | null
  paymentCheck: PaymentCheck
  customerId: string
  recipientId: string
  /** AU local date YYYY-MM-DD. */
  deliveryDate: string
  city: string
  /** Preferred delivery window, e.g. 'Morning (9–12)'. Empty = any time that day. */
  deliveryWindow?: string
  blueprint: GiftBlueprint
  totals: OrderTotals
  /** Compressed data URL of the uploaded eSewa screenshot, if any. */
  paymentScreenshot: string | null
  note: string
  createdAt: string
  updatedAt: string
}

export type OrderItemType = 'gift' | 'packaging' | 'card' | 'task'

export interface OrderItem {
  /** Unique per line, e.g. "TP-1048-03". Procurement marks purchased by this id. */
  id: string
  orderId: string
  /** Product id; tasks use a pseudo id like "task-print-collage". */
  productId: string
  name: string
  qty: number
  /** Unit price in AUD. */
  priceAud: number
  type: OrderItemType
  purchased: boolean
}

export interface ChecklistItem {
  id: string
  orderId: string
  label: string
  sortOrder: number
  done: boolean
  doneAt: string | null
}

// ---------------------------------------------------------------------------
// Settings + whole-store shape
// ---------------------------------------------------------------------------

export interface Settings {
  ownerName: string
  fxAudToNpr: number
  rateAsOf: string
  leadDays: number
  deliveryFeesAud: Record<string, number>
}

export interface OSData {
  products: Product[]
  customers: Customer[]
  recipients: Recipient[]
  orders: Order[]
  orderItems: OrderItem[]
  checklistItems: ChecklistItem[]
  settings: Settings
}
