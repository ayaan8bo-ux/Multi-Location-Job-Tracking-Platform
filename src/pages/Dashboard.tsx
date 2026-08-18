import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, ClipboardList, PackageCheck, Timer, Wrench } from 'lucide-react'
import { useApp } from '../store'
import { config, STALL_AFTER_DAYS, UNCOLLECTED_AFTER_DAYS } from '../config'
import { Avatar, Button, Card, Stat, StatusBadge } from '../components/ui'
import { dotTone, daysSince, isTerminalStage, lastEventOf, locationById, staffById, timeAgo } from '../lib/utils'
import { cn } from '../lib/cn'

export default function Dashboard() {
  const { records, user } = useApp()

  const stats = useMemo(() => {
    const open = records.filter((r) => !isTerminalStage(r.currentStageId))
    const inProgress = open.filter((r) => {
      const rt = config.recordTypes.find((t) => t.id === r.recordTypeId)
      return rt ? r.currentStageId !== rt.pipeline[0] : true
    })
    const pickupId = config.awaitingPickupStageId
    const ready = pickupId ? records.filter((r) => r.currentStageId === pickupId) : []
    const stalled = open.filter((r) => daysSince(lastEventOf(r).updatedAt ?? r.dateReceived) > STALL_AFTER_DAYS)
    const uncollected = ready.filter((r) => daysSince(lastEventOf(r).updatedAt ?? r.dateReceived) > UNCOLLECTED_AFTER_DAYS)
    return { open: open.length, inProgress: inProgress.length, ready: ready.length, stalled: stalled.length, uncollected: uncollected.length }
  }, [records])

  const pipelineCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of records) map.set(r.currentStageId, (map.get(r.currentStageId) ?? 0) + 1)
    return config.stages
      .filter((s) => !s.isException)
      .map((s) => ({ stage: s, count: map.get(s.id) ?? 0 }))
  }, [records])

  const recent = useMemo(() => {
    const all = records.flatMap((r) => r.events.map((e) => ({ ...e, recordCode: r.code })))
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 7)
  }, [records])

  const locationSplit = useMemo(() => {
    return config.locations.map((l) => ({
      loc: l,
      open: records.filter((r) => r.intakeLocationId === l.id && !isTerminalStage(r.currentStageId)).length
    }))
  }, [records])

  const maxPipeline = Math.max(1, ...pipelineCounts.map((p) => p.count))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Live view of every {config.recordLabel.toLowerCase()} across all locations.</p>
        </div>
        <Link to="/records">
          <Button variant="outline" size="sm">
            View all {config.recordLabelPlural.toLowerCase()}
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Open records" value={stats.open} hint="Across all locations" icon={<ClipboardList className="size-4.5" />} />
        <Stat
          label="In progress"
          value={stats.inProgress}
          hint="Actively being worked on"
          accent="text-brand-600"
          icon={<Wrench className="size-4.5" />}
        />
        <Stat
          label="Awaiting pickup"
          value={stats.ready}
          hint={stats.uncollected > 0 ? `${stats.uncollected} past ${UNCOLLECTED_AFTER_DAYS} days` : 'Ready for handover'}
          accent={stats.uncollected > 0 ? 'text-amber-600' : 'text-emerald-600'}
          icon={<PackageCheck className="size-4.5" />}
        />
        <Stat
          label="Stalled"
          value={stats.stalled}
          hint={`No update in ${STALL_AFTER_DAYS}+ days`}
          accent={stats.stalled > 0 ? 'text-red-600' : 'text-ink-900'}
          icon={<Timer className="size-4.5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card title="Live pipeline" subtitle="Current status across all records" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {pipelineCounts.map(({ stage, count }) => (
              <div key={stage.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700">{stage.label}</span>
                  <span className="font-display text-sm font-semibold tabular-nums text-zinc-900">{count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', dotTone(stage.tone))}
                    style={{ width: `${(count / maxPipeline) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {locationSplit.map(({ loc, open }) => (
              <div
                key={loc.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200/70 bg-zinc-50/60 px-4 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-800">{loc.name}</p>
                  <p className="text-xs text-zinc-500">{loc.area}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
                    open > 0 ? 'bg-white text-brand-700 ring-1 ring-brand-100' : 'bg-white text-zinc-500 ring-1 ring-zinc-200'
                  )}
                >
                  {open} open
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent activity" subtitle="Latest status changes" pad={false}>
          {recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 px-1">
              {recent.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-50/70">
                  <Avatar name={staffById(e.updatedByStaffId).name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-zinc-700">
                      <Link to={`/records/${e.recordCode}`} className="font-semibold text-brand-600 hover:underline">
                        {e.recordCode}
                      </Link>{' '}
                      {e.kind === 'created' ? 'created at' : e.kind === 'transfer' ? 'transferred to' : 'moved to'}{' '}
                      <StatusBadge stageId={e.stageId} />
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {staffById(e.updatedByStaffId).name} · {locationById(e.locationId).name} · {timeAgo(e.updatedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {stats.stalled > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50/60 px-5 py-3.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <AlertTriangle className="size-4.5" />
          </span>
          <p className="flex-1 text-sm text-amber-900">
            <span className="font-semibold">{stats.stalled} {config.recordLabel.toLowerCase()}{stats.stalled === 1 ? '' : 's'} stalled</span>{' '}
            — no status update in {STALL_AFTER_DAYS}+ days.
          </p>
          <Link to="/followup" className="flex items-center gap-1 text-sm font-semibold text-amber-700 hover:underline">
            Open queue <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
