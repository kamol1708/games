import { useMemo, useState } from 'react'
import './TreasureHuntPage.css'
import mapImage from '../../assets/map.jpg'
import { useTeacherItems } from '../../lib/useTeacherItems'

type TreasureHuntPageProps = {
  onBack: () => void
}

type Clue = {
  title: string
  text: string
  options: string[]
  answer: string
  reward: number
}

const clues: Clue[] = [
  {
    title: 'Clue #1',
    text: "Ketma-ketlikni toping: 2, 6, 12, 20, 30, ...",
    options: ['36', '40', '42', '44'],
    answer: '42',
    reward: 300,
  },
  {
    title: 'Clue #2',
    text: "Agar barcha BLOP lar RIM bo'lsa va ba'zi RIM lar TAZ bo'lsa, qaysi xulosa doim to'g'ri?",
    options: [
      "Barcha TAZ lar BLOP",
      "Ba'zi BLOP lar TAZ bo'lishi mumkin",
      "Hech bir BLOP RIM emas",
      "Barcha RIM lar BLOP",
    ],
    answer: "Ba'zi BLOP lar TAZ bo'lishi mumkin",
    reward: 300,
  },
  {
    title: 'Clue #3',
    text: "Bir kod 3 xonali. Raqamlar yig'indisi 12. O'nlik xonasi birlikdan 2 katta, yuzlik xonasi o'nlikdan 1 kichik. Kod qaysi?",
    options: ['345', '357', '246', '468'],
    answer: '357',
    reward: 300,
  },
  {
    title: 'Clue #4',
    text: "5 ta kalitdan faqat bittasi sandiqni ochadi. Sinovlar: 1) A emas. 2) C ham D ham emas. 3) B bo'lsa E emas. Agar B noto'g'ri bo'lsa, qaysi biri qoladi?",
    options: ['A', 'B', 'C', 'E'],
    answer: 'E',
    reward: 300,
  },
  {
    title: 'Clue #5',
    text: "9 daqiqada 3 ta mashina yuvilsa, shu tezlikda 27 daqiqada nechta mashina yuviladi?",
    options: ['6', '7', '8', '9'],
    answer: '9',
    reward: 300,
  },
  {
    title: 'Clue #6',
    text: "Qaysi son ortiqcha: 8, 27, 64, 100, 125 ?",
    options: ['27', '64', '100', '125'],
    answer: '100',
    reward: 350,
  },
  {
    title: 'Clue #7',
    text: "Bir xona ichida 4 burchak bor. Har burchakda 1 mushuk, har mushuk qarshisida 3 mushukni ko'radi. Xonada jami nechta mushuk bor?",
    options: ['4', '8', '12', '16'],
    answer: '4',
    reward: 350,
  },
  {
    title: 'Clue #8',
    text: "Agar bugun dushanba bo'lsa, 100 kundan keyin qaysi kun bo'ladi?",
    options: ['Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    answer: 'Chorshanba',
    reward: 350,
  },
  {
    title: 'Clue #9',
    text: "Qaysi ifoda eng katta qiymat beradi?",
    options: ['18 + 17', '9 × 4', '50 - 11', '7 × 5'],
    answer: '50 - 11',
    reward: 400,
  },
  {
    title: 'Clue #10',
    text: "Final kod: 1=5, 2=15, 3=215, 4=3215 bo'lsa, 5 = ?",
    options: ['43215', '5215', '543215', '32155'],
    answer: '43215',
    reward: 500,
  },
]

function normalizeTeacherClue(input: unknown, index: number): Clue | null {
  if (!input || typeof input !== 'object') {
    return null
  }
  const item = input as Partial<Clue>
  if (
    typeof item.text !== 'string' ||
    !Array.isArray(item.options) ||
    item.options.some((opt) => typeof opt !== 'string') ||
    typeof item.answer !== 'string'
  ) {
    return null
  }

  const options = item.options.slice(0, 6)
  if (!options.includes(item.answer)) {
    return null
  }

  return {
    title: typeof item.title === 'string' && item.title.trim() ? item.title : `Teacher Clue #${index + 1}`,
    text: item.text,
    options,
    answer: item.answer,
    reward: typeof item.reward === 'number' && Number.isFinite(item.reward) ? item.reward : 400,
  }
}

function TreasureHuntPage({ onBack }: TreasureHuntPageProps) {
  const [screen, setScreen] = useState<'intro' | 'play' | 'done'>('intro')
  const [index, setIndex] = useState(0)
  const [coins, setCoins] = useState(0)
  const [message, setMessage] = useState('Topishmoqlarni yechib xazinaga yeting.')
  const [locked, setLocked] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [clearedClues, setClearedClues] = useState<number[]>([])
  const teacherItems = useTeacherItems<unknown>('treasure-hunt')

  const allClues = useMemo(() => {
    const teacher = teacherItems
      .map(normalizeTeacherClue)
      .filter((item): item is Clue => item !== null)
    return [...clues, ...teacher]
  }, [teacherItems])

  const current = allClues[index]

  const start = () => {
    setIndex(0)
    setCoins(0)
    setLocked(false)
    setSelectedOption(null)
    setMistakes(0)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setClearedClues([])
    setMessage('Sarguzasht boshlandi. Birinchi clue kutmoqda.')
    setScreen('play')
  }

  const choose = (option: string) => {
    if (locked || !current) {
      return
    }
    setSelectedOption(option)

    if (option === current.answer) {
      const firstClear = !clearedClues.includes(index)
      setLocked(true)
      if (firstClear) {
        setCoins((prev) => prev + current.reward)
        setCorrectCount((prev) => prev + 1)
        setClearedClues((prev) => [...prev, index])
      }
      setStreak((prev) => {
        const next = prev + 1
        setBestStreak((best) => Math.max(best, next))
        return next
      })
      setMessage(
        firstClear
          ? `To'g'ri! +${current.reward} tanga. Yo'l ochildi.`
          : "To'g'ri! Bu clue avval ochilgan, reward qo'shilmadi.",
      )
      window.setTimeout(() => {
        const next = index + 1
        if (next >= allClues.length) {
          setScreen('done')
          return
        }
        setIndex(next)
        setLocked(false)
        setSelectedOption(null)
        setMessage(`Yangi clue ochildi! Bosqich ${next + 1} ga o'tdingiz.`)
      }, 650)
      return
    }

    setLocked(true)
    setMistakes((prev) => prev + 1)
    setStreak(0)
    setMessage("Noto'g'ri yo'nalish. 1 qadam orqaga qaytasiz.")
    window.setTimeout(() => {
      const previousStep = Math.max(0, index - 1)
      setIndex(previousStep)
      setLocked(false)
      setSelectedOption(null)
      setMessage(
        previousStep === index
          ? "Noto'g'ri javob. Siz birinchi clue'dasiz, shu yerdan davom eting."
          : `Noto'g'ri javob. 1 qadam orqaga qaytdingiz (Bosqich ${previousStep + 1}).`,
      )
    }, 900)
  }

  if (screen === 'intro') {
    return (
      <main className="th-page">
        <section className="th-shell">
          <header className="th-head">
            <button type="button" onClick={onBack}>Orqaga</button>
            <h1>Treasure Hunt</h1>
            <span />
          </header>
          <section className="th-map th-map-hero">
            <div className="th-map-image" style={{ backgroundImage: `url(${mapImage})` }} aria-hidden="true" />
            <div className="th-map-overlay">
              <h2>Xazina Xaritasiga Xush Kelibsiz</h2>
              <p>10 ta clue, 1 ta xazina, ko&apos;p tanga.</p>
            </div>
          </section>
          <p className="th-lead">10 ta clue orqali xaritada oldinga yuring va xazinani toping.</p>
          <button type="button" className="th-start" onClick={start}>Sarguzashtni boshlash</button>
        </section>
      </main>
    )
  }

  if (screen === 'done') {
    return (
      <main className="th-page">
        <section className="th-shell">
          <header className="th-head">
            <button type="button" onClick={onBack}>Orqaga</button>
            <h1>Treasure Hunt</h1>
            <span />
          </header>
          <section className="th-result">
            <div className="th-map-image th-result-map" style={{ backgroundImage: `url(${mapImage})` }} aria-hidden="true" />
            <h2>🎉 Xazina topildi!</h2>
            <p>Jami tanga: <strong>{coins}</strong></p>
            <div className="th-result-stats">
              <span>To&apos;g&apos;ri javoblar: <b>{correctCount}</b> / {allClues.length}</span>
              <span>Xatolar: <b>{mistakes}</b></span>
              <span>Best streak: <b>{bestStreak}</b></span>
            </div>
            <button type="button" className="th-start" onClick={start}>Yana o&apos;ynash</button>
          </section>
        </section>
      </main>
    )
  }

  const progress = ((index + 1) / allClues.length) * 100

  return (
    <main className="th-page">
      <section className="th-shell">
        <header className="th-head">
          <button type="button" onClick={onBack}>Orqaga</button>
          <h1>Treasure Hunt</h1>
          <span className="th-coins">Coin: {coins}</span>
        </header>

        <section className="th-map">
          <div className="th-map-image" style={{ backgroundImage: `url(${mapImage})` }} aria-hidden="true" />
          <div className="th-map-overlay top">
            <div className="th-map-chip">Bosqich {index + 1} / {allClues.length}</div>
            <div className="th-map-chip gold">+{current?.reward} coin</div>
          </div>
          <div className="th-progress-line">
            <div className="th-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="th-markers">
            {allClues.map((item, clueIndex) => (
              <span key={item.title} className={clueIndex <= index ? 'active' : ''}>
                {clueIndex === allClues.length - 1 ? '💰' : '📍'}
              </span>
            ))}
          </div>
        </section>

        <p className="th-message">{message}</p>

        <section className="th-layout">
          <section className="th-card">
            <div className="th-card-head">
              <h2>{current?.title}</h2>
              <span>{current?.reward} coin</span>
            </div>
            <p>{current?.text}</p>
            <div className="th-options">
              {current?.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  disabled={locked}
                  className={
                    selectedOption === option && option === current?.answer
                      ? 'is-correct'
                      : selectedOption === option && option !== current?.answer
                        ? 'is-wrong'
                        : ''
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <aside className="th-sidecard">
            <h3>Xazina Holati</h3>
            <p>Topilgan clue: <strong>{index}</strong> / {allClues.length}</p>
            <p>Hozirgi mukofot: <strong>{current?.reward}</strong> coin</p>
            <p>To&apos;g&apos;ri javob: <strong>{correctCount}</strong></p>
            <p>Xatolar: <strong>{mistakes}</strong></p>
            <p>Combo streak: <strong>{streak}</strong> (best: {bestStreak})</p>
            <p>Maqsad: barcha clue ni yechib sandiqni ochish.</p>
          </aside>
        </section>
      </section>
    </main>
  )
}

export default TreasureHuntPage
