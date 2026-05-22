import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, RotateCcw, Clock, CheckCircle2, Search } from 'lucide-react'
import {
  getActiveAssignments, getAllAssignments,
  createAssignment, returnAssignment,
  getAssets, getEmployees,
} from '../lib/queries'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'

const TABS = ['Activas', 'Historial']

export default function Assignments() {
  const [activeList,  setActive]  = useState([])
  const [histList,    setHist]    = useState([])
  const [assets,      setAssets]  = useState([])
  const [employees,   setEmps]    = useState([])
  const [tab,         setTab]     = useState(0)
  const [loading,     setLoading] = useState(true)
  const [search,      setSearch]  = useState('')
  const [modalOpen,   setModal]   = useState(false)
  const [returnId,    setReturnId]= useState(null)
  const [returning,   setRet]     = useState(false)
  const [saving,      setSaving]  = useState(false)
  const [formError,   setFormError]= useState('')
  const [form,        setForm]    = useState({
    asset_id: '', employee_id: '', assigned_at: new Date().toISOString().split('T')[0], notes: ''
  })

  const load = async () => {
    const [
      { data: a }, { data: h }, { data: assets }, { data: emps }
    ] = await Promise.all([
      getActiveAssignments(), getAllAssignments(), getAssets(), getEmployees()
    ])
    setActive(a ?? [])
    setHist(h ?? [])
    setAssets(assets ?? [])
    setEmps(emps ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.asset_id || !form.employee_id) { setFormError('Selecciona un bien y un empleado.'); return }
    setSaving(true)
    const { error } = await createAssignment({
      asset_id:    form.asset_id,
      employee_id: form.employee_id,
      assigned_at: form.assigned_at,
      notes:       form.notes || null,
    })
    if (error) { setFormError(error.message); setSaving(false); return }
    await load()
    setModal(false)
    setSaving(false)
  }

  const handleReturn = async () => {
    setRet(true)
    await returnAssignment(returnId)
    await load()
    setReturnId(null)
    setRet(false)
  }

  const list = tab === 0 ? activeList : histList
  const filtered = list.filter(a =>
    (a.asset?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.employee?.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Only show available (unassigned) assets for new assignment
  const assignedAssetIds = new Set(activeList.map(a => a.asset_id))
  const availableAssets  = assets.filter(a => !assignedAssetIds.has(a.id))

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">Asignaciones</h2>
          <p className="text-slate-500 text-sm mt-1">
            {activeList.length} activas · {histList.length} en historial
          </p>
        </div>
        <button onClick={() => { setForm({ asset_id:'', employee_id:'', assigned_at: new Date().toISOString().split('T')[0], notes:'' }); setFormError(''); setModal(true) }}
          className="btn-primary">
          <Plus size={15} /> Nueva asignación
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-surface rounded-lg p-1 w-fit border border-border-subtle">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-1.5 rounded-md text-sm font-display font-medium transition-all
                        ${tab === i ? 'bg-bg-card text-slate-200 shadow-card' : 'text-slate-500 hover:text-slate-300'}`}>
            {t}
            <span className={`ml-1.5 text-xs font-mono ${tab===i ? 'text-amber-DEFAULT' : 'text-slate-600'}`}>
              {i === 0 ? activeList.length : histList.length}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9 max-w-sm"
          placeholder="Buscar por bien o empleado…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Bien', 'Empleado', 'Área', 'Fecha entrega', tab===1?'Fecha devolución':'', 'Notas', tab===0?'':'' ].filter(h=>h!=='').map((h,i) => (
                <th key={i} className="px-5 py-3 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
              {tab === 0 && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  Sin asignaciones en esta vista
                </td>
              </tr>
            )}
            {filtered.map((a, i) => (
              <motion.tr key={a.id} className="table-row-hover"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <td className="px-5 py-3">
                  <p className="text-slate-200 font-medium">{a.asset?.name ?? '—'}</p>
                  <p className="text-xs text-slate-500 font-mono">{a.asset?.serial_number ?? ''}</p>
                </td>
                <td className="px-5 py-3 text-slate-300">{a.employee?.full_name ?? '—'}</td>
                <td className="px-5 py-3 text-slate-500 text-xs">{a.employee?.department?.name ?? '—'}</td>
                <td className="px-5 py-3 font-mono text-slate-400 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} /> {a.assigned_at}
                  </div>
                </td>
                {tab === 1 && (
                  <td className="px-5 py-3 font-mono text-slate-400 text-xs">
                    {a.returned_at
                      ? <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={11}/>{a.returned_at}</span>
                      : <span className="text-amber-DEFAULT">Activa</span>
                    }
                  </td>
                )}
                <td className="px-5 py-3 text-slate-500 text-xs max-w-[160px] truncate">{a.notes ?? '—'}</td>
                {tab === 0 && (
                  <td className="px-5 py-3">
                    <button onClick={() => setReturnId(a.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400
                                 hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg transition-colors">
                      <RotateCcw size={12} /> Devolver
                    </button>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      <Modal open={modalOpen} onClose={() => setModal(false)} title="Nueva asignación">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Bien *</label>
            <select className="input" value={form.asset_id} onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))} required>
              <option value="">Seleccionar bien disponible</option>
              {availableAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.serial_number ? ` — ${a.serial_number}` : ''}
                </option>
              ))}
            </select>
            {availableAssets.length === 0 && (
              <p className="text-xs text-amber-DEFAULT mt-1">Todos los bienes están asignados actualmente.</p>
            )}
          </div>
          <div>
            <label className="label">Empleado *</label>
            <select className="input" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} required>
              <option value="">Seleccionar empleado</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fecha de entrega</label>
            <input type="date" className="input" value={form.assigned_at}
              onChange={e => setForm(f => ({ ...f, assigned_at: e.target.value }))} />
          </div>
          <div>
            <label className="label">Notas</label>
            <textarea className="input resize-none" rows={2} placeholder="Observaciones…"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {formError && (
            <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando…' : 'Asignar bien'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return confirm */}
      <ConfirmDialog
        open={!!returnId}
        onConfirm={handleReturn}
        onCancel={() => setReturnId(null)}
        loading={returning}
        title="Registrar devolución"
        message="Se registrará hoy como fecha de devolución. ¿Confirmas?"
      />
    </div>
  )
}