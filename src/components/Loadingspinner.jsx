export default function LoadingSpinner({ text = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-border-default" />
        <div className="absolute inset-0 rounded-full border-2 border-t-amber-DEFAULT animate-spin" />
      </div>
      <p className="text-slate-500 text-sm font-mono">{text}</p>
    </div>
  )
}