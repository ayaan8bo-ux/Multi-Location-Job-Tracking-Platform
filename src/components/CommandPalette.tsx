import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, CornerDownLeft, LayoutDashboard, PlusCircle, Search, Users } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { cn } from '../lib/cn'
import { nextStageId, stageById } from '../lib/utils'

interface CmdItem {
  id: string
  group: string
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return { open, setOpen }
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { records, advanceRecord, user } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const items = useMemo<CmdItem[]>(() => {
    const needle = q.trim().toLowerCase()
    const push = (arr: CmdItem[], it: CmdItem) => {
      if (!needle || it.label.toLowerCase().includes(needle) || it.hint?.toLowerCase().includes(needle)) arr.push(it)
    }

    const out: CmdItem[] = []
    push(out, { id: 'nav-dash', group: 'Navigate', label: 'Dashboard', icon: <LayoutDashboard className="size-4" />, run: () => navigate('/') })
    push(out, { id: 'nav-records', group: 'Navigate', label: `${config.recordLabelPlural} list`, icon: <ClipboardList className="size-4" />, run: () => navigate('/records') })
    push(out, { id: 'nav-intake', group: 'Navigate', label: `New ${config.recordLabel.toLowerCase()}`, icon: <PlusCircle className="size-4" />, run: () => navigate('/intake') })
    push(out, { id: 'nav-customers', group: 'Navigate', label: 'Customers', icon: <Users className="size-4" />, run: () => navigate('/customers') })

    for (const r of records) {
      push(out, {
        id: `rec-${r.id}`,
        group: config.recordLabelPlural,
        label: `${r.code} — ${r.customerName}`,
        hint: `${r.uniqueIdentifier} · ${r.customerPhone}`,
        icon: <ClipboardList className="size-4" />,
        run: () => navigate(`/records/${r.code}`)
      })
    }

    const phones = new Map<string, string>()
    for (const r of records) phones.set(r.customerPhone, r.customerName)
    for (const [phone, name] of phones) {
      push(out, {
        id: `cust-${phone}`,
        group: 'Customers',
        label: name,
        hint: phone,
        icon: <Users className="size-4" />,
        run: () => navigate(`/customers/${phone}`)
      })
    }

    for (const r of records) {
      if (nextStageId(r) && r.intakeLocationId === user?.locationId) {
        push(out, {
          id: `adv-${r.id}`,
          group: 'Quick actions',
          label: `Advance ${r.code} → ${stageById(nextStageId(r)!).label}`,
          hint: r.customerName,
          icon: <ArrowRight className="size-4" />,
          run: () => advanceRecord(r.id)
        })
      }
    }

    return out
  }, [q, records, navigate, advanceRecord, user, config.recordLabel, config.recordLabelPlural])

  useEffect(() => setActive(0), [q, open])

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.children[active] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  if (!open) return null

  const run = (it: CmdItem) => {
    it.run()
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && items[active]) {
      run(items[active])
    }
  }

  const groups: { name: string; items: CmdItem[] }[] = []
  const seen = new Set<string>()
  for (const it of items) {
    if (!seen.has(it.group)) {
      seen.add(it.group)
      groups.push({ name: it.group, items: [] })
    }
    groups[groups.length - 1].items.push(it)
  }
  let globalIndex = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/40 px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4">
          <Search className="size-4.5 shrink-0 text-zinc-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Search pages, ${config.recordLabelPlural.toLowerCase()}, customers, actions…`}
            className="h-13 flex-1 bg-transparent py-3.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">ESC</kbd>
        </div>

        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-400">No results for “{q}”.</p>
        ) : (
          <ul ref={listRef} className="max-h-[46vh] overflow-y-auto p-2 scrollbar-thin">
            {groups.map((g) => (
              <li key={g.name}>
                <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">{g.name}</p>
                {g.items.map((it) => {
                  const idx = globalIndex++
                  const isActive = idx === active
                  return (
                    <button
                      key={it.id}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => run(it)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        isActive ? 'bg-brand-50' : 'hover:bg-zinc-50'
                      )}
                    >
                      <span className={cn('text-zinc-400', isActive && 'text-brand-600')}>{it.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate font-medium', isActive ? 'text-brand-800' : 'text-zinc-800')}>{it.label}</span>
                        {it.hint && <span className="block truncate text-xs text-zinc-400">{it.hint}</span>}
                      </span>
                      {isActive && <CornerDownLeft className="size-3.5 shrink-0 text-brand-400" />}
                    </button>
                  )
                })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
