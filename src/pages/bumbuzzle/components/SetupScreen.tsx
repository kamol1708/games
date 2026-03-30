import { useMemo, useState } from 'react'
import type { BoxCount, Difficulty, SetupConfig } from '../types/game'

type Props = {
  onStart: (config: SetupConfig) => void
}

export function SetupScreen({ onStart }: Props) {
  const [teamCount, setTeamCount] = useState(1)
  const [teamNames, setTeamNames] = useState<string[]>(['Player 1', '', '', '', '', ''])
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [boxCount, setBoxCount] = useState<BoxCount>(16)

  const canStart = useMemo(
    () => teamNames.slice(0, teamCount).every((n) => n.trim().length >= 2),
    [teamCount, teamNames],
  )

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-[3px]">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/92 via-[#eef5ff]/90 to-[#fff7df]/88 p-5 shadow-[0_26px_80px_rgba(2,8,23,.2)] sm:p-6">
        <div className="pointer-events-none absolute -left-12 top-0 h-36 w-36 rounded-full bg-fuchsia-400/18 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-amber-300/25 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/80">Bumbuzzle</p>
          <h1 className="mt-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-600 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            O‘yinni Boshlash
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Jamoalar sonini va savol qutilari sonini tanlang. Keyin jamoa nomlarini kiriting va darhol o‘ynang.
          </p>
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_10px_24px_rgba(30,41,59,.06)]">
            <div className="space-y-4">
              <label className="space-y-2 text-sm text-slate-700">
                <span className="block text-xs uppercase tracking-[0.16em] text-slate-500">Nechta jamoa o‘ynaydi?</span>
                <select
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} ta jamoa
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">Nechta savol box bo‘ladi?</p>
                <div className="grid grid-cols-3 gap-2">
                  {([12, 16, 24] as BoxCount[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBoxCount(v)}
                      className={[
                        'h-11 rounded-xl border text-sm font-semibold transition',
                        boxCount === v
                          ? 'border-indigo-300 bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-[0_8px_16px_rgba(59,130,246,.22)]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <label className="space-y-2 text-sm text-slate-700">
                <span className="block text-xs uppercase tracking-[0.16em] text-slate-500">Difficulty (ixtiyoriy)</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="beginner">Beginner (5–7)</option>
                  <option value="intermediate">Intermediate (8–11)</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/80 bg-gradient-to-br from-[#fff7de]/80 to-[#edf5ff]/80 p-4 shadow-[0_10px_24px_rgba(30,41,59,.06)]">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">Jamoa nomlari</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: teamCount }, (_, idx) => (
                <label key={idx} className="space-y-1.5 text-sm">
                  <span className="text-slate-600">Team {idx + 1}</span>
                  <input
                    value={teamNames[idx] ?? ''}
                    onChange={(e) => {
                      const next = [...teamNames]
                      next[idx] = e.target.value
                      setTeamNames(next)
                    }}
                    placeholder={`Team ${idx + 1} name`}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/80 bg-white/75 p-3 text-xs leading-5 text-slate-600">
              Board: <span className="font-semibold text-slate-800">{boxCount} ta box</span> · To‘g‘ri javob: +10/+15 · Bomb: -15 ·
              Double box keyingi savolga x2 beradi.
            </div>

            <button
              type="button"
              disabled={!canStart}
              onClick={() => onStart({ teamCount, teamNames, difficulty, boxCount, roundCount: boxCount })}
              className="mt-4 h-12 w-full rounded-xl border border-fuchsia-300/30 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(236,72,153,.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Bumbuzzle
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
