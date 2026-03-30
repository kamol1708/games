import { useEffect, useMemo, useState } from 'react'
import './FlagPlayerRacePage.css'
import {
  playerDifficultyPoints,
  playerFlagItems,
  type PlayerFlagItem,
} from './playerByCountry'
import { type Difficulty } from './countries'
import { useTeacherItems } from '../../lib/useTeacherItems'

type Screen = 'setup' | 'playing' | 'finished'
type Round = {
  item: PlayerFlagItem
  options: string[]
}

const ROUND_SECONDS = 8

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(input: T[]): T[] {
  const list = [...input]
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index)
    const temp = list[index]
    list[index] = list[swapIndex]
    list[swapIndex] = temp
  }
  return list
}

function countryCodeToFlagEmoji(code: string): string {
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0)),
  )
}

function buildRounds(pool: PlayerFlagItem[]): Round[] {
  const shuffled = shuffle(pool)
  return shuffled.map((item) => {
    const wrongOptions = shuffle(
      pool.filter((entry) => entry.player !== item.player),
    )
      .slice(0, 3)
      .map((entry) => entry.player)

    return {
      item,
      options: shuffle([item.player, ...wrongOptions]),
    }
  })
}

function difficultyLabel(level: Difficulty) {
  if (level === 'easy') {
    return 'Oson'
  }
  if (level === 'medium') {
    return "O'rta"
  }
  return 'Qiyin'
}

type FlagPlayerRacePageProps = {
  onBack: () => void
}

