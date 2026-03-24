import { useState } from 'react'
import './LearningPage.css'
import TugOfWarPage from './TugOfWarPage'
import FootballChallengePage from './FootballChallengePage'
import WordSearchPage from './WordSearchPage'
import FlagRacePage from './flag-race/FlagRacePage'
import FlagPlayerRacePage from './flag-race/FlagPlayerRacePage'
import WheelOfFortunePage from './wheel-of-fortune/WheelOfFortunePage'
import QuizBattlePage from './quiz-battle/QuizBattlePage'
import MemoryRushPage from './memory-rush/MemoryRushPage'
import TreasureHuntPage from './treasure-hunt/TreasureHuntPage'

type Screen =
  | 'learning'
  | 'tug-of-war'
  | 'football-challenge'
  | 'word-search'
  | 'flag-race'
  | 'flag-player-race'
  | 'wheel-of-fortune'
  | 'quiz-battle'
  | 'memory-rush'
  | 'treasure-hunt'

type Category = 'Barchasi' | 'Bilim' | 'Xotira' | 'Sarguzasht' | "So'z" | 'Mantiq' | 'Geografiya' | "So'z o'yini"

type GameCard = {
  title: string
  description: string
  users: string
  level: string
  levelNote: string
  accent: 'blue' | 'orange' | 'green'
  icon: string
  buttonText: string
  target: Exclude<Screen, 'learning'>
  categories: Category[]
}

