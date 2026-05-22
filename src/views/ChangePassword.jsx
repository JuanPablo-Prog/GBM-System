import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ChangePassword() {
  const { completePasswordChange } = useAuth()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8)  { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== confirm)  { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    setError('')
    const { error } = await completePasswordChange(password)
    if (error) setError('Error al actualizar la contraseña. Intenta de nuevo.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-amber-muted border border-amber-DEFAULT/30 rounded-xl
                            flex items-center justify-center mb-4">
              <KeyRound size={20} className="text-amber-DEFAULT" />
            </div>
            <h1 className="font-display font-bold text-xl text-slate-100">Cambia tu contraseña</h1>
            <p className="text-slate-500 text-sm mt-1 text-center">
              Por seguridad, establece una contraseña nueva antes de continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirmar contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Guardando…</>
                : <><ShieldCheck size={15} /> Establecer contraseña</>
              }
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}