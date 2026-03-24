import { useEffect, useMemo, useState } from 'react'
import type { ActivePuzzle, PuzzleQuestion, Team } from '../types/game'

type Props = {
  activePuzzle: ActivePuzzle | null
  teams: Team[]
  turnIndex: number
  onSubmitAnswer: (answer: string) => void
  onCloseBomb: () => void
  onForceCorrect: () => void
  onForceWrong: () => void
}

type ChoiceOption = {
  id: string
  text: string
  correct: boolean
}

function mutateWrongOption(question: PuzzleQuestion, correctAnswer: string) {
  if (question.type === 'sentence_fix') {
    return question.broken
  }
  if (question.type === 'vocab_match') {
    const wrong = question.options.find((o) => o !== question.answer)
    return wrong ?? `${question.answer} (wrong)`
  }
  const chars = correctAnswer.split('')
  if (chars.length >= 2) {
    ;[chars[0], chars[1]] = [chars[1], chars[0]]
    const mutated = chars.join('')
    if (mutated !== correctAnswer) return mutated
  }
  return `${correctAnswer}X`
}

function buildTwoChoices(question: PuzzleQuestion, correctAnswer: string): ChoiceOption[] {
  const wrong = mutateWrongOption(question, correctAnswer)
  const pair: ChoiceOption[] = [
    { id: 'a', text: correctAnswer, correct: true },
    { id: 'b', text: wrong, correct: false },
  ]
  return Math.random() > 0.5 ? pair : [pair[1], pair[0]]
}

function difficultyPointLabel(question: PuzzleQuestion) {
  return question.difficulty === 'intermediate' ? '+15 (+7 fast bonus)' : '+10 (+5 fast bonus)'
}

function promptForQuestion(q: PuzzleQuestion) {
  switch (q.type) {
    case 'word_puzzle':
      return { title: 'WORD PUZZLE', body: `Unscramble: ${q.scrambled}`, answer: q.word }
    case 'sentence_fix':
      return { title: 'SENTENCE FIX', body: q.broken, answer: q.corrected }
    case 'vocab_match':
      return { title: 'VOCAB MATCH', body: q.prompt, answer: q.answer }
    case 'spelling_challenge':
      return { title: 'SPELLING CHALLENGE', body: q.prompt, answer: q.answer }
  }
}

export function PuzzleModal({ activePuzzle, teams, turnIndex, onSubmitAnswer, onCloseBomb, onForceCorrect, onForceWrong }: Props) {
  const [selectedChoice, setSelectedChoice] = useState('')
  const [showChoices, setShowChoices] = useState(false)
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOption[]>([])
  const [resultFlash, setResultFlash] = useState<'true' | 'false' | null>(null)

  useEffect(() => {
    setSelectedChoice('')
    setShowChoices(false)
    setChoiceOptions([])
    setResultFlash(null)
  }, [activePuzzle?.boxId])

  const activeTeam = teams[turnIndex]
  const question = activePuzzle?.question
  const parsed = useMemo(() => (question ? promptForQuestion(question) : null), [question])
  const pointBadge = question ? (question.difficulty === 'intermediate' ? 15 : 10) : 0

  if (!activePuzzle) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-5 shadow-[0_30px_80px_rgba(2,8,23,.32)] backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-fuchsia-400/18 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-400/18 blur-3xl" />
        {!activePuzzle.bomb ? (
          <div className="mb-4 overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-r from-blue-600/85 via-blue-500/85 to-cyan-500/75 shadow-[0_12px_28px_rgba(59,130,246,.25)]">
            <div className="relative flex items-center justify-between gap-3 px-4 py-3">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.22),transparent_55%)]" />
              <span className="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                {activeTeam?.name}
              </span>
              <span className="relative rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1 text-sm font-extrabold text-amber-100 shadow-[0_0_18px_rgba(250,204,21,.22)]">
                {pointBadge}
              </span>
            </div>
          </div>
        ) : null}
        <div className="relative">
          {activePuzzle.bomb ? (
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-rose-600/80">Bomb Box</p>
              <div className="relative mt-4 grid place-items-center">
                <div className="absolute h-20 w-20 rounded-full bg-rose-500/20 blur-2xl" />
                <div className="absolute h-24 w-24 rounded-full border border-rose-300/20 animate-ping" />
                <div className="text-6xl animate-bounce">💣</div>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">Boom! {activeTeam?.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">Bomb topildi. Bu yurishda -15 ball oldingiz.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={onCloseBomb}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : question && parsed ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-indigo-200/90">{parsed.title}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{activeTeam?.name} navbati</h3>
                </div>
                <div className="relative">
                  {activePuzzle.timeLeft <= 5 ? (
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-rose-400/20 blur-sm animate-pulse" />
                  ) : null}
                  <div className={[
                    'relative rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                    activePuzzle.timeLeft <= 5
                      ? 'border-rose-300/30 bg-rose-500/10 text-rose-100 animate-pulse'
                      : 'border-slate-200 bg-white text-slate-700',
                  ].join(' ')}>
                    {activePuzzle.timeLeft}s
                  </div>
                </div>
              </div>

              {activePuzzle.timeLeft <= 5 ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 animate-pulse">
                  Time is running out!
                </div>
              ) : null}

                <div className="mt-4 rounded-2xl border border-white/25 bg-white/10 p-4 shadow-[0_12px_24px_rgba(30,41,59,.16)]">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                      {question.difficulty === 'beginner' ? 'Beginner' : 'Intermediate'}
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      {difficultyPointLabel(question)}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-white/90">{parsed.body}</p>

                {!showChoices ? (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowChoices(true)
                        setResultFlash(null)
                        setChoiceOptions(buildTwoChoices(question, parsed.answer))
                      }}
                      className="group relative inline-flex h-12 min-w-40 items-center justify-center overflow-hidden rounded-full border border-fuchsia-300/20 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 px-6 text-lg font-semibold text-white shadow-[0_12px_30px_rgba(236,72,153,.35)] transition hover:scale-[1.02]"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
                      <span className="relative">Show</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {choiceOptions.map((opt, idx) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (resultFlash) return
                            setResultFlash(opt.correct ? 'true' : 'false')
                            setSelectedChoice(opt.text)
                            window.setTimeout(() => onSubmitAnswer(opt.text), 420)
                          }}
                          className={[
                            'bumbuzzle-choice-in relative overflow-hidden rounded-2xl border px-4 py-4 text-left text-sm font-medium transition',
                            resultFlash && selectedChoice === opt.text
                              ? opt.correct
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-rose-200 bg-rose-50 text-rose-800'
                              : 'border-white/80 bg-white text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/40',
                          ].join(' ')}
                          style={{ animationDelay: `${idx * 120}ms` }}
                        >
                          <span className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.14),transparent_55%)]" />
                          <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-white/55">Variant {idx + 1}</span>
                          <span className="block leading-6">{opt.text}</span>
                        </button>
                      ))}
                    </div>

                    {resultFlash ? (
                      <div
                        className={[
                          'rounded-xl border px-3 py-2 text-center text-sm font-semibold',
                          resultFlash === 'true'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700',
                        ].join(' ')}
                      >
                        {resultFlash === 'true' ? 'TRUE ✅' : 'FALSE ❌'}
                      </div>
                    ) : null}
                  </div>
                )}

                {activePuzzle.revealAnswer ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                    Answer: <span className="font-semibold">{parsed.answer}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-white/60">Teacher override controls (manual scoring)</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onForceWrong}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100"
                  >
                    Mark wrong
                  </button>
                  <button
                    type="button"
                    onClick={onForceCorrect}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Mark correct
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
