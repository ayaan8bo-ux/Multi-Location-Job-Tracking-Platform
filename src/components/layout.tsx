import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowLeftRight, Bell, Briefcase, ClipboardList, Command, Gauge, LayoutDashboard,
  LogOut, Menu, MessageSquareText, PlusCircle, Search, Settings as SettingsIcon, ShieldCheck, ScrollText, Users, Wrench, X
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useApp, useRole } from '../store'
import { config } from '../config'
import { variants } from '../variants'
import { Avatar, Button } from './ui'
import CommandPalette, { useCommandPalette } from './CommandPalette'
import Toast from './Toast'
import type { ReactNode } from 'react'

function NavItem({ to, icon, label, end, onNavigate }: { to: string; icon: ReactNode; label: string; end?: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive ? 'bg-brand-50 text-brand-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />}
          <span className={cn('transition-colors', isActive ? 'text-brand-600' : 'text-zinc-400 group-hover:text-zinc-600')}>{icon}</span>
          {label}
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">{children}</p>
}

function SidebarContent({ role, user, onNavigate, logout }: { role: string; user: NonNullable<ReturnType<typeof useApp>['user']>; onNavigate?: () => void; logout: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 pb-4 pt-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-md">
          <Briefcase className="size-[18px]" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold tracking-tight text-ink-900">Vyden Core</p>
          <p className="truncate text-xs text-zinc-500">{config.businessName}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        <SectionLabel>Operations</SectionLabel>
        <div className="space-y-0.5">
          <NavItem to="/" end onNavigate={onNavigate} icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
          <NavItem to="/records" onNavigate={onNavigate} icon={<ClipboardList className="size-4" />} label={config.recordLabelPlural} />
          <NavItem to="/customers" onNavigate={onNavigate} icon={<Users className="size-4" />} label="Customers" />
          <NavItem to="/transfers" onNavigate={onNavigate} icon={<ArrowLeftRight className="size-4" />} label="Transfers" />
          <NavItem to="/messages" onNavigate={onNavigate} icon={<MessageSquareText className="size-4" />} label="Messages" />
          <NavItem to="/followup" onNavigate={onNavigate} icon={<Activity className="size-4" />} label="Follow-up queue" />
        </div>

        <SectionLabel>Create</SectionLabel>
        <NavItem to="/intake" onNavigate={onNavigate} icon={<PlusCircle className="size-4" />} label={`New ${config.recordLabel.toLowerCase()}`} />

        {role === 'admin' && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <div className="space-y-0.5">
              <NavItem to="/admin/staff" onNavigate={onNavigate} icon={<Users className="size-4" />} label="Staff & locations" />
              <NavItem to="/admin/audit" onNavigate={onNavigate} icon={<ScrollText className="size-4" />} label="Audit log" />
              <NavItem to="/admin/reports" onNavigate={onNavigate} icon={<Gauge className="size-4" />} label="Reports" />
              <NavItem to="/settings" onNavigate={onNavigate} icon={<SettingsIcon className="size-4" />} label="Deployment settings" />
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-zinc-100 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-50">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-zinc-900">{user.name}</p>
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              {user.role === 'admin' ? <ShieldCheck className="size-3" /> : <Wrench className="size-3" />}
              {user.role === 'admin' ? 'Administrator' : 'Staff'}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}

export default function Layout() {
  const { user, logout, activeVariant, switchVariant } = useApp()
  const role = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [drawer, setDrawer] = useState(false)
  const palette = useCommandPalette()

  if (!user) return null

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/records?q=${encodeURIComponent(q.trim())}` : '/records')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <SidebarContent role={role} user={user} logout={logout} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-2xl">
            <button onClick={() => setDrawer(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
              <X className="size-4" />
            </button>
            <SidebarContent role={role} user={user} onNavigate={() => setDrawer(false)} logout={logout} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur lg:px-5">
          <button onClick={() => setDrawer(true)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <form onSubmit={submitSearch} className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search by customer, phone, code or ${config.identifierLabel.toLowerCase()}…`}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/80 py-2 pl-9 pr-3 text-sm text-zinc-800 shadow-sm transition placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </form>
          <button
            onClick={() => palette.setOpen(true)}
            title="Command palette (⌘K)"
            className="hidden items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-400 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-600 xl:flex"
          >
            <Command className="size-3.5" />
            <span className="hidden 2xl:inline">Quick actions</span>
            <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 text-[10px] text-zinc-400">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-sm sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {config.locations.find((l) => l.id === user.locationId)?.name ?? user.locationId}
            </div>
            <select
              value={activeVariant}
              onChange={(e) => switchVariant(e.target.value)}
              title="Switch demo vertical"
              className="hidden cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 shadow-sm focus:border-brand-400 focus:outline-none lg:block"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <button
              className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
              title="Notifications"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" />
            </button>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/intake')}>
              <PlusCircle className="size-3.5" />
              New {config.recordLabel.toLowerCase()}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div key={location.pathname} className="animate-rise mx-auto max-w-7xl p-5 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={palette.open} onClose={() => palette.setOpen(false)} />
      <Toast />
    </div>
  )
}
