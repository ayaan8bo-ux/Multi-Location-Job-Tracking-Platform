import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Card, PageHeader, Stat } from '../components/ui'
import { stageById } from '../lib/utils'
import { cn } from '../lib/cn'

function turnaroundDays(received: string, completed?: string): number | null {
  if (!completed) return null
  return Math.round((new Date(completed).getTime() - new Date(received).getTime()) / 86400000)
}

export default function Reports() {
  const { records } = useApp()

  const stats = useMemo(() => {
    const completed = records.filter((r) => r.dateCompleted)
    const withTat = completed.map((r) => ({ r, d: turnaroundDays(r.dateReceived, r.dateCompleted)! }))
    const avg = withTat.length ? withTat.reduce((s, x) => s + x.d, 0) / withTat.length : 0
    const cancelled = records.filter((r) => {
      const s = stageById(r.currentStageId)
      return s.terminal && s.isException
    }).length
    return { total: records.length, completed: completed.length, avg: avg.toFixed(1), cancelled }
  }, [records])

  const perLocation = useMemo(() => {
    return config.locations
      .map((l) => {
        const all = records.filter((r) => r.intakeLocationId === l.id)
        const done = all.filter((r) => r.dateCompleted)
        const days = done.map((r) => turnaroundDays(r.dateReceived, r.dateCompleted)!).filter((d) => d !== null)
        const avg = days.length ? days.reduce((s, d) => s + d, 0) / days.length : 0
        return { loc: l, total: all.length, done: done.length, avg: days.length ? avg.toFixed(1) : '—', open: all.length - done.length }
      })
      .sort((a, b) => b.total - a.total)
  }, [records])

  const perType = useMemo(() => {
    return config.recordTypes.map((t) => {
      const all = records.filter((r) => r.recordTypeId === t.id)
      const done = all.filter((r) => r.dateCompleted)
      const days = done.map((r) => turnaroundDays(r.dateReceived, r.dateCompleted)!).filter((d) => d !== null)
      const avg = days.length ? days.reduce((s, d) => s + d, 0) / days.length : 0
      return { type: t, total: all.length, done: done.length, avg: days.length ? avg.toFixed(1) : '—' }
    })
  }, [records])

  const maxHandled = Math.max(1, ...perLocation.map((p) => p.total))

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Operational metrics across all locations" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total records" value={stats.total} />
        <Stat label="Completed" value={stats.completed} accent="text-emerald-600" />
        <Stat label="Avg turnaround" value={`${stats.avg}d`} hint="Intake → completion" accent="text-indigo-600" />
        <Stat label="Cancelled / unresolved" value={stats.cancelled} accent={stats.cancelled > 0 ? 'text-red-600' : 'text-zinc-900'} />
      </div>

      <Card title="Turnaround & volume by location" subtitle="Average days from intake to completion">
        <div className="space-y-4">
          {perLocation.map(({ loc, total, done, avg, open }) => (
            <div key={loc.id}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium text-zinc-700">{loc.name}</span>
                <span className="text-xs text-zinc-500">
                  {total} records · {done} completed · <span className="font-semibold text-zinc-700">{avg} days avg</span>
                  {open > 0 && <span className="text-amber-600"> · {open} open</span>}
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-l-full bg-indigo-500" style={{ width: `${(total / maxHandled) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="By service track" subtitle="Volume and turnaround split">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500">
                <th className="py-2 pr-3">Track</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Completed</th>
                <th className="py-2 text-right">Avg turnaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {perType.map(({ type, total, done, avg }) => (
                <tr key={type.id}>
                  <td className="py-2.5 pr-3 font-medium text-zinc-800">{type.label}</td>
                  <td className="py-2.5 pr-3 tabular-nums text-zinc-600">{total}</td>
                  <td className="py-2.5 pr-3 tabular-nums text-zinc-600">{done}</td>
                  <td className="py-2.5 text-right tabular-nums text-zinc-700">{avg}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Throughput" subtitle="Records handled per location, last 30 days">
          {perLocation.map(({ loc, total }) => (
            <div key={loc.id} className="mb-3 flex items-center gap-3 last:mb-0">
              <span className={cn('flex size-7 items-center justify-center rounded-md', total > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-50 text-zinc-400')}>
                <TrendingUp className="size-3.5" />
              </span>
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-zinc-600">{loc.name}</span>
                  <span className="tabular-nums text-zinc-500">{total}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(total / maxHandled) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
