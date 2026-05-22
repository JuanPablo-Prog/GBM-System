import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Briefcase, Building2, Edit3, Save, X } from 'lucide-react'
import { getEmployeeByUserId, updateEmployee, getDepartments } from '../lib/queries'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Profile() {
  const { user, userRole } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', position: '', department_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const [{ data: emp }, { data: depts }] = await Promise.all([
        getEmployeeByUserId(user.id),
        getDepartments()
      ])
      setEmployee(emp)
      setDepartments(depts ?? [])
      if (emp) {
        setForm({
          full_name: emp.full_name || '',
          email: emp.email || '',
          position: emp.position || '',
          department_id: emp.department_id || ''
        })
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email || null,
      position: form.position || null,
      department_id: form.department_id || null
    }
    const { error: updateError } = await updateEmployee(employee.id, payload)
    if (updateError) {
      setError(updateError.message)
    } else {
      setEmployee({ ...employee, ...payload })
      setIsEditing(false)
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-400">No se encontró tu perfil de empleado.</p>
        <p className="text-slate-500 text-sm">Contacta al administrador.</p>
      </div>
    )
  }

  const info = [
    { icon: User, label: 'Nombre', value: employee.full_name, field: 'full_name' },
    { icon: Mail, label: 'Correo', value: employee.email, field: 'email' },
    { icon: Briefcase, label: 'Puesto', value: employee.position, field: 'position' },
    { icon: Building2, label: 'Departamento', value: employee.department?.name || '—', field: 'department_id' },
  ]

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">Mi Perfil</h2>
          <p className="text-slate-400 text-sm mt-1">
            {userRole === 'admin' ? 'Administrador' : 'Empleado'}
          </p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-ghost">
            <Edit3 size={15} /> Editar
          </button>
        )}
      </div>

      <motion.div className="card p-6 space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-5 border-b border-white/10">
          <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="font-display font-bold text-2xl text-violet-300">
              {employee.full_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-display font-semibold text-slate-100">{employee.full_name}</p>
            <span className={`badge border mt-1 ${userRole === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-500/20 text-slate-300'}`}>
              {userRole === 'admin' ? 'Administrador' : 'Empleado'}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Puesto</label>
              <input className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
            </div>
            <div>
              <label className="label">Departamento</label>
              <select className="input" value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}>
                <option value="">Sin departamento</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost">
                <X size={14} /> Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                <Save size={14} /> {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Icon size={14} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-display uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-slate-200 mt-0.5">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}