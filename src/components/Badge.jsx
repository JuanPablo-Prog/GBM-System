const statusColors = {
  'Nuevo':            'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'En uso':           'bg-blue-500/15   text-blue-400   border-blue-500/20',
  'En mantenimiento': 'bg-amber-500/15  text-amber-400  border-amber-500/20',
  'Dañado':           'bg-rose-500/15   text-rose-400   border-rose-500/20',
  'Preventivo':       'bg-sky-500/15    text-sky-400    border-sky-500/20',
  'Correctivo':       'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'admin':            'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'user':             'bg-slate-500/15  text-slate-400  border-slate-500/20',
}

const defaultColor = 'bg-slate-500/15 text-slate-400 border-slate-500/20'

export default function Badge({ text }) {
  if (!text) return null
  const cls = statusColors[text] ?? defaultColor
  return (
    <span className={`badge border ${cls}`}>
      {text}
    </span>
  )
}