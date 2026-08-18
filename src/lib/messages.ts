import type { WorkRecord } from '../types'
import { config } from '../config'
import { locationById, stageById } from './utils'

export type MessageType = 'intake' | 'status_update' | 'completion' | 'review_request'

export interface CustomerMessage {
  id: string
  type: MessageType
  recordCode: string
  customerName: string
  customerPhone: string
  content: string
  sentAt: string
  status: 'sent' | 'delivered'
}

const typeLabel: Record<MessageType, string> = {
  intake: 'Intake document',
  status_update: 'Status update',
  completion: 'Completion document',
  review_request: 'Review request'
}

export const messageTypeLabel = (t: MessageType): string => typeLabel[t]

function hashInt(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function deriveMessages(records: WorkRecord[]): CustomerMessage[] {
  const msgs: CustomerMessage[] = []
  for (const r of records) {
    const loc = locationById(r.intakeLocationId).name
    for (const e of r.events) {
      const seed = `${r.id}-${e.id}`
      const base = {
        recordCode: r.code,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        sentAt: e.updatedAt,
        status: (hashInt(seed) % 4 === 0 ? 'sent' : 'delivered') as CustomerMessage['status']
      }
      if (e.kind === 'created') {
        msgs.push({
          ...base,
          id: `msg-intake-${r.id}-${e.id}`,
          type: 'intake',
          content: `Hi ${r.customerName}, your ${config.recordLabel.toLowerCase()} ${r.code} was received at ${config.businessName}, ${loc}. Keep this code for reference. — ${config.businessName}`
        })
      } else if (e.kind === 'status') {
        const stage = stageById(e.stageId)
        if (stage.terminal && !stage.isException) {
          const cost = r.finalCost ?? r.estimatedCost
          msgs.push({
            ...base,
            id: `msg-complete-${r.id}-${e.id}`,
            type: 'completion',
            content: `Your ${config.recordLabel.toLowerCase()} ${r.code} is complete${cost !== undefined ? ` — ${config.currency}${cost}` : ''}. Please collect it at ${config.businessName}, ${loc}. — ${config.businessName}`
          })
          msgs.push({
            ...base,
            id: `msg-review-${r.id}-${e.id}`,
            type: 'review_request',
            content: `Thanks for choosing ${config.businessName}! If you have a moment, we'd love your feedback on your recent ${config.recordLabel.toLowerCase()} ${r.code}. — ${config.businessName}`
          })
        } else if (stage.terminal) {
          msgs.push({
            ...base,
            id: `msg-status-${r.id}-${e.id}`,
            type: 'status_update',
            content: `Your ${config.recordLabel.toLowerCase()} ${r.code} is now ${stage.label}. If anything changes, we'll let you know. — ${config.businessName}`
          })
        } else {
          msgs.push({
            ...base,
            id: `msg-status-${r.id}-${e.id}`,
            type: 'status_update',
            content: `Your ${config.recordLabel.toLowerCase()} ${r.code} is now ${stage.label}. — ${config.businessName}`
          })
        }
      }
    }
  }
  return msgs.sort((a, b) => b.sentAt.localeCompare(a.sentAt))
}

export function transfersOf(records: WorkRecord[]) {
  const rows: {
    id: string
    recordCode: string
    customerName: string
    fromLocationId: string
    toLocationId: string
    note?: string
    updatedByStaffId: string
    updatedAt: string
  }[] = []
  for (const r of records) {
    for (const e of r.events) {
      if (e.kind !== 'transfer') continue
      rows.push({
        id: e.id,
        recordCode: r.code,
        customerName: r.customerName,
        fromLocationId: e.fromLocationId ?? r.intakeLocationId,
        toLocationId: e.toLocationId ?? '',
        note: e.note,
        updatedByStaffId: e.updatedByStaffId,
        updatedAt: e.updatedAt
      })
    }
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function auditRows(records: WorkRecord[]) {
  const rows: {
    id: string
    recordCode: string
    kind: string
    stageId: string
    note?: string
    updatedByStaffId: string
    locationId: string
    updatedAt: string
  }[] = []
  for (const r of records) {
    for (const e of r.events) {
      rows.push({
        id: e.id,
        recordCode: r.code,
        kind: e.kind,
        stageId: e.stageId,
        note: e.note,
        updatedByStaffId: e.updatedByStaffId,
        locationId: e.locationId,
        updatedAt: e.updatedAt
      })
    }
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
