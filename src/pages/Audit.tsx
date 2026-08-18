import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Card, EmptyState, PageHeader, Select, StatusBadge, Th } from '../components/ui'
import { auditRows } from '../lib/messages'
import { formatDateTime, locationById, staffById } from '../lib/utils'
import type { EventKind } from '../types'

const kindLabel: Record<EventKind, string> = {
  created: 'Created',
  status: 'Status change',
  transfer: 'Transfer',
  edit: 'Admin edit'
}

export default function Audit() {
  const { records } = useApp()
  const [kind, setKind] = useState<EventKind | 'all'>('all')
  const [loc, setLoc] = useState('all')

  const rows = useMemo(() => {
    const all = auditRows(records)
    return all.filter((r) => {
      if (kind !== 'all' && r.kind !== kind) return false
      if (loc !== 'all' && r.locationId !== loc) return false
      return true
    })
  }, [records, kind, loc])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit log"
        description="Every status change, transfer and admin edit — who, what, when, where"
        actions={<ScrollText className="size-5 text-zinc-400" />}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select className="w-52" value={kind} onChange={(e) => setKind(e.target.value as EventKind | 'all')}>
          <option value="all">All event types</option>
          {(Object.keys(kindLabel) as EventKind[]).map((k) => (
            <option key={k} value={k}>
              {kindLabel[k]}
            </option>
          ))}
        </Select>
        <Select className="w-48" value={loc} onChange={(e) => setLoc(e.target.value)}>
          <option value="all">All locations</option>
          {config.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <span className="text-sm text-zinc-500">{rows.length} events</span>
      </div>

      <Card pad={false}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="size-5" />}
            title="No events match your filters"
            description="Adjust the event type or location filters."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>{config.recordLabel}</Th>
                  <Th>Event</Th>
                  <Th>Stage</Th>
                  <Th>Actor</Th>
                  <Th>Location</Th>
                  <Th>Note</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">{formatDateTime(r.updatedAt)}</td>
                    <td className="px-4 py-2.5">
                      <Link to={`/records/${r.recordCode}`} className="font-semibold text-indigo-600 hover:underline">
                        {r.recordCode}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-zinc-700">{kindLabel[r.kind as EventKind] ?? r.kind}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge stageId={r.stageId} />
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600">{staffById(r.updatedByStaffId).name}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{locationById(r.locationId).name}</td>
                    <td className="max-w-56 truncate px-4 py-2.5 text-zinc-500">{r.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
