import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useApp } from './store'
import Layout from './components/layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import RecordDetail from './pages/RecordDetail'
import Intake from './pages/Intake'
import FollowUp from './pages/FollowUp'
import AdminStaff from './pages/AdminStaff'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Transfers from './pages/Transfers'
import Messages from './pages/Messages'
import Audit from './pages/Audit'
import { CustomersIndex, CustomerDetail } from './pages/Customers'
import { IntakeSlip, Receipt } from './pages/PrintDocs'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useApp()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useApp()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="records" element={<Records />} />
        <Route path="records/:id" element={<RecordDetail />} />
        <Route path="customers" element={<CustomersIndex />} />
        <Route path="customers/:phone" element={<CustomerDetail />} />
        <Route path="intake" element={<Intake />} />
        <Route path="followup" element={<FollowUp />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="messages" element={<Messages />} />
        <Route path="admin/staff" element={<RequireAdmin><AdminStaff /></RequireAdmin>} />
        <Route path="admin/audit" element={<RequireAdmin><Audit /></RequireAdmin>} />
        <Route path="admin/reports" element={<RequireAdmin><Reports /></RequireAdmin>} />
        <Route path="settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/print/:code/intake" element={<RequireAuth><IntakeSlip /></RequireAuth>} />
      <Route path="/print/:code/receipt" element={<RequireAuth><Receipt /></RequireAuth>} />
    </Routes>
  )
}
