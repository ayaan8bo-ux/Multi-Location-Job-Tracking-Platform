import type { DeploymentConfig, StatusEvent, WorkRecord } from './types'

export interface Variant {
  id: string
  name: string
  industry: string
  description: string
  config: DeploymentConfig
  records: WorkRecord[]
}

let seq = 0
const uid = () => `var-${++seq}`

function mkRecord(o: {
  code: string
  customerName: string
  customerPhone: string
  identifier: string
  recordTypeId: string
  customFields?: Record<string, string>
  description?: string
  stageIds: string[]
  locationId: string
  staffId: string
  est?: number
  fin?: number
  done?: boolean
}): WorkRecord {
  const start = Date.now() - (o.stageIds.length + 3) * 86400000
  const events: StatusEvent[] = o.stageIds.map((sid, i) => ({
    id: uid(),
    recordId: uid(),
    kind: i === 0 ? 'created' : 'status',
    stageId: sid,
    note: i === 0 ? 'Intake at counter' : undefined,
    updatedByStaffId: o.staffId,
    locationId: o.locationId,
    updatedAt: new Date(start + i * 86400000 + i * 3600000).toISOString()
  }))
  const last = events[events.length - 1]
  return {
    id: uid(),
    code: o.code,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    recordTypeId: o.recordTypeId,
    uniqueIdentifier: o.identifier,
    customFields: o.customFields ?? {},
    description: o.description ?? '',
    intakeLocationId: o.locationId,
    intakeStaffId: o.staffId,
    currentStageId: last.stageId,
    estimatedCost: o.est,
    finalCost: o.fin,
    dateReceived: events[0].updatedAt,
    dateCompleted: o.done ? last.updatedAt : undefined,
    events
  }
}

const mobile: Variant = {
  id: 'mobile-repair',
  name: 'Mobile Station',
  industry: 'Mobile & electronics repair',
  description: 'Jobs tracked by IMEI across two service branches.',
  config: {
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
      { key: 'password', label: 'Device passcode / PIN', type: 'text' }
    ],
    recordTypes: [
      { id: 'in-house', label: 'In-house repair', pipeline: ['received', 'in_progress', 'ready', 'delivered'] },
      { id: 'third-party', label: 'Sent to third party', pipeline: ['received', 'in_progress', 'ready', 'delivered'] }
    ],
    awaitingPickupStageId: 'ready'
  },
  records: [
    mkRecord({ code: 'MS-000132', customerName: 'Rahul Sharma', customerPhone: '9876543210', identifier: '356789012345678', recordTypeId: 'in-house', customFields: { device_model: 'iPhone 14', condition: 'Rear glass scratched', password: '—' }, description: 'Phone not charging.', stageIds: ['received', 'in_progress'], locationId: 'loc-koramangala', staffId: 'stf-002', est: 1200 }),
    mkRecord({ code: 'MS-000133', customerName: 'Sneha Patil', customerPhone: '9988771122', identifier: '353981076543210', recordTypeId: 'third-party', customFields: { device_model: 'Samsung S23', condition: 'Cracked display', password: '—' }, description: 'Display replacement via third party.', stageIds: ['received', 'in_progress', 'ready'], locationId: 'loc-indiranagar', staffId: 'stf-003', est: 6800 }),
    mkRecord({ code: 'MS-000134', customerName: 'Imran Qureshi', customerPhone: '9898765432', identifier: '490154203237518', recordTypeId: 'in-house', customFields: { device_model: 'OnePlus 11', condition: 'Minor scuffs', password: '2580' }, description: 'Battery replacement.', stageIds: ['received', 'in_progress', 'ready', 'delivered'], locationId: 'loc-koramangala', staffId: 'stf-001', est: 2200, fin: 2200, done: true }),
    mkRecord({ code: 'MS-000135', customerName: 'Ananya Iyer', customerPhone: '9012345678', identifier: '868125039241577', recordTypeId: 'in-house', customFields: { device_model: 'Pixel 7a', condition: 'Cracked camera lens', password: '—' }, description: 'Rear camera blurry.', stageIds: ['received', 'in_progress', 'awaiting_decision'], locationId: 'loc-indiranagar', staffId: 'stf-004', est: 3400 }),
    mkRecord({ code: 'MS-000136', customerName: 'Vikram Singh', customerPhone: '9345678901', identifier: '357938045614829', recordTypeId: 'in-house', customFields: { device_model: 'Realme GT 2', condition: 'Dented frame', password: '—' }, description: 'Motherboard component repair.', stageIds: ['received', 'in_progress', 'ready'], locationId: 'loc-koramangala', staffId: 'stf-002', est: 5200 })
  ]
}

