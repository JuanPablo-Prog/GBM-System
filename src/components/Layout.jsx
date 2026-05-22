import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'

const breadcrumbs = {
  dashboard:   'Dashboard',
  assets:      'Bienes Materiales',
  employees:   'Empleados',
  assignments: 'Asignaciones',
  maintenance: 'Mantenimiento',
  reports:     'Reportes',
  myequipment: 'Mi Equipo',
  profile:     'Mi Perfil',
}

export default function Layout({ currentView, onNavigate, children }) {
  return (
    // Fondo con imagen de alta resolución
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-[url('https://4kwallpapers.com/images/wallpapers/earth-horizon-distant-planet-milky-way-blue-planet-astronomy-3840x2160-8987.png')]">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />

      <main className="ml-60 min-h-screen flex flex-col">
        {/* Topbar con fondo semi-transparente para legibilidad */}
        <header className="sticky top-0 z-30 bg-black/50 backdrop-blur border-b border-border-subtle px-8 py-3.5">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-semibold text-slate-200 text-sm tracking-wide">
              {breadcrumbs[currentView] ?? currentView}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              conectado
            </div>
          </div>
        </header>

        {/* Contenido con fondo semi-transparente para mejorar legibilidad */}
        <div className="flex-1 px-8 py-6 bg-bg-base/60 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}