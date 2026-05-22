import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onConfirm, onCancel, title, message, loading }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            className="relative w-full max-w-sm bg-bg-card border border-border-default rounded-2xl shadow-modal p-6"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-500/10 rounded-lg flex-shrink-0">
                <AlertTriangle size={20} className="text-rose-400" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-100 text-sm">{title}</h3>
                <p className="text-slate-400 text-sm mt-1">{message}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={onCancel} className="btn-ghost" disabled={loading}>
                Cancelar
              </button>
              <button onClick={onConfirm} className="btn-danger" disabled={loading}>
                {loading ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}