const salon: Variant = {
  id: 'salon',
  name: 'Glow & Trim',
  industry: 'Salon / spa chain',
  description: 'Appointments tracked by membership ID across branches.',
  config: {
    businessName: 'Glow & Trim',
    recordLabel: 'Appointment',
    recordLabelPlural: 'Appointments',
    identifierLabel: 'Membership ID',
    identifierPlaceholder: 'e.g. MEM-1024',
    currency: '₹',
    recordCodePrefix: 'SLN',
    stages: [
      { id: 'booked', label: 'Booked', sequenceOrder: 1, isException: false, tone: 'blue' },
      { id: 'in_service', label: 'In Service', sequenceOrder: 2, isException: false, tone: 'indigo' },
      { id: 'completed', label: 'Completed', sequenceOrder: 3, isException: false, tone: 'emerald', terminal: true },
      { id: 'no_show', label: 'No-show', sequenceOrder: null, isException: true, tone: 'amber' },
      { id: 'cancelled', label: 'Cancelled', sequenceOrder: null, isException: true, tone: 'red', terminal: true }
    ],
    locations: [
      { id: 'loc-indiranagar', name: 'Indiranagar', area: 'Bengaluru East', active: true },
      { id: 'loc-whitefield', name: 'Whitefield', area: 'Bengaluru East', active: true }
    ],
    staff: [
      { id: 'stf-s1', name: 'Ritu Malhotra', phone: '9811101111', locationId: 'loc-indiranagar', role: 'admin' },
      { id: 'stf-s2', name: 'Sneha K', phone: '9811102222', locationId: 'loc-indiranagar', role: 'staff' },
      { id: 'stf-s3', name: 'Aditi R', phone: '9811103333', locationId: 'loc-whitefield', role: 'staff' }
    ],
    customFields: [
      { key: 'service', label: 'Service', type: 'text', required: true },
      { key: 'stylist', label: 'Stylist', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ],
    recordTypes: [
      { id: 'hair', label: 'Hair services', pipeline: ['booked', 'in_service', 'completed'] },
      { id: 'skin', label: 'Skin & facial', pipeline: ['booked', 'in_service', 'completed'] }
    ]
  },
  records: [
    mkRecord({ code: 'SLN-0041', customerName: 'Kavya Reddy', customerPhone: '9012987654', identifier: 'MEM-1024', recordTypeId: 'hair', customFields: { service: 'Cut + deep conditioning', stylist: 'Ritu' }, description: 'Member, prefers noon slot.', stageIds: ['booked'], locationId: 'loc-indiranagar', staffId: 'stf-s2', est: 1200 }),
    mkRecord({ code: 'SLN-0042', customerName: 'Devansh Mehta', customerPhone: '9567890123', identifier: 'MEM-2048', recordTypeId: 'hair', customFields: { service: 'Beard grooming', stylist: 'Aditi' }, stageIds: ['booked', 'in_service'], locationId: 'loc-whitefield', staffId: 'stf-s3', est: 500 }),
    mkRecord({ code: 'SLN-0043', customerName: 'Pooja Verma', customerPhone: '9765432109', identifier: 'WALK-IN', recordTypeId: 'skin', customFields: { service: 'Hydra facial', stylist: 'Sneha' }, stageIds: ['booked', 'in_service', 'completed'], locationId: 'loc-indiranagar', staffId: 'stf-s2', est: 2500, fin: 2500, done: true }),
    mkRecord({ code: 'SLN-0044', customerName: 'Rohan Bhat', customerPhone: '9876123450', identifier: 'MEM-3072', recordTypeId: 'hair', customFields: { service: 'Hair colour', stylist: 'Ritu' }, description: 'Needs patch test first.', stageIds: ['booked', 'no_show'], locationId: 'loc-indiranagar', staffId: 'stf-s1', est: 3200 })
  ]
}

const dryCleaning: Variant = {
  id: 'dry-cleaning',
  name: 'FreshFold Laundry',
  industry: 'Dry cleaning / laundry',
  description: 'Orders tracked by tag number from drop-off to collection.',
  config: {
    businessName: 'FreshFold Laundry',
    recordLabel: 'Order',
    recordLabelPlural: 'Orders',
    identifierLabel: 'Order tag no.',
    identifierPlaceholder: 'e.g. 8421',
    currency: '₹',
    recordCodePrefix: 'DCL',
    stages: [
      { id: 'dropped_off', label: 'Dropped Off', sequenceOrder: 1, isException: false, tone: 'blue' },
      { id: 'in_process', label: 'In Process', sequenceOrder: 2, isException: false, tone: 'indigo' },
      { id: 'ready', label: 'Ready for Collection', sequenceOrder: 3, isException: false, tone: 'emerald' },
      { id: 'collected', label: 'Collected', sequenceOrder: 4, isException: false, tone: 'emerald', terminal: true },
      { id: 'cancelled', label: 'Cancelled', sequenceOrder: null, isException: true, tone: 'red', terminal: true },
      { id: 'returned_unresolved', label: 'Returned Unresolved', sequenceOrder: null, isException: true, tone: 'slate', terminal: true }
    ],
    locations: [
      { id: 'loc-jpnagar', name: 'JP Nagar', area: 'Bengaluru South', active: true },
      { id: 'loc-hsr', name: 'HSR Layout', area: 'Bengaluru South', active: true }
    ],
    staff: [
      { id: 'stf-d1', name: 'Ganesh Iyer', phone: '9812201111', locationId: 'loc-jpnagar', role: 'admin' },
      { id: 'stf-d2', name: 'Lakshmi M', phone: '9812202222', locationId: 'loc-jpnagar', role: 'staff' },
      { id: 'stf-d3', name: 'Suresh P', phone: '9812203333', locationId: 'loc-hsr', role: 'staff' }
    ],
    customFields: [
      { key: 'garment_type', label: 'Garment type', type: 'text', required: true },
      { key: 'item_count', label: 'Item count', type: 'number' },
      { key: 'stains', label: 'Stains / notes', type: 'textarea' }
    ],
    recordTypes: [
      { id: 'standard', label: 'Standard', pipeline: ['dropped_off', 'in_process', 'ready', 'collected'] },
      { id: 'express', label: 'Express (24h)', pipeline: ['dropped_off', 'in_process', 'ready', 'collected'] }
    ],
    awaitingPickupStageId: 'ready'
  },
  records: [
    mkRecord({ code: 'DCL-8421', customerName: 'Aditya Kulkarni', customerPhone: '9654321098', identifier: '8421', recordTypeId: 'standard', customFields: { garment_type: 'Suits', item_count: '3', stains: 'Wine stain on jacket' }, stageIds: ['dropped_off'], locationId: 'loc-jpnagar', staffId: 'stf-d2', est: 450 }),
    mkRecord({ code: 'DCL-8422', customerName: 'Shruti Jain', customerPhone: '9456781230', identifier: '8422', recordTypeId: 'express', customFields: { garment_type: 'Wedding lehenga', item_count: '1', stains: 'Mild soil' }, stageIds: ['dropped_off', 'in_process'], locationId: 'loc-hsr', staffId: 'stf-d3', est: 1900 }),
    mkRecord({ code: 'DCL-8423', customerName: 'Kavya Reddy', customerPhone: '9012987654', identifier: '8423', recordTypeId: 'standard', customFields: { garment_type: 'Curtains', item_count: '4', stains: '—' }, stageIds: ['dropped_off', 'in_process', 'ready'], locationId: 'loc-jpnagar', staffId: 'stf-d2', est: 700 }),
    mkRecord({ code: 'DCL-8424', customerName: 'Rohan Bhat', customerPhone: '9876123450', identifier: '8424', recordTypeId: 'standard', customFields: { garment_type: 'Shirts', item_count: '8', stains: '—' }, stageIds: ['dropped_off', 'in_process', 'ready', 'collected'], locationId: 'loc-jpnagar', staffId: 'stf-d1', est: 640, fin: 640, done: true })
  ]
}

const autoWorkshop: Variant = {
  id: 'auto-workshop',
  name: 'Torque Garage',
  industry: 'Auto workshop',
  description: 'Job cards tracked by VIN through diagnosis and repair.',
  config: {
    businessName: 'Torque Garage',
    recordLabel: 'Job Card',
    recordLabelPlural: 'Job Cards',
    identifierLabel: 'VIN / reg. no.',
    identifierPlaceholder: 'e.g. KA05AB1234',
    currency: '₹',
    recordCodePrefix: 'AW',
    stages: [
      { id: 'checked_in', label: 'Checked In', sequenceOrder: 1, isException: false, tone: 'blue' },
      { id: 'diagnosis', label: 'Diagnosis', sequenceOrder: 2, isException: false, tone: 'indigo' },
      { id: 'in_repair', label: 'In Repair', sequenceOrder: 3, isException: false, tone: 'indigo' },
      { id: 'delivered', label: 'Delivered', sequenceOrder: 4, isException: false, tone: 'emerald', terminal: true },
      { id: 'awaiting_decision', label: 'Awaiting Customer Decision', sequenceOrder: null, isException: true, tone: 'amber' },
      { id: 'cancelled', label: 'Cancelled', sequenceOrder: null, isException: true, tone: 'red', terminal: true }
    ],
    locations: [
      { id: 'loc-peenya', name: 'Peenya', area: 'Bengaluru North', active: true },
      { id: 'loc-hsr', name: 'HSR Layout', area: 'Bengaluru South', active: true }
    ],
    staff: [
      { id: 'stf-a1', name: 'Ravi Kumar', phone: '9813301111', locationId: 'loc-peenya', role: 'admin' },
      { id: 'stf-a2', name: 'Joseph D', phone: '9813302222', locationId: 'loc-peenya', role: 'staff' },
      { id: 'stf-a3', name: 'Manoj S', phone: '9813303333', locationId: 'loc-hsr', role: 'staff' }
    ],
    customFields: [
      { key: 'vehicle', label: 'Vehicle', type: 'text', required: true },
      { key: 'mileage', label: 'Mileage (km)', type: 'number' },
      { key: 'symptoms', label: 'Reported symptoms', type: 'textarea' }
    ],
    recordTypes: [
      { id: 'general', label: 'General service', pipeline: ['checked_in', 'diagnosis', 'in_repair', 'delivered'] },
      { id: 'bodywork', label: 'Bodywork & paint', pipeline: ['checked_in', 'diagnosis', 'in_repair', 'delivered'] }
    ]
  },
  records: [
    mkRecord({ code: 'AW-0210', customerName: 'Vikram Singh', customerPhone: '9345678901', identifier: 'KA05AB1234', recordTypeId: 'general', customFields: { vehicle: 'Hyundai Creta', mileage: '41200', symptoms: 'Brake noise on front left' }, stageIds: ['checked_in'], locationId: 'loc-peenya', staffId: 'stf-a2', est: 2500 }),
    mkRecord({ code: 'AW-0211', customerName: 'Lakshmi Menon', customerPhone: '9123456780', identifier: 'KA03CD5678', recordTypeId: 'bodywork', customFields: { vehicle: 'Maruti Swift', mileage: '22800', symptoms: 'Dent on rear door' }, stageIds: ['checked_in', 'diagnosis'], locationId: 'loc-hsr', staffId: 'stf-a3', est: 6500 }),
    mkRecord({ code: 'AW-0212', customerName: 'Devansh Mehta', customerPhone: '9567890123', identifier: 'KA02EF9012', recordTypeId: 'general', customFields: { vehicle: 'Tata Nexon', mileage: '31500', symptoms: 'Engine warning light' }, stageIds: ['checked_in', 'diagnosis', 'in_repair'], locationId: 'loc-peenya', staffId: 'stf-a1', est: 4800 }),
    mkRecord({ code: 'AW-0213', customerName: 'Pooja Verma', customerPhone: '9765432109', identifier: 'KA51GH3456', recordTypeId: 'general', customFields: { vehicle: 'Honda City', mileage: '54000', symptoms: 'Periodic service' }, stageIds: ['checked_in', 'diagnosis', 'in_repair', 'delivered'], locationId: 'loc-peenya', staffId: 'stf-a2', est: 3900, fin: 3900, done: true })
  ]
}

const clinic: Variant = {
  id: 'clinic',
  name: 'Pulse Diagnostics',
  industry: 'Clinic / diagnostic lab',
  description: 'Patient cases tracked from registration to report delivery.',
  config: {
    businessName: 'Pulse Diagnostics',
    recordLabel: 'Case',
    recordLabelPlural: 'Cases',
    identifierLabel: 'Patient ID',
    identifierPlaceholder: 'e.g. P-20841',
    currency: '₹',
    recordCodePrefix: 'CLN',
    stages: [
      { id: 'registered', label: 'Registered', sequenceOrder: 1, isException: false, tone: 'blue' },
      { id: 'sample_collected', label: 'Sample Collected', sequenceOrder: 2, isException: false, tone: 'indigo' },
      { id: 'in_lab', label: 'In Lab', sequenceOrder: 3, isException: false, tone: 'indigo' },
      { id: 'report_ready', label: 'Report Ready', sequenceOrder: 4, isException: false, tone: 'emerald', terminal: true },
      { id: 'cancelled', label: 'Cancelled', sequenceOrder: null, isException: true, tone: 'red', terminal: true },
      { id: 'returned_unresolved', label: 'Sample Rejected', sequenceOrder: null, isException: true, tone: 'slate', terminal: true }
    ],
    locations: [
      { id: 'loc-frazertown', name: 'Frazer Town', area: 'Bengaluru Central', active: true },
      { id: 'loc-bommanahalli', name: 'Bommanahalli', area: 'Bengaluru South', active: true }
    ],
    staff: [
      { id: 'stf-c1', name: 'Dr. Anita Rao', phone: '9814401111', locationId: 'loc-frazertown', role: 'admin' },
      { id: 'stf-c2', name: 'Reena Das', phone: '9814402222', locationId: 'loc-frazertown', role: 'staff' },
      { id: 'stf-c3', name: 'Praveen N', phone: '9814403333', locationId: 'loc-bommanahalli', role: 'staff' }
    ],
    customFields: [
      { key: 'department', label: 'Department', type: 'text', required: true },
      { key: 'priority', label: 'Priority', type: 'text' },
      { key: 'referred_by', label: 'Referred by', type: 'text' }
    ],
    recordTypes: [
      { id: 'pathology', label: 'Pathology', pipeline: ['registered', 'sample_collected', 'in_lab', 'report_ready'] },
      { id: 'radiology', label: 'Radiology', pipeline: ['registered', 'sample_collected', 'in_lab', 'report_ready'] }
    ],
    awaitingPickupStageId: 'report_ready'
  },
  records: [
    mkRecord({ code: 'CLN-20841', customerName: 'Shruti Jain', customerPhone: '9456781230', identifier: 'P-20841', recordTypeId: 'pathology', customFields: { department: 'Haematology', priority: 'Routine', referred_by: 'Dr. Nair' }, stageIds: ['registered'], locationId: 'loc-frazertown', staffId: 'stf-c2', est: 900 }),
    mkRecord({ code: 'CLN-20842', customerName: 'Aditya Kulkarni', customerPhone: '9654321098', identifier: 'P-20842', recordTypeId: 'radiology', customFields: { department: 'MRI', priority: 'Urgent', referred_by: 'Dr. Iyer' }, stageIds: ['registered', 'sample_collected'], locationId: 'loc-bommanahalli', staffId: 'stf-c3', est: 4500 }),
    mkRecord({ code: 'CLN-20843', customerName: 'Ananya Iyer', customerPhone: '9012345678', identifier: 'P-20843', recordTypeId: 'pathology', customFields: { department: 'Biochemistry', priority: 'Routine', referred_by: 'Self' }, stageIds: ['registered', 'sample_collected', 'in_lab'], locationId: 'loc-frazertown', staffId: 'stf-c2', est: 1200 }),
    mkRecord({ code: 'CLN-20844', customerName: 'Kavya Reddy', customerPhone: '9012987654', identifier: 'P-20844', recordTypeId: 'pathology', customFields: { department: 'Full body profile', priority: 'Routine', referred_by: 'Dr. Nair' }, stageIds: ['registered', 'sample_collected', 'in_lab', 'report_ready'], locationId: 'loc-frazertown', staffId: 'stf-c1', est: 3400, fin: 3400, done: true })
  ]
}

const courier: Variant = {
  id: 'courier',
  name: 'SwiftHive Couriers',
  industry: 'Courier / logistics hub',
  description: 'Shipments tracked by AWB number across hubs.',
  config: {
    businessName: 'SwiftHive Couriers',
    recordLabel: 'Shipment',
    recordLabelPlural: 'Shipments',
    identifierLabel: 'AWB no.',
    identifierPlaceholder: 'e.g. 771234567890',
    currency: '₹',
    recordCodePrefix: 'CRR',
    stages: [
      { id: 'received', label: 'Received', sequenceOrder: 1, isException: false, tone: 'blue' },
      { id: 'in_transit', label: 'In Transit', sequenceOrder: 2, isException: false, tone: 'indigo' },
      { id: 'at_hub', label: 'At Hub', sequenceOrder: 3, isException: false, tone: 'emerald' },
      { id: 'delivered', label: 'Delivered', sequenceOrder: 4, isException: false, tone: 'emerald', terminal: true },
      { id: 'on_hold', label: 'On Hold', sequenceOrder: null, isException: true, tone: 'amber' },
      { id: 'returned', label: 'Returned to Sender', sequenceOrder: null, isException: true, tone: 'slate', terminal: true },
      { id: 'cancelled', label: 'Cancelled', sequenceOrder: null, isException: true, tone: 'red', terminal: true }
    ],
    locations: [
      { id: 'loc-hub1', name: 'Hub 1', area: 'Peenya Terminal', active: true },
      { id: 'loc-hub2', name: 'Hub 2', area: 'Whitefield Terminal', active: true }
    ],
    staff: [
      { id: 'stf-h1', name: 'Ramesh G', phone: '9815501111', locationId: 'loc-hub1', role: 'admin' },
      { id: 'stf-h2', name: 'Sana K', phone: '9815502222', locationId: 'loc-hub1', role: 'staff' },
      { id: 'stf-h3', name: 'Imran S', phone: '9815503333', locationId: 'loc-hub2', role: 'staff' }
    ],
    customFields: [
      { key: 'service', label: 'Service', type: 'text', required: true },
      { key: 'weight', label: 'Weight (kg)', type: 'number' },
      { key: 'destination', label: 'Destination', type: 'text' }
    ],
    recordTypes: [
      { id: 'standard', label: 'Standard', pipeline: ['received', 'in_transit', 'at_hub', 'delivered'] },
      { id: 'express', label: 'Express', pipeline: ['received', 'in_transit', 'at_hub', 'delivered'] }
    ],
    awaitingPickupStageId: 'at_hub'
  },
  records: [
    mkRecord({ code: 'CRR-7712', customerName: 'Imran Qureshi', customerPhone: '9898765432', identifier: '771234567890', recordTypeId: 'express', customFields: { service: 'Same-day', weight: '0.8', destination: 'MG Road' }, stageIds: ['received'], locationId: 'loc-hub1', staffId: 'stf-h2', est: 180 }),
    mkRecord({ code: 'CRR-7713', customerName: 'Rahul Sharma', customerPhone: '9876543210', identifier: '771234567891', recordTypeId: 'standard', customFields: { service: 'Standard', weight: '3.2', destination: 'Indiranagar' }, stageIds: ['received', 'in_transit'], locationId: 'loc-hub2', staffId: 'stf-h3', est: 140 }),
    mkRecord({ code: 'CRR-7714', customerName: 'Sneha Patil', customerPhone: '9988771122', identifier: '771234567892', recordTypeId: 'standard', customFields: { service: 'Standard', weight: '1.1', destination: 'HSR Layout' }, stageIds: ['received', 'in_transit', 'at_hub'], locationId: 'loc-hub1', staffId: 'stf-h2', est: 120 }),
    mkRecord({ code: 'CRR-7715', customerName: 'Vikram Singh', customerPhone: '9345678901', identifier: '771234567893', recordTypeId: 'express', customFields: { service: 'Same-day', weight: '2.0', destination: 'Koramangala' }, stageIds: ['received', 'in_transit', 'at_hub', 'delivered'], locationId: 'loc-hub1', staffId: 'stf-h1', est: 200, fin: 200, done: true })
  ]
}

const printShop: Variant = {
  id: 'print-shop',
  name: 'InkBox Studio',
  industry: 'Print / signage shop',
  description: 'Orders tracked from design approval through production.',
  config: {
    businessName: 'InkBox Studio',
    recordLabel: 'Order',
    recordLabelPlural: 'Orders',
    identifierLabel: 'Order number',
    identifierPlaceholder: 'e.g. 3021',
    currency: '₹',
    recordCodePrefix: 'PRT',
    stages: [
      { id: 'received', label: 'Received', sequenceOrder: 1, isException: false, tone: 'blue' },
      { id: 'design', label: 'Design', sequenceOrder: 2, isException: false, tone: 'indigo' },
      { id: 'production', label: 'Production', sequenceOrder: 3, isException: false, tone: 'indigo' },
      { id: 'collected', label: 'Collected', sequenceOrder: 4, isException: false, tone: 'emerald', terminal: true },
      { id: 'awaiting_approval', label: 'Awaiting Approval', sequenceOrder: null, isException: true, tone: 'amber' },
      { id: 'cancelled', label: 'Cancelled', sequenceOrder: null, isException: true, tone: 'red', terminal: true }
    ],
    locations: [
      { id: 'loc-brigade', name: 'Brigade Road', area: 'Central Bengaluru', active: true },
      { id: 'loc-mgroad', name: 'MG Road', area: 'Central Bengaluru', active: true }
    ],
    staff: [
      { id: 'stf-p1', name: 'Nikhil R', phone: '9816601111', locationId: 'loc-brigade', role: 'admin' },
      { id: 'stf-p2', name: 'Farah S', phone: '9816602222', locationId: 'loc-brigade', role: 'staff' },
      { id: 'stf-p3', name: 'Deepak M', phone: '9816603333', locationId: 'loc-mgroad', role: 'staff' }
    ],
    customFields: [
      { key: 'product', label: 'Product', type: 'text', required: true },
      { key: 'size', label: 'Size / specs', type: 'text' },
      { key: 'quantity', label: 'Quantity', type: 'number' }
    ],
    recordTypes: [
      { id: 'branding', label: 'Branding & print', pipeline: ['received', 'design', 'production', 'collected'] },
      { id: 'signage', label: 'Signage', pipeline: ['received', 'design', 'production', 'collected'] }
    ],
    awaitingPickupStageId: 'production'
  },
  records: [
    mkRecord({ code: 'PRT-3021', customerName: 'Lakshmi Menon', customerPhone: '9123456780', identifier: '3021', recordTypeId: 'branding', customFields: { product: 'Business cards', size: '90x54mm', quantity: '500' }, stageIds: ['received'], locationId: 'loc-brigade', staffId: 'stf-p2', est: 1600 }),
    mkRecord({ code: 'PRT-3022', customerName: 'Ananya Iyer', customerPhone: '9012345678', identifier: '3022', recordTypeId: 'signage', customFields: { product: 'Shop hoarding', size: '8x4 ft', quantity: '1' }, stageIds: ['received', 'design', 'awaiting_approval'], locationId: 'loc-mgroad', staffId: 'stf-p3', est: 9800 }),
    mkRecord({ code: 'PRT-3023', customerName: 'Rohan Bhat', customerPhone: '9876123450', identifier: '3023', recordTypeId: 'branding', customFields: { product: 'Menu cards', size: 'A5', quantity: '200' }, stageIds: ['received', 'design', 'production'], locationId: 'loc-brigade', staffId: 'stf-p2', est: 4100 }),
    mkRecord({ code: 'PRT-3024', customerName: 'Pooja Verma', customerPhone: '9765432109', identifier: '3024', recordTypeId: 'branding', customFields: { product: 'Wedding invites', size: 'A6', quantity: '150' }, stageIds: ['received', 'design', 'production', 'collected'], locationId: 'loc-brigade', staffId: 'stf-p1', est: 6200, fin: 6200, done: true })
  ]
}

export const variants: Variant[] = [mobile, salon, dryCleaning, autoWorkshop, clinic, courier, printShop]

export const variantById = (id: string): Variant | undefined => variants.find((v) => v.id === id)

export { mobile as mobileVariant }
