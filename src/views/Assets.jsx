import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react'
import {
  getAssets, createAsset, updateAsset, deleteAsset,
  getCategories, getLocations, getStatuses,
} from '../lib/queries'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/Confirmdialog'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'

const EMPTY = { name: '', serial_number: '', category_id: '', status_id: '', location_id: '', notes: '' }

export default function Assets() {
  const [assets,     setAssets]     = useState([])
  const [cats,       setCats]       = useState([])
  const [locs,       setLocs]       = useState([])
  const [statuses,   setStatuses]   = useState([])
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
    const [{ data: a }, { data: c }, { data: l }, { data: s }] = await Promise.all([
      getAssets(), getCategories(), getLocations(), getStatuses(),
    ])
    setAssets(a ?? [])
    setCats(c ?? [])
    setLocs(l ?? [])
    setStatuses(s ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditTarget(null); setFormError(''); setModalOpen(true) }
  const openEdit   = (a) => {
    setForm({
      name: a.name, serial_number: a.serial_number ?? '',
      category_id: a.category_id ?? '', status_id: a.status_id ?? '',
      location_id: a.location_id ?? '', notes: a.notes ?? '',
    })
    setEditTarget(a)
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('El nombre es obligatorio.'); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      serial_number: form.serial_number || null,
      category_id:   form.category_id   || null,
      status_id:     form.status_id     || null,
      location_id:   form.location_id   || null,
      notes:         form.notes         || null,
    }
    const { error } = editTarget
      ? await updateAsset(editTarget.id, payload)
      : await createAsset(payload)

    if (error) { setFormError(error.message); setSaving(false); return }
    await load()
    setModalOpen(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteAsset(deleteId)
    await load()
    setDeleteId(null)
    setDeleting(false)
  }

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.serial_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.category?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">Bienes materiales</h2>
          <p className="text-slate-500 text-sm mt-1">{assets.length} activos registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Nuevo bien
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9 max-w-sm"
          placeholder="Buscar por nombre, serie, categoría…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Nombre', 'Serie / Código', 'Categoría', 'Estado', 'Ubicación', ''].map(h => (
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
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  No se encontraron bienes
                </td>
              </tr>
            )}
            {filtered.map((a, i) => (
              <motion.tr
                key={a.id}
                className="table-row-hover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <td className="px-5 py-3 text-slate-200 font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-bg-hover rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package size={13} className="text-slate-400" />
                    </div>
                    {a.name}
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-slate-400 text-xs">{a.serial_number ?? '—'}</td>
                <td className="px-5 py-3 text-slate-400">{a.category?.name ?? '—'}</td>
                <td className="px-5 py-3"><Badge text={a.status?.name} /></td>
                <td className="px-5 py-3 text-slate-400">{a.location?.name ?? '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(a)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-DEFAULT hover:bg-amber-muted transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(a.id)}
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

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
             title={editTarget ? 'Editar bien' : 'Registrar nuevo bien'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre *</label>
              <input className="input" placeholder="Laptop Dell XPS 15"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Número de serie / código</label>
              <input className="input font-mono" placeholder="SN-00123"
                value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
            </div>
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">Sin categoría</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.status_id} onChange={e => setForm(f => ({ ...f, status_id: e.target.value }))}>
                <option value="">Sin estado</option>
                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ubicación</label>
              <select className="input" value={form.location_id} onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}>
                <option value="">Sin ubicación</option>
                {locs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notas</label>
              <textarea className="input resize-none" rows={3} placeholder="Observaciones del bien…"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
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
              {saving ? 'Guardando…' : editTarget ? 'Guardar cambios' : 'Registrar bien'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title="Eliminar bien"
        message="Esta acción es irreversible. Se eliminarán también sus asignaciones y registros de mantenimiento."
      />
    </div>
  )
}
