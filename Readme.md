# GestorActivos — Sistema de Bienes Materiales

Plataforma web para el control, asignación y seguimiento de activos físicos de una empresa.

## Stack
- **React 18** + **Vite**
- **Supabase** (Auth JWT + PostgreSQL + RLS)
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Framer Motion** para animaciones
- **Recharts** para gráficas

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 3. Correr en desarrollo
npm run dev
```

## Variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Encuéntralas en tu proyecto Supabase: **Settings → API**.

---

## Base de datos

Ejecuta el SQL de `Definición_Base_de_Datos.txt` en el editor SQL de Supabase en el siguiente orden:

1. Extensiones y tablas de catálogo
2. Tablas principales (employees, assets, assignments, maintenance_logs)
3. RLS y políticas
4. Tabla `user_roles`
5. Trigger `on_auth_user_employee`
6. Columna `requires_password_change`

---

## Roles y permisos

| Rol       | Acceso |
|-----------|--------|
| `admin`   | CRUD completo: bienes, empleados, asignaciones, mantenimiento, reportes |
| `user`    | Solo lectura de su propio equipo y perfil |

### Crear el primer administrador

1. Registra un usuario desde Supabase Auth (Dashboard → Authentication → Users → "Invite user")
2. Inserta manualmente su rol:

```sql
insert into public.user_roles (user_id, role, requires_password_change)
values ('<uuid-del-usuario>', 'admin', false);
```

### Crear empleados con acceso al sistema

El trigger `on_auth_user_employee` crea el registro de empleado automáticamente si el usuario
se registra con los metadatos `create_employee: true`.

Para invitar a un empleado como administrador desde Supabase Dashboard:
1. Crea el usuario en **Authentication → Users → Invite**
2. Agrega los metadatos en "User Metadata":
   ```json
   {
     "create_employee": true,
     "full_name": "Juan Pérez",
     "position": "Técnico",
     "role": "user",
     "requires_password_change": true
   }
   ```
3. El trigger se encargará del resto al primer login.

> **Nota**: Para automatizar la creación de cuentas desde el frontend se requiere una
> **Supabase Edge Function** con la clave `service_role`. Nunca expongas esa clave en el cliente.

---

## Estructura del proyecto

```
src/
  lib/
    supabase.js        – Cliente de Supabase
    queries.js         – Funciones de consulta a la BD
  contexts/
    AuthContext.jsx    – Estado de sesión y rol
  components/
    Layout.jsx         – Shell principal
    Sidebar.jsx        – Navegación lateral
    Modal.jsx          – Modal reutilizable
    ConfirmDialog.jsx  – Diálogo de confirmación
    Badge.jsx          – Badges de estado
    LoadingSpinner.jsx – Estado de carga
  views/
    Login.jsx          – Pantalla de acceso
    ChangePassword.jsx – Cambio forzado de contraseña
    Dashboard.jsx      – Panel de control (admin)
    Assets.jsx         – Gestión de bienes (admin)
    Employees.jsx      – Gestión de empleados (admin)
    Assignments.jsx    – Asignaciones (admin)
    Maintenance.jsx    – Mantenimiento (admin)
    Reports.jsx        – Reportes y gráficas (admin)
    MyEquipment.jsx    – Mi equipo (empleado)
    Profile.jsx        – Mi perfil (empleado)
```

---

## Sugerencias de mejora a la BD

La estructura actual es sólida. Algunas mejoras opcionales:

- **Adjuntos / fotos**: Agregar `photo_url text` en `assets` usando Supabase Storage.
- **Auditoría**: Crear tabla `audit_logs` con triggers que registren cada cambio.
- **Número de inventario**: Campo `inventory_number` en `assets` para numeración interna.
- **Vida útil**: Campos `purchase_date` y `warranty_until` en `assets`.
- **Departamentos en ubicaciones**: Si las ubicaciones tienen estructura jerárquica.
- **Notificaciones**: Tabla `notifications` para alertar vencimientos de mantenimiento.