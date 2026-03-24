import { useMemo } from 'react'
import Timer from './Timer'
import type { QuizQuestion, Team } from '../logic/types'

type Props = {
  open: boolean
  question: QuizQuestion | null
  tilePoints: number
  team: Team | null
  timerEnabled: boolean
  timerSecondsLeft: number
  revealAnswer: boolean
  stealCandidates: Team[]
  stealActive: boolean
  selectedChoice: number | null
  numericValue: string
  onSelectChoice: (idx: number) => void
  onNumericChange: (value: string) => void
  onSubmit: () => void
  onSkip: () => void
  onReveal: () => void
  onContinueAfterReveal: () => void
}

export default function QuestionModal({
  open,
  question,
  tilePoints,
  team,
  timerEnabled,
  timerSecondsLeft,
  revealAnswer,
  stealCandidates,
  stealActive,
  selectedChoice,
  numericValue,
  onSelectChoice,
  onNumericChange,
  onSubmit,
  onSkip,
  onReveal,
  onContinueAfterReveal,
}: Props) {
  const title = useMemo(() => {
    if (stealActive) return 'Steal Mode'
    return team ? `${team.name} navbati` : 'Question'
  }, [stealActive, team])

  if (!open || !question) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-white/15 bg-[#090d18] p-6 shadow-[0_40px_120px_rgba(2,8,23,0.8)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">{title}</p>
            <h3 className="mt-1 text-2xl font-semibold">{question.question}</h3>
            <p className="mt-2 text-sm text-white/65">Points: {tilePoints}</p>
          </div>
          {timerEnabled ? <Timer secondsLeft={timerSecondsLeft} /> : null}
        </div>

        {question.type === 'mcq' || question.type === 'boolean' ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options?.map((option, idx) => (
              <button
                key={`${option}-${idx}`}
                type="button"
                onClick={() => onSelectChoice(idx)}
                className={`rounded-xl border px-4 py-3 text-left ${
                  selectedChoice === idx
                    ? 'border-cyan-300/45 bg-cyan-500/20 text-cyan-100'
                    : 'border-white/15 bg-black/35 text-white/85'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            value={numericValue}
            onChange={(event) => onNumericChange(event.target.value)}
            className="mt-5 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-lg"
            placeholder={question.type === 'sentence' ? 'Correct sentence ni kiriting' : 'Javobni kiriting'}
          />
        )}

        {revealAnswer ? (
          <div className="mt-4 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-emerald-100">
            To&apos;g&apos;ri javob: {question.answer}
          </div>
        ) : null}

        {stealActive && stealCandidates.length > 0 ? (
          <p className="mt-4 text-sm text-amber-200/90">Steal imkoni: {stealCandidates.map((t) => t.name).join(', ')}</p>
        ) : null}

        {revealAnswer ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onContinueAfterReveal}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 font-semibold"
            >
              Davom etish
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 font-semibold"
            >
              Yuborish
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 font-semibold"
            >
              O&apos;tkazib yuborish
            </button>
            <button
              type="button"
              onClick={onReveal}
              className="rounded-xl border border-amber-300/30 bg-amber-500/15 px-5 py-2.5 font-semibold text-amber-100"
            >
              Javobni ko&apos;rsatish
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
