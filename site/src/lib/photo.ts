// Shrinks an uploaded photo to a small data URL (~600px) so collage photos and payment screenshots fit in localStorage. Called by checkout and the builder.

export const PHOTO_MAX_EDGE = 600
export const MAX_COLLAGE_PHOTOS = 12

export function fileToSmallDataUrl(file: File, maxEdge: number = PHOTO_MAX_EDGE, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas unavailable'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      // WebP where the browser can encode it; otherwise toDataURL silently returns PNG, so fall back to JPEG.
      const webp = canvas.toDataURL('image/webp', quality)
      resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('could not read image'))
    }
    img.src = url
  })
}
