import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { DeploymentConfig, Role, Staff, StatusEvent, WorkRecord } from './types'
import { applyDeployment, config } from './config'
import { records as seedRecords } from './data/mock'
import { variantById } from './variants'
import { nextStageId, stageById } from './lib/utils'

interface Toast {
  id: number
  message: string
  undoLabel?: string
  onUndo?: () => void
}

interface AppState {
  user: Staff | null
  login: (staffId: string) => void
  logout: () => void
  records: WorkRecord[]
  addRecord: (r: WorkRecord) => void
  updateStatus: (recordId: string, stageId: string, note?: string) => void
  transfer: (recordId: string, toLocationId: string, note?: string) => void
  advanceRecord: (recordId: string) => void
  advanceRecords: (recordIds: string[]) => number
  setStage: (recordId: string, stageId: string) => void
  activeVariant: string
  switchVariant: (variantId: string) => void
  toast: Toast | null
  notify: (message: string, opts?: { undoLabel?: string; onUndo?: () => void }) => void
  dismissToast: () => void
}

const Ctx = createContext<AppState | null>(null)

let seq = 0
let toastSeq = 0
const nowIso = () => new Date().toISOString()
const uid = (p: string) => `${p}-${Date.now().toString(36)}${(seq += 1).toString(36)}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Staff | null>(null)
  const [records, setRecords] = useState<WorkRecord[]>(seedRecords)
  const [activeVariant, setActiveVariant] = useState('mobile-repair')
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notify = useCallback((message: string, opts?: { undoLabel?: string; onUndo?: () => void }) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ id: ++toastSeq, message, undoLabel: opts?.undoLabel, onUndo: opts?.onUndo })
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const baseEvent = (record: WorkRecord, kind: StatusEvent['kind'], stageId: string, extra: Partial<StatusEvent> = {}) => {
    const who = user?.id ?? record.intakeStaffId
    const where = user?.locationId ?? record.intakeLocationId
    const evt: StatusEvent = {
      id: uid('evt'),
      recordId: record.id,
      kind,
      stageId,
      note: extra.note,
      fromLocationId: extra.fromLocationId,
      toLocationId: extra.toLocationId,
      updatedByStaffId: who,
      locationId: where,
      updatedAt: nowIso()
    }
    return evt
  }

  const value = useMemo<AppState>(() => {
    const applyStage = (recordId: string, stageId: string) => {
      setRecords((prev) =>
        prev.map((r) => {
          if (r.id !== recordId) return r
          const evt = baseEvent(r, 'status', stageId)
          return {
            ...r,
            currentStageId: stageId,
            dateCompleted: stageById(stageId).terminal ? nowIso() : r.dateCompleted,
            events: [...r.events, evt]
          }
        })
      )
    }

    return {
      user,
      login: (staffId: string) => setUser(config.staff.find((s) => s.id === staffId) ?? config.staff[0] ?? null),
      logout: () => setUser(null),
      records,
      addRecord: (r: WorkRecord) => setRecords((prev) => [r, ...prev]),
      updateStatus: (recordId: string, stageId: string, note?: string) =>
        setRecords((prev) =>
          prev.map((r) => {
            if (r.id !== recordId) return r
            const evt = baseEvent(r, 'status', stageId, { note })
            return {
              ...r,
              currentStageId: stageId,
              dateCompleted: stageById(stageId).terminal ? nowIso() : r.dateCompleted,
              events: [...r.events, evt]
            }
          })
        ),
      transfer: (recordId: string, toLocationId: string, note?: string) =>
        setRecords((prev) =>
          prev.map((r) => {
            if (r.id !== recordId) return r
            const evt = baseEvent(r, 'transfer', r.currentStageId, {
              note,
              fromLocationId: user?.locationId ?? r.intakeLocationId,
              toLocationId
            })
            return { ...r, events: [...r.events, evt] }
          })
        ),
      setStage: applyStage,
      advanceRecord: (recordId: string) => {
        const rec = records.find((r) => r.id === recordId)
        const next = rec ? nextStageId(rec) : null
        if (!rec || !next) return
        const prevStage = rec.currentStageId
        applyStage(recordId, next)
        notify(`${rec.code} → ${stageById(next).label}`, {
          undoLabel: 'Undo',
          onUndo: () => applyStage(recordId, prevStage)
        })
      },
      advanceRecords: (recordIds: string[]) => {
        const toAdvance = records.filter((r) => recordIds.includes(r.id) && nextStageId(r))
        if (toAdvance.length === 0) return 0
        setRecords((prev) =>
          prev.map((r) => {
            if (!recordIds.includes(r.id)) return r
            const next = nextStageId(r)
            if (!next) return r
            const evt = baseEvent(r, 'status', next)
            return {
              ...r,
              currentStageId: next,
              dateCompleted: stageById(next).terminal ? nowIso() : r.dateCompleted,
              events: [...r.events, evt]
            }
          })
        )
        notify(`Advanced ${toAdvance.length} ${config.recordLabel.toLowerCase()}${toAdvance.length === 1 ? '' : 's'}`)
        return toAdvance.length
      },
      activeVariant,
      switchVariant: (variantId: string) => {
        const v = variantById(variantId)
        if (!v) return
        applyDeployment(v.config)
        setActiveVariant(variantId)
        setRecords(v.records)
        const admin = v.config.staff.find((s) => s.role === 'admin') ?? v.config.staff[0]
        setUser(admin ?? null)
      },
      toast,
      notify,
      dismissToast
    }
  }, [user, records, activeVariant, toast, notify, dismissToast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useRole(): Role {
  return useApp().user?.role ?? 'staff'
}

export type { DeploymentConfig }
