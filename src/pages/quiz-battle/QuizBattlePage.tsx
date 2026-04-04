import { useEffect, useMemo, useState } from 'react'
import './QuizBattlePage.css'
import { useTeacherItems } from '../../lib/useTeacherItems'

type QuizBattlePageProps = {
  onBack: () => void
}

type Difficulty = 'easy' | 'medium' | 'hard'
type Category = 'Bilim' | 'Mantiq' | 'Geografiya' | "So'z"

type QuestionCard = {
  id: number
  category: Category
  difficulty: Difficulty
  question: string
  options: string[]
  answer: string
  points: number
  used: boolean
}

type Phase = 'preview' | 'pick' | 'answer' | 'reveal' | 'done'

const ANSWER_SECONDS = 20
const CARD_COUNT = 16

const bank: Omit<QuestionCard, 'id' | 'used'>[] = [
  { category: 'Bilim', difficulty: 'easy', question: "O'zbekiston poytaxti?", options: ['Toshkent', 'Buxoro', 'Navoiy', 'Qo‘qon'], answer: 'Toshkent', points: 10 },
  { category: 'Bilim', difficulty: 'easy', question: "12 * 3 = ?", options: ['24', '30', '36', '42'], answer: '36', points: 10 },
  { category: 'Bilim', difficulty: 'medium', question: "Qaysi biri sayyora?", options: ['Oy', 'Mars', 'Kometa', 'Yulduz'], answer: 'Mars', points: 15 },
  { category: 'Bilim', difficulty: 'medium', question: "49 / 7 + 5 = ?", options: ['10', '11', '12', '13'], answer: '12', points: 15 },
  { category: 'Bilim', difficulty: 'hard', question: "0.25 ning foizi?", options: ['2.5%', '25%', '0.25%', '250%'], answer: '25%', points: 20 },
  { category: 'Bilim', difficulty: 'hard', question: "Qaysi gaz o'simliklar uchun muhim?", options: ['Kislorod', 'Azot', 'CO2', 'Geliy'], answer: 'CO2', points: 20 },

  { category: 'Mantiq', difficulty: 'easy', question: "2, 4, 8, 16, ...", options: ['24', '28', '30', '32'], answer: '32', points: 10 },
  { category: 'Mantiq', difficulty: 'easy', question: "Qaysi son ortiqcha? 3, 5, 7, 8", options: ['3', '5', '7', '8'], answer: '8', points: 10 },
  { category: 'Mantiq', difficulty: 'medium', question: "3, 6, 12, 24, ...", options: ['36', '40', '48', '52'], answer: '48', points: 15 },
  { category: 'Mantiq', difficulty: 'medium', question: "5 ta uchburchak nechta burchak?", options: ['10', '12', '15', '18'], answer: '15', points: 15 },
  { category: 'Mantiq', difficulty: 'hard', question: "Agar 40% = 80 bo'lsa, 100% = ?", options: ['160', '180', '200', '220'], answer: '200', points: 20 },
  { category: 'Mantiq', difficulty: 'hard', question: "2, 5, 11, 23, ...", options: ['35', '41', '47', '59'], answer: '47', points: 20 },

  { category: 'Geografiya', difficulty: 'easy', question: "Qaysi qit'a eng katta?", options: ['Afrika', 'Osiyo', 'Yevropa', 'Avstraliya'], answer: 'Osiyo', points: 10 },
  { category: 'Geografiya', difficulty: 'easy', question: "Qaysi okean eng katta?", options: ['Atlantika', 'Hind', 'Tinch', 'Shimoliy Muz'], answer: 'Tinch', points: 10 },
  { category: 'Geografiya', difficulty: 'medium', question: "Fransiya poytaxti?", options: ['Rim', 'Madrid', 'Parij', 'Berlin'], answer: 'Parij', points: 15 },
  { category: 'Geografiya', difficulty: 'medium', question: "Nil daryosi qaysi qit'ada?", options: ['Osiyo', 'Afrika', 'Yevropa', 'Janubiy Amerika'], answer: 'Afrika', points: 15 },
  { category: 'Geografiya', difficulty: 'hard', question: "Qaysi davlat ikki qit'ada joylashgan?", options: ['Turkiya', 'Qatar', 'Nepal', 'Misr'], answer: 'Turkiya', points: 20 },
  { category: 'Geografiya', difficulty: 'hard', question: "Ekvator ko'proq qaysi okeandan o'tadi?", options: ['Tinch', 'Hind', 'Atlantika', 'Arktika'], answer: 'Tinch', points: 20 },

  { category: "So'z", difficulty: 'easy', question: "Sinonim: katta", options: ['kichik', 'ulkan', 'past', 'tor'], answer: 'ulkan', points: 10 },
  { category: "So'z", difficulty: 'easy', question: "Inglizcha 'book' bu...", options: ['Qalam', 'Parta', 'Kitob', 'Daftar'], answer: 'Kitob', points: 10 },
  { category: "So'z", difficulty: 'medium', question: "Qaysi biri fe'l?", options: ['tez', "ko'k", 'yurmoq', 'kitob'], answer: 'yurmoq', points: 15 },
  { category: "So'z", difficulty: 'medium', question: "Antonim: issiq", options: ['iliq', 'sovuq', 'yorug‘', 'oq'], answer: 'sovuq', points: 15 },
  { category: "So'z", difficulty: 'hard', question: "Qaysi gapda sifat bor?", options: ['U yugurdi', 'Ko‘k osmon ochiq', 'Men yozdim', 'Biz o‘qidik'], answer: 'Ko‘k osmon ochiq', points: 20 },
  { category: "So'z", difficulty: 'hard', question: "Maqolni tugating: Mehnat qilgan...", options: ['to‘yadi', 'topadi', 'yalqov bo‘ladi', 'uxlaydi'], answer: 'topadi', points: 20 },
]

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

