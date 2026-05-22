import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './views/Login'
import ChangePassword from './views/ChangePassword'
import Dashboard from './views/Dashboard'
import Assets from './views/Assets'
import Employees from './views/Employees'
import Users from './views/users'                 // <-- NUEVA IMPORTACIÓN
import Assignments from './views/Assignments'
import Maintenance from './views/Maintenance'
import Reports from './views/Reports'
import MyEquipment from './views/MyEquipment'
import Profile from './views/Profile'
import Catalogs from './views/Catalogs'
import LoadingSpinner from './components/Loadingspinner'

const ADMIN_VIEWS = {
  dashboard:   <Dashboard />,
  assets:      <Assets />,
  employees:   <Employees />,
  users:       <Users />,                        // <-- NUEVA VISTA
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
        <LoadingSpinner text="Iniciando sistema…" />
      </div>
    )
  }

  if (!user) return <Login />
  if (requiresPasswordChange) return <ChangePassword />

  const defaultView  = isAdmin ? 'dashboard' : 'myequipment'
  const currentView  = view ?? defaultView
  const views        = isAdmin ? ADMIN_VIEWS : EMPLOYEE_VIEWS

  // Guard: if employee tries to access admin route, redirect
  const resolvedView = views[currentView] ? currentView : defaultView

  return (
    <Layout currentView={resolvedView} onNavigate={setView}>
      {views[resolvedView]}
    </Layout>
  )
}
