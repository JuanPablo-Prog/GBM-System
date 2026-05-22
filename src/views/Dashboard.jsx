import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Users, ArrowLeftRight, Wrench, CalendarDays, TrendingUp } from 'lucide-react'
import { getDashboardStats, getRecentAssignments } from '../lib/queries'
import LoadingSpinner from '../components/LoadingSpinner'

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <motion.div
    className="card p-5 flex items-start gap-4"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-display uppercase tracking-wider">{label}</p>
      <p className="font-display font-bold text-3xl text-slate-100 mt-0.5">{value}</p>
    </div>
  </motion.div>
)

export default function Dashboard() {
  const [stats,  setStats]  = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getRecentAssignments()])
      .then(([{ data: _s, ...s }, { data: r }]) => {
        // getDashboardStats returns the object directly
        setStats(s)
        setRecent(r ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // getDashboardStats returns the counts directly
  useEffect(() => {
    getDashboardStats().then(s => setStats(s))
    getRecentAssignments().then(({ data }) => setRecent(data ?? []))
    setLoading(false)
  }, [])

  if (loading) return <LoadingSpinner />

  const cards = [
    { label: 'Total de bienes',    value: stats?.total ?? '—',       icon: Package,        color: 'bg-blue-500/15 text-blue-400',    delay: 0 },
    { label: 'Bienes asignados',   value: stats?.assigned ?? '—',    icon: ArrowLeftRight, color: 'bg-amber-500/15 text-amber-400',  delay: 0.05 },
    { label: 'En mantenimiento',   value: stats?.maintenance ?? '—', icon: Wrench,         color: 'bg-orange-500/15 text-orange-400',delay: 0.1 },
    { label: 'Empleados',          value: stats?.employees ?? '—',   icon: Users,          color: 'bg-violet-500/15 text-violet-400',delay: 0.15 },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">Panel de control</h2>
        <p className="text-slate-500 text-sm mt-1">Resumen general del inventario</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Recent assignments */}
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
          <TrendingUp size={15} className="text-amber-DEFAULT" />
          <h3 className="font-display font-semibold text-sm text-slate-200">Asignaciones recientes</h3>
        </div>
        {recent.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">Sin asignaciones activas</p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recent.map((r, i) => (
              <motion.div
                key={i}
                className="px-5 py-3 flex items-center justify-between hover:bg-bg-hover transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.04 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-bg-hover rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{r.asset?.name ?? '—'}</p>
                    <p className="text-xs text-slate-500">→ {r.employee?.full_name ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <CalendarDays size={12} />
                  {r.assigned_at}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}