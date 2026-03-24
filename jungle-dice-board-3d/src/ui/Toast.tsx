type Props = {
  toast: { text: string; tone: 'info' | 'trap' | 'ladder' | 'win' } | null
}

const toneClasses: Record<NonNullable<Props['toast']>['tone'], string> = {
  info: 'from-sky-500/80 to-cyan-400/70 border-sky-200/20',
  trap: 'from-rose-600/85 to-orange-500/70 border-rose-200/20',
  ladder: 'from-sky-500/85 to-emerald-400/70 border-cyan-200/20',
  win: 'from-amber-500/90 to-emerald-400/80 border-yellow-100/30',
}

export default function Toast({ toast }: Props) {
  if (!toast) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 top-28 z-20 flex justify-center px-4">
      <div className={`animate-floaty rounded-2xl border bg-gradient-to-r px-5 py-3 text-center text-sm font-semibold text-white shadow-2xl backdrop-blur-md ${toneClasses[toast.tone]}`}>
        {toast.text}
      </div>
    </div>
  )
}
