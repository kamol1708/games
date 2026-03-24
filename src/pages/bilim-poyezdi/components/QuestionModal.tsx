import { useEffect, useMemo, useState } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import type { Question, TeamState, TrackKey } from '../types/game'

type SubmitPayload = {
  answer: string
  timeLeft: number
  useTurbo: boolean
  useShield: boolean
}

type Props = {
  isOpen: boolean
  question: Question | null
  team: TeamState | null
  trackKey: TrackKey | null
  durationSec: number
  onClose: () => void
  onSubmit: (payload: SubmitPayload) => void
  onExpire: () => void
}

export function QuestionModal({
  isOpen,
  question,
  team,
  trackKey,
  durationSec,
  onClose,
  onSubmit,
  onExpire,
}: Props) {
  const [answer, setAnswer] = useState('')
  const [useTurbo, setUseTurbo] = useState(false)
  const [useShield, setUseShield] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setAnswer('')
    setUseTurbo(false)
    setUseShield(false)
  }, [isOpen, question?.id])

  const resetKey = `${question?.id ?? 'none'}-${isOpen ? 'open' : 'closed'}`
  const timeLeft = useCountdown({
    durationSec,
    active: isOpen,
    resetKey,
    onExpire,
  })

  const timeTone = useMemo(() => {
    if (timeLeft <= 5) return 'text-rose-300 border-rose-300/30 bg-rose-500/10'
    if (timeLeft <= 10) return 'text-amber-200 border-amber-300/30 bg-amber-500/10'
    return 'text-white border-white/10 bg-white/5'
  }, [timeLeft])

  if (!isOpen || !question || !team || !trackKey) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#080b14]/95 p-5 shadow-glow backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Track {trackKey} Challenge</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{team.name} navbati</h3>
            <p className="mt-1 text-sm text-white/60">
              {question.subject} · <span className="capitalize">{question.difficulty}</span> · {question.type.toUpperCase()}
            </p>
          </div>
          <div className={`rounded-xl border px-3 py-2 text-sm font-semibold ${timeTone}`}>⏳ {timeLeft}s</div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-lg leading-7 text-white">{question.prompt}</p>

          {question.type === 'mcq' && question.options ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswer(option)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    answer === option
                      ? 'border-violet-300/40 bg-violet-500/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Javobni kiriting..."
              className="mt-4 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none placeholder:text-white/30"
              autoFocus
            />
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setUseTurbo((v) => !v)}
            disabled={!team.turboAvailable}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
              useTurbo
                ? 'border-cyan-300/30 bg-cyan-500/15 text-cyan-100'
                : 'border-white/10 bg-white/5 text-white/70'
            } disabled:opacity-40`}
          >
            <div className="font-semibold">Turbo x2 (bir marta)</div>
            <div className="mt-1 text-xs text-white/60">To&apos;g&apos;ri javobda ball ikki barobar bo&apos;ladi.</div>
          </button>
          <button
            type="button"
            onClick={() => setUseShield((v) => !v)}
            disabled={!team.shieldAvailable}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
              useShield
                ? 'border-emerald-300/30 bg-emerald-500/15 text-emerald-100'
                : 'border-white/10 bg-white/5 text-white/70'
            } disabled:opacity-40`}
          >
            <div className="font-semibold">Shield (bir marta)</div>
            <div className="mt-1 text-xs text-white/60">Noto&apos;g&apos;ri javobda penaltyni bekor qiladi.</div>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/75 hover:bg-white/10"
          >
            Yopish
          </button>
          <button
            type="button"
            onClick={() => onSubmit({ answer, timeLeft, useTurbo, useShield })}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Javobni Yuborish
          </button>
        </div>
      </div>
    </div>
  )
}

