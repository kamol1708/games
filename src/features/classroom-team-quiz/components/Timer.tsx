type Props = {
  secondsLeft: number
}

export default function Timer({ secondsLeft }: Props) {
  const danger = secondsLeft <= 5
  return (
    <div
      className={`rounded-full border px-3 py-1 text-sm font-semibold ${
        danger ? 'border-rose-300/40 bg-rose-500/20 text-rose-100' : 'border-white/20 bg-black/40 text-white/85'
      }`}
    >
      {secondsLeft}s
    </div>
  )
}
