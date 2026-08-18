import { useEffect, useState } from 'react'
import { Card, PageHeader, StatusBadge, Input, Button, Field } from '../components/ui'
import { applyDeployment, config } from '../config'
import { variants } from '../variants'
import { useApp } from '../store'
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '../lib/cn'

const fixed = [
  'Database schema & relationships',
  'Auth + role-based permissions (RLS)',
  'Status-history audit engine',
  'Notification trigger logic',
  'PDF document-generation engine',
  'Admin dashboard components'
]

const configured = [
  'Business name, logo, addresses, tax ID',
  'Terminology — record & identifier labels',
  'Number and names of locations',
  'Status pipeline stages & exceptions',
  'Document template text (disclaimers, terms)',
  'WhatsApp message copy'
]

export default function Settings() {
  const { activeVariant, switchVariant } = useApp()
  const [tick, setTick] = useState(0)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    businessName: config.businessName,
    recordLabel: config.recordLabel,
    recordLabelPlural: config.recordLabelPlural,
    identifierLabel: config.identifierLabel,
    currency: config.currency
  })

  useEffect(() => {
    setForm({
      businessName: config.businessName,
      recordLabel: config.recordLabel,
      recordLabelPlural: config.recordLabelPlural,
      identifierLabel: config.identifierLabel,
      currency: config.currency
    })
    setEditing(false)
  }, [activeVariant])

  const pipeline = config.stages.filter((s) => !s.isException)
  const exceptions = config.stages.filter((s) => s.isException)
  void tick

  const save = () => {
    applyDeployment({
      ...config,
      businessName: form.businessName.trim() || config.businessName,
      recordLabel: form.recordLabel.trim() || config.recordLabel,
      recordLabelPlural: form.recordLabelPlural.trim() || config.recordLabelPlural,
      identifierLabel: form.identifierLabel.trim() || config.identifierLabel,
      currency: form.currency.trim() || config.currency
    })
    setEditing(false)
    setTick((t) => t + 1)
  }

  const reset = () => {
    const v = variants.find((x) => x.id === activeVariant)
    if (v) switchVariant(activeVariant)
    setForm({ businessName: v?.config.businessName ?? '', recordLabel: v?.config.recordLabel ?? '', recordLabelPlural: v?.config.recordLabelPlural ?? '', identifierLabel: v?.config.identifierLabel ?? '', currency: v?.config.currency ?? '' })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Deployment settings"
        description="Everything shown here is configured per client — no code changes required"
        actions={
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" />
            Reset vertical
          </Button>
        }
      />

      <Card
        title="Demo vertical switcher"
        subtitle="Section 15 mapping — re-labels the whole app for a target industry"
        actions={<Sparkles className="size-4 text-brand-400" />}
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => switchVariant(v.id)}
              className={cn(
                'rounded-xl border px-4 py-3 text-left transition-all',
                activeVariant === v.id
                  ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-500/20'
                  : 'border-zinc-200 bg-white hover:border-brand-200 hover:bg-brand-50/40'
              )}
            >
              <p className="flex items-center justify-between text-sm font-semibold text-zinc-800">
                {v.name}
                {activeVariant === v.id && <Check className="size-4 text-brand-600" />}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{v.industry}</p>
              <p className="mt-2 text-[11px] font-medium text-zinc-400">
                “{v.config.recordLabel}” · {v.config.identifierLabel}
              </p>
            </button>
          ))}
        </div>
      </Card>

      <Card
        title="Branding & terminology editor"
        subtitle="Edit live — affects the whole deployment immediately"
        actions={
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={save}>
                  <Check className="size-3.5" />
                  Apply
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { setForm({ businessName: config.businessName, recordLabel: config.recordLabel, recordLabelPlural: config.recordLabelPlural, identifierLabel: config.identifierLabel, currency: config.currency }); setEditing(true) }}>
                Edit
              </Button>
            )}
          </div>
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business name">
              <Input value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} />
            </Field>
            <Field label="Currency symbol">
              <Input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} maxLength={3} />
            </Field>
            <Field label={`What a ${config.recordLabel.toLowerCase()} is called (singular)`}>
              <Input value={form.recordLabel} onChange={(e) => setForm((f) => ({ ...f, recordLabel: e.target.value }))} />
            </Field>
            <Field label="Plural form">
              <Input value={form.recordLabelPlural} onChange={(e) => setForm((f) => ({ ...f, recordLabelPlural: e.target.value }))} />
            </Field>
            <Field label="Unique-identifier label" className="sm:col-span-2">
              <Input value={form.identifierLabel} onChange={(e) => setForm((f) => ({ ...f, identifierLabel: e.target.value }))} />
            </Field>
          </div>
        ) : (
          <dl className="divide-y divide-zinc-100 text-sm">
            {[
              ['Business name', config.businessName],
              ['What a record is called', config.recordLabel],
              ['Plural', config.recordLabelPlural],
              ['Unique-identifier label', config.identifierLabel],
              ['Record code prefix', `${config.recordCodePrefix}-000000`],
              ['Currency', config.currency],
              ['Active locations', config.locations.filter((l) => l.active).map((l) => l.name).join(', ')]
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-zinc-500">{k}</dt>
                <dd className="text-right font-medium text-zinc-800">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Status pipeline" subtitle="Configured via workflow_stages">
          <div className="flex flex-wrap items-center gap-1.5">
            {pipeline.map((s, i) => (
              <span key={s.id} className="flex items-center gap-1.5">
                <StatusBadge stageId={s.id} />
                {i < pipeline.length - 1 && <ArrowRight className="size-3.5 text-zinc-300" />}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Branch / exception states</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {exceptions.map((s) => (
              <StatusBadge key={s.id} stageId={s.id} />
            ))}
          </div>
        </Card>

        <Card title="Fixed vs configured" subtitle="What Vyden Co. builds once vs. what changes per sales call">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
                <Check className="size-4 text-emerald-500" /> Fixed core — built once
              </p>
              <ul className="space-y-1.5">
                {fixed.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
                <Check className="size-4 text-brand-500" /> Configured per client
              </p>
              <ul className="space-y-1.5">
                {configured.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-zinc-600">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card title="WhatsApp message templates" subtitle="Example copy sent on status change (configurable)">
        <div className="space-y-2.5 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
          <p>
            <span className="font-semibold text-zinc-900">To customer:</span> Your {config.recordLabel.toLowerCase()}{' '}
            <span className="font-mono">{config.recordCodePrefix}-000133</span> is now{' '}
            <span className="font-medium">
              {config.awaitingPickupStageId ? config.stages.find((s) => s.id === config.awaitingPickupStageId)?.label ?? 'Ready' : pipeline[pipeline.length - 2]?.label ?? 'Ready'}
            </span>
            . Please collect it at {config.businessName}, {config.locations[0]?.name}. — {config.businessName}
          </p>
          <p className="text-xs text-zinc-500">
            Trigger: new row in record_status_history → message sent via WhatsApp Business API. Copy and pipeline labels come from
            deployment_config.
          </p>
        </div>
      </Card>
    </div>
  )
}
