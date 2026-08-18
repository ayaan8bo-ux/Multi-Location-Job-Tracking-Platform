import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck, MessageSquareText, Send } from 'lucide-react'
import { useApp } from '../store'
import { Card, EmptyState, PageHeader, Tabs } from '../components/ui'
import { cn } from '../lib/cn'
import { deriveMessages, messageTypeLabel } from '../lib/messages'
import type { MessageType } from '../lib/messages'
import { formatDateTime } from '../lib/utils'

type Tab = MessageType | 'all'

const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'status_update', label: 'Status updates' },
  { id: 'intake', label: 'Intake docs' },
  { id: 'completion', label: 'Completion docs' },
  { id: 'review_request', label: 'Review requests' }
]

export default function Messages() {
  const { records } = useApp()
  const [tab, setTab] = useState<Tab>('all')
  const messages = useMemo(() => deriveMessages(records), [records])

  const counts = useMemo(() => {
    const m = new Map<Tab, number>()
    for (const t of tabs) m.set(t.id, 0)
    for (const msg of messages) m.set(msg.type, (m.get(msg.type) ?? 0) + 1)
    m.set('all', messages.length)
    return m
  }, [messages])

  const rows = messages.filter((m) => tab === 'all' || m.type === tab)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer messages"
        description="Every outbound touchpoint sent via WhatsApp — automatically triggered by status changes"
      />

      <Tabs<Tab>
        items={tabs.map((t) => ({ id: t.id, label: t.label, count: counts.get(t.id) ?? 0 }))}
        value={tab}
        onChange={setTab}
      />

      <Card pad={false}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText className="size-5" />}
            title="No messages yet"
            description="Status changes on records automatically generate customer messages."
          />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {rows.map((m) => (
              <li key={m.id} className="flex items-start gap-3 px-5 py-3.5">
                <div
                  className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                    m.type === 'status_update'
                      ? 'bg-indigo-50 text-indigo-600'
                      : m.type === 'intake'
                        ? 'bg-blue-50 text-blue-600'
                        : m.type === 'completion'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                  )}
                >
                  {m.type === 'review_request' ? <MessageSquareText className="size-4" /> : <Send className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[13px] font-medium text-zinc-800">{messageTypeLabel(m.type)}</span>
                    <span className="text-zinc-400">·</span>
                    <Link to={`/records/${m.recordCode}`} className="text-[13px] font-medium text-indigo-600 hover:underline">
                      {m.recordCode}
                    </Link>
                    <span className="text-xs text-zinc-400">
                      → {m.customerName} ({m.customerPhone})
                    </span>
                    <span
                      className={cn(
                        'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        m.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                      )}
                    >
                      {m.status === 'delivered' ? <CheckCheck className="size-3" /> : <Send className="size-3" />}
                      {m.status === 'delivered' ? 'Delivered' : 'Sent'}
                    </span>
                  </div>
                  <p className="mt-1 rounded-lg bg-zinc-50 px-3 py-2 text-[13px] leading-relaxed text-zinc-600">{m.content}</p>
                  <p className="mt-1 text-xs text-zinc-400">{formatDateTime(m.sentAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
