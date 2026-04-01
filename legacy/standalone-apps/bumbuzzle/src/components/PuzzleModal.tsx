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
  const [answer, setAnswer] = useState('')
  const [selectedChoice, setSelectedChoice] = useState('')

  useEffect(() => {
    setAnswer('')
    setSelectedChoice('')
  }, [activePuzzle?.boxId])

  const activeTeam = teams[turnIndex]
  const question = activePuzzle?.question
  const parsed = useMemo(() => (question ? promptForQuestion(question) : null), [question])

  if (!activePuzzle) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f18]/95 p-5 shadow-[0_30px_80px_rgba(2,8,23,.6)] backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          {activePuzzle.bomb ? (
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-rose-200/80">Bomb Box</p>
              <div className="relative mt-4 grid place-items-center">
                <div className="absolute h-20 w-20 rounded-full bg-rose-500/20 blur-2xl" />
                <div className="text-6xl animate-explode">💣</div>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">Boom! {activeTeam?.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">Bomb topildi. Bu yurishda -15 ball oldingiz.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={onCloseBomb}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : question && parsed ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-violet-200/80">{parsed.title}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{activeTeam?.name} navbati</h3>
                </div>
                <div className={[
                  'rounded-full border px-3 py-1.5 text-sm font-semibold',
                  activePuzzle.timeLeft <= 5
                    ? 'border-rose-300/30 bg-rose-500/10 text-rose-100'
                    : 'border-white/10 bg-white/5 text-white/80',
                ].join(' ')}>
                  {activePuzzle.timeLeft}s
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-7 text-white/85">{parsed.body}</p>
                {question.type === 'vocab_match' ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {question.options.map((opt) => {
                      const active = selectedChoice === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedChoice(opt)}
                          className={[
                            'rounded-xl border px-3 py-2.5 text-left text-sm transition',
                            active
                              ? 'border-violet-300/25 bg-violet-400/10 text-violet-100'
                              : 'border-white/10 bg-black/20 text-white/75 hover:bg-white/5',
                          ].join(' ')}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={question.type === 'vocab_match' ? selectedChoice : answer}
                    onChange={(e) => {
                      if (question.type === 'vocab_match') {
                        setSelectedChoice(e.target.value)
                      } else {
                        setAnswer(e.target.value)
                      }
                    }}
                    placeholder="Type answer here"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white placeholder:text-white/30 outline-none focus:border-violet-300/40"
                  />
                  <button
                    type="button"
                    onClick={() => onSubmitAnswer(question.type === 'vocab_match' ? selectedChoice : answer)}
                    className="h-11 rounded-xl border border-violet-300/20 bg-gradient-to-r from-violet-500 to-blue-500 px-4 text-sm font-semibold text-white"
                  >
                    Submit
                  </button>
                </div>

                {activePuzzle.revealAnswer ? (
                  <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2.5 text-sm text-amber-100">
                    Answer: <span className="font-semibold">{parsed.answer}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-white/50">Teacher override controls (manual scoring)</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onForceWrong}
                    className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-100 hover:bg-rose-400/15"
                  >
                    Mark wrong
                  </button>
                  <button
                    type="button"
                    onClick={onForceCorrect}
                    className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-100 hover:bg-emerald-400/15"
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
