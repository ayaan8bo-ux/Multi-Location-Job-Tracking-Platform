export type Role = 'staff' | 'admin'

export type Tone = 'slate' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'red'

export interface Stage {
  id: string
  label: string
  sequenceOrder: number | null
  isException: boolean
  tone: Tone
  terminal?: boolean
}

export interface Location {
  id: string
  name: string
  area: string
  active: boolean
}

export interface Staff {
  id: string
  name: string
  phone: string
  locationId: string
  role: Role
}

export interface CustomFieldDef {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea'
  required?: boolean
}

export interface RecordTypeDef {
  id: string
  label: string
  pipeline: string[]
}

export interface DeploymentConfig {
  businessName: string
  recordLabel: string
  recordLabelPlural: string
  identifierLabel: string
  identifierPlaceholder: string
  currency: string
  recordCodePrefix: string
  stages: Stage[]
  locations: Location[]
  staff: Staff[]
  customFields: CustomFieldDef[]
  recordTypes: RecordTypeDef[]
  awaitingPickupStageId?: string
}

export type EventKind = 'created' | 'status' | 'transfer' | 'edit'

export interface StatusEvent {
  id: string
  recordId: string
  kind: EventKind
  stageId: string
  note?: string
  fromLocationId?: string
  toLocationId?: string
  updatedByStaffId: string
  locationId: string
  updatedAt: string
}

export interface WorkRecord {
  id: string
  code: string
  customerName: string
  customerPhone: string
  recordTypeId: string
  uniqueIdentifier: string
  customFields: Record<string, string>
  description: string
  intakeLocationId: string
  intakeStaffId: string
  currentStageId: string
  estimatedCost?: number
  finalCost?: number
  dateReceived: string
  dateCompleted?: string
  events: StatusEvent[]
}
