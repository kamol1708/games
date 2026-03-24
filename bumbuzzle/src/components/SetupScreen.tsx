import { useMemo, useState } from 'react'
import type { Difficulty, RoundCount, SetupConfig } from '../types/game'

type Props = {
  onStart: (config: SetupConfig) => void
}

export function SetupScreen({ onStart }: Props) {
  const [teamCount, setTeamCount] = useState(2)
  const [teamNames, setTeamNames] = useState<string[]>(['Team A', 'Team B', '', '', '', ''])
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [roundCount, setRoundCount] = useState<RoundCount>(10)

  const canStart = useMemo(
    () => teamNames.slice(0, teamCount).every((n) => n.trim().length >= 2),
    [teamCount, teamNames],
  )

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="noise relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl sm:p-7">
        <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">Bumbuzzle</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Team English Mystery Game</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
              Jamoalar sirli qutilarni tanlaydi: ba&apos;zilarida English puzzle, ba&apos;zilarida bonus, ba&apos;zilarida bomba.
              To‘g‘ri javob bilan ball yig‘ing, bombalardan ehtiyot bo‘ling.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
            <p className="font-medium text-white">Projector Friendly</p>
            <p className="mt-1 text-xs">Responsive layout, katta kartalar, sticky scoreboard</p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-white/80">
                <span className="block text-xs uppercase tracking-[0.16em] text-white/45">Jamoa soni</span>
                <select
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-violet-300/40"
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} ta jamoa
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-white/80">
                <span className="block text-xs uppercase tracking-[0.16em] text-white/45">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-violet-300/40"
                >
                  <option value="beginner">Beginner (Grades 5–7)</option>
                  <option value="intermediate">Intermediate (Grades 8–11)</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-white/80 sm:col-span-2">
                <span className="block text-xs uppercase tracking-[0.16em] text-white/45">Round count</span>
                <div className="grid grid-cols-3 gap-2">
                  {([5, 10, 15] as RoundCount[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRoundCount(v)}
                      className={[
                        'h-11 rounded-xl border text-sm font-medium transition',
                        roundCount === v
                          ? 'border-violet-300/30 bg-violet-400/15 text-violet-100'
                          : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
                      ].join(' ')}
                    >
                      {v} round
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-white/45">Team names</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: teamCount }, (_, idx) => (
                  <label key={idx} className="space-y-2 text-sm">
                    <span className="text-white/65">Team {idx + 1}</span>
                    <input
                      value={teamNames[idx] ?? ''}
                      onChange={(e) => {
                        const next = [...teamNames]
                        next[idx] = e.target.value
                        setTeamNames(next)
                      }}
                      placeholder={`Team ${idx + 1} name`}
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white placeholder:text-white/30 outline-none focus:border-violet-300/40"
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Qoidalar</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">
                <li>To‘g‘ri javob: +10</li>
                <li>Tez javob (&lt;10s): +5 bonus</li>
                <li>Noto‘g‘ri javob: -5</li>
                <li>Bomb 💣: -15</li>
                <li>Double box: keyingi to‘g‘ri javob x2</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/65">
              20 ta quti: Word Puzzle, Sentence Fix, Vocab Match, Spelling, Bonus, Double, Bomb. Har yurishda jamoa bitta
              quti tanlaydi.
            </div>
            <button
              type="button"
              disabled={!canStart}
              onClick={() => onStart({ teamCount, teamNames, difficulty, roundCount })}
              className="h-12 w-full rounded-xl border border-violet-300/20 bg-gradient-to-r from-violet-500 to-blue-500 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Bumbuzzle
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}
