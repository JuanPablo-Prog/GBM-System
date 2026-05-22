import { supabase } from './supabase'

// ─── Catálogos ────────────────────────────────────────────────
export const getCategories  = () => supabase.from('categories').select('*').order('name')
export const getLocations   = () => supabase.from('locations').select('*').order('name')
export const getStatuses    = () => supabase.from('asset_statuses').select('*').order('name')
export const getDepartments = () => supabase.from('departments').select('*').order('name')

export const createCategory   = (d) => supabase.from('categories').insert(d).select().single()
export const createLocation   = (d) => supabase.from('locations').insert(d).select().single()
export const createDepartment = (d) => supabase.from('departments').insert(d).select().single()
export const createStatus     = (d) => supabase.from('asset_statuses').insert(d).select().single()  // <-- FALTABA

// Actualizar y eliminar catálogos (necesarios para Catalogs.jsx)
export const updateCategory = (id, data) =>
  supabase.from('categories').update(data).eq('id', id).select().single()
export const deleteCategory = (id) =>
  supabase.from('categories').delete().eq('id', id)

export const updateLocation = (id, data) =>
  supabase.from('locations').update(data).eq('id', id).select().single()
export const deleteLocation = (id) =>
  supabase.from('locations').delete().eq('id', id)

export const updateStatus = (id, data) =>
  supabase.from('asset_statuses').update(data).eq('id', id).select().single()
export const deleteStatus = (id) =>
  supabase.from('asset_statuses').delete().eq('id', id)

export const updateDepartment = (id, data) =>
  supabase.from('departments').update(data).eq('id', id).select().single()
export const deleteDepartment = (id) =>
  supabase.from('departments').delete().eq('id', id)

// ─── Activos ──────────────────────────────────────────────────
export const getAssets = () =>
  supabase
    .from('assets')
    .select(`
      *,
      category:categories(id, name),
      status:asset_statuses(id, name),
      location:locations(id, name)
    `)
    .order('created_at', { ascending: false })

export const getAssetById = (id) =>
  supabase
    .from('assets')
    .select(`*, category:categories(id,name), status:asset_statuses(id,name), location:locations(id,name)`)
    .eq('id', id)
    .single()

export const createAsset = (data) =>
  supabase.from('assets').insert(data).select().single()

export const updateAsset = (id, data) =>
  supabase.from('assets').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()

export const deleteAsset = (id) =>
  supabase.from('assets').delete().eq('id', id)

// ─── Empleados ────────────────────────────────────────────────
export const getEmployees = () =>
  supabase
    .from('employees')
    .select(`*, department:departments(id, name)`)
    .order('full_name')

export const getEmployeeByUserId = (userId) =>
  supabase.from('employees').select(`*, department:departments(id,name)`).eq('user_id', userId).single()

// Función original para crear solo empleado (sin usuario de auth)
export const createEmployeeOnly = (data) =>
  supabase.from('employees').insert(data).select().single()

// Nueva función que crea empleado + usuario de auth (usando signUp)
export const createEmployee = async (data) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password || 'empleado-2026',
    options: {
      data: {
        create_employee: true,
        full_name: data.full_name,
        department_id: data.department_id || null,
        position: data.position,
        role: data.role || 'user',
        requires_password_change: true
      }
    }
  });

  if (error) throw error;
  return { data: authData, error: null };
}

export const updateEmployee = (id, data) =>
  supabase.from('employees').update(data).eq('id', id).select().single()

export const deleteEmployee = (id) =>
  supabase.from('employees').delete().eq('id', id)

// Funciones para roles (necesarias para manejo de roles)
export const updateEmployeeRole = (userId, role) =>
  supabase
    .from('user_roles')
    .update({ role })
    .eq('user_id', userId)
    .select()
    .single()

export const deleteUserRole = (userId) =>
  supabase.from('user_roles').delete().eq('user_id', userId)

// ─── Asignaciones ─────────────────────────────────────────────
export const getActiveAssignments = () =>
  supabase
    .from('assignments')
    .select(`
      *,
      asset:assets(id, name, serial_number, category:categories(name)),
      employee:employees(id, full_name, position, department:departments(name))
    `)
    .is('returned_at', null)
    .order('assigned_at', { ascending: false })

export const getAllAssignments = () =>
  supabase
    .from('assignments')
    .select(`
      *,
      asset:assets(id, name, serial_number, category:categories(name)),
      employee:employees(id, full_name, department:departments(name))
    `)
    .order('assigned_at', { ascending: false })

export const getAssignmentsByEmployee = (employeeId) =>
  supabase
    .from('assignments')
    .select(`*, asset:assets(id, name, serial_number, category:categories(name), status:asset_statuses(name), location:locations(name))`)
    .eq('employee_id', employeeId)
    .order('assigned_at', { ascending: false })

export const createAssignment = (data) =>
  supabase.from('assignments').insert(data).select().single()

export const returnAssignment = (id) =>
  supabase
    .from('assignments')
    .update({ returned_at: new Date().toISOString().split('T')[0] })
    .eq('id', id)
    .select()
    .single()

// ─── Mantenimiento ────────────────────────────────────────────
export const getMaintenanceLogs = () =>
  supabase
    .from('maintenance_logs')
    .select(`*, asset:assets(id, name, serial_number)`)
    .order('performed_at', { ascending: false })

export const getMaintenanceByAsset = (assetId) =>
  supabase
    .from('maintenance_logs')
    .select(`*`)
    .eq('asset_id', assetId)
    .order('performed_at', { ascending: false })

export const createMaintenanceLog = (data) =>
  supabase.from('maintenance_logs').insert(data).select().single()

export const updateMaintenanceLog = (id, data) =>
  supabase.from('maintenance_logs').update(data).eq('id', id).select().single()

export const deleteMaintenanceLog = (id) =>
  supabase.from('maintenance_logs').delete().eq('id', id)

// ─── Dashboard stats ──────────────────────────────────────────
export const getDashboardStats = async () => {
  const [assets, active, maintenance, employees] = await Promise.all([
    supabase.from('assets').select('id', { count: 'exact', head: true }),
    supabase.from('assignments').select('id', { count: 'exact', head: true }).is('returned_at', null),
    supabase.from('assets').select('id', { count: 'exact', head: true })
      .eq('status_id', (await supabase.from('asset_statuses').select('id').eq('name', 'En mantenimiento').single()).data?.id),
    supabase.from('employees').select('id', { count: 'exact', head: true }),
  ])
  return {
    total:       assets.count    ?? 0,
    assigned:    active.count    ?? 0,
    maintenance: maintenance.count ?? 0,
    employees:   employees.count ?? 0,
  }
}

export const getRecentAssignments = () =>
  supabase
    .from('assignments')
    .select(`assigned_at, notes, asset:assets(name), employee:employees(full_name)`)
    .is('returned_at', null)
    .order('assigned_at', { ascending: false })
    .limit(8)

export const getAssetsByStatus = async () => {
  const { data } = await supabase
    .from('assets')
    .select('status:asset_statuses(name)')
  const counts = {}
  data?.forEach(a => {
    const name = a.status?.name ?? 'Sin estado'
    counts[name] = (counts[name] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export const getAssetsByCategory = async () => {
  const { data } = await supabase
    .from('assets')
    .select('category:categories(name)')
  const counts = {}
  data?.forEach(a => {
    const name = a.category?.name ?? 'Sin categoría'
    counts[name] = (counts[name] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}