function FlagPlayerRacePage({ onBack }: FlagPlayerRacePageProps) {
  const teacherItems = useTeacherItems<PlayerFlagItem>('flag-player-race')
  const [screen, setScreen] = useState<Screen>('setup')
  const [teamA, setTeamA] = useState('1-Jamoa')
  const [teamB, setTeamB] = useState('2-Jamoa')
  const [rounds, setRounds] = useState<Round[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [attempted, setAttempted] = useState<[boolean, boolean]>([false, false])
  const [roundWinner, setRoundWinner] = useState<0 | 1 | null>(null)
  const [statusText, setStatusText] = useState('Bayroqdagi davlat futbolchisini birinchi toping.')
  const [error, setError] = useState('')

  const playerPool = useMemo(() => {
    const normalizedTeacher = teacherItems.filter(
      (item) =>
        item &&
        typeof item.country === 'string' &&
        item.country.trim().length >= 2 &&
        typeof item.player === 'string' &&
        item.player.trim().length >= 2 &&
        typeof item.code === 'string' &&
        item.code.trim().length === 2,
    )

    const merged = [...playerFlagItems]
    const seen = new Set(playerFlagItems.map((item) => `${item.country.trim().toLowerCase()}-${item.player.trim().toLowerCase()}`))

    normalizedTeacher.forEach((item) => {
      const key = `${item.country.trim().toLowerCase()}-${item.player.trim().toLowerCase()}`
      if (seen.has(key)) {
        return
      }

      seen.add(key)
      merged.push({
        country: item.country.trim(),
        code: item.code.trim().toUpperCase(),
        player: item.player.trim(),
        difficulty: item.difficulty,
      })
    })

    return merged
  }, [teacherItems])

  const currentRound = rounds[roundIndex]
  const totalRounds = rounds.length
  const pointsForRound = currentRound ? playerDifficultyPoints[currentRound.item.difficulty] : 0

  const leaderLabel = useMemo(() => {
    if (scores[0] === scores[1]) {
      return 'Durrang'
    }
    return scores[0] > scores[1] ? teamA : teamB
  }, [scores, teamA, teamB])

  useEffect(() => {
    if (screen !== 'playing') {
      return
    }
    if (roundWinner !== null || timeLeft <= 0) {
      return
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => window.clearTimeout(timerId)
  }, [screen, timeLeft, roundWinner])

  useEffect(() => {
    if (screen !== 'playing' || !currentRound) {
      return
    }

    const bothTried = attempted[0] && attempted[1]
    const shouldAdvance = roundWinner !== null || bothTried || timeLeft <= 0
    if (!shouldAdvance) {
      return
    }

    if (timeLeft <= 0 && roundWinner === null) {
      setStatusText(`Vaqt tugadi. To'g'ri futbolchi: ${currentRound.item.player}`)
    }

    if (bothTried && roundWinner === null) {
      setStatusText(`Ikkala jamoa ham noto'g'ri javob berdi. To'g'ri futbolchi: ${currentRound.item.player}`)
    }

    const timeoutId = window.setTimeout(() => {
      const nextIndex = roundIndex + 1
      if (nextIndex >= rounds.length) {
        setScreen('finished')
        return
      }

      const nextRound = rounds[nextIndex]
      setRoundIndex(nextIndex)
      setTimeLeft(ROUND_SECONDS)
      setAttempted([false, false])
      setRoundWinner(null)
      setStatusText(
        `${difficultyLabel(nextRound.item.difficulty)} daraja. To'g'ri javob: +${playerDifficultyPoints[nextRound.item.difficulty]} ball`,
      )
    }, 1100)

    return () => window.clearTimeout(timeoutId)
  }, [screen, currentRound, attempted, roundWinner, timeLeft, roundIndex, rounds])

  const bootGame = () => {
    const generated = buildRounds(playerPool)
    const firstRound = generated[0]

    if (!firstRound) {
      setError('O‘yin uchun futbolchi savollari topilmadi.')
      setScreen('setup')
      return
    }

    setRounds(generated)
    setRoundIndex(0)
    setScores([0, 0])
    setAttempted([false, false])
    setRoundWinner(null)
    setTimeLeft(ROUND_SECONDS)
    setStatusText(
      `${difficultyLabel(firstRound.item.difficulty)} daraja. To'g'ri javob: +${playerDifficultyPoints[firstRound.item.difficulty]} ball`,
    )
    setScreen('playing')
  }

  const startGame = () => {
    if (!teamA.trim() || !teamB.trim()) {
      setError('Ikkala jamoa nomini kiriting.')
      return
    }
    setError('')
    bootGame()
  }

  const answer = (teamIndex: 0 | 1, option: string) => {
    if (screen !== 'playing' || !currentRound) {
      return
    }
    if (roundWinner !== null || attempted[teamIndex]) {
      return
    }

    const isCorrect = option === currentRound.item.player
    const teamLabel = teamIndex === 0 ? teamA : teamB

    if (isCorrect) {
      const gained = playerDifficultyPoints[currentRound.item.difficulty]
      setScores((prev) => (teamIndex === 0 ? [prev[0] + gained, prev[1]] : [prev[0], prev[1] + gained]))
      setRoundWinner(teamIndex)
      setAttempted((prev) => (teamIndex === 0 ? [true, prev[1]] : [prev[0], true]))
      setStatusText(`${teamLabel} birinchi topdi: ${currentRound.item.player} (+${gained} ball)`)
      return
    }

    setAttempted((prev) => (teamIndex === 0 ? [true, prev[1]] : [prev[0], true]))
    setStatusText(`${teamLabel} noto'g'ri javob berdi.`)
  }

  if (screen === 'setup') {
    return (
      <main className="fpr-page">
        <section className="fpr-setup-card">
          <h1>Bayroqdan Futbolchini Topish</h1>
          <p>
            Bayroq chiqadi, pastda 4 ta futbolchi varianti bo&apos;ladi.
            2 jamoa bir vaqtda javob beradi, birinchi to&apos;g&apos;ri javobga ball yoziladi.
          </p>

          <div className="fpr-points">
            <span>Ball:</span>
            <strong>Oson +10</strong>
            <strong>O&apos;rta +20</strong>
            <strong>Qiyin +30</strong>
          </div>

          <div className="fpr-inputs">
            <input
              value={teamA}
              onChange={(event) => setTeamA(event.target.value)}
              placeholder="1-Jamoa"
              aria-label="1-jamoa nomi"
            />
            <input
              value={teamB}
              onChange={(event) => setTeamB(event.target.value)}
              placeholder="2-Jamoa"
              aria-label="2-jamoa nomi"
            />
          </div>

          {error ? <p className="fpr-error">{error}</p> : null}

          <div className="fpr-actions">
            <button type="button" className="fpr-back" onClick={onBack}>Orqaga</button>
            <button type="button" className="fpr-start" onClick={startGame}>Boshlash ({playerPool.length} round)</button>
          </div>
        </section>
      </main>
    )
  }

  if (screen === 'finished') {
    const winner =
      scores[0] === scores[1]
        ? 'Durrang'
        : scores[0] > scores[1]
          ? `${teamA} g'olib`
          : `${teamB} g'olib`

    return (
      <main className="fpr-page">
        <section className="fpr-finish-card">
          <h1>O&apos;yin tugadi</h1>
          <p className="fpr-finish-winner">{winner}</p>
          <p className="fpr-finish-score">
            {teamA}: <strong>{scores[0]}</strong> | {teamB}: <strong>{scores[1]}</strong>
          </p>
          <div className="fpr-actions">
            <button type="button" className="fpr-back" onClick={onBack}>Orqaga</button>
            <button type="button" className="fpr-start" onClick={bootGame}>Qayta boshlash</button>
          </div>
        </section>
      </main>
    )
  }

  if (!currentRound) {
    return null
  }

  const options = currentRound.options

  return (
    <main className="fpr-page">
      <section className="fpr-game-shell">
        <header className="fpr-top">
          <table className="fpr-score-table">
            <thead>
              <tr>
                <th>Jamoa</th>
                <th>Ball</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{teamA}</td>
                <td>{scores[0]}</td>
              </tr>
              <tr>
                <td>{teamB}</td>
                <td>{scores[1]}</td>
              </tr>
            </tbody>
          </table>

          <div className="fpr-round-box">
            <p>Round: {roundIndex + 1} / {totalRounds}</p>
            <strong>{timeLeft}s</strong>
            <span>Lider: {leaderLabel}</span>
          </div>
        </header>

        <section className="fpr-flag-stage">
          <p className={`fpr-difficulty fpr-${currentRound.item.difficulty}`}>
            {difficultyLabel(currentRound.item.difficulty)} daraja • +{pointsForRound} ball
          </p>
          <div className="fpr-flag">{countryCodeToFlagEmoji(currentRound.item.code)}</div>
          <p className="fpr-country">{currentRound.item.country}</p>
          <p className="fpr-status">{statusText}</p>
        </section>

        <section className="fpr-team-answers">
          <article className="fpr-team-card">
            <h2>{teamA}</h2>
            <div className="fpr-options">
              {options.map((option) => (
                <button
                  key={`a-${option}`}
                  type="button"
                  onClick={() => answer(0, option)}
                  disabled={roundWinner !== null || attempted[0]}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>

          <article className="fpr-team-card">
            <h2>{teamB}</h2>
            <div className="fpr-options">
              {options.map((option) => (
                <button
                  key={`b-${option}`}
                  type="button"
                  onClick={() => answer(1, option)}
                  disabled={roundWinner !== null || attempted[1]}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}

export default FlagPlayerRacePage
