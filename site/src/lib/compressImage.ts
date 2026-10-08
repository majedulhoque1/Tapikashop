// Client-side image compression for the admin uploader.
//
// Supabase is on the free plan here, so there is no on-the-fly transform
// endpoint (`/render/image/...` returns 403 FeatureNotEnabled). Whatever lands
// in storage is exactly what a shopper downloads, so every upload has to be the
// right size *before* it leaves the browser.

export type Encoded = { blob: Blob; ext: string; type: string };

export const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

// Product cards render at ~500px wide at most, so anything past 1400px is bytes
// the shopper pays for and never sees.
export const MAX_EDGE = 1400;
export const QUALITY = 0.82;
// If the first pass still lands above this, try again smaller rather than
// shipping it. A jewellery photo has no business being half a megabyte.
export const TARGET_BYTES = 500 * 1024;
const RETRY_EDGE = 1100;
const RETRY_QUALITY = 0.72;

// Ordered by preference. WebP is ~35% smaller than JPEG at the same quality,
// but Safari only gained canvas WebP *encoding* in 16.4 — JPEG is the fallback
// every browser can actually produce.
const LOSSY_TYPES = ['image/webp', 'image/jpeg'] as const;

type CanvasLike = {
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void;
};

/**
 * Encode `canvas` to the smallest lossy format the browser actually supports.
 *
 * toBlob() is only *required* to support image/png. When asked for a type it
 * can't encode, the spec says the UA falls back to image/png and ignores the
 * quality argument — silently, with no error. A PNG re-encode of a 1400px
 * photo is ~2.5 MB, i.e. worse than doing nothing, so the returned blob's own
 * `type` is the only trustworthy signal. Never assume the request was honoured.
 *
 * Returns null if the browser can produce neither WebP nor JPEG.
 */
export async function encodeLossy(canvas: CanvasLike, quality: number): Promise<Blob | null> {
  for (const type of LOSSY_TYPES) {
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, type, quality),
    );
    if (blob && blob.type === type) return blob;
  }
  return null;
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('could not read image'));
    };
    img.src = url;
  });

const draw = (img: HTMLImageElement, maxEdge: number): HTMLCanvasElement => {
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/** The original file, unchanged — used whenever re-encoding wouldn't help. */
const asIs = (file: File): Encoded => ({
  blob: file,
  ext: ALLOWED_TYPES[file.type],
  type: file.type,
});

export async function compressImage(file: File): Promise<Encoded> {
  // GIFs are animated — a canvas re-encode would flatten them to one frame.
  if (file.type === 'image/gif') return asIs(file);

  const img = await loadImage(file);
  let blob = await encodeLossy(draw(img, MAX_EDGE), QUALITY);

  // No lossy encoder at all. PNG is the only thing left and it would inflate a
  // photo, so hand back what we were given rather than making it worse.
  if (!blob) return asIs(file);

  if (blob.size > TARGET_BYTES) {
    const smaller = await encodeLossy(draw(img, RETRY_EDGE), RETRY_QUALITY);
    if (smaller && smaller.size < blob.size) blob = smaller;
  }

  // Never ship something bigger than what came in.
  if (blob.size >= file.size) return asIs(file);

  return { blob, ext: ALLOWED_TYPES[blob.type], type: blob.type };
}
