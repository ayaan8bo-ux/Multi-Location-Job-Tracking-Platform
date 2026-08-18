import { useState } from 'react'
import { MapPin, UserPlus, Users } from 'lucide-react'
import { useApp } from '../store'
import { config } from '../config'
import { Avatar, Button, Card, Field, Input, PageHeader, Select, ToneBadge } from '../components/ui'
import { isTerminalStage } from '../lib/utils'
import type { Role } from '../types'

export default function AdminStaff() {
  const { records } = useApp()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loc, setLoc] = useState(config.locations[0]?.id ?? '')
  const [role, setRole] = useState<Role>('staff')
  const [added, setAdded] = useState<string[]>([])

  const openByLocation = (locId: string) => records.filter((r) => r.intakeLocationId === locId && !isTerminalStage(r.currentStageId)).length

  const addStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setAdded((prev) => [...prev, `${name.trim()} · ${role}`])
    setName('')
    setPhone('')
    setAdding(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff & locations"
        description="Who can access the system, and where"
        actions={
          <Button onClick={() => setAdding(!adding)}>
            <UserPlus className="size-4" />
            Add staff
          </Button>
        }
      />

      {adding && (
        <Card title="Add staff member" actions={<button className="text-xs font-medium text-zinc-400 hover:text-zinc-700" onClick={() => setAdding(false)}>Cancel</button>}>
          <form onSubmit={addStaff} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Full name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Staff name" autoFocus />
            </Field>
            <Field label="Phone" required>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" maxLength={10} inputMode="numeric" />
            </Field>
            <Field label="Location">
              <Select value={loc} onChange={(e) => setLoc(e.target.value)}>
                {config.locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Role">
              <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit">Add {name.trim() || 'staff'}</Button>
            </div>
          </form>
          {added.length > 0 && (
            <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Added (demo): {added.join(' · ')}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Staff" subtitle={`${config.staff.length + added.length} active accounts`} pad={false}>
          <ul className="divide-y divide-zinc-100">
            {config.staff.map((s) => {
              const loc = config.locations.find((l) => l.id === s.locationId)
              return (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={s.name} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                      {s.name}
                      <ToneBadge tone={s.role === 'admin' ? 'indigo' : 'slate'} label={s.role} />
                    </p>
                    <p className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="size-3" />
                      {loc?.name} — {s.phone}
                    </p>
                  </div>
                  <span className="size-2 rounded-full bg-emerald-500" title="Active" />
                </li>
              )
            })}
            {added.map((a, i) => (
              <li key={`added-${i}`} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={a.split(' · ')[0]} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                    {a.split(' · ')[0]}
                    <ToneBadge tone={a.endsWith('admin') ? 'indigo' : 'slate'} label={a.split(' · ')[1]} />
                  </p>
                  <p className="text-xs text-emerald-600">Just added (demo)</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Locations" subtitle={`${config.locations.filter((l) => l.active).length} operating`} pad={false}>
          <ul className="divide-y divide-zinc-100">
            {config.locations.map((l) => {
              const staffCount = config.staff.filter((s) => s.locationId === l.id).length
              return (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                    <Users className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                      {l.name}
                      {!l.active && <ToneBadge tone="red" label="inactive" />}
                    </p>
                    <p className="text-xs text-zinc-500">{l.area}</p>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    <p className="font-medium text-zinc-700">{staffCount} staff</p>
                    <p>{openByLocation(l.id)} open records</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
