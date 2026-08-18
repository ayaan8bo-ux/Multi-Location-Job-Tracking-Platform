import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckSquare, Download, SearchX } from 'lucide-react'
import { useApp } from '../store'
import { config, STALL_AFTER_DAYS } from '../config'
import { Button, Card, EmptyState, PageHeader, Select, StatusBadge, Th } from '../components/ui'
import { cn } from '../lib/cn'
import { formatMoney, isTerminalStage, lastEventOf, locationById, nextStageId, nextStageLabel, timeAgo } from '../lib/utils'
import type { WorkRecord } from '../types'

type View = 'all' | 'open' | 'inprogress' | 'pickup' | 'stalled' | 'myloc'

const chips: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'inprogress', label: 'In progress' },
  { id: 'pickup', label: 'Awaiting pickup' },
  { id: 'stalled', label: 'Stalled' },
  { id: 'myloc', label: 'My location' }
]

function toCsv(records: WorkRecord[]): string {
  const headers = [
    'Code',
    'Customer',
    'Phone',
    config.identifierLabel,
    'Service',
    'Location',
    'Status',
    'Received',
    'Est. cost',
    'Final cost',
    'Description'
  ]
  const rows = records.map((r) => [
    r.code,
    r.customerName,
    r.customerPhone,
    r.uniqueIdentifier,
    config.recordTypes.find((t) => t.id === r.recordTypeId)?.label ?? '',
    locationById(r.intakeLocationId).name,
    config.stages.find((s) => s.id === r.currentStageId)?.label ?? r.currentStageId,
    new Date(r.dateReceived).toLocaleDateString('en-IN'),
    String(r.estimatedCost ?? ''),
    String(r.finalCost ?? ''),
    r.description
  ])
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [headers, ...rows].map((row) => row.map(esc).join(',')).join('\n')
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Records() {
  const { records, user, advanceRecord, advanceRecords, notify, updateStatus } = useApp()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const locRaw = params.get('loc') ?? 'all'
  const statusRaw = params.get('status') ?? 'all'
  const typeRaw = params.get('type') ?? 'all'
  const viewRaw = params.get('view') as View | null

  const loc = locRaw !== 'all' && config.locations.some((l) => l.id === locRaw) ? locRaw : 'all'
  const status = statusRaw !== 'all' && config.stages.some((s) => s.id === statusRaw) ? statusRaw : 'all'
  const type = typeRaw !== 'all' && config.recordTypes.some((t) => t.id === typeRaw) ? typeRaw : 'all'
  const view: View = viewRaw && chips.some((c) => c.id === viewRaw) ? viewRaw : 'all'

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const setView = (v: View) => {
    const next = new URLSearchParams(params)
    if (v === 'all') next.delete('view')
    else next.set('view', v)
    next.delete('status')
    next.delete('loc')
    setParams(next, { replace: true })
    setSelected(new Set())
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = records
    if (loc !== 'all') list = list.filter((r) => r.intakeLocationId === loc)
    if (status !== 'all') list = list.filter((r) => r.currentStageId === status)
    if (type !== 'all') list = list.filter((r) => r.recordTypeId === type)
    if (needle) {
      list = list.filter((r) =>
        [r.code, r.customerName, r.customerPhone, r.uniqueIdentifier, r.description, ...Object.values(r.customFields)]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      )
    }
    switch (view) {
      case 'open':
        list = list.filter((r) => !isTerminalStage(r.currentStageId))
        break
      case 'inprogress':
        list = list.filter((r) => {
          if (isTerminalStage(r.currentStageId)) return false
          const rt = config.recordTypes.find((t) => t.id === r.recordTypeId)
          return rt ? r.currentStageId !== rt.pipeline[0] : true
        })
        break
      case 'pickup':
        list = config.awaitingPickupStageId ? list.filter((r) => r.currentStageId === config.awaitingPickupStageId) : []
        break
      case 'stalled':
        list = list.filter((r) => !isTerminalStage(r.currentStageId) && (Date.now() - new Date(lastEventOf(r).updatedAt).getTime()) > STALL_AFTER_DAYS * 86400000)
        break
      case 'myloc':
        list = list.filter((r) => r.intakeLocationId === user?.locationId)
        break
    }
    return list
  }, [records, q, loc, status, type, view, user])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => lastEventOf(b).updatedAt.localeCompare(lastEventOf(a).updatedAt)),
    [filtered]
  )

  const allVisibleIds = sorted.map((r) => r.id)
  const allSelected = sorted.length > 0 && allVisibleIds.every((id) => selected.has(id))
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allVisibleIds))
  }
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exportFiltered = () => downloadCsv(`vyden-${config.recordCodePrefix.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(sorted))
  const exportSelected = () => {
    const rows = records.filter((r) => selected.has(r.id))
    downloadCsv(`vyden-selection-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
    setSelected(new Set())
  }

  const bulkAdvance = () => {
    const ids = [...selected]
    advanceRecords(ids)
    setSelected(new Set())
  }
  const bulkDeliver = () => {
    let n = 0
    for (const r of records) {
      if (!selected.has(r.id)) continue
      const rt = config.recordTypes.find((t) => t.id === r.recordTypeId)
      const final = rt?.pipeline[rt.pipeline.length - 1]
      if (final && r.currentStageId !== final && !isTerminalStage(r.currentStageId)) {
        updateStatus(r.id, final)
        n += 1
      }
    }
    if (n > 0) notify(`Marked ${n} ${config.recordLabel.toLowerCase()}${n === 1 ? '' : 's'} as complete`)
    setSelected(new Set())
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={config.recordLabelPlural}
        description={`${records.length} records across ${config.locations.filter((l) => l.active).length} locations`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportFiltered} disabled={sorted.length === 0}>
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <Link to="/intake">
              <Button size="sm">New {config.recordLabel.toLowerCase()}</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {chips.map((c) => {
          const active = c.id === 'all' ? view === 'all' && loc === 'all' && status === 'all' : view === c.id
          return (
            <button
              key={c.id}
              onClick={() => setView(c.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                active ? 'bg-zinc-900 text-white shadow-sm' : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
              )}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select className="w-44" value={loc} onChange={(e) => { setParam('loc', e.target.value); setSelected(new Set()) }}>
          <option value="all">All locations</option>
          {config.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <Select className="w-56" value={status} onChange={(e) => { setParam('status', e.target.value); setSelected(new Set()) }}>
          <option value="all">All statuses</option>
          {config.stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.isException ? '— ' : ''}
              {s.label}
            </option>
          ))}
        </Select>
        <Select className="w-56" value={type} onChange={(e) => { setParam('type', e.target.value); setSelected(new Set()) }}>
          <option value="all">All service tracks</option>
          {config.recordTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
        {q && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Results for “{q}” — {sorted.length}
          </span>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2.5">
          <CheckSquare className="size-4 text-brand-600" />
          <span className="text-sm font-semibold text-brand-800">{selected.size} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={bulkAdvance}>Advance stage</Button>
            <Button size="sm" variant="outline" onClick={bulkDeliver}>Mark complete</Button>
            <Button size="sm" variant="outline" onClick={exportSelected}>Export CSV</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      <Card pad={false}>
        {sorted.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title={`No ${config.recordLabelPlural.toLowerCase()} match`}
            description="Try a different search term or clear the filters."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 w-10 border-b border-zinc-200 bg-zinc-50/95 px-3 py-2.5 backdrop-blur">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="size-4 rounded border-zinc-300 accent-brand-600"
                    />
                  </th>
                  <Th>Code</Th>
                  <Th>Customer</Th>
                  <Th>{config.identifierLabel}</Th>
                  <Th>Location</Th>
                  <Th>Service</Th>
                  <Th>Status</Th>
                  <Th>Last update</Th>
                  <Th className="text-right">Est. cost</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sorted.map((r) => {
                  const lastUpdate = lastEventOf(r).updatedAt
                  const stalled = !isTerminalStage(r.currentStageId) && (Date.now() - new Date(lastUpdate).getTime()) > STALL_AFTER_DAYS * 86400000
                  const next = nextStageId(r)
                  return (
                    <tr key={r.id} className={cn('transition-colors hover:bg-brand-50/40', selected.has(r.id) && 'bg-brand-50/60')}>
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(r.id)}
                          onChange={() => toggleOne(r.id)}
                          className="size-4 rounded border-zinc-300 accent-brand-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/records/${r.code}`} className="font-semibold text-brand-600 hover:underline">
                          {r.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/customers/${r.customerPhone}`} className="font-medium text-zinc-800 hover:text-brand-700">
                          {r.customerName}
                        </Link>
                        <p className="text-xs text-zinc-500">{r.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[13px] text-zinc-600">{r.uniqueIdentifier}</td>
                      <td className="px-4 py-3 text-zinc-600">{locationById(r.intakeLocationId).name}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {config.recordTypes.find((t) => t.id === r.recordTypeId)?.label ?? r.recordTypeId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge stageId={r.currentStageId} />
                          {stalled && <span className="text-[11px] font-medium text-red-500">stalled</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{timeAgo(lastUpdate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-700">{formatMoney(r.estimatedCost)}</td>
                      <td className="px-4 py-3 text-right">
                        {next && (
                          <button
                            title={`Advance to ${nextStageLabel(r)}`}
                            onClick={() => advanceRecord(r.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                          >
                            Advance
                            <ArrowRight className="size-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
