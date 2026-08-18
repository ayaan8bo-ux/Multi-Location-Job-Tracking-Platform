import type { StatusEvent, WorkRecord } from '../types'
import { config } from '../config'

function iso(deltaDays: number, hourOffset = 0): string {
  const d = new Date(Date.now() - deltaDays * 86400000 - hourOffset * 3600000)
  d.setSeconds(0, 0)
  return d.toISOString()
}

let seq = 0
function event(
  recordId: string,
  kind: StatusEvent['kind'],
  stageId: string,
  opts: Partial<StatusEvent> = {}
): StatusEvent {
  seq += 1
  return {
    id: `evt-${seq}`,
    recordId,
    kind,
    stageId,
    note: opts.note,
    fromLocationId: opts.fromLocationId,
    toLocationId: opts.toLocationId,
    updatedByStaffId: opts.updatedByStaffId ?? 'stf-002',
    locationId: opts.locationId ?? 'loc-koramangala',
    updatedAt: opts.updatedAt ?? iso(0)
  }
}

function rec(r: Omit<WorkRecord, 'id' | 'events'> & { id?: string; events?: StatusEvent[] }): WorkRecord {
  return { ...r, id: r.id ?? `rec-${seq}`, events: r.events ?? [] }
}

export const records: WorkRecord[] = [
  rec({
    code: 'MS-000132',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    recordTypeId: 'in-house',
    uniqueIdentifier: '356789012345678',
    customFields: {
      device_model: 'iPhone 14',
      condition: 'Scratches on rear glass, no liquid damage',
      password: '—',
      accessories: 'None'
    },
    description: 'Phone not charging, port suspected faulty.',
    intakeLocationId: 'loc-koramangala',
    intakeStaffId: 'stf-002',
    currentStageId: 'in_progress',
    estimatedCost: 1200,
    dateReceived: iso(4),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(4, 3), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala', note: 'Intake at counter' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(3, 2), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala', note: 'Charging port replaced' })
    ]
  }),
  rec({
    code: 'MS-000133',
    customerName: 'Sneha Patil',
    customerPhone: '9988771122',
    recordTypeId: 'third-party',
    uniqueIdentifier: '353981076543210',
    customFields: {
      device_model: 'Samsung Galaxy S23',
      condition: 'Cracked AMOLED display',
      password: '—',
      accessories: 'Back cover'
    },
    description: 'Display replacement, sent to third-party service.',
    intakeLocationId: 'loc-indiranagar',
    intakeStaffId: 'stf-003',
    currentStageId: 'ready',
    estimatedCost: 6800,
    dateReceived: iso(6),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(6, 2), updatedByStaffId: 'stf-003', locationId: 'loc-indiranagar' }),
      event('x', 'transfer', 'in_progress', { updatedAt: iso(5, 4), updatedByStaffId: 'stf-003', locationId: 'loc-indiranagar', fromLocationId: 'loc-indiranagar', toLocationId: 'loc-koramangala', note: 'Sent to third-party service desk' }),
      event('x', 'status', 'ready', { updatedAt: iso(1, 1), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala', note: 'Repair complete, awaiting collection' })
    ]
  }),
  rec({
    code: 'MS-000134',
    customerName: 'Imran Qureshi',
    customerPhone: '9898765432',
    recordTypeId: 'in-house',
    uniqueIdentifier: '490154203237518',
    customFields: {
      device_model: 'OnePlus 11',
      condition: 'Minor scuffs, front glass ok',
      password: '2580',
      accessories: 'None'
    },
    description: 'Battery drains fast even after recalibration.',
    intakeLocationId: 'loc-koramangala',
    intakeStaffId: 'stf-001',
    currentStageId: 'delivered',
    estimatedCost: 2200,
    finalCost: 2200,
    dateReceived: iso(12),
    dateCompleted: iso(8),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(12, 3), updatedByStaffId: 'stf-001', locationId: 'loc-koramangala' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(11, 2), updatedByStaffId: 'stf-001', locationId: 'loc-koramangala', note: 'Battery health checked, replacement ordered' }),
      event('x', 'status', 'ready', { updatedAt: iso(9, 1), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala' }),
      event('x', 'status', 'delivered', { updatedAt: iso(8, 4), updatedByStaffId: 'stf-001', locationId: 'loc-koramangala', note: 'Collected at counter, receipt issued' })
    ]
  }),
  rec({
    code: 'MS-000135',
    customerName: 'Ananya Iyer',
    customerPhone: '9012345678',
    recordTypeId: 'in-house',
    uniqueIdentifier: '868125039241577',
    customFields: {
      device_model: 'Pixel 7a',
      condition: 'Cracked camera lens',
      password: '—',
      accessories: 'None'
    },
    description: 'Rear camera blurry, lens cracked.',
    intakeLocationId: 'loc-indiranagar',
    intakeStaffId: 'stf-004',
    currentStageId: 'awaiting_decision',
    estimatedCost: 3400,
    dateReceived: iso(5),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(5, 2), updatedByStaffId: 'stf-004', locationId: 'loc-indiranagar' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(4, 1), updatedByStaffId: 'stf-004', locationId: 'loc-indiranagar', note: 'Quote prepared: ₹3,400 for lens unit' }),
      event('x', 'status', 'awaiting_decision', { updatedAt: iso(3, 2), updatedByStaffId: 'stf-004', locationId: 'loc-indiranagar', note: 'Waiting for customer approval on quote' })
    ]
  }),
  rec({
    code: 'MS-000136',
    customerName: 'Vikram Singh',
    customerPhone: '9345678901',
    recordTypeId: 'third-party',
    uniqueIdentifier: '357938045614829',
    customFields: {
      device_model: 'Realme GT 2',
      condition: 'Dented frame, touch erratic',
      password: '—',
      accessories: 'SIM tray'
    },
    description: 'Motherboard issue, need component-level repair.',
    intakeLocationId: 'loc-koramangala',
    intakeStaffId: 'stf-002',
    currentStageId: 'in_progress',
    estimatedCost: 5200,
    dateReceived: iso(2),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(2, 3), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(1, 2), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala', note: 'Diagnosis done, awaiting component stock' })
    ]
  }),
  rec({
    code: 'MS-000137',
    customerName: 'Lakshmi Menon',
    customerPhone: '9123456780',
    recordTypeId: 'in-house',
    uniqueIdentifier: '864449031574832',
    customFields: {
      device_model: 'Nokia G42',
      condition: 'No visible damage',
      password: '—',
      accessories: 'None'
    },
    description: 'Software issue, device stuck on boot logo.',
    intakeLocationId: 'loc-indiranagar',
    intakeStaffId: 'stf-003',
    currentStageId: 'ready',
    estimatedCost: 900,
    dateReceived: iso(7),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(7, 2), updatedByStaffId: 'stf-003', locationId: 'loc-indiranagar' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(6, 1), updatedByStaffId: 'stf-003', locationId: 'loc-indiranagar', note: 'Firmware reflashed' }),
      event('x', 'status', 'ready', { updatedAt: iso(5, 2), updatedByStaffId: 'stf-003', locationId: 'loc-indiranagar' })
    ]
  }),
  rec({
    code: 'MS-000138',
    customerName: 'Devansh Mehta',
    customerPhone: '9567890123',
    recordTypeId: 'in-house',
    uniqueIdentifier: '350123456789014',
    customFields: {
      device_model: 'iPhone 13',
      condition: 'Good, minor edge wear',
      password: '—',
      accessories: 'None'
    },
    description: 'Face ID not working after screen replacement.',
    intakeLocationId: 'loc-koramangala',
    intakeStaffId: 'stf-001',
    currentStageId: 'in_progress',
    estimatedCost: 2800,
    dateReceived: iso(3),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(3, 3), updatedByStaffId: 'stf-001', locationId: 'loc-koramangala' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(2, 4), updatedByStaffId: 'stf-001', locationId: 'loc-koramangala', note: 'TrueDepth flex replaced' })
    ]
  }),
  rec({
    code: 'MS-000139',
    customerName: 'Pooja Verma',
    customerPhone: '9765432109',
    recordTypeId: 'in-house',
    uniqueIdentifier: '356981026345182',
    customFields: {
      device_model: 'Vivo V27',
      condition: 'Cracked front glass, display works',
      password: '1234',
      accessories: 'None'
    },
    description: 'Front glass crack, touch partially responsive.',
    intakeLocationId: 'loc-indiranagar',
    intakeStaffId: 'stf-004',
    currentStageId: 'cancelled',
    dateReceived: iso(9),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(9, 2), updatedByStaffId: 'stf-004', locationId: 'loc-indiranagar' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(8, 1), updatedByStaffId: 'stf-004', locationId: 'loc-indiranagar' }),
      event('x', 'status', 'cancelled', { updatedAt: iso(7, 3), updatedByStaffId: 'stf-004', locationId: 'loc-indiranagar', note: 'Customer chose not to proceed with repair' })
    ]
  }),
  rec({
    code: 'MS-000140',
    customerName: 'Aditya Kulkarni',
    customerPhone: '9654321098',
    recordTypeId: 'third-party',
    uniqueIdentifier: '359412086753190',
    customFields: {
      device_model: 'OnePlus 9 Pro',
      condition: 'Dropped, corner dent',
      password: '—',
      accessories: 'None'
    },
    description: 'Water damage board, needs ultrasonic cleaning.',
    intakeLocationId: 'loc-koramangala',
    intakeStaffId: 'stf-002',
    currentStageId: 'returned_unresolved',
    estimatedCost: 4600,
    dateReceived: iso(14),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(14, 2), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(13, 1), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala', note: 'Cleaning attempted' }),
      event('x', 'status', 'returned_unresolved', { updatedAt: iso(11, 3), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala', note: 'Board beyond repair, returned as-is' })
    ]
  }),
  rec({
    code: 'MS-000141',
    customerName: 'Kavya Reddy',
    customerPhone: '9012987654',
    recordTypeId: 'in-house',
    uniqueIdentifier: '866342059784210',
    customFields: {
      device_model: 'Redmi Note 12',
      condition: 'Good',
      password: '—',
      accessories: 'None'
    },
    description: 'Speaker not working during calls.',
    intakeLocationId: 'loc-koramangala',
    intakeStaffId: 'stf-001',
    currentStageId: 'delivered',
    estimatedCost: 1500,
    finalCost: 1500,
    dateReceived: iso(10),
    dateCompleted: iso(6),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(10, 3), updatedByStaffId: 'stf-001', locationId: 'loc-koramangala' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(9, 2), updatedByStaffId: 'stf-001', locationId: 'loc-koramangala', note: 'Earpiece replaced' }),
      event('x', 'status', 'ready', { updatedAt: iso(8, 1), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala' }),
      event('x', 'status', 'delivered', { updatedAt: iso(6, 4), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala' })
    ]
  }),
  rec({
    code: 'MS-000142',
    customerName: 'Rohan Bhat',
    customerPhone: '9876123450',
    recordTypeId: 'in-house',
    uniqueIdentifier: '353780124596234',
    customFields: {
      device_model: 'iPhone 12',
      condition: 'Scratches, battery swelled',
      password: '—',
      accessories: 'None'
    },
    description: 'Battery swollen, back glass lifted.',
    intakeLocationId: 'loc-indiranagar',
    intakeStaffId: 'stf-003',
    currentStageId: 'received',
    estimatedCost: 3400,
    dateReceived: iso(1),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(1, 2), updatedByStaffId: 'stf-003', locationId: 'loc-indiranagar', note: 'Battery replacement requested' })
    ]
  }),
  rec({
    code: 'MS-000143',
    customerName: 'Shruti Jain',
    customerPhone: '9456781230',
    recordTypeId: 'in-house',
    uniqueIdentifier: '868145092637418',
    customFields: {
      device_model: 'Samsung A54',
      condition: 'Good',
      password: '—',
      accessories: 'Case'
    },
    description: 'Charging slow, port needs cleaning.',
    intakeLocationId: 'loc-koramangala',
    intakeStaffId: 'stf-002',
    currentStageId: 'ready',
    estimatedCost: 600,
    dateReceived: iso(4),
    events: [
      event('x', 'created', 'received', { updatedAt: iso(4, 2), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala' }),
      event('x', 'status', 'in_progress', { updatedAt: iso(3, 1), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala' }),
      event('x', 'status', 'ready', { updatedAt: iso(2, 3), updatedByStaffId: 'stf-002', locationId: 'loc-koramangala', note: 'Port cleaned, ready for pickup' })
    ]
  })
]

export const defaultRecord = {
  customerName: '',
  customerPhone: '',
  recordTypeId: config.recordTypes[0]?.id ?? 'in-house',
  uniqueIdentifier: '',
  device_model: '',
  condition: '',
  password: '',
  accessories: '',
  description: '',
  estimatedCost: ''
}
