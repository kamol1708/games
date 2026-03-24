import { useEffect, useMemo, useState } from 'react'
import './MemoryRushPage.css'

type MemoryRushPageProps = {
  onBack: () => void
}

type Difficulty = 'easy' | 'medium' | 'hard'

type CardItem = {
  id: number
  value: string
  open: boolean
  matched: boolean
}

const PREVIEW_SECONDS = 10
const MAX_LIVES = 3
const iconPool = ['🍎', '⚽', '🚀', '🎧', '📘', '🐟', '🌟', '🧩', '🎲', '🧠', '🦊', '🌍']

function shuffle<T>(input: T[]): T[] {
  const list = [...input]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = list[i]
    list[i] = list[j]
    list[j] = temp
  }
  return list
}

function getPairCount(level: Difficulty) {
  if (level === 'easy') {
    return 8
  }
  if (level === 'medium') {
    return 10
  }
  return 12
}

function getSeconds(level: Difficulty) {
  if (level === 'easy') {
    return 330
  }
  if (level === 'medium') {
    return 290
  }
  return 260
}

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function buildDeck(level: Difficulty): CardItem[] {
  const pairCount = getPairCount(level)
  const values = shuffle(iconPool).slice(0, pairCount)
  const cards = shuffle(
    [...values, ...values].map((value, index) => ({
      id: index + 1,
      value,
      open: true,
      matched: false,
    })),
  )
  return cards
}

