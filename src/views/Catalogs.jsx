import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Tag, Activity, Building2,
  Plus, Pencil, Trash2, Loader2,
} from 'lucide-react'
import {
  getCategories,   createCategory,   updateCategory,   deleteCategory,
  getLocations,    createLocation,   updateLocation,   deleteLocation,
  getStatuses,     createStatus,     updateStatus,     deleteStatus,
  getDepartments,  createDepartment, updateDepartment, deleteDepartment,
} from '../lib/queries'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

// ── Per-catalog configuration ────────────────────────────────
const CATALOGS = [
  {
    key:        'categories',
    label:      'Categorías',
    icon:       Tag,
    color:      'text-blue-400',
    colorBg:    'bg-blue-500/15',
    get:        getCategories,
    create:     createCategory,
    update:     updateCategory,
    del:        deleteCategory,
    description:'Tipos de bienes: computadoras, herramientas, mobiliario…',
  },
  {
    key:        'locations',
    label:      'Ubicaciones',
    icon:       MapPin,
    color:      'text-emerald-400',
    colorBg:    'bg-emerald-500/15',
    get:        getLocations,
    create:     createLocation,
    update:     updateLocation,
    del:        deleteLocation,
    description:'Lugares físicos donde se resguardan los activos.',
  },
  {
    key:        'statuses',
    label:      'Estados',
    icon:       Activity,
    color:      'text-amber-400',
    colorBg:    'bg-amber-500/15',
    get:        getStatuses,
    create:     createStatus,
    update:     updateStatus,
    del:        deleteStatus,
    description:'Estado de un bien: Nuevo, En uso, En mantenimiento, Dañado…',
  },
  {
    key:        'departments',
    label:      'Departamentos',
    icon:       Building2,
    color:      'text-violet-400',
    colorBg:    'bg-violet-500/15',
    get:        getDepartments,
    create:     createDepartment,
    update:     updateDepartment,
    del:        deleteDepartment,
    description:'Áreas o divisiones de la empresa.',
  },
]

// ── Inline edit row ──────────────────────────────────────────
function EditRow({ item, onSave, onCancel }) {
  const [name, setName]   = useState(item?.name ?? '')
  const [desc, setDesc]   = useState(item?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr]     = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setErr('El nombre es obligatorio.'); return }
    setSaving(true)
    const { error } = await onSave({ name: name.trim(), description: desc || null }, item?.id)
    if (error) { setErr(error.message); setSaving(false); return }
    onCancel()
  }

  return (
    <motion.tr
      className="bg-bg-hover"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <td className="px-5 py-2.5" colSpan={3}>
        <form onSubmit={submit} className="flex items-center gap-3">
          <input
            autoFocus
            className="input flex-1 py-1.5 text-sm"
            placeholder="Nombre *"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="input flex-[2] py-1.5 text-sm"
            placeholder="Descripción (opcional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          {err && <span className="text-rose-400 text-xs whitespace-nowrap">{err}</span>}
          <div className="flex gap-2 flex-shrink-0">
            <button type="submit" disabled={saving} className="btn-primary py-1.5 text-xs">
              {saving ? <Loader2 size={13} className="animate-spin" /> : (item ? 'Guardar' : 'Agregar')}
            </button>
            <button type="button" onClick={onCancel} className="btn-ghost py-1.5 text-xs">
              Cancelar
            </button>
          </div>
        </form>
      </td>
    </motion.tr>
  )
}

// ── Single catalog table ─────────────────────────────────────
function CatalogTable({ config }) {
  const { key, label, icon: Icon, color, colorBg, get, create, update, del, description } = config

  const [items,      setItems]   = useState([])
  const [loading,    setLoading] = useState(true)
  const [creating,   setCreating] = useState(false)
  const [editId,     setEditId]  = useState(null)
  const [deleteId,   setDeleteId]= useState(null)
  const [deleting,   setDeleting]= useState(false)

  const load = () => get().then(({ data }) => { setItems(data ?? []); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleSave = async (payload, id) => {
    const { error } = id ? await update(id, payload) : await create(payload)
    if (!error) { await load(); return { error: null } }
    return { error }
  }

  const handleDelete = async () => {
    setDeleting(true)
    await del(deleteId)
    await load()
    setDeleteId(null)
    setDeleting(false)
  }

  return (
    <motion.div
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Card header */}
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorBg}`}>
            <Icon size={15} className={color} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-200">{label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={() => { setCreating(true); setEditId(null) }}
          className="btn-primary py-1.5 text-xs"
          disabled={creating}
        >
          <Plus size={13} /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="px-5 py-8 flex justify-center">
          <div className="w-5 h-5 border-2 border-t-amber-DEFAULT border-border-default rounded-full animate-spin" />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-5 py-2.5 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider w-1/3">
                Nombre
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-5 py-2.5 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {/* Create row */}
            <AnimatePresence>
              {creating && (
                <EditRow
                  key="new-row"
                  item={null}
                  onSave={handleSave}
                  onCancel={() => setCreating(false)}
                />
              )}
            </AnimatePresence>

            {items.length === 0 && !creating && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-600 text-sm italic">
                  Sin registros — haz clic en "Nuevo" para agregar.
                </td>
              </tr>
            )}

            {items.map((item) => (
              <AnimatePresence key={item.id} mode="wait">
                {editId === item.id ? (
                  <EditRow
                    key={`edit-${item.id}`}
                    item={item}
                    onSave={handleSave}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <motion.tr
                    key={`row-${item.id}`}
                    className="table-row-hover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-5 py-3 text-slate-200 font-medium">{item.name}</td>
                    <td className="px-5 py-3 text-slate-500 text-sm">{item.description ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditId(item.id); setCreating(false) }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-DEFAULT
                                     hover:bg-amber-muted transition-colors"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400
                                     hover:bg-rose-500/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title={`Eliminar de ${label}`}
        message="Si este valor está en uso por algún bien o empleado, quedará desvinculado (null). ¿Continuar?"
      />
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function Catalogs() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-100">Catálogos</h2>
        <p className="text-slate-500 text-sm mt-1">
          Administra los valores de referencia del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {CATALOGS.map(c => <CatalogTable key={c.key} config={c} />)}
      </div>
    </div>
  )
}