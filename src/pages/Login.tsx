import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Briefcase, Clock3, Layers, Lock, MessageSquareText, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Button, Field, Input, Select } from '../components/ui'

const perks = [
  { icon: Layers, title: 'One core, every client', text: 'Rebranded and reconfigured per deployment — your data, your database.' },
  { icon: Truck, title: 'Cross-location visibility', text: 'Any branch can track any item, live, end to end.' },
  { icon: MessageSquareText, title: 'Automatic customer updates', text: 'Status change in, WhatsApp message out. No chasing.' },
  { icon: ShieldCheck, title: 'Isolated by design', text: 'Row-level security plus a physically separate database per client.' }
]

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [staffId, setStaffId] = useState(config.staff[0]?.id ?? '')
  const [password, setPassword] = useState('••••••••')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    login(staffId)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <div className="relative hidden w-1/2 overflow-hidden bg-zinc-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-brand-950" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.55) 0, transparent 45%), radial-gradient(circle at 85% 15%, rgba(56,189,248,0.25) 0, transparent 40%), radial-gradient(circle at 70% 90%, rgba(99,102,241,0.35) 0, transparent 45%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
              <Briefcase className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold tracking-tight text-white">Vyden Core</p>
              <p className="text-sm text-zinc-400">{config.businessName} — internal staff portal</p>
            </div>
          </div>

          <div>
            <h2 className="font-display max-w-md text-3xl font-semibold leading-tight tracking-tight text-white text-balance">
              Every record, every branch, one place.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-400">
              A configurable job-tracking platform for multi-location businesses — branded as your own software, deployed to
              your own database.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                ['24/7', 'Cross-location access'],
                ['< 1s', 'Live status sync'],
                ['100%', 'Data isolated per client']
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                  <p className="font-display text-xl font-semibold text-white">{v}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300 ring-1 ring-white/10">
                  <p.icon className="size-3.5" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{p.title}</span>
                  <span className="block text-xs leading-relaxed text-zinc-400">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <Briefcase className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold tracking-tight">Vyden Core</p>
              <p className="text-sm text-zinc-500">{config.businessName}</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-500">Access the internal {config.recordLabelPlural.toLowerCase()} tracking portal.</p>

          <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
            <Field label="Staff account">
              <Select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
                {config.staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {config.locations.find((l) => l.id === s.locationId)?.name} ({s.role})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
              </div>
            </Field>

            <Button type="submit" className="w-full">
              Sign in
              <ArrowRight className="size-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
              <Clock3 className="size-3.5" />
              Demo build — pick an account to preview staff or admin views
            </div>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <Wrench className="size-3.5" />
            Staff see only their location · Admins see all locations
          </p>
        </div>
      </div>
    </div>
  )
}
