// /os/products: catalogue with cost, price, margin and the in-stock switch (setInStock). Switching off hides the item from the public shop and builder immediately.
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { formatAud } from '../../lib/format'
import { EmptyState, Icon, PageHeader, cardCls, inputCls } from '../../os/components/ui'
import { marginPct, titleCase } from '../../os/logic'
import { setInStock, useOS } from '../../os/store'
import type { Category, Product } from '../../types'

export const Route = createFileRoute('/os/products')({ component: Products })

function StockSwitch({ product }: { product: Product }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={product.inStock}
      aria-label={`${product.name} in stock`}
      onClick={() => setInStock(product.id, !product.inStock)}
      className="inline-flex min-h-11 items-center gap-2 rounded-pill pr-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
    >
      <span className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${product.inStock ? 'bg-action' : 'bg-field'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-pill bg-raised transition-[left] ${product.inStock ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <span className={`w-14 text-xs font-semibold ${product.inStock ? 'text-ink' : 'text-danger-text'}`}>{product.inStock ? 'In stock' : 'Hidden'}</span>
    </button>
  )
}

function roleOf(p: Product): string {
  if (p.flags.packaging) return 'Packaging'
  if (p.flags.addOn) return 'Add-on'
  if (p.flags.readyMade && p.flags.builderEligible) return 'Shop + builder'
  if (p.flags.builderEligible) return 'Builder'
  return 'Shop'
}

function Products() {
  const data = useOS()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | ''>('')
  const needle = q.trim().toLowerCase()
  const categories = [...new Set(data.products.map((p) => p.category))]
  const list = data.products
    .filter((p) => !cat || p.category === cat)
    .filter((p) => !needle || `${p.name} ${p.category}`.toLowerCase().includes(needle))
  const hidden = data.products.filter((p) => !p.inStock).length

  return (
    <>
      <PageHeader title="Products" sub={`${data.products.length} products · ${hidden === 0 ? 'all in stock' : `${hidden} hidden from the shop`}`} />
      <div className="flex flex-col gap-4 px-4 py-5 md:px-8">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block sm:w-64">
            <span className="sr-only">Search products</span>
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className={`${inputCls} pl-9`} />
          </label>
          <label className="block sm:w-56">
            <span className="sr-only">Category</span>
            <select value={cat} onChange={(e) => setCat(e.target.value as Category | '')} className={inputCls}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={`${cardCls} overflow-hidden`}>
          {list.length === 0 ? (
            <EmptyState text="No products match." />
          ) : (
            <>
              <table className="hidden w-full text-sm md:table">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
                    <th className="px-4 py-2 font-semibold">Product</th>
                    <th className="px-2 py-2 font-semibold">Category</th>
                    <th className="px-2 py-2 font-semibold">Sold as</th>
                    <th className="px-2 py-2 text-right font-semibold">Cost</th>
                    <th className="px-2 py-2 text-right font-semibold">Price</th>
                    <th className="px-2 py-2 text-right font-semibold">Margin</th>
                    <th className="px-4 py-2 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className={`h-12 border-b border-line last:border-0 ${p.inStock ? '' : 'bg-band/50 text-muted'}`}>
                      <td className="px-4 font-semibold">{p.name}</td>
                      <td className="px-2">{titleCase(p.category)}</td>
                      <td className="px-2 text-muted">{roleOf(p)}</td>
                      <td className="px-2 text-right tabular-nums">{formatAud(p.costAud)}</td>
                      <td className="px-2 text-right tabular-nums">{formatAud(p.priceAud)}</td>
                      <td className="px-2 text-right tabular-nums">{marginPct(p)}%</td>
                      <td className="px-4">
                        <StockSwitch product={p} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="md:hidden">
                {list.map((p) => (
                  <li key={p.id} className={`flex items-center gap-3 border-b border-line px-4 py-2 last:border-0 ${p.inStock ? '' : 'bg-band/50'}`}>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-muted tabular-nums">
                        {titleCase(p.category)} · cost {formatAud(p.costAud)} · sell {formatAud(p.priceAud)} · {marginPct(p)}%
                      </div>
                    </div>
                    <StockSwitch product={p} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  )
}
