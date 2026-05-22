import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, User } from 'lucide-react'
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getDepartments,
} from '../lib/queries'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/Confirmdialog'
import LoadingSpinner from '../components/LoadingSpinner'

const EMPTY = { full_name: '', email: '', department_id: '', position: '' }

export default function Employees() {
  const [employees,  setEmployees]  = useState([])
  const [depts,      setDepts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [formError,  setFormError]  = useState('')

  const load = async () => {
    const [{ data: e }, { data: d }] = await Promise.all([getEmployees(), getDepartments()])
    setEmployees(e ?? [])
    setDepts(d ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditTarget(null); setFormError(''); setModalOpen(true) }
  const openEdit   = (e) => {
    setForm({ full_name: e.full_name, email: e.email ?? '', department_id: e.department_id ?? '', position: e.position ?? '' })
    setEditTarget(e); setFormError(''); setModalOpen(true)
  }

  const handleSave = async (evt) => {
    evt.preventDefault()
    if (!form.full_name.trim()) { setFormError('El nombre es obligatorio.'); return }
    setSaving(true)
    const payload = {
      full_name:     form.full_name.trim(),
      email:         form.email || null,
      department_id: form.department_id || null,
      position:      form.position || null,
    }
    const { error } = editTarget
      ? await updateEmployee(editTarget.id, payload)
      : await createEmployee(payload)

    if (error) { setFormError(error.message); setSaving(false); return }
    await load()
    setModalOpen(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteEmployee(deleteId)
    await load()
    setDeleteId(null)
    setDeleting(false)
  }

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.department?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">Empleados</h2>
          <p className="text-slate-500 text-sm mt-1">{employees.length} empleados registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Nuevo empleado
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9 max-w-sm"
          placeholder="Buscar por nombre, correo, área…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Nombre', 'Correo', 'Departamento', 'Puesto', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-display font-medium
                                       text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                  No se encontraron empleados
                </td>
              </tr>
            )}
            {filtered.map((emp, i) => (
              <motion.tr key={emp.id} className="table-row-hover"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-violet-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User size={13} className="text-violet-400" />
                    </div>
                    <span className="text-slate-200 font-medium">{emp.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-slate-400 text-xs">{emp.email ?? '—'}</td>
                <td className="px-5 py-3 text-slate-400">{emp.department?.name ?? '—'}</td>
                <td className="px-5 py-3 text-slate-400">{emp.position ?? '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(emp)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-DEFAULT hover:bg-amber-muted transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(emp.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
             title={editTarget ? 'Editar empleado' : 'Registrar empleado'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre completo *</label>
              <input className="input" placeholder="Juan Pérez García"
                value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" placeholder="juan@empresa.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Puesto</label>
              <input className="input" placeholder="Técnico de soporte"
                value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Departamento</label>
              <select className="input" value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}>
                <option value="">Sin departamento</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {formError && (
            <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando…' : editTarget ? 'Guardar cambios' : 'Registrar empleado'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title="Eliminar empleado"
        message="Se eliminarán también sus asignaciones vinculadas. Esta acción es irreversible."
      />
    </div>
  )
}
