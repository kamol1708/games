import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import monopolyBoardImage from '../assets/monomap.jpg'
import {
  CHANCE_CARDS,
  CHEST_CARDS,
  EDU_MONOPOLY_QUESTIONS,
  EDU_MONOPOLY_TILES,
  WIN_OWNED_TILES,
  WIN_SCORE,
  type EduEventCard,
  type EduMonopolyTile,
  type EduQuestion,
  type EduSubject,
} from './edu-monopoly/eduMonopolyData'

type Props = {
  onBack?: () => void
}

type TeamState = {
  id: 'A' | 'B'
  name: string
  color: string
  position: number
  score: number
  owned: number[]
  correctAnswers: number
  laps: number
  cards: {
    shield: number
    steal: number
    upgrade: number
  }
}

type PendingQuestion = {
  tile: EduMonopolyTile
  question: EduQuestion
  teamIndex: number
  ownerIndex: number | null
}

type PendingDecision =
  | {
      kind: 'claim'
      tile: EduMonopolyTile
      teamIndex: number
      reward: number
    }
  | {
      kind: 'upgrade'
      tile: EduMonopolyTile
      teamIndex: number
      nextLevel: number
      cost: number
      reward: number
    }
  | {
      kind: 'shield'
      tile: EduMonopolyTile
      teamIndex: number
      ownerIndex: number
      rent: number
    }
  | {
      kind: 'steal'
      tile: EduMonopolyTile
      teamIndex: number
      ownerIndex: number
    }

type PendingDuel = {
  tile: EduMonopolyTile
  challengerIndex: number
  defenderIndex: number
  question: EduQuestion
}

type NoticeState = {
  title: string
  body: string
  tone: 'good' | 'bad' | 'info'
  keepTurn?: boolean
}

const TEAM_COLORS = ['#22c55e', '#f97316'] as const
const TILE_CENTER = 100 / 11 / 2
const TILE_STEP = 100 / 11
const QUESTION_SECONDS = 20
const SUBJECT_THEME: Record<EduSubject, { accent: string; surface: string; text: string }> = {
  Matematika: { accent: '#2b7fff', surface: 'rgba(43,127,255,0.18)', text: '#dbeafe' },
  Geografiya: { accent: '#fde047', surface: 'rgba(253,224,71,0.24)', text: '#fff8c5' },
  Tarix: { accent: '#ef4444', surface: 'rgba(239,68,68,0.18)', text: '#fee2e2' },
  'Ingliz tili': { accent: '#f97316', surface: 'rgba(249,115,22,0.18)', text: '#ffedd5' },
  Fizika: { accent: '#8b5cf6', surface: 'rgba(139,92,246,0.18)', text: '#ede9fe' },
  Biologiya: { accent: '#22c55e', surface: 'rgba(34,197,94,0.18)', text: '#dcfce7' },
  Kimyo: { accent: '#14b8a6', surface: 'rgba(20,184,166,0.18)', text: '#ccfbf1' },
}

const TILE_POSITIONS = Array.from({ length: 40 }, (_, index) => {
  if (index <= 10) {
    return { left: 100 - TILE_CENTER - index * TILE_STEP, top: 100 - TILE_CENTER }
  }
  if (index <= 20) {
    return { left: TILE_CENTER, top: 100 - TILE_CENTER - (index - 10) * TILE_STEP }
  }
  if (index <= 30) {
    return { left: TILE_CENTER + (index - 20) * TILE_STEP, top: TILE_CENTER }
  }
  return { left: 100 - TILE_CENTER, top: TILE_CENTER + (index - 30) * TILE_STEP }
})

function clampScore(value: number) {
  return Math.max(0, value)
}

function findOwnerIndex(teams: TeamState[], tileIndex: number) {
  const owner = teams.findIndex((team) => team.owned.includes(tileIndex))
  return owner === -1 ? null : owner
}

function subjectOwnedCount(team: TeamState, subject: EduSubject) {
  return team.owned
    .map((tileId) => EDU_MONOPOLY_TILES[tileId])
    .filter((tile) => tile?.subject === subject).length
}

function subjectKingdomBonus(team: TeamState, subject?: EduSubject) {
  if (!subject) return 0
  const count = subjectOwnedCount(team, subject)
  if (count >= 3) return 60
  if (count >= 2) return 30
  return 0
}

function nextQuestionFor(subject: EduSubject, cursorsRef: MutableRefObject<Record<EduSubject, number>>) {
  const bank = EDU_MONOPOLY_QUESTIONS[subject]
  const cursor = cursorsRef.current[subject] ?? 0
  const question = bank[cursor % bank.length]
  cursorsRef.current[subject] = cursor + 1
  return question
}

function nextCard(cards: EduEventCard[], cursorRef: MutableRefObject<number>) {
  const card = cards[cursorRef.current % cards.length]
  cursorRef.current += 1
  return card
}

function tokenOffset(teams: TeamState[], teamIndex: number) {
  const sameTileIndexes = teams
    .map((team, index) => ({ position: team.position, index }))
    .filter((item) => item.position === teams[teamIndex].position)
    .map((item) => item.index)

  if (sameTileIndexes.length < 2) return { x: 0, y: 0 }
  return sameTileIndexes[0] === teamIndex ? { x: -14, y: -14 } : { x: 14, y: 14 }
}

