// A greeting card with the gift message in handwriting (Kalam, the only place that font is used). Used by builder, gift detail, cart and order pages.
export function CardPaper({ message, empty = 'Your message will appear here.', className = '' }: { message: string; empty?: string; className?: string }) {
  return (
    <div
      className={`rounded-frame border border-line bg-raised p-5 shadow-soft ${className}`}
      style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 31px, rgb(75 46 36 / 0.12) 31px 32px)', backgroundPositionY: '10px' }}
    >
      <p lang={/[ऀ-ॿ]/.test(message) ? 'ne' : undefined} className="min-h-24 whitespace-pre-wrap break-words font-note text-xl leading-8 text-ink">
        {message.trim() ? message : <span className="text-muted">{empty}</span>}
      </p>
    </div>
  )
}
