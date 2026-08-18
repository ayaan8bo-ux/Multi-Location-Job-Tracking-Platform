import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Phone, Search, Users } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Avatar, Card, EmptyState, Input, PageHeader, StatusBadge, Th } from '../components/ui'
import { dotTone, formatDate, formatDateTime, formatMoney, isTerminalStage, locationById, stageById, timeAgo } from '../lib/utils'
import { cn } from '../lib/cn'

export function CustomersIndex() {
  const { records } = useApp()
  const [q, setQ] = useState('')

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; records: number; open: number; last: string }>()
    for (const r of records) {
      const cur = map.get(r.customerPhone) ?? {
        name: r.customerName,
        phone: r.customerPhone,
        records: 0,
        open: 0,
        last: r.dateReceived
      }
      cur.records += 1
      if (!isTerminalStage(r.currentStageId)) cur.open += 1
      if (r.dateReceived > cur.last) cur.last = r.dateReceived
      map.set(r.customerPhone, cur)
    }
    const needle = q.trim().toLowerCase()
    return [...map.values()]
      .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.phone.includes(needle))
      .sort((a, b) => b.last.localeCompare(a.last))
  }, [records, q])

  return (
    <div className="space-y-4">
      <PageHeader title="Customers" description={`${customers.length} customers across all locations`} />
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone…" className="pl-9" />
      </div>

      <Card pad={false}>
        {customers.length === 0 ? (
          <EmptyState icon={<Users className="size-5" />} title="No customers found" description="Try a different name or phone number." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {customers.map((c) => (
              <li key={c.phone}>
                <Link
                  to={`/customers/${c.phone}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-brand-50/40"
                >
                  <Avatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-800">{c.name}</p>
                    <p className="flex items-center gap-1 text-xs text-zinc-500">
                      <Phone className="size-3" /> {c.phone}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium tabular-nums text-zinc-700">{c.records} {config.recordLabel.toLowerCase()}{c.records === 1 ? '' : 's'}</p>
                    <p className={cn('text-xs', c.open > 0 ? 'font-medium text-amber-600' : 'text-zinc-400')}>
                      {c.open > 0 ? `${c.open} open` : 'All closed'}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400">{timeAgo(c.last)}</span>
                  <ArrowRight className="size-4 text-zinc-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export function CustomerDetail() {
  const { phone = '' } = useParams()
  const { records } = useApp()

  const customerRecords = useMemo(
    () => records.filter((r) => r.customerPhone === phone).sort((a, b) => b.dateReceived.localeCompare(a.dateReceived)),
    [records, phone]
  )
  const name = customerRecords[0]?.customerName ?? 'Unknown'
  const open = customerRecords.filter((r) => !isTerminalStage(r.currentStageId)).length

  const allEvents = useMemo(
    () =>
      customerRecords
        .flatMap((r) => r.events.map((e) => ({ ...e, recordCode: r.code })))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 8),
    [customerRecords]
  )

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/customers" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="size-4" /> All customers
      </Link>

      <div className="card flex flex-wrap items-center gap-4 px-6 py-5">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-900">{name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Phone className="size-3.5" /> {phone}
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="font-display text-xl font-semibold text-zinc-900">{customerRecords.length}</p>
            <p className="text-xs text-zinc-500">Total {config.recordLabelPlural.toLowerCase()}</p>
          </div>
          <div>
            <p className={cn('font-display text-xl font-semibold', open > 0 ? 'text-amber-600' : 'text-emerald-600')}>{open}</p>
            <p className="text-xs text-zinc-500">Open</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-zinc-900">{customerRecords.filter((r) => r.dateCompleted).length}</p>
            <p className="text-xs text-zinc-500">Completed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title={`${config.recordLabelPlural} history`} subtitle={`${customerRecords.length} total`} pad={false} className="lg:col-span-2">
          {customerRecords.length === 0 ? (
            <EmptyState icon={<Users className="size-5" />} title="No records for this customer" />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>Service</Th>
                    <Th>Location</Th>
                    <Th>Status</Th>
                    <Th>Received</Th>
                    <Th className="text-right">Cost</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {customerRecords.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-4 py-3">
                        <Link to={`/records/${r.code}`} className="font-semibold text-brand-600 hover:underline">
                          {r.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{config.recordTypes.find((t) => t.id === r.recordTypeId)?.label ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-600">{locationById(r.intakeLocationId).name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge stageId={r.currentStageId} />
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{formatDate(r.dateReceived)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-700">{formatMoney(r.estimatedCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Recent activity" subtitle="Across this customer's records" pad={false}>
          <ul className="divide-y divide-zinc-100 px-1">
            {allEvents.map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                <span className={cn('mt-1 size-2.5 shrink-0 rounded-full', dotTone(stageById(e.stageId).tone))} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-zinc-700">
                    <Link to={`/records/${e.recordCode}`} className="font-semibold text-brand-600 hover:underline">
                      {e.recordCode}
                    </Link>{' '}
                    → {stageById(e.stageId).label}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">{formatDateTime(e.updatedAt)}</p>
                </div>
              </li>
            ))}
            {allEvents.length === 0 && <li className="px-4 py-8 text-center text-sm text-zinc-400">No activity.</li>}
          </ul>
        </Card>
      </div>
    </div>
  )
}
