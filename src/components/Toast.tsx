import { Check, Undo2, X } from 'lucide-react'
import { useApp } from '../store'
import { Button } from './ui'

export default function Toast() {
  const { toast, dismissToast } = useApp()
  if (!toast) return null

  return (
    <div
      key={toast.id}
      className="animate-rise fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-900 py-2.5 pl-4 pr-2 text-sm text-white shadow-2xl"
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
        <Check className="size-3.5" />
      </span>
      <span className="max-w-72 truncate">{toast.message}</span>
      {toast.undoLabel && toast.onUndo && (
        <Button
          variant="ghost"
          size="sm"
          className="text-brand-300 hover:bg-white/10 hover:text-brand-200"
          onClick={() => {
            toast.onUndo?.()
            dismissToast()
          }}
        >
          <Undo2 className="size-3.5" />
          {toast.undoLabel}
        </Button>
      )}
      <button onClick={dismissToast} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white">
        <X className="size-3.5" />
      </button>
    </div>
  )
}
