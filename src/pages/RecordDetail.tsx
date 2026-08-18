import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, Printer, RefreshCw, Send, Truck } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Avatar, Button, Card, Field, Select, StatusBadge, Textarea } from '../components/ui'
import PipelineStepper from '../components/PipelineStepper'
import { cn } from '../lib/cn'
import {
  dotTone, formatDateTime, formatMoney, isTerminalStage,
  lastEventOf, locationById, staffById, timeAgo
} from '../lib/utils'
import type { Stage } from '../types'

type Panel = 'status' | 'transfer' | null

export default function RecordDetail() {
  const { id } = useParams()
  const { records, user, updateStatus, transfer } = useApp()
  const record = records.find((r) => r.code === id)
  const [panel, setPanel] = useState<Panel>(null)
  const [stageId, setStageId] = useState('')
  const [targetLoc, setTargetLoc] = useState('')
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState('')

  if (!record) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-500">{config.recordLabel} not found.</p>
        <Link to="/records" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
          ← Back to {config.recordLabelPlural.toLowerCase()}
        </Link>
      </div>
    )
  }

  const submitPanel = () => {
    if (panel === 'status' && stageId) {
      updateStatus(record.id, stageId, note || undefined)
      setFlash(`Status updated to “${config.stages.find((s) => s.id === stageId)?.label}”`)
    }
    if (panel === 'transfer' && targetLoc) {
      transfer(record.id, targetLoc, note || undefined)
      setFlash(`Transferred to ${locationById(targetLoc).name}`)
    }
    setPanel(null)
    setNote('')
    setStageId('')
    setTargetLoc('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const timeline = [...record.events].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
  const canEdit = user?.role === 'admin' || user?.locationId === record.intakeLocationId || user?.locationId === lastEventOf(record).locationId

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/records" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="size-4" />
        Back to {config.recordLabelPlural.toLowerCase()}
      </Link>

      {flash && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          <RefreshCw className="size-4" />
          {flash}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-900">{record.code}</h1>
            <StatusBadge stageId={record.currentStageId} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {record.customerName} · {record.customerPhone}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {config.identifierLabel}: <span className="font-mono text-zinc-600">{record.uniqueIdentifier}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/print/${record.code}/intake`}>
            <Button variant="outline" size="sm">
              <Printer className="size-3.5" />
              Print intake
            </Button>
          </Link>
          {isTerminalStage(record.currentStageId) && (
            <Link to={`/print/${record.code}/receipt`}>
              <Button variant="outline" size="sm">
                <Printer className="size-3.5" />
                Print receipt
              </Button>
            </Link>
          )}
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={() => setPanel(panel === 'status' ? null : 'status')}>
                <ArrowRight className="size-3.5" />
                Update status
              </Button>
              <Button size="sm" onClick={() => setPanel(panel === 'transfer' ? null : 'transfer')}>
                <Truck className="size-3.5" />
                Transfer location
              </Button>
            </>
          )}
        </div>
      </div>

      <PipelineStepper record={record} />

      {panel && (
        <Card
          title={panel === 'status' ? 'Update status' : 'Transfer to another location'}
          actions={
            <button className="text-xs font-medium text-zinc-400 hover:text-zinc-700" onClick={() => setPanel(null)}>
              Cancel
            </button>
          }
        >
          <div className="space-y-4">
            {panel === 'status' ? (
              <Field label={`Move ${config.recordLabel.toLowerCase()} ${record.code} to a new stage`}>
                <Select value={stageId} onChange={(e) => setStageId(e.target.value)}>
                  <option value="">Select stage…</option>
                  {config.stages
                    .filter((s: Stage) => s.id !== record.currentStageId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.isException ? '— ' : ''}
                        {s.label}
                      </option>
                    ))}
                </Select>
              </Field>
            ) : (
              <Field label="Destination location">
                <Select value={targetLoc} onChange={(e) => setTargetLoc(e.target.value)}>
                  <option value="">Select location…</option>
                  {config.locations
                    .filter((l) => l.id !== (user?.locationId ?? record.intakeLocationId))
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.area}
                      </option>
                    ))}
                </Select>
              </Field>
            )}
            <Field label="Note" hint="Optional — shown in the audit trail">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Awaiting component stock" />
            </Field>
            <div className="flex justify-end">
              <Button onClick={submitPanel} disabled={panel === 'status' ? !stageId : !targetLoc}>
                <Send className="size-4" />
                Confirm
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Card title="Customer & device details" subtitle={`Opened at ${locationById(record.intakeLocationId).name}`}>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ['Customer', record.customerName],
                ['Phone', record.customerPhone],
                [config.identifierLabel, record.uniqueIdentifier],
                ['Service track', config.recordTypes.find((t) => t.id === record.recordTypeId)?.label ?? '—'],
                ['Received', formatDateTime(record.dateReceived)],
                ['Completed', record.dateCompleted ? formatDateTime(record.dateCompleted) : '—']
              ].map(([k, v]) => (
                <div key={k} className="border-b border-zinc-100 pb-2">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{k}</dt>
                  <dd className="mt-0.5 text-sm text-zinc-800">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Description">
            <p className="text-sm leading-relaxed text-zinc-700">{record.description || '—'}</p>
          </Card>

          {config.customFields.length > 0 && (
            <Card title="Custom fields">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {config.customFields.map((f) => (
                  <div key={f.key} className="border-b border-zinc-100 pb-2">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{f.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-zinc-800">{record.customFields[f.key] || '—'}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          <Card title="Costs">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Estimate</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900">{formatMoney(record.estimatedCost)}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-500">Final</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-700">{formatMoney(record.finalCost)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Audit trail" subtitle="Every status change, logged" pad={false}>
            <ol className="relative space-y-5 px-5 py-5">
              {timeline.map((e, i) => {
                const stage = config.stages.find((s) => s.id === e.stageId)
                const tone = stage?.tone ?? 'slate'
                const isLast = i === timeline.length - 1
                return (
                  <li key={e.id} className="relative flex gap-3">
                    {!isLast && <span className="absolute left-[7px] top-4 h-full w-px bg-zinc-200" />}
                    <span className={cn('relative mt-1 size-[15px] shrink-0 rounded-full ring-4 ring-white', dotTone(tone))} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[13px] font-medium text-zinc-800">
                          {e.kind === 'created' && 'Record created'}
                          {e.kind === 'status' && `Status → ${stage?.label ?? e.stageId}`}
                          {e.kind === 'transfer' && (
                            <span className="inline-flex items-center gap-1">
                              Transferred{' '}
                              <span className="inline-flex items-center gap-1 text-zinc-500">
                                <MapPin className="size-3" /> {locationById(e.fromLocationId ?? '').name}
                              </span>
                              <ArrowRight className="size-3 text-zinc-400" />
                              <span className="inline-flex items-center gap-1 text-zinc-500">
                                <MapPin className="size-3" /> {locationById(e.toLocationId ?? '').name}
                              </span>
                            </span>
                          )}
                        </span>
                      </div>
                      {e.note && <p className="mt-0.5 text-xs text-zinc-600">“{e.note}”</p>}
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                        <Avatar name={staffById(e.updatedByStaffId).name} size="sm" />
                        {staffById(e.updatedByStaffId).name} · {locationById(e.locationId).name}
                        <span className="text-zinc-300">·</span>
                        {formatDateTime(e.updatedAt)} ({timeAgo(e.updatedAt)})
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
