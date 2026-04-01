type Props = {
  items: Array<{ id: number; text: string }>
}

export default function EventLog({ items }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md shadow-glow">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Event Log</p>
        <p className="text-xs text-white/45">Last 5</p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-white/85">
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}
