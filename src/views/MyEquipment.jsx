import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, MapPin, Tag, Clock, CheckCircle2 } from 'lucide-react'
import { getEmployeeByUserId, getAssignmentsByEmployee } from '../lib/queries'
import { useAuth } from '../contexts/AuthContext'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MyEquipment() {
  const { user } = useAuth()
  const [employee,    setEmployee]    = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState(0) // 0=active, 1=history

  useEffect(() => {
    if (!user) return
    getEmployeeByUserId(user.id).then(({ data: emp }) => {
      setEmployee(emp)
      if (emp) {
        getAssignmentsByEmployee(emp.id).then(({ data: asgn }) => {
          setAssignments(asgn ?? [])
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [user])

  if (loading) return <LoadingSpinner />

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 bg-bg-card rounded-xl flex items-center justify-center">
          <Package size={22} className="text-slate-500" />
        </div>
        <p className="text-slate-400 text-sm">Tu cuenta no tiene un perfil de empleado vinculado.</p>
        <p className="text-slate-600 text-xs">Contacta al administrador.</p>
      </div>
    )
  }

  const active  = assignments.filter(a => !a.returned_at)
  const history = assignments.filter(a => a.returned_at)
  const list    = tab === 0 ? active : history

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Employee card */}
      <motion.div
        className="card p-5 flex items-center gap-4"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-12 h-12 bg-violet-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-lg text-violet-400">
            {employee.full_name[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-display font-semibold text-slate-100">{employee.full_name}</p>
          <p className="text-slate-500 text-sm">{employee.position ?? ''}{employee.department ? ` · ${employee.department.name}` : ''}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-2xl font-bold text-amber-DEFAULT">{active.length}</p>
          <p className="text-slate-500 text-xs">bienes asignados</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-surface rounded-lg p-1 w-fit border border-border-subtle">
        {['Equipo actual', 'Historial'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-1.5 rounded-md text-sm font-display font-medium transition-all
                        ${tab === i ? 'bg-bg-card text-slate-200 shadow-card' : 'text-slate-500 hover:text-slate-300'}`}>
            {t}
            <span className={`ml-1.5 text-xs font-mono ${tab===i ? 'text-amber-DEFAULT' : 'text-slate-600'}`}>
              {i === 0 ? active.length : history.length}
            </span>
          </button>
        ))}
      </div>

      {/* Equipment grid */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Package size={24} className="text-slate-600" />
          <p className="text-slate-500 text-sm">
            {tab === 0 ? 'No tienes bienes asignados actualmente.' : 'Sin historial de devoluciones.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((a, i) => (
            <motion.div
              key={a.id}
              className={`card p-5 ${tab === 0 ? 'border-border-subtle' : 'opacity-70'}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-bg-hover rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium text-sm">{a.asset?.name ?? '—'}</p>
                    {a.asset?.serial_number && (
                      <p className="text-slate-500 text-xs font-mono mt-0.5">{a.asset.serial_number}</p>
                    )}
                  </div>
                </div>
                <Badge text={a.asset?.status?.name} />
              </div>

              <div className="mt-4 space-y-1.5">
                {a.asset?.category?.name && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Tag size={11} />{a.asset.category.name}
                  </div>
                )}
                {a.asset?.location?.name && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={11} />{a.asset.location.name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={11} />Asignado: {a.assigned_at}
                </div>
                {a.returned_at && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 size={11} />Devuelto: {a.returned_at}
                  </div>
                )}
              </div>

              {a.notes && (
                <p className="mt-3 text-xs text-slate-600 bg-bg-surface rounded-lg px-3 py-2 border border-border-subtle">
                  {a.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}