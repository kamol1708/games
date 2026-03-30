import { useEffect, useMemo, useState } from 'react'
import type { GameSettings, GradeMode } from '../types/game'

type Props = {
  onStart: (settings: GameSettings, teamNames: string[]) => void
}

export function SetupScreen({ onStart }: Props) {
  const [teamCount, setTeamCount] = useState(1)
  const [gradeMode, setGradeMode] = useState<GradeMode>('5-7')
  const [questionTimeSec, setQuestionTimeSec] = useState(20)
  const [stationCount, setStationCount] = useState(10)
  const [teamNames, setTeamNames] = useState<string[]>(['Team 1'])

  useEffect(() => {
    setTeamNames((prev) => {
      const next = Array.from({ length: teamCount }, (_, index) => prev[index] ?? `Team ${index + 1}`)
      return next
    })
  }, [teamCount])

  const isValid = useMemo(
    () => teamNames.every((name) => name.trim().length > 0) && teamCount >= 1 && teamCount <= 6,
    [teamNames, teamCount],
  )

  const submit = () => {
    if (!isValid) return
    onStart(
      {
        teamCount,
        gradeMode,
        questionTimeSec,
        stationCount,
      },
      teamNames,
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Bilim Poyezdi</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Jamoaviy bilim poygasi uchun premium classroom o&apos;yin
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              5-11-sinf o&apos;quvchilari uchun. Poyezd stansiyadan stansiyaga harakat qiladi, har bir yo&apos;l savol bilan
              qulflangan. To&apos;g&apos;ri javob bering, bonus oling, turbo va shielddan aqlli foydalaning.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                '1-6 ta o‘yinchi yoki jamoa',
                '3 ta track (A/B/C)',
                'Matematika / Fan / Mantiq',
                'Timer + bonus ball',
                'Teacher override',
                'LocalStorage saqlash',
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0b1020]/70 p-5">
            <h2 className="text-lg font-semibold text-white">Setup</h2>

            <div>
              <label className="mb-2 block text-sm text-white/75">Jamoalar soni</label>
              <input
                type="range"
                min={1}
                max={6}
                value={teamCount}
                onChange={(e) => setTeamCount(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
              <div className="mt-2 flex justify-between text-xs text-white/55">
                <span>1</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white">{teamCount} teams</span>
                <span>6</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/75">Sinf darajasi</label>
              <div className="grid grid-cols-2 gap-2">
                {(['5-7', '8-11'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGradeMode(mode)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      gradeMode === mode
                        ? 'border-violet-300/40 bg-violet-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {mode} sinf
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-white/75">Savol timeri</span>
                <select
                  value={questionTimeSec}
                  onChange={(e) => setQuestionTimeSec(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none"
                >
                  <option value={15}>15 soniya</option>
                  <option value={20}>20 soniya</option>
                  <option value={30}>30 soniya</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-white/75">Stansiyalar soni</span>
                <select
                  value={stationCount}
                  onChange={(e) => setStationCount(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none"
                >
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={12}>12</option>
                  <option value={15}>15</option>
                </select>
              </label>
            </div>

            <div>
              <p className="mb-2 text-sm text-white/75">Jamoa nomlari</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {teamNames.map((name, index) => (
                  <input
                    key={index}
                    value={name}
                    onChange={(e) =>
                      setTeamNames((prev) => prev.map((item, i) => (i === index ? e.target.value : item)))
                    }
                    className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/30"
                    placeholder={`Team ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!isValid}
              onClick={submit}
              className="shine-button relative w-full rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              O&apos;yinni Boshlash
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