function buildCardsFrom(source: Omit<QuestionCard, 'id' | 'used'>[]) {
  return shuffle(source)
    .slice(0, CARD_COUNT)
    .map((item, index) => ({
      ...item,
      id: index + 1,
      used: false,
    }))
}

function normalizeTeacherQuizCard(input: unknown): Omit<QuestionCard, 'id' | 'used'> | null {
  if (!input || typeof input !== 'object') {
    return null
  }
  const item = input as Partial<Omit<QuestionCard, 'id' | 'used'>>
  const categories: Category[] = ['Bilim', 'Mantiq', 'Geografiya', "So'z"]
  const levels: Difficulty[] = ['easy', 'medium', 'hard']

  if (
    typeof item.question !== 'string' ||
    !Array.isArray(item.options) ||
    item.options.some((opt) => typeof opt !== 'string') ||
    typeof item.answer !== 'string' ||
    typeof item.points !== 'number' ||
    !categories.includes(item.category as Category) ||
    !levels.includes(item.difficulty as Difficulty)
  ) {
    return null
  }

  if (!item.options.includes(item.answer)) {
    return null
  }

  return {
    category: item.category as Category,
    difficulty: item.difficulty as Difficulty,
    question: item.question,
    options: item.options.slice(0, 6),
    answer: item.answer,
    points: item.points,
  }
}

function difficultyLabel(difficulty: Difficulty) {
  if (difficulty === 'easy') {
    return 'Oson'
  }
  if (difficulty === 'medium') {
    return "O'rta"
  }
  return 'Qiyin'
}

