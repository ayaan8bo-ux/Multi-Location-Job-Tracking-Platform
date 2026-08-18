import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageOpen, Timer, ArrowRight } from 'lucide-react'
import { useApp } from '../store'
import { config, STALL_AFTER_DAYS, UNCOLLECTED_AFTER_DAYS } from '../config'
import { Card, EmptyState, PageHeader, StatusBadge, Tabs, Th } from '../components/ui'
import { daysSince, isTerminalStage, lastEventOf, locationById, staffById } from '../lib/utils'
import type { WorkRecord } from '../types'

type Tab = 'stalled' | 'uncollected'

export default function FollowUp() {
  const { records } = useApp()
  const [tab, setTab] = useState<Tab>('stalled')

  const { stalled, uncollected } = useMemo(() => {
    const open = records.filter((r) => !isTerminalStage(r.currentStageId))
    const stalled = open
      .filter((r) => daysSince(lastEventOf(r).updatedAt) > STALL_AFTER_DAYS)
      .sort((a, b) => daysSince(lastEventOf(b).updatedAt) - daysSince(lastEventOf(a).updatedAt))
    const pickupId = config.awaitingPickupStageId
    const uncollected = (pickupId ? records.filter((r) => r.currentStageId === pickupId) : [])
      .filter((r) => daysSince(lastEventOf(r).updatedAt) > UNCOLLECTED_AFTER_DAYS)
      .sort((a, b) => daysSince(lastEventOf(b).updatedAt) - daysSince(lastEventOf(a).updatedAt))
    return { stalled, uncollected }
  }, [records])

  const rows = tab === 'stalled' ? stalled : uncollected

  const Row = ({ r, days }: { r: WorkRecord; days: number }) => (
    <tr key={r.id} className="transition-colors hover:bg-indigo-50/40">
      <td className="px-4 py-3">
        <Link to={`/records/${r.code}`} className="font-semibold text-indigo-600 hover:underline">
          {r.code}
        </Link>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-zinc-800">{r.customerName}</p>
        <p className="text-xs text-zinc-500">{r.customerPhone}</p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge stageId={r.currentStageId} />
      </td>
      <td className="px-4 py-3 text-zinc-600">{locationById(r.intakeLocationId).name}</td>
      <td className="px-4 py-3 text-zinc-600">{staffById(lastEventOf(r).updatedByStaffId).name}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
          <Timer className="size-3.5" />
          {days} day{days === 1 ? '' : 's'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link to={`/records/${r.code}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
          Review <ArrowRight className="size-3.5" />
        </Link>
      </td>
    </tr>
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="Follow-up queue"
        description="Records that need attention — surfaced automatically, no one has to check."
      />
      <Tabs<Tab>
        items={[
          { id: 'stalled', label: 'Stalled', count: stalled.length },
          { id: 'uncollected', label: 'Uncollected items', count: uncollected.length }
        ]}
        value={tab}
        onChange={setTab}
      />

      <Card pad={false}>
        {rows.length === 0 ? (
          <EmptyState
            icon={tab === 'stalled' ? <Timer className="size-5" /> : <PackageOpen className="size-5" />}
            title={tab === 'stalled' ? 'Nothing is stalled' : 'No items awaiting collection'}
            description={
              tab === 'stalled'
                ? `Every open ${config.recordLabel.toLowerCase()} has been updated within the last ${STALL_AFTER_DAYS} days.`
                : `No “Ready” ${config.recordLabel.toLowerCase()} has sat uncollected past ${UNCOLLECTED_AFTER_DAYS} days.`
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th>Location</Th>
                  <Th>Last updated by</Th>
                  <Th>Idle</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <Row key={r.id} r={r} days={daysSince(lastEventOf(r).updatedAt)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
