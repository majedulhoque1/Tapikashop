// Maps template ids to the real photos already in /public/img/products (the catalogue names the files after ids that do not exist yet). Used by ProductImage.
const OVERRIDES: Record<string, string> = {}

export function imageFor(id: string | undefined, fallback: string): string {
  return (id && OVERRIDES[id]) || fallback
}
