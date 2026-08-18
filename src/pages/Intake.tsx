import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FilePlus2, History, Phone } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Button, Card, Field, Input, Select, Textarea, PageHeader, StatusBadge } from '../components/ui'
import { daysSince, isTerminalStage, locationById } from '../lib/utils'
import type { WorkRecord } from '../types'

export default function Intake() {
  const { records, user, addRecord } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    setForm((f) => {
      const valid = config.recordTypes.some((t) => t.id === f.recordTypeId)
      return valid ? f : { ...f, recordTypeId: config.recordTypes[0]?.id ?? '' }
    })
    setErrors([])
  }, [config.recordTypes])

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    recordTypeId: config.recordTypes[0]?.id ?? '',
    uniqueIdentifier: '',
    device_model: '',
    condition: '',
    password: '',
    description: '',
    estimatedCost: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [nameTouched, setNameTouched] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const past = useMemo(
    () => (form.customerPhone.trim().length >= 10 ? records.filter((r) => r.customerPhone === form.customerPhone.trim()) : []),
    [records, form.customerPhone]
  )

  const autofillFromPhone = (phone: string) => {
    const match = records.find((r) => r.customerPhone === phone.trim())
    if (match && (!form.customerName.trim() || !nameTouched)) {
      setForm((f) => ({ ...f, customerName: match.customerName }))
    }
  }

  const duplicate = form.uniqueIdentifier.trim()
    ? records.find((r) => r.uniqueIdentifier === form.uniqueIdentifier.trim() && !isTerminalStage(r.currentStageId))
    : undefined

  const nextCode = () => {
    const max = records.reduce((m, r) => {
      const n = parseInt(r.code.replace(config.recordCodePrefix + '-', ''), 10)
      return Number.isFinite(n) ? Math.max(m, n) : m
    }, 0)
    return `${config.recordCodePrefix}-${String(max + 1).padStart(6, '0')}`
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (!form.customerName.trim()) errs.push('Customer name is required')
    if (!/^\d{10}$/.test(form.customerPhone.trim())) errs.push('Enter a valid 10-digit phone number')
    if (!form.uniqueIdentifier.trim()) errs.push(`${config.identifierLabel} is required`)
    setErrors(errs)
    if (errs.length) return

    const customFields: Record<string, string> = {}
    for (const f of config.customFields) customFields[f.key] = (form[f.key as keyof typeof form] as string).trim()

    const typeId = form.recordTypeId || config.recordTypes[0]?.id || ''
    const type = config.recordTypes.find((t) => t.id === typeId)
    const startStage = type?.pipeline[0] ?? config.stages.find((s) => !s.isException)?.id ?? ''

    const now = new Date().toISOString()
    const code = nextCode()
    const record: WorkRecord = {
      id: `rec-${Date.now()}`,
      code,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      recordTypeId: typeId,
      uniqueIdentifier: form.uniqueIdentifier.trim(),
      customFields,
      description: form.description.trim(),
      intakeLocationId: user?.locationId ?? config.locations[0].id,
      intakeStaffId: user?.id ?? config.staff[0].id,
      currentStageId: startStage,
      estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      dateReceived: now,
      events: [
        {
          id: `evt-${Date.now()}`,
          recordId: `rec-${Date.now()}`,
          kind: 'created',
          stageId: startStage,
          note: 'Intake at counter',
          updatedByStaffId: user?.id ?? config.staff[0].id,
          locationId: user?.locationId ?? config.locations[0].id,
          updatedAt: now
        }
      ]
    }
    addRecord(record)
    navigate(`/records/${code}`)
  }

  const selectedPipeline = config.recordTypes.find((t) => t.id === form.recordTypeId)?.pipeline ?? []
  const firstLabel = config.stages.find((s) => s.id === selectedPipeline[0])?.label ?? 'Received'

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title={`New ${config.recordLabel.toLowerCase()}`}
        description="Intake form — generates the intake document on submission"
        actions={
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            Starts at “{firstLabel}”
          </span>
        }
      />

      <form onSubmit={submit} className="space-y-5">
        <Card title="Customer details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Customer name" required>
              <Input
                value={form.customerName}
                onChange={(e) => {
                  setNameTouched(true)
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }}
                placeholder="Full name"
                autoFocus
              />
            </Field>
            <Field label="Phone number" required hint="10-digit mobile number">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={form.customerPhone}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, customerPhone: e.target.value }))
                    autofillFromPhone(e.target.value)
                  }}
                  placeholder="98XXXXXXXX"
                  inputMode="numeric"
                  maxLength={10}
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label={config.identifierLabel} required hint="Checked against past records for duplicates">
              <Input value={form.uniqueIdentifier} onChange={set('uniqueIdentifier')} placeholder={config.identifierPlaceholder} className="font-mono" />
            </Field>
            <Field label="Service track">
              <Select value={form.recordTypeId} onChange={set('recordTypeId')}>
                {config.recordTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {config.customFields.map((f) => (
              <Field key={f.key} label={f.label} required={f.required} className="sm:col-span-1">
                {f.type === 'textarea' ? (
                  <Textarea value={form[f.key as keyof typeof form] as string} onChange={set(f.key as keyof typeof form)} />
                ) : f.type === 'number' ? (
                  <Input type="number" value={form[f.key as keyof typeof form] as string} onChange={set(f.key as keyof typeof form)} />
                ) : (
                  <Input value={form[f.key as keyof typeof form] as string} onChange={set(f.key as keyof typeof form)} />
                )}
              </Field>
            ))}
            <Field label="Reported issue / request">
              <Textarea value={form.description} onChange={set('description')} placeholder="What the customer reported" />
            </Field>
            <Field label={`Estimated cost (${config.currency})`}>
              <Input type="number" value={form.estimatedCost} onChange={set('estimatedCost')} placeholder="0" min={0} />
            </Field>
          </div>
        </Card>

        {past.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3">
            <History className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div className="text-sm text-brand-900">
              <p className="font-semibold">Repeat customer — {past.length} past {config.recordLabel.toLowerCase()}{past.length === 1 ? '' : 's'}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {past.slice(0, 4).map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                    <StatusBadge stageId={r.currentStageId} />
                    <button type="button" className="hover:underline" onClick={() => navigate(`/records/${r.code}`)}>
                      {r.code}
                    </button>
                    <span className="text-brand-300">·</span>
                    {daysSince(r.dateReceived)}d ago · {locationById(r.intakeLocationId).name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {duplicate && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Possible duplicate</p>
              <p className="mt-0.5">
                This {config.identifierLabel.toLowerCase()} matches{' '}
                <span className="font-medium">{duplicate.code}</span> ({duplicate.customerName},{' '}
                {daysSince(duplicate.dateReceived)} days ago, {locationById(duplicate.intakeLocationId).name}).
                Verify with the customer before proceeding.
              </p>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-red-700">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/records')}>
            Cancel
          </Button>
          <Button type="submit">
            <FilePlus2 className="size-4" />
            Create {config.recordLabel.toLowerCase()} & issue intake slip
          </Button>
        </div>
      </form>
    </div>
  )
}
