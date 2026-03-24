import { useEffect, useMemo, useState } from 'react'
import { GameBoard } from './components/GameBoard'
import { SetupScreen } from './components/SetupScreen'
import { buildStationTracks, getQuestionById, isCorrectAnswer, nextTeamIndex, SCORE_RULES, createTeams } from './lib/game'
import { clearGameState, loadGameState, saveGameState } from './lib/storage'
import type { GameSettings, GameState, TeamState, TrackChallenge, TrackKey } from './types/game'

type AnswerPayload = {
  answer: string
  timeLeft: number
  useTurbo: boolean
  useShield: boolean
}

function App() {
  const [game, setGame] = useState<GameState | null>(() => loadGameState())

  useEffect(() => {
    saveGameState(game)
  }, [game])

  useEffect(() => {
    if (!game || game.status === 'finished') return
    const currentTeam = game.teams[game.activeTeamIndex]
    const station = currentTeam?.position ?? 0
    if (game.stationTracks[station]) return

    setGame((prev) => {
      if (!prev || prev.status === 'finished') return prev
      const activeTeam = prev.teams[prev.activeTeamIndex]
      const activeStation = activeTeam.position
      if (prev.stationTracks[activeStation]) return prev

      const generated = buildStationTracks(prev.settings, prev.usedQuestionIds)
      return {
        ...prev,
        stationTracks: {
          ...prev.stationTracks,
          [activeStation]: generated.tracks,
        },
        usedQuestionIds: generated.usedIds,
      }
    })
  }, [game])

  const startGame = (settings: GameSettings, teamNames: string[]) => {
    const teams = createTeams(teamNames.slice(0, settings.teamCount))
    const generated = buildStationTracks(settings, [])
    const initial: GameState = {
      status: 'playing',
      settings,
      teams,
      activeTeamIndex: 0,
      stationTracks: { 0: generated.tracks },
      usedQuestionIds: generated.usedIds,
      openQuestion: null,
      winnerTeamId: null,
      lastEvent: `O‘yin boshlandi. ${teams[0]?.name ?? '1-jamoa'} Track tanlasin.`,
    }
    setGame(initial)
  }

  const currentTeam = useMemo(() => {
    if (!game) return null
    return game.teams[game.activeTeamIndex] ?? null
  }, [game])

  const currentTracks: TrackChallenge[] = useMemo(() => {
    if (!game || !currentTeam) return []
    return game.stationTracks[currentTeam.position] ?? []
  }, [game, currentTeam])

  const activeQuestion = useMemo(() => {
    if (!game?.openQuestion) return null
    return getQuestionById(game.openQuestion.questionId) ?? null
  }, [game?.openQuestion])

  const advanceTurn = (teams: TeamState[], currentIndex: number) => nextTeamIndex(currentIndex, teams.length)

  const resolveAnswer = (kind: 'correct' | 'incorrect' | 'expired', payload?: AnswerPayload) => {
    setGame((prev) => {
      if (!prev || prev.status === 'finished' || !prev.openQuestion) return prev

      const q = getQuestionById(prev.openQuestion.questionId)
      if (!q) {
        return { ...prev, openQuestion: null, lastEvent: 'Savol topilmadi. Turn o‘tkazildi.' }
      }

      const teamIndex = prev.activeTeamIndex
      const team = prev.teams[teamIndex]
      const nextTeams = prev.teams.map((t) => ({ ...t }))
      const active = nextTeams[teamIndex]

      let scoreDelta = 0
      let movedTo = active.position
      let event = ''
      let usedTurboNow = false
      let usedShieldNow = false

      const elapsed = payload ? Math.max(0, prev.settings.questionTimeSec - payload.timeLeft) : prev.settings.questionTimeSec
      const fastBonus = elapsed < SCORE_RULES.fastThresholdSec ? SCORE_RULES.fastBonus : 0

      const applyCorrect = (manual = false) => {
        const turbo = Boolean(payload?.useTurbo && active.turboAvailable)
        usedTurboNow = turbo
        scoreDelta = SCORE_RULES.correct + fastBonus
        if (turbo) scoreDelta *= 2
        active.score += scoreDelta
        active.position = Math.min(prev.settings.stationCount - 1, active.position + 1)
        movedTo = active.position
        if (turbo) active.turboAvailable = false
        event = `${active.name}: to‘g‘ri javob (${manual ? 'manual' : 'normal'}) +${scoreDelta}. Station ${movedTo}.`
      }

      const applyIncorrect = (reason: 'wrong' | 'time', manual = false) => {
        const shield = Boolean(payload?.useShield && active.shieldAvailable)
        if (shield) {
          active.shieldAvailable = false
          usedShieldNow = true
          event = `${active.name}: ${reason === 'time' ? 'vaqt tugadi' : 'noto‘g‘ri'} lekin Shield ishlatildi. Penalty yo‘q.`
          return
        }
        scoreDelta = SCORE_RULES.wrong
        active.score += scoreDelta
        active.position = Math.max(0, active.position - 1)
        movedTo = active.position
        event = `${active.name}: ${reason === 'time' ? 'vaqt tugadi' : 'noto‘g‘ri'} (${manual ? 'manual' : 'auto'}) ${scoreDelta}. Station ${movedTo}.`
      }

      if (kind === 'correct') {
        applyCorrect(kind === 'correct' && !payload)
      } else if (kind === 'incorrect') {
        applyIncorrect('wrong', kind === 'incorrect' && !payload)
      } else {
        applyIncorrect('time')
      }

      const reachedFinish = active.position >= prev.settings.stationCount - 1
      const nextIndex = reachedFinish ? prev.activeTeamIndex : advanceTurn(nextTeams, prev.activeTeamIndex)

      return {
        ...prev,
        teams: nextTeams,
        activeTeamIndex: nextIndex,
        openQuestion: null,
        status: reachedFinish ? 'finished' : 'playing',
        winnerTeamId: reachedFinish ? active.id : null,
        lastEvent:
          kind === 'correct'
            ? `${event}${usedTurboNow ? ' Turbo ishlatildi.' : ''}${fastBonus > 0 ? ' Fast bonus!' : ''}`
            : `${event}${usedShieldNow ? ' Shield sarflandi.' : ''}`,
      }
    })
  }

  const openTrack = (trackKey: TrackKey) => {
    setGame((prev) => {
      if (!prev || prev.status === 'finished' || prev.openQuestion) return prev
      const team = prev.teams[prev.activeTeamIndex]
      const tracks = prev.stationTracks[team.position] ?? []
      const track = tracks.find((t) => t.key === trackKey)
      if (!track) return prev

      return {
        ...prev,
        openQuestion: {
          stationIndex: team.position,
          trackKey,
          questionId: track.questionId,
        },
        lastEvent: `${team.name} Track ${trackKey} savolini ochdi.`,
      }
    })
  }

  const closeQuestion = () => {
    setGame((prev) => (prev ? { ...prev, openQuestion: null, lastEvent: 'Savol yopildi.' } : prev))
  }

  const submitAnswer = (payload: AnswerPayload) => {
    if (!game?.openQuestion) return
    const q = getQuestionById(game.openQuestion.questionId)
    if (!q) return
    const correct = isCorrectAnswer(q, payload.answer)
    resolveAnswer(correct ? 'correct' : 'incorrect', payload)
  }

  const onQuestionExpire = () => resolveAnswer('expired')
  const teacherMarkCorrect = () => resolveAnswer('correct')
  const teacherMarkIncorrect = () => resolveAnswer('incorrect')

  const teacherSkip = () => {
    setGame((prev) => {
      if (!prev || prev.status === 'finished') return prev
      const nextIndex = advanceTurn(prev.teams, prev.activeTeamIndex)
      return {
        ...prev,
        openQuestion: null,
        activeTeamIndex: nextIndex,
        lastEvent: `${prev.teams[prev.activeTeamIndex].name} savoli skip qilindi.`,
      }
    })
  }

  const teacherNextStation = () => {
    setGame((prev) => {
      if (!prev || prev.status === 'finished') return prev
      const nextTeams = prev.teams.map((t) => ({ ...t }))
      const active = nextTeams[prev.activeTeamIndex]
      active.position = Math.min(prev.settings.stationCount - 1, active.position + 1)
      const reachedFinish = active.position >= prev.settings.stationCount - 1
      return {
        ...prev,
        teams: nextTeams,
        openQuestion: null,
        status: reachedFinish ? 'finished' : 'playing',
        winnerTeamId: reachedFinish ? active.id : null,
        lastEvent: `${active.name} teacher override bilan station ${active.position} ga o‘tdi.`,
      }
    })
  }

  const resetGame = () => {
    clearGameState()
    setGame(null)
  }

  if (!game || !currentTeam) {
    return (
      <main className="min-h-screen bg-[#05060a] text-white">
        <BackgroundFX />
        <SetupScreen onStart={startGame} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <BackgroundFX />
      <GameBoard
        state={game}
        currentTeam={currentTeam}
        currentStationTracks={currentTracks}
        activeQuestion={activeQuestion}
        onOpenTrack={openTrack}
        onSubmitAnswer={submitAnswer}
        onQuestionExpire={onQuestionExpire}
        onCloseQuestion={closeQuestion}
        onTeacherNextStation={teacherNextStation}
        onTeacherMarkCorrect={teacherMarkCorrect}
        onTeacherMarkIncorrect={teacherMarkIncorrect}
        onTeacherSkip={teacherSkip}
        onReset={resetGame}
      />
    </main>
  )
}

function BackgroundFX() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(800px_400px_at_10%_5%,rgba(168,85,247,0.18),transparent_60%),radial-gradient(900px_500px_at_90%_8%,rgba(59,130,246,0.16),transparent_60%),#05060a]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_20%_20%,white_0.8px,transparent_1px)] [background-size:14px_14px]" />
    </>
  )
}

export default App