function tileRuleText(tile: EduMonopolyTile | null, ownerName?: string | null) {
  if (!tile) return 'Zar tashlang va school city bo‘ylab harakatni boshlang.'

  switch (tile.type) {
    case 'start':
      return 'Bu katak bonus start hududi. Tushsangiz yoki undan o‘tsangiz coin olasiz.'
    case 'lesson':
      return ownerName
        ? `Bu hudud hozir ${ownerName} qo‘lida. To‘g‘ri javob bersangiz rentdan qutulasiz, xato bo‘lsa rent to‘laysiz.`
        : 'Bu fan hududi. To‘g‘ri javob bersangiz tile sizniki bo‘ladi.'
    case 'rail':
      return ownerName
        ? `Bu ekspress yo‘lni ${ownerName} egallagan. Savol sizni rentdan qutqarishi mumkin.`
        : 'Ekspress hududlar yuqoriroq reward beradi. To‘g‘ri javob bilan tezda egallang.'
    case 'utility':
      return 'Lab tile. Savolga to‘g‘ri javob bersangiz maxsus ilmiy hudud sizniki bo‘ladi.'
    case 'chance':
      return 'Bu surprise task. Bonus, jarima yoki qo‘shimcha yurish chiqishi mumkin.'
    case 'chest':
      return 'Bu class bonus sandig‘i. Jamoa uchun ijobiy yoki neytral event ochiladi.'
    case 'tax':
      return 'Bu xarajat katagi. Bu yerda coin yo‘qotasiz.'
    case 'free':
      return 'Tanaffus maydoni. Bu yer sizga kichik bonus beradi.'
    case 'gotojail':
      return 'Bu katak sizni nazorat zonasiga qaytaradi.'
    case 'jail':
      return 'Nazorat zonasi. Bu safar faqat kuzatuvchi bo‘lib turasiz.'
    default:
      return 'Maxsus tile.'
  }
}

function tileDisplayTone(tile: EduMonopolyTile) {
  if (tile.subject) return SUBJECT_THEME[tile.subject]

  switch (tile.type) {
    case 'start':
      return { accent: '#22c55e', surface: 'rgba(34,197,94,0.18)', text: '#dcfce7' }
    case 'chance':
      return { accent: '#a855f7', surface: 'rgba(168,85,247,0.18)', text: '#f3e8ff' }
    case 'chest':
      return { accent: '#eab308', surface: 'rgba(234,179,8,0.18)', text: '#fef9c3' }
    case 'tax':
      return { accent: '#fb7185', surface: 'rgba(251,113,133,0.18)', text: '#ffe4e6' }
    case 'rail':
      return { accent: '#94a3b8', surface: 'rgba(148,163,184,0.18)', text: '#e2e8f0' }
    case 'utility':
      return { accent: '#06b6d4', surface: 'rgba(6,182,212,0.18)', text: '#cffafe' }
    case 'jail':
    case 'gotojail':
      return { accent: '#f97316', surface: 'rgba(249,115,22,0.18)', text: '#ffedd5' }
    default:
      return { accent: '#cbd5e1', surface: 'rgba(203,213,225,0.14)', text: '#f8fafc' }
  }
}

function tileLabelAngle(tileIndex: number) {
  if (tileIndex >= 1 && tileIndex <= 9) return 0
  if (tileIndex >= 11 && tileIndex <= 19) return -90
  if (tileIndex >= 21 && tileIndex <= 29) return 180
  if (tileIndex >= 31 && tileIndex <= 39) return 90
  return 0
}

function tileLabelSize(tileIndex: number) {
  const isCorner = tileIndex % 10 === 0
  return isCorner ? { width: 76, height: 76 } : tileIndex <= 9 || (tileIndex >= 21 && tileIndex <= 29) ? { width: 56, height: 76 } : { width: 76, height: 56 }
}

function tileMiniText(tile: EduMonopolyTile) {
  if (tile.type === 'chance') return '?'
  if (tile.type === 'chest') return 'CHEST'
  if (tile.type === 'tax') return 'TAX'
  if (tile.type === 'start') return 'GO'
  if (tile.type === 'jail') return 'REST'
  if (tile.type === 'gotojail') return 'GO JAIL'
  if (tile.type === 'rail') return 'EXP'
  if (tile.type === 'utility') return 'LAB'
  return tile.subject ?? 'LESSON'
}

function tileNameCompact(name: string) {
  return name.length > 18 ? `${name.slice(0, 18)}…` : name
}

