import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, Wrench } from 'lucide-react'
import {
  getMaintenanceLogs, createMaintenanceLog,
  updateMaintenanceLog, deleteMaintenanceLog,
  getAssets,
} from '../lib/queries'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/Confirmdialog'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'

const EMPTY = { asset_id: '', maintenance_type: 'Preventivo', description: '', performed_at: new Date().toISOString().split('T')[0], notes: '' }

export default function Maintenance() {
  const [logs,       setLogs]      = useState([])
  const [assets,     setAssets]    = useState([])
  const [loading,    setLoading]   = useState(true)
  const [search,     setSearch]    = useState('')
  const [modalOpen,  setModal]     = useState(false)
  const [editTarget, setEdit]      = useState(null)
  const [form,       setForm]      = useState(EMPTY)
  const [saving,     setSaving]    = useState(false)
  const [deleteId,   setDeleteId]  = useState(null)
  const [deleting,   setDeleting]  = useState(false)
  const [formError,  setFormError] = useState('')

  const load = async () => {
    const [{ data: l }, { data: a }] = await Promise.all([getMaintenanceLogs(), getAssets()])
    setLogs(l ?? [])
    setAssets(a ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEdit(null); setFormError(''); setModal(true) }
  const openEdit   = (l) => {
    setForm({
      asset_id:         l.asset_id,
      maintenance_type: l.maintenance_type,
      description:      l.description ?? '',
      performed_at:     l.performed_at,
      notes:            l.notes ?? '',
    })
    setEdit(l); setFormError(''); setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.asset_id) { setFormError('Selecciona un bien.'); return }
    setSaving(true)
    const payload = {
      asset_id:         form.asset_id,
      maintenance_type: form.maintenance_type,
      description:      form.description || null,
      performed_at:     form.performed_at,
      notes:            form.notes || null,
    }
    const { error } = editTarget
      ? await updateMaintenanceLog(editTarget.id, payload)
      : await createMaintenanceLog(payload)
    if (error) { setFormError(error.message); setSaving(false); return }
    await load()
    setModal(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteMaintenanceLog(deleteId)
    await load()
    setDeleteId(null)
    setDeleting(false)
  }

  const filtered = logs.filter(l =>
    (l.asset?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l.maintenance_type).toLowerCase().includes(search.toLowerCase()) ||
    (l.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">Mantenimiento</h2>
          <p className="text-slate-500 text-sm mt-1">{logs.length} registros</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Registrar mantenimiento
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9 max-w-sm" placeholder="Buscar por bien o tipo…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Bien', 'Tipo', 'Descripción', 'Fecha', 'Notas', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Sin registros de mantenimiento</td>
              </tr>
            )}
            {filtered.map((log, i) => (
              <motion.tr key={log.id} className="table-row-hover"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <Wrench size={11} className="text-amber-DEFAULT" />
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">{log.asset?.name ?? '—'}</p>
                      <p className="text-xs text-slate-500 font-mono">{log.asset?.serial_number ?? ''}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><Badge text={log.maintenance_type} /></td>
                <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{log.description ?? '—'}</td>
                <td className="px-5 py-3 font-mono text-slate-400 text-xs">{log.performed_at}</td>
                <td className="px-5 py-3 text-slate-500 text-xs max-w-[160px] truncate">{log.notes ?? '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(log)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-DEFAULT hover:bg-amber-muted transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(log.id)}
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

      <Modal open={modalOpen} onClose={() => setModal(false)}
             title={editTarget ? 'Editar mantenimiento' : 'Registrar mantenimiento'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Bien *</label>
            <select className="input" value={form.asset_id} onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))} required>
              <option value="">Seleccionar bien</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tipo de mantenimiento</label>
            <div className="flex gap-3">
              {['Preventivo', 'Correctivo'].map(t => (
                <label key={t} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer
                                           text-sm transition-all ${
                  form.maintenance_type === t
                    ? 'border-amber-DEFAULT/50 bg-amber-muted text-amber-text'
                    : 'border-border-default text-slate-400 hover:border-border-strong'
                }`}>
                  <input type="radio" className="hidden" value={t} checked={form.maintenance_type === t}
                    onChange={() => setForm(f => ({ ...f, maintenance_type: t }))} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={2} placeholder="Describe el trabajo realizado…"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Fecha de realización</label>
            <input type="date" className="input" value={form.performed_at}
              onChange={e => setForm(f => ({ ...f, performed_at: e.target.value }))} />
          </div>
          <div>
            <label className="label">Notas adicionales</label>
            <textarea className="input resize-none" rows={2} placeholder="Observaciones…"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {formError && (
            <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando…' : editTarget ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title="Eliminar registro"
        message="¿Estás seguro de que deseas eliminar este registro de mantenimiento?"
      />
    </div>
  )
}
