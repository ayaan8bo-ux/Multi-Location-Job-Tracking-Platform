import type { Stage, StatusEvent, Tone, WorkRecord, Location, Staff } from '../types'
import { config } from '../config'

export const stageById = (id: string): Stage =>
  config.stages.find((s) => s.id === id) ?? {
    id,
    label: id,
    sequenceOrder: null,
    isException: false,
    tone: 'slate'
  }

export const stageTone = (tone: Tone): string => {
  const map: Record<Tone, string> = {
    slate: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200',
    indigo: 'bg-brand-50 text-brand-700 ring-brand-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200'
  }
  return map[tone]
}

export const dotTone = (tone: Tone): string => {
  const map: Record<Tone, string> = {
    slate: 'bg-zinc-400',
    blue: 'bg-sky-500',
    indigo: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  }
  return map[tone]
}

export const ringTone = (tone: Tone): string => {
  const map: Record<Tone, string> = {
    slate: 'ring-zinc-200',
    blue: 'ring-sky-200',
    indigo: 'ring-brand-200',
    emerald: 'ring-emerald-200',
    amber: 'ring-amber-200',
    red: 'ring-red-200'
  }
  return map[tone]
}

export function formatMoney(n?: number): string {
  if (n === undefined || n === null || Number.isNaN(n)) return '—'
  return `${config.currency}${n.toLocaleString('en-IN')}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / 86400000))
}

export function timeAgo(iso: string): string {
  const d = daysSince(iso)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d} days ago`
}

export const locationById = (id: string): Location =>
  config.locations.find((l) => l.id === id) ?? { id, name: id, area: '', active: true }

export const staffById = (id: string): Staff =>
  config.staff.find((s) => s.id === id) ?? { id, name: id, phone: '', locationId: '', role: 'staff' }

export const staffInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export function lastEventOf(record: WorkRecord): StatusEvent {
  return (
    record.events[record.events.length - 1] ?? {
      id: 'none',
      recordId: record.id,
      kind: 'created',
      stageId: record.currentStageId,
      updatedByStaffId: record.intakeStaffId,
      locationId: record.intakeLocationId,
      updatedAt: record.dateReceived
    }
  )
}

export function isTerminalStage(stageId: string): boolean {
  return stageById(stageId).terminal ?? false
}

/** Next stage in the record's pipeline, or null if at the end / terminal. */
export function nextStageId(record: WorkRecord): string | null {
  const pipeline = config.recordTypes.find((t) => t.id === record.recordTypeId)?.pipeline ?? []
  const idx = pipeline.indexOf(record.currentStageId)
  if (idx < 0 || idx >= pipeline.length - 1) return null
  return pipeline[idx + 1]
}

export function nextStageLabel(record: WorkRecord): string | null {
  const next = nextStageId(record)
  return next ? stageById(next).label : null
}