function LearningPage() {
  const [screen, setScreen] = useState<Screen>('learning')
  const [activeCategory, setActiveCategory] = useState<Category>('Barchasi')

  if (screen === 'tug-of-war') {
    return <TugOfWarPage />
  }

  if (screen === 'football-challenge') {
    return <FootballChallengePage onBack={() => setScreen('learning')} />
  }

  if (screen === 'word-search') {
    return <WordSearchPage onBack={() => setScreen('learning')} />
  }

  if (screen === 'flag-race') {
    return <FlagRacePage onBack={() => setScreen('learning')} />
  }

  if (screen === 'flag-player-race') {
    return <FlagPlayerRacePage onBack={() => setScreen('learning')} />
  }

  if (screen === 'wheel-of-fortune') {
    return <WheelOfFortunePage onBack={() => setScreen('learning')} />
  }

  if (screen === 'quiz-battle') {
    return <QuizBattlePage onBack={() => setScreen('learning')} />
  }

  if (screen === 'memory-rush') {
    return <MemoryRushPage onBack={() => setScreen('learning')} />
  }

  if (screen === 'treasure-hunt') {
    return <TreasureHuntPage onBack={() => setScreen('learning')} />
  }

  const features = [
    {
      icon: '🎮',
      title: "Ta'limiy o'yinlar",
      text: "O'rganishni qiziqarli qiladigan interaktiv o'yinlar",
      tone: 'blue',
    },
    {
      icon: '🖍️',
      title: 'Samarali vositalar',
      text: 'Topshiriq berish uchun qiziqarli vositalar',
      tone: 'pink',
    },
    {
      icon: '🖥️',
      title: 'Qulay interfeys',
      text: 'Chiroyli va yengil foydalanuvchi interfeysi',
      tone: 'purple',
    },
    {
      icon: '📱',
      title: 'Mobil moslashuv',
      text: 'Barcha qurilmalar uchun moslashuvchan UI',
      tone: 'green',
    },
  ]

  const categories: Category[] = ['Barchasi', 'Bilim', 'Xotira', 'Sarguzasht', "So'z", 'Mantiq', 'Geografiya', "So'z o'yini"]

  const favoriteGames: GameCard[] = [
    {
      title: "Bayroq topish o'yini",
      description: '70 ta davlat bayrogini toping, 2 jamoa bir vaqtda javob beradi.',
      users: '500+',
      level: "O'rta",
      levelNote: 'daraja',
      accent: 'blue',
      icon: '🏳️',
      buttonText: "O'yinni ochish",
      target: 'flag-race',
      categories: ['Bilim', 'Geografiya', 'Mantiq'],
    },
    {
      title: "Bayroqdan futbolchi topish",
      description: "Bayroq chiqadi, 4 futbolchidan shu davlatnikini birinchi toping.",
      users: '520+',
      level: 'Murakkab',
      levelNote: 'daraja',
      accent: 'green',
      icon: '🥅',
      buttonText: "O'yinni ochish",
      target: 'flag-player-race',
      categories: ['Bilim', 'Geografiya'],
    },
    {
      title: "Arqon tortish o'yini",
      description: "Jamoaviy arqon tortish o'yinida g'alaba qozoning",
      users: '600+',
      level: 'Oddiy',
      levelNote: 'daraja',
      accent: 'orange',
      icon: '🪢',
      buttonText: 'Foydalanish',
      target: 'tug-of-war',
      categories: ['Bilim', 'Mantiq'],
    },
    {
      title: "So'z qidiruv o'yini",
      description: "Aralash harflar maydonidan so'zlarni topish o'yini",
      users: '650+',
      level: 'Murakkab',
      levelNote: 'daraja',
      accent: 'green',
      icon: '🔠',
      buttonText: 'Foydalanish',
      target: 'word-search',
      categories: ["So'z", "So'z o'yini", 'Xotira'],
    },
    {
      title: 'Futbol Quiz Challenge',
      description: "5 himoyachi savolini yechib o'ting va darvozabonga gol uring.",
      users: '900+',
      level: "O'rta",
      levelNote: 'daraja',
      accent: 'blue',
      icon: '⚽',
      buttonText: "O'yinni ochish",
      target: 'football-challenge',
      categories: ['Bilim', 'Mantiq', 'Sarguzasht'],
    },
    {
      title: "Baraban o'yini",
      description: "Ismlar bilan baraban aylantiring, savol bering, 2-3 minut vaqt va ball qo'ying.",
      users: '730+',
      level: "O'rta",
      levelNote: 'daraja',
      accent: 'blue',
      icon: '🥁',
      buttonText: "O'yinni ochish",
      target: 'wheel-of-fortune',
      categories: ['Bilim', 'Xotira'],
    },
    {
      title: 'Quiz Battle',
      description: 'Tezkor savollar, timer va reyting bilan bilim sinovi.',
      users: '760+',
      level: "Boshlang'ich",
      levelNote: 'daraja',
      accent: 'orange',
      icon: '⚡',
      buttonText: "O'yinni ochish",
      target: 'quiz-battle',
      categories: ['Bilim', 'Mantiq'],
    },
    {
      title: 'Memory Rush',
      description: "Xotirani charxlaydigan tezkor kartochkalar o'yini.",
      users: '640+',
      level: "Oson - O'rta - Qiyin",
      levelNote: 'daraja',
      accent: 'green',
      icon: '🧠',
      buttonText: "O'yinni ochish",
      target: 'memory-rush',
      categories: ['Xotira'],
    },
    {
      title: 'Treasure Hunt',
      description: 'Topishmoqlar yechib va xarita bo‘ylab xazinani topish sarguzashti.',
      users: '520+',
      level: 'Kreativ',
      levelNote: 'daraja',
      accent: 'orange',
      icon: '🗺️',
      buttonText: "O'yinni ochish",
      target: 'treasure-hunt',
      categories: ['Sarguzasht', 'Mantiq', 'Geografiya'],
    },
  ]

  const filteredGames =
    activeCategory === 'Barchasi'
      ? favoriteGames
      : favoriteGames.filter((game) => game.categories.includes(activeCategory))

  const openGame = (target: GameCard['target']) => {
    setScreen(target)
  }

  return (
    <main className="lp-page">
      <div className="lp-layer lp-kids" aria-hidden="true" />
      <div className="lp-layer lp-stars" aria-hidden="true" />

      <span className="lp-badge lp-badge-left" aria-hidden="true">📘</span>
      <span className="lp-badge lp-badge-right" aria-hidden="true">🎓</span>
      <span className="lp-badge lp-badge-mid" aria-hidden="true">💡</span>
      <span className="lp-badge lp-badge-bottom" aria-hidden="true">✂</span>

      <section className="lp-hero">
        <p className="lp-pill">🎉 50+ O‘qituvchilar safiga qo‘shiling</p>

        <h1>
          Ta&apos;lim jarayoni biz bilan
          <span>Qiziqarli</span>
        </h1>

        <p className="lp-subtitle">
          Interaktiv o&apos;yinlar, metodlar va o&apos;qitish vositalari hammasi bir joyda.
          O&apos;rganish va o&apos;qitish usulingizni boyiting.
        </p>

        <div className="lp-actions">
          <button className="lp-btn lp-btn-primary" type="button">Hozir boshlash →</button>
          <button className="lp-btn lp-btn-ghost" type="button">O&apos;yinlarni ko&apos;rish</button>
        </div>

        <p className="lp-rating" aria-label="rating">
          <span>★ ★ ★ ★ ★</span>
          O&apos;qituvchilar 4.7 bilan baholadi
        </p>
      </section>

      <section className="lp-features">
        <h2>Platforma xususiyatlari</h2>
        <p className="lp-features-subtitle">
          Zamonaviy ustozlar va o&apos;quvchilar uchun
          samarali vositalar
        </p>

        <div className="lp-feature-grid">
          {features.map((item) => (
            <article key={item.title} className="lp-feature-card">
              <div className={`lp-feature-icon ${item.tone}`} aria-hidden="true">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-favorites">
        <p className="lp-pill lp-pill-small">⭐ O&apos;qituvchilarning tanlovlari</p>
        <h2>Sevimli O&apos;yinlar</h2>
        <p className="lp-favorites-subtitle">
          O&apos;qituvchilar eng ko&apos;p tanlayotgan o&apos;yinlar va metodlar
        </p>

        <div className="lp-category-row">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'lp-category-chip active' : 'lp-category-chip'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="lp-favorites-grid">
          {filteredGames.map((game) => (
            <article key={game.title} className={`lp-game-card ${game.accent}`}>
              <div className="lp-game-preview">
                <span>{game.icon}</span>
              </div>

              <h3>{game.title}</h3>
              <p>{game.description}</p>

              <div className="lp-game-stats">
                <div className="lp-stat">
                  <strong>{game.users}</strong>
                  <span>foydalanish</span>
                </div>
                <div className="lp-stat">
                  <strong>{game.level}</strong>
                  <span>{game.levelNote}</span>
                </div>
              </div>

              <button
                className="lp-game-btn"
                type="button"
                onClick={() => openGame(game.target)}
              >
                {game.buttonText} <span>›</span>
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default LearningPage
