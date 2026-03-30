import { useEffect, useMemo, useState } from 'react'
import './FlagRacePage.css'
import { countries, difficultyPoints, type Difficulty, type FlagCountry } from './countries'
import { useTeacherItems } from '../../lib/useTeacherItems'

type Screen = 'setup' | 'playing' | 'finished'
type Round = {
  country: FlagCountry
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

function buildRounds(pool: FlagCountry[]): Round[] {
  const shuffled = shuffle(pool)
  return shuffled.map((country) => {
    const wrongOptions = shuffle(
      pool.filter((item) => item.name !== country.name),
    )
      .slice(0, 3)
      .map((item) => item.name)

    return {
      country,
      options: shuffle([country.name, ...wrongOptions]),
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

type FlagRacePageProps = {
  onBack: () => void
}

function FlagRacePage({ onBack }: FlagRacePageProps) {
  const teacherCountries = useTeacherItems<FlagCountry>('flag-race')
  const [screen, setScreen] = useState<Screen>('setup')
  const [teamA, setTeamA] = useState('1-Jamoa')
  const [teamB, setTeamB] = useState('2-Jamoa')
  const [rounds, setRounds] = useState<Round[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [attempted, setAttempted] = useState<[boolean, boolean]>([false, false])
  const [roundWinner, setRoundWinner] = useState<0 | 1 | null>(null)
  const [statusText, setStatusText] = useState('Bayroq nomini birinchi bo‘lib toping.')
  const [error, setError] = useState('')

  const countryPool = useMemo(() => {
    const normalizedTeacher = teacherCountries.filter(
      (item) =>
        item &&
        typeof item.name === 'string' &&
        item.name.trim().length >= 2 &&
        typeof item.code === 'string' &&
        item.code.trim().length === 2,
    )

    const merged = [...countries]
    const seen = new Set(countries.map((item) => item.name.trim().toLowerCase()))

    normalizedTeacher.forEach((item) => {
      const key = item.name.trim().toLowerCase()
      if (seen.has(key)) {
        return
      }

      seen.add(key)
      merged.push({
        name: item.name.trim(),
        code: item.code.trim().toUpperCase(),
        difficulty: item.difficulty,
      })
    })

    return merged
  }, [teacherCountries])

  const currentRound = rounds[roundIndex]
  const totalRounds = rounds.length
  const pointsForRound = currentRound ? difficultyPoints[currentRound.country.difficulty] : 0

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
      setStatusText(`Vaqt tugadi. To'g'ri javob: ${currentRound.country.name}`)
    }

    if (bothTried && roundWinner === null) {
      setStatusText(`Ikkala jamoa ham noto'g'ri javob berdi. To'g'ri javob: ${currentRound.country.name}`)
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
        `${difficultyLabel(nextRound.country.difficulty)} bayroq. To'g'ri javob: +${difficultyPoints[nextRound.country.difficulty]} ball`,
      )
    }, 1100)

    return () => window.clearTimeout(timeoutId)
  }, [screen, currentRound, attempted, roundWinner, timeLeft, roundIndex, rounds])

  const startGame = () => {
    if (!teamA.trim() || !teamB.trim()) {
      setError('Ikkala jamoa nomini kiriting.')
      return
    }

    const generated = buildRounds(countryPool)
    const firstRound = generated[0]

    if (!firstRound) {
      setError('O‘yin uchun bayroqlar topilmadi.')
      return
    }

    setRounds(generated)
    setRoundIndex(0)
    setScores([0, 0])
    setAttempted([false, false])
    setRoundWinner(null)
    setTimeLeft(ROUND_SECONDS)
    setStatusText(
      `${difficultyLabel(firstRound.country.difficulty)} bayroq. To'g'ri javob: +${difficultyPoints[firstRound.country.difficulty]} ball`,
    )
    setError('')
    setScreen('playing')
  }

  const restartGame = () => {
    const generated = buildRounds(countryPool)
    const firstRound = generated[0]

    if (!firstRound) {
      setScreen('setup')
      setError('O‘yin uchun bayroqlar topilmadi.')
      return
    }

    setRounds(generated)
    setRoundIndex(0)
    setScores([0, 0])
    setAttempted([false, false])
    setRoundWinner(null)
    setTimeLeft(ROUND_SECONDS)
    setStatusText(
      `${difficultyLabel(firstRound.country.difficulty)} bayroq. To'g'ri javob: +${difficultyPoints[firstRound.country.difficulty]} ball`,
    )
    setScreen('playing')
  }

  const answer = (teamIndex: 0 | 1, option: string) => {
    if (screen !== 'playing' || !currentRound) {
      return
    }

    if (roundWinner !== null || attempted[teamIndex]) {
      return
    }

    const isCorrect = option === currentRound.country.name
    const teamLabel = teamIndex === 0 ? teamA : teamB

    if (isCorrect) {
      const gained = difficultyPoints[currentRound.country.difficulty]
      setScores((prev) => (teamIndex === 0 ? [prev[0] + gained, prev[1]] : [prev[0], prev[1] + gained]))
      setRoundWinner(teamIndex)
      setAttempted((prev) => (teamIndex === 0 ? [true, prev[1]] : [prev[0], true]))
      setStatusText(`${teamLabel} birinchi topdi: ${currentRound.country.name} (+${gained} ball)`)
      return
    }

    setAttempted((prev) => (teamIndex === 0 ? [true, prev[1]] : [prev[0], true]))
    setStatusText(`${teamLabel} noto'g'ri javob berdi.`)
  }

  if (screen === 'setup') {
    return (
      <main className="fr-page">
        <section className="fr-setup-card">
          <h1>Bayroq Topish O&apos;yini</h1>
          <p>
            2 ta jamoa bir vaqtda javob beradi. Har bir bayroq uchun 8 soniya bor.
            Kim birinchi to&apos;g&apos;ri topsa, o&apos;sha jamoa ball oladi.
          </p>

          <div className="fr-points">
            <span>Ball tizimi:</span>
            <strong>Oson: +10</strong>
            <strong>O&apos;rta: +20</strong>
            <strong>Qiyin: +30</strong>
          </div>

          <div className="fr-inputs">
            <input
              value={teamA}
              onChange={(event) => setTeamA(event.target.value)}
              placeholder="1-Jamoa"
              aria-label="Birinchi jamoa nomi"
            />
            <input
              value={teamB}
              onChange={(event) => setTeamB(event.target.value)}
              placeholder="2-Jamoa"
              aria-label="Ikkinchi jamoa nomi"
            />
          </div>

          {error ? <p className="fr-error">{error}</p> : null}

          <div className="fr-actions">
            <button type="button" className="fr-back" onClick={onBack}>Orqaga</button>
            <button type="button" className="fr-start" onClick={startGame}>Boshlash ({countryPool.length} bayroq)</button>
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
      <main className="fr-page">
        <section className="fr-finish-card">
          <h1>O&apos;yin tugadi</h1>
          <p className="fr-finish-winner">{winner}</p>
          <p className="fr-finish-score">
            {teamA}: <strong>{scores[0]}</strong> | {teamB}: <strong>{scores[1]}</strong>
          </p>

          <div className="fr-actions">
            <button type="button" className="fr-back" onClick={onBack}>Orqaga</button>
            <button type="button" className="fr-start" onClick={restartGame}>Qayta boshlash</button>
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
    <main className="fr-page">
      <section className="fr-game-shell">
        <header className="fr-top">
          <table className="fr-score-table">
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

          <div className="fr-round-box">
            <p>Bayroq: {roundIndex + 1} / {totalRounds}</p>
            <strong>{timeLeft}s</strong>
            <span>Lider: {leaderLabel}</span>
          </div>
        </header>

        <section className="fr-flag-stage">
          <p className={`fr-difficulty fr-${currentRound.country.difficulty}`}>
            {difficultyLabel(currentRound.country.difficulty)} daraja • +{pointsForRound} ball
          </p>
          <div className="fr-flag" aria-label="bayroq">
            {countryCodeToFlagEmoji(currentRound.country.code)}
          </div>
          <p className="fr-status">{statusText}</p>
        </section>

        <section className="fr-team-answers">
          <article className="fr-team-card">
            <h2>{teamA}</h2>
            <div className="fr-options">
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

          <article className="fr-team-card">
            <h2>{teamB}</h2>
            <div className="fr-options">
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

export default FlagRacePage
