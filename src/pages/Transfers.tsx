import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Truck } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Card, EmptyState, PageHeader, Avatar, Th } from '../components/ui'
import { transfersOf } from '../lib/messages'
import { formatDateTime, locationById, staffById } from '../lib/utils'

export default function Transfers() {
  const { records } = useApp()
  const transfers = useMemo(() => transfersOf(records), [records])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transfers"
        description="Every item moved between locations — logged as its own event, not a generic status change"
      />

      <Card pad={false}>
        {transfers.length === 0 ? (
          <EmptyState
            icon={<Truck className="size-5" />}
            title="No transfers yet"
            description="When an item physically moves between two locations, it will appear here."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <Th>{config.recordLabel}</Th>
                  <Th>Customer</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Handled by</Th>
                  <Th>When</Th>
                  <Th>Note</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-indigo-50/40">
                    <td className="px-4 py-3">
                      <Link to={`/records/${t.recordCode}`} className="font-semibold text-indigo-600 hover:underline">
                        {t.recordCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{t.customerName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-zinc-600">
                        <MapPin className="size-3.5 text-zinc-400" />
                        {locationById(t.fromLocationId).name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800">
                        <MapPin className="size-3.5 text-indigo-500" />
                        {locationById(t.toLocationId).name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-zinc-600">
                        <Avatar name={staffById(t.updatedByStaffId).name} size="sm" />
                        {staffById(t.updatedByStaffId).name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{formatDateTime(t.updatedAt)}</td>
                    <td className="max-w-56 truncate px-4 py-3 text-zinc-500">{t.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-700">
        <ArrowRight className="size-4 shrink-0" />
        Transfers are the specific gap this product closes in every vertical — this log is the proof of movement.
      </div>
    </div>
  )
}