export default function MonopolyCalibrationPage({ onBack }: Props) {
  const questionCursorRef = useRef<Record<EduSubject, number>>({
    Matematika: 0,
    Geografiya: 0,
    Tarix: 0,
    'Ingliz tili': 0,
    Fizika: 0,
    Biologiya: 0,
    Kimyo: 0,
  })
  const chanceCursorRef = useRef(0)
  const chestCursorRef = useRef(0)

  const [teamNames, setTeamNames] = useState(['Jamoa A', 'Jamoa B'])
  const [teams, setTeams] = useState<TeamState[]>([])
  const [activeTeamIndex, setActiveTeamIndex] = useState(0)
  const [phase, setPhase] = useState<'setup' | 'ready' | 'question' | 'duel' | 'decision' | 'notice' | 'finished'>('setup')
  const [dice, setDice] = useState<[number, number] | null>(null)
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null)
  const [pendingDuel, setPendingDuel] = useState<PendingDuel | null>(null)
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS)
  const [tileLevels, setTileLevels] = useState<Record<number, number>>({})

  const activeTeam = teams[activeTeamIndex] ?? null
  const activeTile = activeTeam ? EDU_MONOPOLY_TILES[activeTeam.position] : null
  const activeTileOwnerIndex = activeTile ? findOwnerIndex(teams, activeTile.id) : null
  const activeTileOwnerName = activeTileOwnerIndex !== null ? teams[activeTileOwnerIndex]?.name : null
  const activeTileLevel = activeTile ? tileLevels[activeTile.id] ?? 0 : 0

  const leaderboard = useMemo(
    () => [...teams].sort((a, b) => b.score - a.score || b.owned.length - a.owned.length),
    [teams],
  )

  useEffect(() => {
    if (phase !== 'question' && phase !== 'duel') return
    if (timeLeft <= 0) {
      if (phase === 'duel') {
        handleDuelResult(false, true)
      } else {
        handleQuestionResult(false, true)
      }
      return
    }
    const timer = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [phase, timeLeft])

  const startGame = () => {
    questionCursorRef.current = {
      Matematika: 0,
      Geografiya: 0,
      Tarix: 0,
      'Ingliz tili': 0,
      Fizika: 0,
      Biologiya: 0,
      Kimyo: 0,
    }
    chanceCursorRef.current = 0
    chestCursorRef.current = 0

    setTeams([
      {
        id: 'A',
        name: teamNames[0].trim() || 'Jamoa A',
        color: TEAM_COLORS[0],
        position: 0,
        score: 350,
        owned: [],
        correctAnswers: 0,
        laps: 0,
        cards: { shield: 0, steal: 0, upgrade: 0 },
      },
      {
        id: 'B',
        name: teamNames[1].trim() || 'Jamoa B',
        color: TEAM_COLORS[1],
        position: 0,
        score: 350,
        owned: [],
        correctAnswers: 0,
        laps: 0,
        cards: { shield: 0, steal: 0, upgrade: 0 },
      },
    ])
    setActiveTeamIndex(0)
    setDice(null)
    setPendingQuestion(null)
    setNotice(null)
    setWinnerIndex(null)
    setTimeLeft(QUESTION_SECONDS)
    setPendingDuel(null)
    setPendingDecision(null)
    setTileLevels({})
    setPhase('ready')
  }

  const finishTurn = (keepTurn = false) => {
    setPendingQuestion(null)
    setPendingDuel(null)
    setPendingDecision(null)
    setTimeLeft(QUESTION_SECONDS)
    setNotice(null)
    setPhase('ready')
    if (!keepTurn) {
      setActiveTeamIndex((prev) => (prev + 1) % 2)
    }
  }

  const finalizeWinnerIfNeeded = (nextTeams: TeamState[]) => {
    const winner = nextTeams.findIndex((team) => team.score >= WIN_SCORE || team.owned.length >= WIN_OWNED_TILES)
    if (winner !== -1) {
      setWinnerIndex(winner)
      setPhase('finished')
      setNotice(null)
      setPendingQuestion(null)
      setPendingDuel(null)
      setPendingDecision(null)
      return true
    }
    return false
  }

  const openQuestionForTile = (teamIndex: number, tile: EduMonopolyTile, ownerIndex: number | null) => {
    if (!tile.subject) return
    const question = nextQuestionFor(tile.subject, questionCursorRef)
    setPendingQuestion({ tile, question, teamIndex, ownerIndex })
    setTimeLeft(QUESTION_SECONDS)
    setPhase('question')
  }

  const applyEventCard = (card: EduEventCard, label: string) => {
    setTeams((prev) => {
      const next = prev.map((team, index) =>
        index === activeTeamIndex
          ? {
              ...team,
              score: clampScore(team.score + card.delta),
              cards: card.grantCard
                ? {
                    ...team.cards,
                    [card.grantCard]: team.cards[card.grantCard] + (card.grantAmount ?? 1),
                  }
                : team.cards,
            }
          : team,
      )
      if (!finalizeWinnerIfNeeded(next)) {
        setNotice({
          title: card.title,
          body: `${label}: ${card.text}${card.grantCard ? ` Kartochka: ${card.grantCard}.` : ''}`,
          tone: card.delta >= 0 ? 'good' : 'bad',
          keepTurn: card.bonusRoll,
        })
        setPhase('notice')
      }
      return next
    })
  }

  const handleLanding = (teamIndex: number, tileIndex: number) => {
    const tile = EDU_MONOPOLY_TILES[tileIndex]
    const ownerIndex = findOwnerIndex(teams, tileIndex)

    switch (tile.type) {
      case 'start':
        setTeams((prev) => {
          const next = prev.map((team, index) =>
            index === teamIndex ? { ...team, score: clampScore(team.score + 80) } : team,
          )
          setNotice({ title: 'Start Bonus', body: "Start katagiga tushdingiz. +80 bilim coin.", tone: 'good' })
          setPhase('notice')
          return next
        })
        return
      case 'free':
        setTeams((prev) => {
          const next = prev.map((team, index) =>
            index === teamIndex ? { ...team, score: clampScore(team.score + 60) } : team,
          )
          setNotice({ title: 'Study Break', body: "Free Parking bonus: jamoa dam olib, +60 coin oldi.", tone: 'good' })
          setPhase('notice')
          return next
        })
        return
      case 'tax':
        setTeams((prev) => {
          const next = prev.map((team, index) =>
            index === teamIndex ? { ...team, score: clampScore(team.score - 90) } : team,
          )
          setNotice({ title: 'Exam Expense', body: "Imtihon va loyiha xarajatlari uchun -90 bilim coin.", tone: 'bad' })
          setPhase('notice')
          return next
        })
        return
      case 'gotojail':
        setTeams((prev) => {
          const next = prev.map((team, index) =>
            index === teamIndex ? { ...team, position: 10, score: clampScore(team.score - 70) } : team,
          )
          setNotice({ title: 'Detention', body: "Qoidabuzarlik uchun Study Break katagiga qaytdingiz. -70 coin.", tone: 'bad' })
          setPhase('notice')
          return next
        })
        return
      case 'chance':
        applyEventCard(nextCard(CHANCE_CARDS, chanceCursorRef), 'Chance')
        return
      case 'chest':
        applyEventCard(nextCard(CHEST_CARDS, chestCursorRef), 'Community Chest')
        return
      case 'jail':
        setNotice({ title: 'Just Visiting', body: "Bu safar faqat kuzatib turibsiz. Navbatni yakunlang.", tone: 'info' })
        setPhase('notice')
        return
      default:
        openQuestionForTile(teamIndex, tile, ownerIndex)
    }
  }

  const rollDice = () => {
    if (phase !== 'ready' || !activeTeam) return
    const d1 = Math.floor(Math.random() * 6) + 1
    const d2 = Math.floor(Math.random() * 6) + 1
    const total = d1 + d2
    const passedStart = activeTeam.position + total >= EDU_MONOPOLY_TILES.length
    const nextPosition = (activeTeam.position + total) % EDU_MONOPOLY_TILES.length

    setDice([d1, d2])
    setTeams((prev) =>
      prev.map((team, index) =>
        index === activeTeamIndex
          ? {
              ...team,
              position: nextPosition,
              laps: team.laps + (passedStart ? 1 : 0),
              score: clampScore(team.score + (passedStart ? 120 : 0)),
            }
          : team,
      ),
    )

    window.setTimeout(() => handleLanding(activeTeamIndex, nextPosition), 280)
  }

  const handleQuestionResult = (correct: boolean, timedOut = false) => {
    if (!pendingQuestion) return

    const { teamIndex, tile, ownerIndex } = pendingQuestion
    const baseReward = tile.reward ?? 120
    setTeams((prev) => {
      const next = prev.map((team) => ({ ...team, owned: [...team.owned], cards: { ...team.cards } }))
      const team = next[teamIndex]
      const bonus = subjectKingdomBonus(team, tile.subject)

      if (correct) {
        team.correctAnswers += 1
        if (ownerIndex === null) {
          setPendingDecision({
            kind: 'claim',
            tile,
            teamIndex,
            reward: baseReward + bonus,
          })
          setPhase('decision')
        } else if (ownerIndex === teamIndex) {
          const nextLevel = Math.min(3, (tileLevels[tile.id] ?? 1) + 1)
          if ((tileLevels[tile.id] ?? 1) < 3) {
            setPendingDecision({
              kind: 'upgrade',
              tile,
              teamIndex,
              nextLevel,
              cost: 40 * nextLevel,
              reward: Math.round(baseReward * 0.35) + bonus,
            })
            setPhase('decision')
          } else {
            team.score = clampScore(team.score + Math.round(baseReward * 0.45) + bonus)
            setNotice({
              title: 'Gold tile bonus',
              body: `${team.name} to‘liq upgrade qilingan hududida bonus coin oldi.`,
              tone: 'good',
            })
            setPhase('notice')
          }
        } else {
          if (team.cards.steal > 0) {
            setPendingDecision({
              kind: 'steal',
              tile,
              teamIndex,
              ownerIndex,
            })
            setPhase('decision')
          } else if (tile.subject) {
            setPendingDuel({
              tile,
              challengerIndex: teamIndex,
              defenderIndex: ownerIndex,
              question: nextQuestionFor(tile.subject, questionCursorRef),
            })
            setTimeLeft(QUESTION_SECONDS)
            setPhase('duel')
          }
        }
      } else if (ownerIndex !== null && ownerIndex !== teamIndex) {
        const level = tileLevels[tile.id] ?? 1
        const rent = (tile.rent ?? 90) + (level - 1) * 40
        if (team.cards.shield > 0) {
          setPendingDecision({
            kind: 'shield',
            tile,
            teamIndex,
            ownerIndex,
            rent,
          })
          setPhase('decision')
        } else {
          team.score = clampScore(team.score - rent)
          next[ownerIndex].score = clampScore(next[ownerIndex].score + rent)
          setNotice({
            title: timedOut ? 'Vaqt tugadi' : 'Xato javob',
            body: `${team.name} ${tile.name} savolida yiqildi va ${rent} coin rent to‘ladi.`,
            tone: 'bad',
          })
          setPhase('notice')
        }
      } else {
        team.score = clampScore(team.score - 45)
        setNotice({
          title: timedOut ? 'Vaqt tugadi' : 'Xato javob',
          body: `${team.name} savolni topa olmadi. Tile olinmadi va -45 coin yozildi.`,
          tone: 'bad',
        })
        setPhase('notice')
      }

      finalizeWinnerIfNeeded(next)

      return next
    })

    setPendingQuestion(null)
    setTimeLeft(QUESTION_SECONDS)
  }

  const handleDuelResult = (defenderCorrect: boolean, timedOut = false) => {
    if (!pendingDuel) return
    const { challengerIndex, defenderIndex, tile } = pendingDuel
    setTeams((prev) => {
      const next = prev.map((team) => ({ ...team, owned: [...team.owned], cards: { ...team.cards } }))
      const challenger = next[challengerIndex]
      const defender = next[defenderIndex]

      if (defenderCorrect) {
        defender.correctAnswers += 1
        defender.score = clampScore(defender.score + 50)
        setNotice({
          title: 'Duel himoyasi',
          body: `${defender.name} duel savoliga javob berib ${tile.name} ni saqlab qoldi.`,
          tone: 'good',
        })
      } else {
        defender.owned = defender.owned.filter((id) => id !== tile.id)
        challenger.owned.push(tile.id)
        setTileLevels((prev) => ({ ...prev, [tile.id]: 1 }))
        challenger.score = clampScore(challenger.score + 90)
        setNotice({
          title: timedOut ? 'Duelda vaqt tugadi' : 'Tile qo‘lga olindi',
          body: `${challenger.name} duelda ustun keldi va ${tile.name} ni raqibdan olib qo‘ydi.`,
          tone: 'good',
        })
      }

      if (!finalizeWinnerIfNeeded(next)) {
        setPhase('notice')
      }
      return next
    })
    setPendingDuel(null)
    setTimeLeft(QUESTION_SECONDS)
  }

  const resolveDecision = (action: 'claim' | 'coins' | 'upgrade' | 'skip-upgrade' | 'shield' | 'pay-rent' | 'steal' | 'duel') => {
    if (!pendingDecision) return

    setTeams((prev) => {
      const next = prev.map((team) => ({ ...team, owned: [...team.owned], cards: { ...team.cards } }))

      if (pendingDecision.kind === 'claim') {
        const team = next[pendingDecision.teamIndex]
        if (action === 'claim') {
          team.score = clampScore(team.score + pendingDecision.reward)
          if (!team.owned.includes(pendingDecision.tile.id)) team.owned.push(pendingDecision.tile.id)
          setTileLevels((prevLevels) => ({ ...prevLevels, [pendingDecision.tile.id]: 1 }))
          setNotice({
            title: 'Hudud egallandi',
            body: `${team.name} ${pendingDecision.tile.name} ni egalladi va ${pendingDecision.reward} coin oldi.`,
            tone: 'good',
          })
        } else {
          team.score = clampScore(team.score + pendingDecision.reward + 35)
          setNotice({
            title: 'Tez coin olindi',
            body: `${team.name} hududni olmadi, lekin tez mukofot bilan davom etdi.`,
            tone: 'info',
          })
        }
      }

      if (pendingDecision.kind === 'upgrade') {
        const team = next[pendingDecision.teamIndex]
        if (action === 'upgrade' && (team.cards.upgrade > 0 || team.score >= pendingDecision.cost)) {
          const useCard = team.cards.upgrade > 0
          if (useCard) team.cards.upgrade -= 1
          if (!useCard) team.score = clampScore(team.score - pendingDecision.cost)
          setTileLevels((prevLevels) => ({ ...prevLevels, [pendingDecision.tile.id]: pendingDecision.nextLevel }))
          team.score = clampScore(team.score + pendingDecision.reward)
          setNotice({
            title: `Tile level ${pendingDecision.nextLevel}`,
            body: `${team.name} ${pendingDecision.tile.name} ni upgrade qildi.${useCard ? ' Upgrade card ishlatildi.' : ''}`,
            tone: 'good',
          })
        } else {
          team.score = clampScore(team.score + pendingDecision.reward)
          setNotice({
            title: 'Upgrade qilinmadi',
            body: `${team.name} coinni oldi va hududni hozircha upgrade qilmadi.`,
            tone: 'info',
          })
        }
      }

      if (pendingDecision.kind === 'shield') {
        const team = next[pendingDecision.teamIndex]
        const owner = next[pendingDecision.ownerIndex]
        if (action === 'shield' && team.cards.shield > 0) {
          team.cards.shield -= 1
          setNotice({
            title: 'Shield ishlatildi',
            body: `${team.name} shield kartochkasi bilan rentdan qutuldi.`,
            tone: 'good',
          })
        } else {
          team.score = clampScore(team.score - pendingDecision.rent)
          owner.score = clampScore(owner.score + pendingDecision.rent)
          setNotice({
            title: 'Rent to‘landi',
            body: `${team.name} ${pendingDecision.rent} coin rent to‘ladi.`,
            tone: 'bad',
          })
        }
      }

      if (pendingDecision.kind === 'steal') {
        const team = next[pendingDecision.teamIndex]
        const owner = next[pendingDecision.ownerIndex]
        if (action === 'steal' && team.cards.steal > 0) {
          team.cards.steal -= 1
          owner.owned = owner.owned.filter((id) => id !== pendingDecision.tile.id)
          team.owned.push(pendingDecision.tile.id)
          setTileLevels((prevLevels) => ({ ...prevLevels, [pendingDecision.tile.id]: 1 }))
          setNotice({
            title: 'Steal card ishladi',
            body: `${team.name} kartochka bilan ${pendingDecision.tile.name} ni tortib oldi.`,
            tone: 'good',
          })
        } else if (pendingDecision.tile.subject) {
          setPendingDuel({
            tile: pendingDecision.tile,
            challengerIndex: pendingDecision.teamIndex,
            defenderIndex: pendingDecision.ownerIndex,
            question: nextQuestionFor(pendingDecision.tile.subject, questionCursorRef),
          })
          setPhase('duel')
          setTimeLeft(QUESTION_SECONDS)
          return next
        }
      }

      if (!finalizeWinnerIfNeeded(next)) {
        if (action !== 'duel') {
          setPhase('notice')
        }
      }
      return next
    })

    setPendingDecision(null)
  }

  return (
    <main className="min-h-screen bg-[#08111c] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-5 px-4 py-4 lg:flex-row">
        <section className="order-2 flex-1 lg:order-1">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#101b28] shadow-[0_24px_80px_rgba(2,8,23,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)] opacity-60" />

            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">School City Monopoly</p>
                  <h1 className="text-2xl font-black text-white sm:text-3xl">Eng yaxshi ta’limiy jamoaviy monopoly</h1>
              </div>
              <div className="flex items-center gap-2">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    Orqaga
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setPhase('setup')}
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  Qayta sozlash
                </button>
              </div>
            </div>

            <div className="relative aspect-square w-full bg-[#d8e4ff]">
              <img src={monopolyBoardImage} alt="Educational Monopoly Board" className="h-full w-full object-cover" draggable={false} />

              {EDU_MONOPOLY_TILES.map((tile) => {
                const pos = TILE_POSITIONS[tile.id]
                const ownerIndex = findOwnerIndex(teams, tile.id)
                const theme = tileDisplayTone(tile)
                const angle = tileLabelAngle(tile.id)
                const size = tileLabelSize(tile.id)
                const isActive = activeTeam?.position === tile.id && phase !== 'setup'

                return (
                  <div
                    key={`label-${tile.id}`}
                    className="pointer-events-none absolute z-[1]"
                    style={{
                      left: `${pos.left}%`,
                      top: `${pos.top}%`,
                      width: size.width,
                      height: size.height,
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    }}
                  >
                    <div
                      className={`flex h-full w-full flex-col justify-between overflow-hidden rounded-[12px] border px-1.5 py-1 text-center shadow-[0_10px_24px_rgba(15,23,42,0.10)] ${isActive ? 'scale-[1.04]' : ''}`}
                      style={{
                        borderColor: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.16)',
                        background: `linear-gradient(180deg, ${theme.surface}, rgba(255,255,255,0.88))`,
                        boxShadow: isActive ? `0 0 0 2px ${theme.accent}, 0 10px 24px rgba(15,23,42,0.14)` : '0 10px 24px rgba(15,23,42,0.10)',
                      }}
                    >
                      <div className="mx-auto h-1.5 w-full rounded-full" style={{ backgroundColor: theme.accent }} />
                      <p className="mt-1 text-[8px] font-black uppercase leading-tight tracking-[0.12em]" style={{ color: theme.accent }}>
                        {tileMiniText(tile)}
                      </p>
                      <p className="line-clamp-2 text-[8px] font-bold leading-tight text-slate-800">{tileNameCompact(tile.name)}</p>
                      {ownerIndex !== null ? (
                        <div className="mx-auto mt-1 h-2 w-2 rounded-full border border-white" style={{ backgroundColor: teams[ownerIndex]?.color }} />
                      ) : (
                        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-slate-300/70" />
                      )}
                    </div>
                  </div>
                )
              })}

              {EDU_MONOPOLY_TILES.map((tile) => {
                const pos = TILE_POSITIONS[tile.id]
                const ownerIndex = findOwnerIndex(teams, tile.id)
                return (
                  <div
                    key={tile.id}
                    className="pointer-events-none absolute z-[2] flex items-center justify-center"
                    style={{ left: `${pos.left}%`, top: `${pos.top}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {ownerIndex !== null ? (
                      <span
                        className="h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_3px_rgba(7,15,25,0.25)]"
                        style={{ backgroundColor: teams[ownerIndex]?.color ?? '#fff' }}
                      />
                    ) : null}
                  </div>
                )
              })}

              {teams.map((team, index) => {
                const pos = TILE_POSITIONS[team.position]
                const offset = tokenOffset(teams, index)
                return (
                  <div
                    key={team.id}
                    className="absolute z-[3]"
                    style={{
                      left: `calc(${pos.left}% + ${offset.x}px)`,
                      top: `calc(${pos.top}% + ${offset.y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-full border-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.35)] ${activeTeamIndex === index && phase !== 'setup' ? 'scale-110' : ''}`}
                      style={{ backgroundColor: team.color, borderColor: 'rgba(255,255,255,0.9)' }}
                    >
                      {team.id}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="order-1 w-full lg:order-2 lg:w-[420px]">
          <div className="flex h-full flex-col gap-4 rounded-[32px] border border-white/10 bg-[#0f1723] p-5 shadow-[0_22px_70px_rgba(2,8,23,0.35)]">
            {phase === 'setup' ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Best Variant</p>
                  <h2 className="mt-2 text-3xl font-black">School City + Subject Kingdoms</h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    2 jamoa maktab shaharchasi bo‘ylab yuradi, fan savollariga javob berib hudud egallaydi va bilim coin yig‘adi. Birinchi bo‘lib {WIN_SCORE} coin yoki {WIN_OWNED_TILES} tile olgan jamoa g‘olib bo‘ladi.
                  </p>
                </div>

                <div className="space-y-3">
                  {teamNames.map((name, index) => (
                    <label key={index} className="block">
                      <span className="mb-2 block text-sm font-semibold text-white/75">Jamoa {index + 1}</span>
                      <input
                        value={name}
                        onChange={(event) => {
                          const next = [...teamNames]
                          next[index] = event.target.value
                          setTeamNames(next)
                        }}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                      />
                    </label>
                  ))}
                </div>

                <div className="rounded-3xl border border-cyan-300/15 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50/90">
                  Bu versiyada rangli hududlar fan qirolliklari hisoblanadi: matematika, geografiya, tarix, ingliz tili, biologiya, fizika va kimyo. To‘g‘ri javob tile olib beradi, xato javob esa rent, tax yoki bonusni boy beradi.
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/75">
                  <div className="rounded-2xl bg-[#2b7fff]/15 px-3 py-2">Ko‘k: Matematika</div>
                  <div className="rounded-2xl bg-[#2ec27e]/15 px-3 py-2">Yashil: Biologiya</div>
                  <div className="rounded-2xl bg-[#f97316]/15 px-3 py-2">To‘q sariq: Ingliz tili</div>
                  <div className="rounded-2xl bg-[#ef4444]/15 px-3 py-2">Qizil: Tarix</div>
                  <div className="rounded-2xl bg-[#fde047]/15 px-3 py-2 text-slate-900">Sariq: Geografiya</div>
                  <div className="rounded-2xl bg-[#8b5cf6]/15 px-3 py-2">Binafsha: Fizika/Kimyo</div>
                </div>

                <button
                  type="button"
                  onClick={startGame}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-4 text-base font-black text-slate-950 transition hover:brightness-110"
                >
                  O‘yinni boshlash
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {teams.map((team, index) => (
                    <div
                      key={team.id}
                      className={`rounded-3xl border px-4 py-4 ${activeTeamIndex === index ? 'border-white/25 bg-white/10' : 'border-white/10 bg-white/[0.04]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full border border-white/70" style={{ backgroundColor: team.color }} />
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-white/50">{team.id}</p>
                          <h3 className="text-lg font-black">{team.name}</h3>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-2xl bg-black/20 p-3">
                          <span className="block text-white/50">Coin</span>
                          <strong className="text-xl">{team.score}</strong>
                        </div>
                        <div className="rounded-2xl bg-black/20 p-3">
                          <span className="block text-white/50">Tile</span>
                          <strong className="text-xl">{team.owned.length}</strong>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-2xl bg-black/20 p-2 text-center">
                          <span className="block text-white/45">Shield</span>
                          <strong>{team.cards.shield}</strong>
                        </div>
                        <div className="rounded-2xl bg-black/20 p-2 text-center">
                          <span className="block text-white/45">Steal</span>
                          <strong>{team.cards.steal}</strong>
                        </div>
                        <div className="rounded-2xl bg-black/20 p-2 text-center">
                          <span className="block text-white/45">Upgrade</span>
                          <strong>{team.cards.upgrade}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Active Turn</p>
                  <h2 className="mt-2 text-2xl font-black">{activeTeam?.name}</h2>
                  <p className="mt-1 text-sm text-white/65">
                    {activeTile ? `${activeTile.name} ustida turibdi.` : 'Zar tashlashga tayyor.'}
                  </p>
                  {activeTile?.subject ? (
                    <span
                      className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                      style={{
                        color: SUBJECT_THEME[activeTile.subject].text,
                        border: `1px solid ${SUBJECT_THEME[activeTile.subject].accent}66`,
                        background: SUBJECT_THEME[activeTile.subject].surface,
                      }}
                    >
                      {activeTile.subject}
                    </span>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-white/70">{tileRuleText(activeTile, activeTileOwnerName)}</p>

                  {activeTile ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/75">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-white/60">Tile reward</span>
                        <strong className="text-white">{activeTile.reward ?? 0}</strong>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="font-semibold text-white/60">Rent risk</span>
                        <strong className="text-white">{(activeTile.rent ?? 0) + Math.max(0, activeTileLevel - 1) * 40}</strong>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="font-semibold text-white/60">Upgrade level</span>
                        <strong className="text-white">{activeTileLevel}</strong>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={rollDice}
                      disabled={phase !== 'ready'}
                      className="rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 px-5 py-3 text-sm font-black text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Zar tashlash
                    </button>
                    <div className="flex gap-2">
                      {(dice ?? [0, 0]).map((value, index) => (
                        <div key={index} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-black/20 text-lg font-black">
                          {value || '•'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {pendingQuestion ? (
                  <div className="rounded-[28px] border border-cyan-300/15 bg-gradient-to-b from-cyan-400/10 to-slate-900 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">{pendingQuestion.question.subject}</p>
                        <h3 className="mt-2 text-2xl font-black">{pendingQuestion.tile.name}</h3>
                      </div>
                      <div className="rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-center">
                        <span className="block text-[11px] uppercase tracking-[0.16em] text-white/50">Timer</span>
                        <strong className="text-2xl">{timeLeft}s</strong>
                      </div>
                    </div>

                    <p className="mt-4 text-base font-semibold leading-7 text-white/92">{pendingQuestion.question.question}</p>

                    <div className="mt-4 grid gap-3">
                      {pendingQuestion.question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleQuestionResult(option === pendingQuestion.question.answer)}
                          className="rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {pendingDuel ? (
                  <div className="rounded-[28px] border border-fuchsia-300/20 bg-gradient-to-b from-fuchsia-500/10 to-slate-900 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/70">Duel</p>
                        <h3 className="mt-2 text-2xl font-black">{teams[pendingDuel.defenderIndex]?.name} himoyada</h3>
                      </div>
                      <div className="rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-center">
                        <span className="block text-[11px] uppercase tracking-[0.16em] text-white/50">Timer</span>
                        <strong className="text-2xl">{timeLeft}s</strong>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/75">
                      {teams[pendingDuel.challengerIndex]?.name} bu tile uchun duel boshladi. Himoyachi to‘g‘ri javob bersa tile saqlanadi.
                    </p>
                    <p className="mt-4 text-base font-semibold leading-7 text-white/92">{pendingDuel.question.question}</p>
                    <div className="mt-4 grid gap-3">
                      {pendingDuel.question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleDuelResult(option === pendingDuel.question.answer)}
                          className="rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-fuchsia-300/30 hover:bg-fuchsia-300/10"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {pendingDecision ? (
                  <div className="rounded-[28px] border border-amber-300/20 bg-amber-300/10 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-100/70">Strategic Choice</p>
                    <h3 className="mt-2 text-2xl font-black">
                      {pendingDecision.kind === 'claim'
                        ? 'Tile ni egallaysizmi?'
                        : pendingDecision.kind === 'upgrade'
                          ? 'Tile ni upgrade qilasizmi?'
                          : pendingDecision.kind === 'shield'
                            ? 'Shield ishlatasizmi?'
                            : 'Steal yoki duel?'}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {pendingDecision.kind === 'claim'
                        ? `${pendingDecision.tile.name} uchun claim yoki tez coin variantini tanlang.`
                        : pendingDecision.kind === 'upgrade'
                          ? `${pendingDecision.tile.name} ni ${pendingDecision.nextLevel}-darajaga ko‘tarish mumkin.`
                          : pendingDecision.kind === 'shield'
                            ? `${pendingDecision.rent} coin rentdan qutulish uchun shield ishlatishingiz mumkin.`
                            : `${pendingDecision.tile.name} ni steal card bilan darrov olish yoki duel boshlash mumkin.`}
                    </p>
                    <div className="mt-5 grid gap-3">
                      {pendingDecision.kind === 'claim' ? (
                        <>
                          <button type="button" onClick={() => resolveDecision('claim')} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900">
                            Tile ni egallash
                          </button>
                          <button type="button" onClick={() => resolveDecision('coins')} className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm font-black text-white">
                            Faqat coin olish
                          </button>
                        </>
                      ) : null}
                      {pendingDecision.kind === 'upgrade' ? (
                        <>
                          <button type="button" onClick={() => resolveDecision('upgrade')} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900">
                            Upgrade qilish
                          </button>
                          <button type="button" onClick={() => resolveDecision('skip-upgrade')} className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm font-black text-white">
                            Bonus coin olish
                          </button>
                        </>
                      ) : null}
                      {pendingDecision.kind === 'shield' ? (
                        <>
                          <button type="button" onClick={() => resolveDecision('shield')} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900">
                            Shield ishlatish
                          </button>
                          <button type="button" onClick={() => resolveDecision('pay-rent')} className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm font-black text-white">
                            Rent to‘lash
                          </button>
                        </>
                      ) : null}
                      {pendingDecision.kind === 'steal' ? (
                        <>
                          <button type="button" onClick={() => resolveDecision('steal')} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900">
                            Steal card ishlatish
                          </button>
                          <button type="button" onClick={() => resolveDecision('duel')} className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm font-black text-white">
                            Duel ochish
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {notice ? (
                  <div
                    className={`rounded-[28px] border p-5 ${
                      notice.tone === 'good'
                        ? 'border-emerald-300/20 bg-emerald-400/10'
                        : notice.tone === 'bad'
                          ? 'border-rose-300/20 bg-rose-400/10'
                          : 'border-cyan-300/20 bg-cyan-400/10'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">Turn Result</p>
                    <h3 className="mt-2 text-2xl font-black">{notice.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">{notice.body}</p>
                    <button
                      type="button"
                      onClick={() => finishTurn(Boolean(notice.keepTurn))}
                      className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900"
                    >
                      {notice.keepTurn ? 'Yana shu jamoa o‘ynaydi' : 'Keyingi jamoa'}
                    </button>
                  </div>
                ) : null}

                {phase === 'finished' && winnerIndex !== null ? (
                  <div className="rounded-[28px] border border-yellow-300/20 bg-yellow-300/10 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-yellow-100/70">Winner</p>
                    <h3 className="mt-2 text-3xl font-black">{teams[winnerIndex]?.name} g‘olib bo‘ldi</h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      Bu jamoa {teams[winnerIndex]?.score} coin va {teams[winnerIndex]?.owned.length} ta tile bilan marra chizig‘idan o‘tdi.
                    </p>
                    <button
                      type="button"
                      onClick={startGame}
                      className="mt-5 rounded-2xl bg-yellow-300 px-4 py-3 text-sm font-black text-slate-900"
                    >
                      Yangi o‘yin
                    </button>
                  </div>
                ) : null}

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Leaderboard</p>
                      <h3 className="mt-1 text-lg font-black">Joriy holat</h3>
                    </div>
                    <p className="text-xs text-white/55">Win: {WIN_SCORE} coin yoki {WIN_OWNED_TILES} tile</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {leaderboard.map((team, index) => (
                      <div key={team.id} className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-black">{index + 1}</span>
                          <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: team.color }} />
                          <div>
                            <p className="font-bold">{team.name}</p>
                            <p className="text-xs text-white/50">Correct: {team.correctAnswers} | Laps: {team.laps}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className="block text-lg">{team.score}</strong>
                          <span className="text-xs text-white/55">{team.owned.length} tile</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Subject Kingdoms</p>
                  <h3 className="mt-1 text-lg font-black">Fan hududlari progressi</h3>
                  <div className="mt-4 space-y-3">
                    {teams.map((team) => {
                      const subjects = team.owned
                        .map((tileId) => EDU_MONOPOLY_TILES[tileId]?.subject)
                        .filter(Boolean) as EduSubject[]
                      const summary = Object.entries(
                        subjects.reduce<Record<string, number>>((acc, subject) => {
                          acc[subject] = (acc[subject] ?? 0) + 1
                          return acc
                        }, {}),
                      )
                      return (
                        <div key={team.id} className="rounded-2xl bg-black/20 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: team.color }} />
                            <strong>{team.name}</strong>
                          </div>
                          <p className="mt-2 text-sm text-white/65">
                            {summary.length > 0 ? summary.map(([subject, count]) => `${subject} ${count}ta`).join(' • ') : 'Hali fan hududi yo‘q'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Game Mechanics</p>
                  <h3 className="mt-1 text-lg font-black">Strategik elementlar</h3>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                    <p>`Duel`: raqib tileiga tushib savolni topsangiz, himoyachi alohida savol bilan tile ni saqlab qolishga urinadi.</p>
                    <p>`Power cards`: `shield`, `steal`, `upgrade` kartalari chance va chest orqali tushadi.</p>
                    <p>`Tile upgrade`: o‘z hududingizga qaytsangiz, uni level 2-3 ga ko‘tarib rentni oshirasiz.</p>
                    <p>`Subject kingdom bonus`: bir fan hududlari ko‘paygan sari reward ham ortadi.</p>
                    <p>`Corner events`: start, tanaffus, nazorat va go-to-detention endi oddiy katak emas, maxsus event beradi.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}
