import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/cn'
import { dotTone, stageTone, stageById, staffInitials } from '../lib/utils'

/* ---------- Button ---------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md'
}
const btnVariant: Record<BtnVariant, string> = {
  primary:
    'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_1px_2px_rgba(79,70,229,0.4)] hover:from-brand-600 hover:to-brand-700 active:from-brand-700 active:to-brand-800',
  secondary:
    'bg-zinc-900 text-white shadow-[0_1px_2px_rgba(15,23,42,0.3)] hover:bg-zinc-800 active:bg-zinc-950',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  outline:
    'border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900',
  danger: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100'
}
export function Button({ variant = 'primary', size = 'md', className, ...props }: BtnProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        size === 'sm' ? 'px-3 py-1.5 text-[13px]' : 'px-4 py-2 text-sm',
        btnVariant[variant],
        className
      )}
      {...props}
    />
  )
}

/* ---------- Status badge ---------- */
export function StatusBadge({ stageId, className }: { stageId: string; className?: string }) {
  const stage = stageById(stageId)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap',
        stageTone(stage.tone),
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', dotTone(stage.tone))} />
      {stage.label}
    </span>
  )
}

export function ToneBadge({ tone, label }: { tone: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        stageTone(tone as never)
      )}
    >
      {label}
    </span>
  )
}

/* ---------- Card ---------- */
interface CardProps {
  title?: ReactNode
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  pad?: boolean
}
export function Card({ title, subtitle, actions, children, className, pad = true }: CardProps) {
  return (
    <section className={cn('card', className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

/* ---------- Stat card ---------- */
export function Stat({
  label,
  value,
  hint,
  accent,
  icon
}: {
  label: string
  value: ReactNode
  hint?: string
  accent?: string
  icon?: ReactNode
}) {
  return (
    <div className="card group relative overflow-hidden px-5 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</p>
          <p
            className={cn(
              'font-display mt-1.5 text-[26px] font-semibold leading-none tracking-tight tabular-nums',
              accent ?? 'text-ink-900'
            )}
          >
            {value}
          </p>
          {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
        </div>
        {icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Form controls ---------- */
export function Field({ label, required, children, hint, className }: { label: string; required?: boolean; children: ReactNode; hint?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}
    </label>
  )
}

const controlBase =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:bg-zinc-50 disabled:text-zinc-500'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />
}
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlBase, 'cursor-pointer appearance-none pr-8', className)} {...props}>
      {children}
    </select>
  )
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, 'min-h-20', className)} {...props} />
}

/* ---------- Avatar ---------- */
const avatarPalette = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500'
]
function paletteOf(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return avatarPalette[h % avatarPalette.length]
}
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'size-6 text-[10px]' : size === 'lg' ? 'size-10 text-sm' : 'size-8 text-xs'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm',
        paletteOf(name),
        s
      )}
    >
      {staffInitials(name)}
    </span>
  )
}

/* ---------- Tabs ---------- */
export function Tabs<T extends string>({ items, value, onChange }: { items: { id: T; label: string; count?: number }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
            value === it.id ? 'bg-brand-600 text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
          )}
        >
          {it.label}
          {it.count !== undefined && (
            <span
              className={cn(
                'rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                value === it.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
              )}
            >
              {it.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-500 ring-1 ring-inset ring-brand-100">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>}
    </div>
  )
}

/* ---------- Page header ---------- */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ---------- Table helpers ---------- */
export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/95 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500 backdrop-blur',
        className
      )}
    >
      {children}
    </th>
  )
}
