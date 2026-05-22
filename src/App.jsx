import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './views/Login'
import ChangePassword from './views/ChangePassword'
import Dashboard from './views/Dashboard'
import Assets from './views/Assets'
import Employees from './views/Employees'
import Assignments from './views/Assignments'
import Maintenance from './views/Maintenance'
import Reports from './views/Reports'
import MyEquipment from './views/MyEquipment'
import Profile from './views/Profile'
import Catalogs from './views/Catalogs'
import Users from './views/users'
import UserRoles from './views/UserRoles'

// Componente inline para loading (evita dependencia de archivo)
function LoadingSpinnerInline({ text = "Iniciando sistema…" }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-border-default" />
        <div className="absolute inset-0 rounded-full border-2 border-t-amber-DEFAULT animate-spin" />
      </div>
      <p className="text-slate-500 text-sm font-mono">{text}</p>
    </div>
  )
}

const ADMIN_VIEWS = {
  dashboard:   <Dashboard />,
  assets:      <Assets />,
  employees:   <Employees />,
  users:       <Users />,
  userroles:   <UserRoles />,
  assignments: <Assignments />,
  maintenance: <Maintenance />,
  reports:     <Reports />,
  catalogs:    <Catalogs />,
  profile:     <Profile />,
}

const EMPLOYEE_VIEWS = {
  myequipment: <MyEquipment />,
  profile:     <Profile />,
}

export default function App() {
  const { user, isAdmin, requiresPasswordChange, loading } = useAuth()
  const [view, setView] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <LoadingSpinnerInline text="Iniciando sistema…" />
      </div>
    )
  }

  if (!user) return <Login />
  if (requiresPasswordChange) return <ChangePassword />

  const defaultView  = isAdmin ? 'dashboard' : 'myequipment'
  const currentView  = view ?? defaultView
  const views        = isAdmin ? ADMIN_VIEWS : EMPLOYEE_VIEWS

  const resolvedView = views[currentView] ? currentView : defaultView

  return (
    <Layout currentView={resolvedView} onNavigate={setView}>
      {views[resolvedView]}
    </Layout>
  )
}
