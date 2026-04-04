import { useMemo, useState } from 'react'
import { useGameFeedback } from '../lib/useGameFeedback'

function formatStamp(value: number) {
  return new Date(value).toLocaleString('uz-UZ', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TeacherFeedbackInbox() {
  const items = useGameFeedback()
  const [selectedGame, setSelectedGame] = useState('all')

  const games = useMemo(
    () =>
      Array.from(new Set(items.map((item) => `${item.gameKey}:::${item.gameTitle}`))).map((value) => {
        const [key, title] = value.split(':::')
        return { key, title }
      }),
    [items],
  )

  const filtered = useMemo(() => {
    const base = selectedGame === 'all' ? items : items.filter((item) => item.gameKey === selectedGame)
    return [...base].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1
      return (b.approvedAt ?? b.createdAt) - (a.approvedAt ?? a.createdAt)
    })
  }, [items, selectedGame])

  const approvedCount = items.length

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Feedback Inbox</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Foydalanuvchi commentlari</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/60">
            Filterdan o‘tgan commentlar shu yerda va o‘yin ichida darhol ko‘rinadi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
            Visible: {approvedCount}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedGame('all')}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${
            selectedGame === 'all'
              ? 'border-sky-300/30 bg-sky-400/10 text-sky-100'
              : 'border-white/10 bg-black/20 text-white/65'
          }`}
        >
          Barcha o‘yinlar
        </button>
        {games.map((game) => (
          <button
            key={game.key}
            type="button"
            onClick={() => setSelectedGame(game.key)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              selectedGame === game.key
                ? 'border-sky-300/30 bg-sky-400/10 text-sky-100'
                : 'border-white/10 bg-black/20 text-white/65'
            }`}
          >
            {game.title}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm text-white/50">
            Hozircha feedback yo‘q.
          </div>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.gameTitle}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {item.userName} · {formatStamp(item.createdAt)}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                  Public
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white/8 px-4 py-3 text-sm text-white/90">
                  {item.message}
                </div>

                <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-sky-400/12 px-4 py-3 text-sm text-sky-50">
                  <p className="mt-1 text-[11px] text-sky-100/55">
                    Ko‘rindi: {formatStamp(item.approvedAt ?? item.createdAt)}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
