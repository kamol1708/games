import { useMemo, useState } from 'react'
import type { GameSettings, GradeBand, Subject } from '../logic/types'

type Props = {
  onStart: (settings: GameSettings) => void
}

const subjectOptions: Array<{ key: Subject; label: string }> = [
  { key: 'math', label: 'Math' },
  { key: 'english', label: 'English' },
  { key: 'science', label: 'Science' },
  { key: 'history', label: 'History' },
]

export default function Setup({ onStart }: Props) {
  const [teamCount, setTeamCount] = useState(2)
  const [teamNames, setTeamNames] = useState(['Team 1', 'Team 2'])
  const [gradeBand, setGradeBand] = useState<GradeBand>('5-7')
  const [subjects, setSubjects] = useState<Subject[]>(['math', 'english', 'science', 'history'])
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerSeconds, setTimerSeconds] = useState<15 | 20>(15)
  const [negativeMarking, setNegativeMarking] = useState(true)
  const [stealMode, setStealMode] = useState(false)

  const canStart = useMemo(() => subjects.length >= 1 && teamNames.slice(0, teamCount).every((t) => t.trim().length > 0), [subjects, teamNames, teamCount])

  const updateTeamCount = (count: number) => {
    setTeamCount(count)
    setTeamNames((prev) => {
      const next = [...prev]
      while (next.length < count) next.push(`Team ${next.length + 1}`)
      return next.slice(0, count)
    })
  }

  const toggleSubject = (subject: Subject) => {
    setSubjects((prev) => {
      if (prev.includes(subject)) {
        if (prev.length === 1) return prev
        return prev.filter((item) => item !== subject)
      }
      return [...prev, subject]
    })
  }

  return (
    <main className="min-h-screen bg-[#04060b] p-4 text-white sm:p-6">
      <section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Classroom Quiz System</p>
        <h1 className="mt-2 text-3xl font-semibold">Team Battle Quiz Setup</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
            Number of Teams (2-4)
            <select
              value={teamCount}
              onChange={(e) => updateTeamCount(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
            >
              {[2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
            Grade Band
            <select
              value={gradeBand}
              onChange={(e) => setGradeBand(e.target.value as GradeBand)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
            >
              <option value="5-7">5-7</option>
              <option value="8-9">8-9</option>
              <option value="10-11">10-11</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: teamCount }).map((_, idx) => (
            <label key={idx} className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
              Team {idx + 1} name
              <input
                value={teamNames[idx] ?? ''}
                onChange={(e) => setTeamNames((prev) => {
                  const next = [...prev]
                  next[idx] = e.target.value
                  return next
                })}
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-sm font-medium">Subjects</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {subjectOptions.map((subject) => {
              const active = subjects.includes(subject.key)
              return (
                <button
                  key={subject.key}
                  type="button"
                  onClick={() => toggleSubject(subject.key)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    active ? 'border-cyan-300/40 bg-cyan-500/20 text-cyan-100' : 'border-white/15 bg-black/35 text-white/80'
                  }`}
                >
                  {subject.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
            <label className="flex items-center justify-between gap-3">
              Timer Enabled
              <input type="checkbox" checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} />
            </label>
            <label className="mt-3 flex items-center justify-between gap-3">
              Timer Seconds
              <select
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value) as 15 | 20)}
                disabled={!timerEnabled}
                className="rounded-lg border border-white/15 bg-black/40 px-2 py-1"
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
            <label className="flex items-center justify-between gap-3">
              Negative Marking
              <input type="checkbox" checked={negativeMarking} onChange={(e) => setNegativeMarking(e.target.checked)} />
            </label>
            <label className="mt-3 flex items-center justify-between gap-3">
              Steal Mode
              <input type="checkbox" checked={stealMode} onChange={(e) => setStealMode(e.target.checked)} />
            </label>
          </div>
        </div>

        <button
          type="button"
          disabled={!canStart}
          onClick={() =>
            onStart({
              teams: teamNames.slice(0, teamCount),
              gradeBand,
              subjects,
              timerEnabled,
              timerSeconds,
              negativeMarking,
              stealMode,
            })
          }
          className="mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 font-semibold disabled:opacity-50"
        >
          Start Quiz Game
        </button>
      </section>
    </main>
  )
}
