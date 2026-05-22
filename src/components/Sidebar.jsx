import { motion } from 'framer-motion'
import {
  LayoutDashboard, Package, Users, ArrowLeftRight,
  Wrench, BarChart3, Monitor, LogOut, Settings, Database, UserCircle, Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const adminNav = [
  { id: 'dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'assets',       label: 'Bienes',         icon: Package },
  { id: 'employees',    label: 'Empleados',      icon: Users },
  { id: 'users',        label: 'Usuarios',       icon: UserCircle },
  { id: 'userroles',    label: 'Roles',          icon: Shield },
  { id: 'assignments',  label: 'Asignaciones',   icon: ArrowLeftRight },
  { id: 'maintenance',  label: 'Mantenimiento',  icon: Wrench },
  { id: 'reports',      label: 'Reportes',       icon: BarChart3 },
  { id: 'catalogs',     label: 'Catálogos',      icon: Database },
  { id: 'profile',      label: 'Mi Perfil',      icon: UserCircle },
]

const employeeNav = [
  { id: 'myequipment',  label: 'Mi Equipo',      icon: Monitor },
  { id: 'profile',      label: 'Mi Perfil',      icon: Settings },
]

export default function Sidebar({ currentView, onNavigate }) {
  const { isAdmin, user, signOut } = useAuth()
  const navItems = isAdmin ? adminNav : employeeNav

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-black/40 backdrop-blur-md border-r border-white/10
                      flex flex-col z-40 select-none">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500/80 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Package size={14} className="text-bg-base" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-slate-100 leading-none">GestorActivos</p>
            <p className="font-mono text-[10px] text-slate-300 mt-0.5">
              {isAdmin ? 'Administrador' : 'Empleado'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                          font-body transition-all duration-150 group relative
                          ${active
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm'
                            : 'text-slate-300 hover:text-slate-100 hover:bg-white/10'
                          }`}
            >
              <Icon size={16} className={active ? 'text-amber-300' : 'text-slate-400 group-hover:text-slate-200'} />
              <span className={active ? 'font-medium' : ''}>{label}</span>
              {active && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute right-2 w-1 h-1 bg-amber-400 rounded-full"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-3 border-t border-white/10 space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs text-slate-300 truncate font-mono">{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 transition-all duration-150"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}