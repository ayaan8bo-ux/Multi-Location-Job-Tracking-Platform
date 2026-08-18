import { Check } from 'lucide-react'
import { config } from '../config'
import { cn } from '../lib/cn'
import { dotTone, ringTone, stageById } from '../lib/utils'
import type { WorkRecord } from '../types'

export default function PipelineStepper({ record }: { record: WorkRecord }) {
  const pipeline = config.recordTypes.find((t) => t.id === record.recordTypeId)?.pipeline ?? []
  const currentIdx = pipeline.indexOf(record.currentStageId)
  const isException = currentIdx === -1
  const currentStage = stageById(record.currentStageId)

  if (pipeline.length === 0) return null

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white px-5 py-4 shadow-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Pipeline</p>
      <div className="flex items-center">
        {pipeline.map((sid, i) => {
          const s = stageById(sid)
          const done = !isException && i < currentIdx
          const isCurrent = !isException && i === currentIdx
          return (
            <div key={sid} className={cn('flex items-center', i < pipeline.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-all',
                    done && 'bg-emerald-500 text-white',
                    isCurrent && cn('text-white ring-4 ring-offset-1', ringTone(s.tone), dotTone(s.tone)),
                    !done && !isCurrent && 'bg-zinc-100 text-zinc-400'
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'mt-1.5 whitespace-nowrap text-[11px] font-medium',
                    isCurrent ? 'text-zinc-900' : done ? 'text-zinc-600' : 'text-zinc-400'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < pipeline.length - 1 && (
                <div className={cn('mx-2 mb-5 h-0.5 flex-1 rounded-full', i < currentIdx || isCurrent ? 'bg-emerald-400' : 'bg-zinc-200')} />
              )}
            </div>
          )
        })}
      </div>
      {isException && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          This {config.recordLabel.toLowerCase()} branched out of the main pipeline to: <strong>{currentStage.label}</strong>
        </p>
      )}
    </div>
  )
}
