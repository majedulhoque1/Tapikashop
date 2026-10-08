// Small shared UI bits: buttons-as-classes, text fields, section titles, twine rule, step headings. Used by every customer route.
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const BTN_PRIMARY =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-action px-6 text-base font-bold text-on-action transition-[background-color,transform,box-shadow] duration-150 hover:bg-action-hover hover:shadow-lift active:translate-y-px active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-action disabled:hover:shadow-none'
export const BTN_SECONDARY =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border-2 border-ink px-6 text-base font-bold text-ink transition-[background-color,transform] duration-150 hover:bg-band active:translate-y-px active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45'
/** Sticker-style buttons for the bright hero and closing bands: ink outline, hard offset shadow that presses flat. */
export const BTN_POP =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-pill border-2 border-ink px-7 text-base font-bold transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
export const BTN_POP_DARK = `${BTN_POP} bg-[#14191C] text-[#FFFDF8] shadow-[4px_4px_0_0_#fff] hover:shadow-[6px_6px_0_0_#fff]`
export const BTN_POP_LIGHT = `${BTN_POP} bg-[#FFFFFF] text-[#14191C] shadow-[4px_4px_0_0_#14191C] hover:shadow-[6px_6px_0_0_#14191C]`
export const BTN_TEXT =
  'inline-flex min-h-11 items-center gap-1.5 rounded-pill px-2 text-sm font-semibold text-brand-text underline-offset-4 hover:underline'

const FIELD =
  'w-full rounded-field border border-field bg-raised px-3.5 py-3 text-base text-ink placeholder:text-muted/70'

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  htmlFor: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-sm text-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-sm font-semibold text-danger-text">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextInput(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`${FIELD} ${p.className ?? ''}`} />
}
export function TextArea(p: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`${FIELD} ${p.className ?? ''}`} />
}
export function Select(p: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={`${FIELD} ${p.className ?? ''}`} />
}

/** Dashed "twine" rule, the brand's one signature line. */
export function Twine({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t-2 border-dashed border-muted/55 ${className}`} />
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-text ${className}`}>
      <span aria-hidden="true" className="w-7 border-t-2 border-dashed border-current opacity-70" />
      {children}
    </p>
  )
}

export function PageHead({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="mb-8 border-b-2 border-ink bg-band">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-12 md:pb-10 md:pt-14">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-2 max-w-3xl font-display text-3xl leading-[1.1] tracking-[-0.02em]">{title}</h1>
        {lead ? <p className="mt-4 max-w-[62ch] text-lg text-ink/80">{lead}</p> : null}
      </div>
    </div>
  )
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 md:px-12 ${className}`}>{children}</div>
}

/** The note shown on policy/about pages whose copy the owner still has to confirm. */
export function PlaceholderNote({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-field border border-dashed border-muted/60 bg-band px-4 py-3 text-sm text-ink">
      <strong className="font-semibold">Placeholder, owner to confirm.</strong> {children ?? 'This copy is a draft until the owner approves it.'}
    </p>
  )
}
