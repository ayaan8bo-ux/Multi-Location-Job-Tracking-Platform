import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Button } from '../components/ui'
import { formatDate, formatDateTime, formatMoney, locationById, staffById, stageById } from '../lib/utils'

function Shell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-zinc-100 p-4 print:bg-white print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800">
          <ArrowLeft className="size-4" /> Back
        </button>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          Print
        </Button>
      </div>
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {children}
      </div>
    </div>
  )
}

function Header({ title }: { title: string }) {
  return (
    <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-4">
      <div>
        <p className="font-display text-2xl font-semibold tracking-tight">{config.businessName}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {config.locations.map((l) => `${l.name}, ${l.area}`).join(' · ')}
          <br />
          Reg. no: VYDEN-{config.recordCodePrefix}-2026 · GST: 29ABCDE1234F1Z5
        </p>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{title}</p>
        <p className="font-display mt-1 text-lg font-semibold text-zinc-900">{config.recordLabel}</p>
        <p className="text-xs text-zinc-500">Issued {formatDateTime(new Date().toISOString())}</p>
      </div>
    </div>
  )
}

function FieldRow({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex items-start justify-between border-b border-zinc-100 py-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{k}</span>
      <span className="text-right text-sm font-medium text-zinc-800">{v || '—'}</span>
    </div>
  )
}

function IntakeSlip() {
  const { code } = useParams()
  const { records } = useApp()
  const record = records.find((r) => r.code === code)
  if (!record) return <div className="py-20 text-center text-sm text-zinc-500">Not found.</div>

  return (
    <Shell>
      <Header title="Intake document" />
      <div className="grid grid-cols-2 gap-x-8 pt-4">
        <FieldRow k="Reference" v={record.code} />
        <FieldRow k="Date received" v={formatDate(record.dateReceived)} />
        <FieldRow k="Customer" v={record.customerName} />
        <FieldRow k="Phone" v={record.customerPhone} />
        <FieldRow k={config.identifierLabel} v={record.uniqueIdentifier} />
        <FieldRow k="Service track" v={config.recordTypes.find((t) => t.id === record.recordTypeId)?.label} />
        <FieldRow k="Received at" v={locationById(record.intakeLocationId).name} />
        <FieldRow k="Handled by" v={staffById(record.intakeStaffId).name} />
        <FieldRow k="Est. cost" v={formatMoney(record.estimatedCost)} />
      </div>

      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-400">Item / service details</p>
      <div className="grid grid-cols-2 gap-x-8">
        {config.customFields.map((f) => (
          <FieldRow key={f.key} k={f.label} v={record.customFields[f.key]} />
        ))}
      </div>

      <p className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-400">Reported issue</p>
      <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">{record.description || '—'}</p>

      <p className="mt-6 text-[11px] leading-relaxed text-zinc-400">
        This document confirms receipt of the item described above. Item is held on the premises until collected. Please quote
        the reference number when enquiring or collecting. {config.businessName} is not liable for items uncollected beyond 30
        days. Warranty terms as per the service policy displayed at the counter.
      </p>
      <div className="mt-8 flex items-end justify-between">
        <p className="text-xs text-zinc-400">Staff signature</p>
        <p className="text-xs text-zinc-400">Customer signature</p>
      </div>
    </Shell>
  )
}

function Receipt() {
  const { code } = useParams()
  const { records } = useApp()
  const record = records.find((r) => r.code === code)
  if (!record) return <div className="py-20 text-center text-sm text-zinc-500">Not found.</div>

  return (
    <Shell>
      <Header title="Completion receipt" />
      <div className="grid grid-cols-2 gap-x-8 pt-4">
        <FieldRow k="Reference" v={record.code} />
        <FieldRow k="Completed" v={record.dateCompleted ? formatDateTime(record.dateCompleted) : '—'} />
        <FieldRow k="Customer" v={record.customerName} />
        <FieldRow k="Phone" v={record.customerPhone} />
        <FieldRow k={config.identifierLabel} v={record.uniqueIdentifier} />
        <FieldRow k="Service track" v={config.recordTypes.find((t) => t.id === record.recordTypeId)?.label} />
      </div>

      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-400">Journey summary</p>
      <ol className="space-y-1.5">
        {record.events.map((e) => (
          <li key={e.id} className="flex items-center justify-between border-b border-dashed border-zinc-200 py-1 text-sm">
            <span className="text-zinc-600">
              {e.kind === 'created' ? 'Intake' : e.kind === 'transfer' ? 'Transferred' : stageById(e.stageId).label}
            </span>
            <span className="text-xs text-zinc-400">{formatDateTime(e.updatedAt)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-900 px-5 py-4 text-white">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">Estimate</p>
          <p className="font-display text-lg font-semibold">{formatMoney(record.estimatedCost)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">Total due</p>
          <p className="font-display text-2xl font-semibold text-emerald-400">{formatMoney(record.finalCost ?? record.estimatedCost)}</p>
        </div>
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-zinc-400">
        Thank you for choosing {config.businessName}. Item has been handed over in satisfactory condition. Warranty as per the
        service policy. Please retain this receipt for any warranty claim.
      </p>
    </Shell>
  )
}

export { IntakeSlip, Receipt }
