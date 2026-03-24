import { getQuestionById } from '../lib/game'
import type { GameState, Question, TeamState, TrackChallenge } from '../types/game'
import { QuestionModal } from './QuestionModal'
import { Scoreboard } from './Scoreboard'
import { StationMap } from './StationMap'
import { TrackCard } from './TrackCard'

type Props = {
  state: GameState
  currentTeam: TeamState
  currentStationTracks: TrackChallenge[]
  activeQuestion: Question | null
  onOpenTrack: (trackKey: 'A' | 'B' | 'C') => void
  onSubmitAnswer: (payload: { answer: string; timeLeft: number; useTurbo: boolean; useShield: boolean }) => void
  onQuestionExpire: () => void
  onCloseQuestion: () => void
  onTeacherNextStation: () => void
  onTeacherMarkCorrect: () => void
  onTeacherMarkIncorrect: () => void
  onTeacherSkip: () => void
  onReset: () => void
}

export function GameBoard({
  state,
  currentTeam,
  currentStationTracks,
  activeQuestion,
  onOpenTrack,
  onSubmitAnswer,
  onQuestionExpire,
  onCloseQuestion,
  onTeacherNextStation,
  onTeacherMarkCorrect,
  onTeacherMarkIncorrect,
  onTeacherSkip,
  onReset,
}: Props) {
  const openTrack = state.openQuestion?.trackKey ?? null
  const modalQuestion = state.openQuestion ? getQuestionById(state.openQuestion.questionId) ?? activeQuestion : null

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-4 sm:py-6">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Bilim Poyezdi</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">Stansiya #{currentTeam.position}</h1>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Hozirgi navbat: <span className="font-semibold text-white">{currentTeam.name}</span>. Track A/B/C dan birini tanlang.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b1020]/80 px-4 py-3 text-right">
                <p className="text-xs text-white/45">Oxirgi holat</p>
                <p className="mt-1 max-w-[28ch] text-sm leading-5 text-white/85">{state.lastEvent}</p>
              </div>
            </div>
          </section>

          <StationMap stationCount={state.settings.stationCount} teams={state.teams} activeTeamId={currentTeam.id} />

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Yo‘llar</h3>
              <p className="text-xs text-white/50">To‘g‘ri +10 | Tez bonus +5 | Noto‘g‘ri -3</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {currentStationTracks.map((track) => (
                <TrackCard
                  key={`${currentTeam.position}-${track.key}`}
                  track={track.key}
                  subject={track.subject}
                  difficulty={track.difficulty}
                  onClick={() => onOpenTrack(track.key)}
                  disabled={Boolean(state.openQuestion) || state.status === 'finished'}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <Scoreboard teams={state.teams} activeTeamId={currentTeam.id} stationCount={state.settings.stationCount} />

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">O‘qituvchi boshqaruvi</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={onTeacherNextStation} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                Keyingi stansiya
              </button>
              <button type="button" onClick={onTeacherSkip} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                Savolni o‘tkazish
              </button>
              <button
                type="button"
                onClick={onTeacherMarkCorrect}
                disabled={!state.openQuestion}
                className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 disabled:opacity-40"
              >
                To‘g‘ri deb belgilash
              </button>
              <button
                type="button"
                onClick={onTeacherMarkIncorrect}
                disabled={!state.openQuestion}
                className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 disabled:opacity-40"
              >
                Noto‘g‘ri deb belgilash
              </button>
              <button
                type="button"
                onClick={onReset}
                className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                O‘yinni tiklash
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur-xl">
            <h4 className="font-semibold text-white">Qoidalar</h4>
            <ul className="mt-2 space-y-1.5">
              <li>To‘g‘ri javob: +10 ball</li>
              <li>Tez bonus (&lt;10 soniya): +5 ball</li>
              <li>Noto‘g‘ri javob: -3 ball va 1 stansiya ortga</li>
              <li>Turbo: bitta to‘g‘ri javob ballini 2x qiladi</li>
              <li>Shield: bitta noto‘g‘ri javob penalti sini bekor qiladi</li>
            </ul>
          </section>
        </div>
      </div>

      <QuestionModal
        isOpen={Boolean(state.openQuestion)}
        question={modalQuestion}
        team={currentTeam}
        trackKey={openTrack}
        durationSec={state.settings.questionTimeSec}
        onClose={onCloseQuestion}
        onSubmit={onSubmitAnswer}
        onExpire={onQuestionExpire}
      />

      {state.status === 'finished' ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#090d18]/95 p-6 text-center shadow-glow backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Winner</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {state.teams.find((t) => t.id === state.winnerTeamId)?.name ?? 'Jamoa'} g&apos;olib bo&apos;ldi!
            </h2>
            <p className="mt-3 text-white/70">Tabriklaymiz. Bilim Poyezdi final stansiyasiga birinchi yetib keldi.</p>
            <button
              type="button"
              onClick={onReset}
              className="mt-6 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Qayta boshlash
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
