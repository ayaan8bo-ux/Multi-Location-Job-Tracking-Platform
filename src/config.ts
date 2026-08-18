import type { DeploymentConfig } from './types'

/**
 * deployment_config (single row) — every client-specific value lives here.
 * Nothing below is hardcoded into the UI; screens render off this object.
 */
export const config: DeploymentConfig = {
  businessName: 'Mobile Station',
  recordLabel: 'Job',
  recordLabelPlural: 'Jobs',
  identifierLabel: 'IMEI / serial no.',
  identifierPlaceholder: 'e.g. 356789012345678',
  currency: '₹',
  recordCodePrefix: 'MS',

  stages: [
    { id: 'received', label: 'Received', sequenceOrder: 1, isException: false, tone: 'blue' },
    { id: 'in_progress', label: 'In Progress', sequenceOrder: 2, isException: false, tone: 'indigo' },
    { id: 'ready', label: 'Ready for Delivery', sequenceOrder: 3, isException: false, tone: 'emerald' },
    { id: 'delivered', label: 'Delivered', sequenceOrder: 4, isException: false, tone: 'emerald', terminal: true },
    { id: 'awaiting_decision', label: 'Awaiting Customer Decision', sequenceOrder: null, isException: true, tone: 'amber' },
    { id: 'cancelled', label: 'Cancelled', sequenceOrder: null, isException: true, tone: 'red', terminal: true },
    { id: 'returned_unresolved', label: 'Returned Unresolved', sequenceOrder: null, isException: true, tone: 'slate', terminal: true }
  ],

  locations: [
    { id: 'loc-koramangala', name: 'Koramangala', area: 'Bengaluru South', active: true },
    { id: 'loc-indiranagar', name: 'Indiranagar', area: 'Bengaluru East', active: true }
  ],

  staff: [
    { id: 'stf-001', name: 'Arun Kumar', phone: '9845012345', locationId: 'loc-koramangala', role: 'admin' },
    { id: 'stf-002', name: 'Divya Rao', phone: '9845067890', locationId: 'loc-koramangala', role: 'staff' },
    { id: 'stf-003', name: 'Farhan Ali', phone: '9900112233', locationId: 'loc-indiranagar', role: 'staff' },
    { id: 'stf-004', name: 'Meera Nair', phone: '9988776655', locationId: 'loc-indiranagar', role: 'staff' }
  ],

  customFields: [
    { key: 'device_model', label: 'Device model', type: 'text', required: true },
    { key: 'condition', label: 'Physical condition notes', type: 'textarea' },
    { key: 'password', label: 'Device passcode / PIN', type: 'text' },
    { key: 'accessories', label: 'Accessories received', type: 'text' }
  ],

  recordTypes: [
    { id: 'in-house', label: 'In-house repair', pipeline: ['received', 'in_progress', 'ready', 'delivered'] },
    { id: 'third-party', label: 'Sent to third party', pipeline: ['received', 'in_progress', 'ready', 'delivered'] }
  ],
  awaitingPickupStageId: 'ready'
}

/**
 * Applies a full deployment config by mutating the shared singleton.
 * Kept a mutable object so every module that imports `config` reads the
 * current deployment without prop-drilling. `applyDeployment` replaces
 * each field in place.
 */
export function applyDeployment(v: DeploymentConfig): void {
  config.businessName = v.businessName
  config.recordLabel = v.recordLabel
  config.recordLabelPlural = v.recordLabelPlural
  config.identifierLabel = v.identifierLabel
  config.identifierPlaceholder = v.identifierPlaceholder
  config.currency = v.currency
  config.recordCodePrefix = v.recordCodePrefix
  config.stages = v.stages
  config.locations = v.locations
  config.staff = v.staff
  config.customFields = v.customFields
  config.recordTypes = v.recordTypes
  config.awaitingPickupStageId = v.awaitingPickupStageId
}

export const STALL_AFTER_DAYS = 3
export const UNCOLLECTED_AFTER_DAYS = 3
