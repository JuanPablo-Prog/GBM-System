import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Pencil, Trash2, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/Confirmdialog'
import LoadingSpinner from '../components/LoadingSpinner'

export default function UserRoles() {
  const [items, setItems] = useState([])        // { user_id, email, full_name, role }
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [selectedRole, setSelectedRole] = useState('user')
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadRoles = async () => {
    // Obtener todos los user_roles con el email y nombre del usuario
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')

    if (rolesError) throw rolesError

    // Obtener todos los usuarios de auth
    const { data: users, error: usersError } = await supabase
      .from('users_view')
      .select('id, email, full_name')

    if (usersError) throw usersError

    // Combinar: solo usuarios que tienen rol
    const combined = users
      .map(user => ({
        user_id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: roles.find(r => r.user_id === user.id)?.role || null
      }))
      .filter(item => item.role !== null)   // solo los que tienen rol asignado

    setItems(combined)
    setLoading(false)
  }

  const loadAvailableUsers = async () => {
    // Usuarios de auth que NO tienen rol en user_roles
    const { data: roles } = await supabase.from('user_roles').select('user_id')
    const roleUserIds = roles?.map(r => r.user_id) || []
    const { data: users } = await supabase
      .from('users_view')
      .select('id, email, full_name')
    const available = users?.filter(u => !roleUserIds.includes(u.id)) || []
    setAvailableUsers(available)
  }

  useEffect(() => { loadRoles() }, [])

  const openCreate = async () => {
    await loadAvailableUsers()
    setSelectedUserId('')
    setSelectedRole('user')
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditTarget(item)
    setSelectedRole(item.role)
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    if (editTarget) {
      // Actualizar rol
      const { error } = await supabase
        .from('user_roles')
        .update({ role: selectedRole })
        .eq('user_id', editTarget.user_id)

      if (error) {
        setFormError(error.message)
        setSaving(false)
        return
      }
    } else {
      // Crear nuevo rol
      if (!selectedUserId) {
        setFormError('Debes seleccionar un usuario')
        setSaving(false)
        return
      }
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUserId, role: selectedRole, requires_password_change: true })

      if (error) {
        setFormError(error.message)
        setSaving(false)
        return
      }
    }

    await loadRoles()
    setModalOpen(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', deleteId)

    if (!error) await loadRoles()
    setDeleteId(null)
    setDeleting(false)
  }

  const filtered = items.filter(item =>
    item.email.toLowerCase().includes(search.toLowerCase()) ||
    (item.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">Roles de Usuario</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona qué usuarios pueden acceder al sistema y con qué permisos</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Asignar rol
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9 max-w-sm"
          placeholder="Buscar por email o nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-5 py-3 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 text-left text-xs font-display font-medium text-slate-500 uppercase tracking-wider">Rol</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                  No hay roles asignados
                </td>
              </tr>
            )}
            {filtered.map((item, i) => (
              <motion.tr key={item.user_id} className="table-row-hover"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <td className="px-5 py-3 font-mono text-slate-300">{item.email}</td>
                <td className="px-5 py-3 text-slate-400">{item.full_name || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${item.role === 'admin' ? 'bg-violet-500/15 text-violet-400' : 'bg-slate-500/15 text-slate-400'}`}>
                    {item.role === 'admin' ? 'Administrador' : 'Empleado'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-DEFAULT hover:bg-amber-muted">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(item.user_id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar rol */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar rol' : 'Asignar rol a usuario'}>
        <form onSubmit={handleSave} className="space-y-4">
          {!editTarget && (
            <div>
              <label className="label">Usuario</label>
              <select
                className="input"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">-- Selecciona un usuario --</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.email} {u.full_name ? `(${u.full_name})` : ''}</option>
                ))}
              </select>
              {availableUsers.length === 0 && (
                <p className="text-xs text-amber-400 mt-1">Todos los usuarios ya tienen un rol asignado.</p>
              )}
            </div>
          )}
          {editTarget && (
            <div>
              <label className="label">Usuario</label>
              <p className="text-slate-300 text-sm">{editTarget.email} {editTarget.full_name ? `(${editTarget.full_name})` : ''}</p>
            </div>
          )}
          <div>
            <label className="label">Rol</label>
            <select className="input" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
              <option value="user">Empleado (user)</option>
              <option value="admin">Administrador (admin)</option>
            </select>
          </div>
          {formError && <p className="text-rose-400 text-xs bg-rose-500/10 p-2 rounded">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando…' : editTarget ? 'Actualizar rol' : 'Asignar rol'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title="Eliminar rol"
        message="Este usuario perderá el acceso al sistema (ya no podrá iniciar sesión). ¿Continuar?"
      />
    </div>
  )
}