function QuizBattlePage({ onBack }: QuizBattlePageProps) {
  const [screen, setScreen] = useState<'intro' | 'play'>('intro')
  const [teamA, setTeamA] = useState('1-Jamoa')
  const [teamB, setTeamB] = useState('2-Jamoa')
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0)
  const [cards, setCards] = useState<QuestionCard[]>([])
  const [phase, setPhase] = useState<Phase>('preview')
  const [previewLeft, setPreviewLeft] = useState(0)
  const [answerLeft, setAnswerLeft] = useState(ANSWER_SECONDS)
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [message, setMessage] = useState("Kartalarni eslab qoling. 10 soniyadan keyin yopiladi.")
  const [comboA, setComboA] = useState(0)
  const [comboB, setComboB] = useState(0)
  const [bestComboA, setBestComboA] = useState(0)
  const [bestComboB, setBestComboB] = useState(0)
  const teacherItems = useTeacherItems<unknown>('quiz-battle')
  const mergedBank = useMemo(() => {
    const teacher = teacherItems
      .map(normalizeTeacherQuizCard)
      .filter((item): item is Omit<QuestionCard, 'id' | 'used'> => item !== null)
    return [...bank, ...teacher]
  }, [teacherItems])

  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null
  const usedCount = cards.filter((card) => card.used).length
  const remaining = cards.length - usedCount
  const progressPercent = cards.length ? (usedCount / cards.length) * 100 : 0

  const start = () => {
    setCards(buildCardsFrom(mergedBank))
    setScores([0, 0])
    setActiveTeam(0)
    setPhase('pick')
    setPreviewLeft(0)
    setAnswerLeft(ANSWER_SECONDS)
    setSelectedCardId(null)
    setLocked(false)
    setMessage("Kartalar default holatda yopiq. Jamoalar navbat bilan tanlaydi.")
    setComboA(0)
    setComboB(0)
    setBestComboA(0)
    setBestComboB(0)
    setScreen('play')
  }

  useEffect(() => {
    if (screen !== 'play' || phase !== 'answer' || !selectedCard) {
      return
    }
    if (answerLeft <= 0) {
      setLocked(true)
      setMessage(`Vaqt tugadi. To'g'ri javob: ${selectedCard.answer}`)
      window.setTimeout(() => {
        setCards((prev) => prev.map((card) => (card.id === selectedCard.id ? { ...card, used: true } : card)))
        if (activeTeam === 0) {
          setComboA(0)
        } else {
          setComboB(0)
        }
        const nextUsed = usedCount + 1
        if (nextUsed >= cards.length) {
          setPhase('done')
          setSelectedCardId(null)
          setMessage("Barcha kartalar tugadi. Yakuniy natija tayyor.")
          return
        }
        setActiveTeam((prev) => (prev === 0 ? 1 : 0))
        setPhase('pick')
        setSelectedCardId(null)
        setAnswerLeft(ANSWER_SECONDS)
        setLocked(false)
      }, 1100)
      return
    }
    const id = window.setTimeout(() => setAnswerLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(id)
  }, [screen, phase, answerLeft, selectedCard, activeTeam, usedCount, cards.length])

  const pickCard = (cardId: number) => {
    if (phase !== 'pick' || locked) {
      return
    }
    const card = cards.find((item) => item.id === cardId)
    if (!card || card.used) {
      return
    }
    setSelectedCardId(cardId)
    setAnswerLeft(ANSWER_SECONDS)
    setPhase('answer')
    setMessage(`${activeTeam === 0 ? teamA : teamB} savolga javob beryapti.`)
  }

  const submitAnswer = (option: string) => {
    if (phase !== 'answer' || locked || !selectedCard) {
      return
    }

    setLocked(true)
    const correct = option === selectedCard.answer

    if (correct) {
      const combo = activeTeam === 0 ? comboA + 1 : comboB + 1
      const bonus = Math.min(12, combo * 2)
      const gained = selectedCard.points + bonus
      setScores((prev) => (activeTeam === 0 ? [prev[0] + gained, prev[1]] : [prev[0], prev[1] + gained]))
      if (activeTeam === 0) {
        setComboA(combo)
        setBestComboA((prev) => Math.max(prev, combo))
        setComboB(0)
      } else {
        setComboB(combo)
        setBestComboB((prev) => Math.max(prev, combo))
        setComboA(0)
      }
      setMessage(`To'g'ri! +${selectedCard.points} va combo bonus +${bonus}`)
    } else {
      if (activeTeam === 0) {
        setComboA(0)
      } else {
        setComboB(0)
      }
      setMessage(`Noto'g'ri. To'g'ri javob: ${selectedCard.answer}`)
    }

    window.setTimeout(() => {
      setCards((prev) => prev.map((card) => (card.id === selectedCard.id ? { ...card, used: true } : card)))
      const nextUsed = usedCount + 1
      if (nextUsed >= cards.length) {
        setPhase('done')
        setSelectedCardId(null)
        setLocked(false)
        setMessage("Barcha kartalar tugadi. Yakuniy natija tayyor.")
        return
      }
      setActiveTeam((prev) => (prev === 0 ? 1 : 0))
      setSelectedCardId(null)
      setAnswerLeft(ANSWER_SECONDS)
      setPhase('pick')
      setLocked(false)
    }, 1100)
  }

  const leader =
    scores[0] === scores[1] ? 'Durrang' : scores[0] > scores[1] ? teamA : teamB
  const winnerName = phase === 'done' && scores[0] !== scores[1] ? (scores[0] > scores[1] ? teamA : teamB) : null
  const showWinnerModal = phase === 'done'

  const visibleCard = (card: QuestionCard) => card.used || selectedCardId === card.id

  if (screen === 'intro') {
    return (
      <main className="qb-page">
        <section className="qb-shell">
          <header className="qb-head">
            <button type="button" onClick={onBack}>Orqaga</button>
            <h1>Quiz Battle 2 Jamoa</h1>
            <span />
          </header>

          <p className="qb-lead">
            16 ta savol kartasi default holatda yopiq bo&apos;ladi. Jamoalar navbat bilan kartani tanlab javob beradi.
          </p>

          <div className="qb-team-inputs">
            <input value={teamA} onChange={(e) => setTeamA(e.target.value)} placeholder="1-Jamoa" />
            <input value={teamB} onChange={(e) => setTeamB(e.target.value)} placeholder="2-Jamoa" />
          </div>

          <button type="button" className="qb-start" onClick={start}>Boshlash</button>
        </section>
      </main>
    )
  }

  return (
    <main className="qb-page">
      <section className="qb-shell">
        <header className="qb-head">
          <button type="button" onClick={onBack}>Orqaga</button>
          <h1>Quiz Battle Arena</h1>
          <span>{usedCount}/{cards.length}</span>
        </header>

        <div className="qb-score-row">
          <div className={activeTeam === 0 && phase !== 'done' ? 'qb-team-box active' : 'qb-team-box'}>
            <input value={teamA} onChange={(e) => setTeamA(e.target.value)} />
            <strong>{scores[0]}</strong>
            <small>Combo x{comboA} • Best x{bestComboA}</small>
          </div>
          <div className="qb-center-meta">
            <div className="qb-phase">
              {phase === 'preview' ? `Preview ${previewLeft}s` : phase === 'pick' ? 'Karta tanlang' : phase === 'answer' ? `Javob ${answerLeft}s` : phase === 'done' ? 'Yakun' : 'Natija'}
            </div>
            <div className="qb-leader">Lider: <b>{leader}</b></div>
            <div className="qb-progress"><i style={{ width: `${progressPercent}%` }} /></div>
          </div>
          <div className={activeTeam === 1 && phase !== 'done' ? 'qb-team-box active' : 'qb-team-box'}>
            <input value={teamB} onChange={(e) => setTeamB(e.target.value)} />
            <strong>{scores[1]}</strong>
            <small>Combo x{comboB} • Best x{bestComboB}</small>
          </div>
        </div>

        <p className="qb-message">{message}</p>

        <section className="qb-arena">
          <div className="qb-grid">
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={
                  card.used
                    ? 'qb-card used'
                    : selectedCardId === card.id
                      ? 'qb-card selected'
                      : 'qb-card'
                }
                onClick={() => pickCard(card.id)}
                disabled={card.used || phase !== 'pick' || locked}
              >
                {visibleCard(card) ? (
                  <div className="qb-card-front">
                    <span className={`qb-tag ${card.difficulty}`}>{card.category}</span>
                    <b>{difficultyLabel(card.difficulty)}</b>
                    <small>+{card.points}</small>
                  </div>
                ) : (
                  <div className="qb-card-back">
                    <span>Q{card.id}</span>
                    <small>?</small>
                  </div>
                )}
              </button>
            ))}
          </div>

          <aside className="qb-panel">
            {phase === 'answer' && selectedCard ? (
              <div className="qb-question-card">
                <p className={`qb-tag ${selectedCard.difficulty}`}>{selectedCard.category} • {difficultyLabel(selectedCard.difficulty)}</p>
                <h2>{selectedCard.question}</h2>
                <div className="qb-options">
                  {selectedCard.options.map((option) => (
                    <button key={option} type="button" onClick={() => submitAnswer(option)} disabled={locked}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="qb-question-card idle">
                <h2>{phase === 'done' ? 'O‘yin tugadi' : 'Savol paneli'}</h2>
                <p>
                  {phase === 'preview'
                    ? 'Kartalar yopiq holatda kutib turibdi.'
                    : phase === 'pick'
                      ? `${activeTeam === 0 ? teamA : teamB} uchun bitta kartani tanlang.`
                      : `Qolgan kartalar: ${remaining}`}
                </p>
                {phase === 'done' ? (
                  <button type="button" className="qb-start" onClick={start}>Yana o&apos;ynash</button>
                ) : null}
              </div>
            )}
          </aside>
        </section>
      </section>

      {showWinnerModal ? (
        <div className="qb-modal-overlay" role="presentation">
          <div className="qb-modal" role="dialog" aria-modal="true" aria-labelledby="qb-winner-title">
            <p className="qb-modal-tag">Quiz Battle Arena</p>
            <h2 id="qb-winner-title">
              {winnerName ? `${winnerName} yutdingiz!` : 'Durrang!'}
            </h2>
            <p className="qb-modal-text">
              {winnerName ? 'Tabriklaymiz, g‘olib jamoa aniqlandi.' : 'Ikkala jamoa teng natija ko‘rsatdi.'}
            </p>
            <p className="qb-modal-score">
              {teamA}: {scores[0]} | {teamB}: {scores[1]}
            </p>
            <div className="qb-modal-actions">
              <button type="button" className="qb-start" onClick={start}>Yana o&apos;ynash</button>
              <button type="button" onClick={onBack}>Games sahifasi</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default QuizBattlePage
