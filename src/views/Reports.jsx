import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getAssetsByStatus, getAssetsByCategory, getActiveAssignments, getEmployees } from '../lib/queries'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-border-default rounded-lg px-3 py-2 shadow-modal">
      <p className="text-slate-200 text-xs font-mono">{payload[0].name}: <strong>{payload[0].value}</strong></p>
    </div>
  )
}

export default function Reports() {
  const [byStatus,   setByStatus]   = useState([])
  const [byCategory, setByCategory] = useState([])
  const [assignments,setAssignments]= useState([])
  const [employees,  setEmployees]  = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      getAssetsByStatus(), getAssetsByCategory(),
      getActiveAssignments(), getEmployees(),
    ]).then(([s, c, { data: a }, { data: e }]) => {
      setByStatus(s)
      setByCategory(c)
      setAssignments(a ?? [])
      setEmployees(e ?? [])
      setLoading(false)
    })
  }, [])

  // Equipment by department (from active assignments)
  const byDept = (() => {
    const counts = {}
    assignments.forEach(a => {
      const dept = a.employee?.department?.name ?? 'Sin área'
      counts[dept] = (counts[dept] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  })()

  const unassigned = (() => {
    const total = byStatus.reduce((s, x) => s + x.value, 0)
    const assigned = assignments.length
    return Math.max(0, total - assigned)
  })()

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">Reportes</h2>
        <p className="text-slate-500 text-sm mt-1">Análisis del inventario</p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total activos',    value: byStatus.reduce((s, x) => s + x.value, 0), color: 'text-blue-400' },
          { label: 'Asignados',        value: assignments.length,                          color: 'text-amber-DEFAULT' },
          { label: 'Disponibles',      value: unassigned,                                  color: 'text-emerald-400' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} className="card p-5"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <p className="text-slate-500 text-xs font-display uppercase tracking-wider">{label}</p>
            <p className={`font-display font-bold text-3xl mt-1 ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* By status */}
        <motion.div className="card p-5"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-4">Bienes por estado</h3>
          {byStatus.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#374151', strokeWidth: 1 }} fontSize={11} fill="#8884d8">
                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </motion.div>

        {/* By category */}
        <motion.div className="card p-5"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-4">Bienes por categoría</h3>
          {byCategory.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1a2333' }} />
                  <Bar dataKey="value" name="Cantidad" radius={[4, 4, 0, 0]}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </motion.div>
      </div>

      {/* By department */}
      <motion.div className="card p-5"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h3 className="font-display font-semibold text-sm text-slate-200 mb-4">Bienes asignados por área</h3>
        {byDept.length === 0
          ? <p className="text-slate-500 text-sm text-center py-8">No hay asignaciones activas</p>
          : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byDept} layout="vertical" margin={{ top: 0, right: 4, left: 60, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1a2333' }} />
                <Bar dataKey="value" name="Bienes" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </motion.div>

      {/* Employee list with assignment count */}
      <motion.div className="card overflow-hidden"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="font-display font-semibold text-sm text-slate-200">Bienes por empleado (activos)</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Empleado', 'Área', 'Bienes asignados'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {employees.map(emp => {
              const count = assignments.filter(a => a.employee_id === emp.id).length
              return (
                <tr key={emp.id} className="table-row-hover">
                  <td className="px-5 py-3 text-slate-200">{emp.full_name}</td>
                  <td className="px-5 py-3 text-slate-500">{emp.department?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono font-medium ${count > 0 ? 'text-amber-DEFAULT' : 'text-slate-600'}`}>
                      {count}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}