function MemoryRushPage({ onBack }: MemoryRushPageProps) {
  const [screen, setScreen] = useState<'intro' | 'play' | 'done'>('intro')
  const [level, setLevel] = useState<Difficulty>('easy')
  const [phase, setPhase] = useState<'preview' | 'active'>('preview')
  const [cards, setCards] = useState<CardItem[]>([])
  const [timeLeft, setTimeLeft] = useState(getSeconds('easy'))
  const [previewLeft, setPreviewLeft] = useState(PREVIEW_SECONDS)
  const [moves, setMoves] = useState(0)
  const [lock, setLock] = useState(false)
  const [combo, setCombo] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [hints, setHints] = useState(2)
  const [resultTitle, setResultTitle] = useState('')
  const [resultNote, setResultNote] = useState('')
  const [score, setScore] = useState(0)
  const [streakBest, setStreakBest] = useState(0)

  const openedIds = useMemo(() => cards.filter((card) => card.open && !card.matched).map((card) => card.id), [cards])
  const allMatched = cards.length > 0 && cards.every((card) => card.matched)
  const matchedCount = cards.filter((card) => card.matched).length / 2
  const pairCount = getPairCount(level)

  useEffect(() => {
    if (screen !== 'play' || phase !== 'active') {
      return
    }
    if (allMatched) {
      setResultTitle('Ajoyib! Barcha juftlik topildi')
      setResultNote('Memory Rush master!')
      setScreen('done')
      return
    }
    if (lives <= 0) {
      setResultTitle("Imkoniyat tugadi")
      setResultNote("Hayotlar tugadi, ammo yaxshi urinish bo'ldi.")
      setScreen('done')
      return
    }
    if (timeLeft <= 0) {
      setResultTitle('Vaqt tugadi')
      setResultNote("Yana tezroq va aniqroq o'ynab ko'ring.")
      setScreen('done')
      return
    }
    const id = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(id)
  }, [screen, phase, timeLeft, allMatched, lives])

  useEffect(() => {
    if (screen !== 'play' || phase !== 'preview') {
      return
    }
    if (previewLeft <= 0) {
      setCards((prev) => prev.map((card) => ({ ...card, open: false })))
      setPhase('active')
      return
    }
    const id = window.setTimeout(() => setPreviewLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(id)
  }, [screen, phase, previewLeft])

  useEffect(() => {
    if (phase !== 'active' || openedIds.length !== 2) {
      return
    }
    setLock(true)
    const opened = cards.filter((card) => openedIds.includes(card.id))
    const match = opened[0].value === opened[1].value
    const id = window.setTimeout(() => {
      setCards((prev) =>
        prev.map((card) => {
          if (!openedIds.includes(card.id)) {
            return card
          }
          if (match) {
            return { ...card, open: true, matched: true }
          }
          return { ...card, open: false }
        }),
      )
      setMoves((prev) => prev + 1)
      if (match) {
        const nextCombo = combo + 1
        const bonus = 10 + nextCombo * 2
        setCombo(nextCombo)
        setStreakBest((prev) => Math.max(prev, nextCombo))
        setScore((prev) => prev + bonus)
      } else {
        setCombo(0)
        setLives((prev) => Math.max(0, prev - 1))
      }
      setLock(false)
    }, 650)
    return () => window.clearTimeout(id)
  }, [openedIds, cards, phase, combo])

  const start = () => {
    setCards(buildDeck(level))
    setPhase('preview')
    setPreviewLeft(PREVIEW_SECONDS)
    setTimeLeft(getSeconds(level))
    setMoves(0)
    setLock(false)
    setCombo(0)
    setLives(MAX_LIVES)
    setHints(2)
    setScore(0)
    setStreakBest(0)
    setResultTitle('')
    setResultNote('')
    setScreen('play')
  }

  const openCard = (id: number) => {
    if (lock || phase !== 'active') {
      return
    }
    if (openedIds.length >= 2) {
      return
    }
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id || card.open || card.matched) {
          return card
        }
        return { ...card, open: true }
      }),
    )
  }

  const useHint = () => {
    if (hints <= 0 || phase !== 'active' || lock) {
      return
    }
    setHints((prev) => prev - 1)
    setLock(true)
    setCards((prev) => prev.map((card) => (card.matched ? card : { ...card, open: true })))
    window.setTimeout(() => {
      setCards((prev) => prev.map((card) => (card.matched ? card : { ...card, open: false })))
      setLock(false)
    }, 1600)
  }

  if (screen === 'intro') {
    return (
      <main className="mr-page">
        <section className="mr-shell">
          <header className="mr-head">
            <button type="button" onClick={onBack}>Orqaga</button>
            <h1>Memory Rush</h1>
            <span />
          </header>
          <p className="mr-lead">
            O&apos;yin boshlanishida barcha kartalar 10 soniya ko&apos;rinadi. Eslab qoling va maksimal combo qiling.
          </p>
          <div className="mr-levels">
            <button type="button" className={level === 'easy' ? 'active' : ''} onClick={() => setLevel('easy')}>Oson</button>
            <button type="button" className={level === 'medium' ? 'active' : ''} onClick={() => setLevel('medium')}>O&apos;rta</button>
            <button type="button" className={level === 'hard' ? 'active' : ''} onClick={() => setLevel('hard')}>Qiyin</button>
          </div>
          <button type="button" className="mr-start" onClick={start}>Boshlash</button>
        </section>
      </main>
    )
  }

  if (screen === 'done') {
    return (
      <main className="mr-page">
        <section className="mr-shell">
          <header className="mr-head">
            <button type="button" onClick={onBack}>Orqaga</button>
            <h1>Memory Rush</h1>
            <span />
          </header>
          <div className="mr-result">
            <h2>{resultTitle}</h2>
            <p>{resultNote}</p>
            <p>Topilgan juftliklar: <strong>{matchedCount}</strong> / {pairCount}</p>
            <p>Qadamlar: <strong>{moves}</strong></p>
            <p>Ball: <strong>{score}</strong> • Eng yaxshi combo: <strong>x{streakBest}</strong></p>
            <button type="button" className="mr-start" onClick={start}>Yana o&apos;ynash</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mr-page">
      <section className="mr-shell">
        <header className="mr-head">
          <button type="button" onClick={onBack}>Orqaga</button>
          <h1>Memory Rush</h1>
          <span>{level}</span>
        </header>
        <div className="mr-stats">
          <div>Vaqt <strong>{formatClock(timeLeft)}</strong></div>
          <div>Juftlik <strong>{matchedCount}/{pairCount}</strong></div>
          <div>Qadam <strong>{moves}</strong></div>
          <div>Ball <strong>{score}</strong></div>
          <div>Combo <strong>x{combo}</strong></div>
          <div>Jon <strong>{'❤️'.repeat(lives) || '—'}</strong></div>
        </div>
        <div className="mr-tools">
          <button type="button" onClick={useHint} disabled={hints <= 0 || phase !== 'active' || lock}>
            Hint ({hints})
          </button>
          <p>{phase === 'preview' ? `Eslab qoling: ${previewLeft}s` : 'Juftliklarni toping!'}</p>
        </div>
        <div className={level === 'hard' ? 'mr-grid hard' : level === 'medium' ? 'mr-grid medium' : 'mr-grid easy'}>
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={card.open || card.matched ? 'mr-card open' : 'mr-card'}
              onClick={() => openCard(card.id)}
              disabled={card.open || card.matched}
            >
              <span>{card.open || card.matched ? card.value : '?'}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

export default MemoryRushPage
