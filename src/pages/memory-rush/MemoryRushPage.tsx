import { useEffect, useMemo, useRef, useState } from 'react'
import './MemoryRushPage.css'

type MemoryRushPageProps = {
  onBack: () => void
}

type Difficulty = 'easy' | 'medium' | 'hard'
type GameMode = 'solo' | 'duo'
type DuoStyle = 'same-screen' | 'two-screen'
type RoomRole = 'host' | 'guest' | null

type CardItem = {
  id: number
  value: string
  open: boolean
  matched: boolean
}

type PlayerStats = {
  name: string
  score: number
  matches: number
  streakBest: number
}

type GameSnapshot = {
  screen: 'intro' | 'play' | 'done'
  level: Difficulty
  mode: GameMode
  duoStyle: DuoStyle
  phase: 'preview' | 'active'
  cards: CardItem[]
  timeLeft: number
  previewLeft: number
  moves: number
  lock: boolean
  combo: number
  lives: number
  hints: number
  resultTitle: string
  resultNote: string
  score: number
  streakBest: number
  playerNames: [string, string]
  players: PlayerStats[]
  activePlayer: number
  turnMessage: string
}

type ChannelMessage =
  | { type: 'join-request'; senderId: string }
  | { type: 'snapshot'; senderId: string; snapshot: GameSnapshot }
  | { type: 'action'; senderId: string; action: 'open-card' | 'use-hint'; cardId?: number }

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
  if (level === 'easy') return 8
  if (level === 'medium') return 10
  return 12
}

function getSeconds(level: Difficulty) {
  if (level === 'easy') return 330
  if (level === 'medium') return 290
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
  return shuffle(
    [...values, ...values].map((value, index) => ({
      id: index + 1,
      value,
      open: true,
      matched: false,
    })),
  )
}

function createPlayers(names: [string, string]): PlayerStats[] {
  return names.map((name, index) => ({
    name: name.trim() || `${index + 1}-jamoa`,
    score: 0,
    matches: 0,
    streakBest: 0,
  }))
}

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

function MemoryRushPage({ onBack }: MemoryRushPageProps) {
  const [screen, setScreen] = useState<'intro' | 'play' | 'done'>('intro')
  const [level, setLevel] = useState<Difficulty>('easy')
  const [mode, setMode] = useState<GameMode>('solo')
  const [duoStyle, setDuoStyle] = useState<DuoStyle>('same-screen')
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
  const [playerNames, setPlayerNames] = useState<[string, string]>(['1-jamoa', '2-jamoa'])
  const [players, setPlayers] = useState<PlayerStats[]>(() => createPlayers(['1-jamoa', '2-jamoa']))
  const [activePlayer, setActivePlayer] = useState(0)
  const [turnMessage, setTurnMessage] = useState('')
  const [roomRole, setRoomRole] = useState<RoomRole>(null)
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [connectionNote, setConnectionNote] = useState('')

  const channelRef = useRef<BroadcastChannel | null>(null)
  const clientIdRef = useRef(`mr-${Math.random().toString(36).slice(2, 10)}`)

  const openedIds = useMemo(() => cards.filter((card) => card.open && !card.matched).map((card) => card.id), [cards])
  const allMatched = cards.length > 0 && cards.every((card) => card.matched)
  const matchedCount = cards.filter((card) => card.matched).length / 2
  const pairCount = getPairCount(level)
  const isDuo = mode === 'duo'
  const isTwoScreen = isDuo && duoStyle === 'two-screen'
  const activePlayerName = players[activePlayer]?.name || 'Player'
  const playerSeat = roomRole === 'guest' ? 1 : 0
  const canControlBoard = !isTwoScreen || roomRole !== 'guest'
  const canInteract =
    phase === 'active' &&
    !lock &&
    (!isTwoScreen || activePlayer === playerSeat)

  const buildSnapshot = (): GameSnapshot => ({
    screen,
    level,
    mode,
    duoStyle,
    phase,
    cards,
    timeLeft,
    previewLeft,
    moves,
    lock,
    combo,
    lives,
    hints,
    resultTitle,
    resultNote,
    score,
    streakBest,
    playerNames,
    players,
    activePlayer,
    turnMessage,
  })

  const applySnapshot = (snapshot: GameSnapshot) => {
    setScreen(snapshot.screen)
    setLevel(snapshot.level)
    setMode(snapshot.mode)
    setDuoStyle(snapshot.duoStyle)
    setPhase(snapshot.phase)
    setCards(snapshot.cards)
    setTimeLeft(snapshot.timeLeft)
    setPreviewLeft(snapshot.previewLeft)
    setMoves(snapshot.moves)
    setLock(snapshot.lock)
    setCombo(snapshot.combo)
    setLives(snapshot.lives)
    setHints(snapshot.hints)
    setResultTitle(snapshot.resultTitle)
    setResultNote(snapshot.resultNote)
    setScore(snapshot.score)
    setStreakBest(snapshot.streakBest)
    setPlayerNames(snapshot.playerNames)
    setPlayers(snapshot.players)
    setActivePlayer(snapshot.activePlayer)
    setTurnMessage(snapshot.turnMessage)
  }

  useEffect(() => {
    return () => {
      channelRef.current?.close()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isTwoScreen || !roomCode || typeof BroadcastChannel === 'undefined') {
      return
    }

    channelRef.current?.close()
    const channel = new BroadcastChannel(`memory-rush:${roomCode}`)
    channelRef.current = channel

    channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
      const message = event.data
      if (!message || message.senderId === clientIdRef.current) return

      if (message.type === 'join-request' && roomRole === 'host') {
        channel.postMessage({ type: 'snapshot', senderId: clientIdRef.current, snapshot: buildSnapshot() } satisfies ChannelMessage)
        setConnectionNote('2-ekran ulandi.')
        return
      }

      if (message.type === 'snapshot' && roomRole === 'guest') {
        applySnapshot(message.snapshot)
        setConnectionNote('Host bilan sync qilindi.')
        return
      }

      if (message.type === 'action' && roomRole === 'host') {
        if (message.action === 'open-card' && typeof message.cardId === 'number') {
          setCards((prev) =>
            prev.map((card) => {
              if (card.id !== message.cardId || card.open || card.matched) {
                return card
              }
              return { ...card, open: true }
            }),
          )
          return
        }

        if (message.action === 'use-hint') {
          setHints((prev) => {
            if (prev <= 0 || phase !== 'active' || lock) return prev
            return prev - 1
          })
          setLock(true)
          setCards((prev) => prev.map((card) => (card.matched ? card : { ...card, open: true })))
          window.setTimeout(() => {
            setCards((prev) => prev.map((card) => (card.matched ? card : { ...card, open: false })))
            setLock(false)
          }, 1600)
        }
      }
    }

    if (roomRole === 'guest') {
      channel.postMessage({ type: 'join-request', senderId: clientIdRef.current } satisfies ChannelMessage)
      setConnectionNote('Host kutilyapti...')
    }

    return () => {
      channel.close()
      if (channelRef.current === channel) {
        channelRef.current = null
      }
    }
  }, [isTwoScreen, roomCode, roomRole, phase, lock])

  useEffect(() => {
    if (!isTwoScreen || roomRole !== 'host' || !channelRef.current) {
      return
    }
    channelRef.current.postMessage({
      type: 'snapshot',
      senderId: clientIdRef.current,
      snapshot: buildSnapshot(),
    } satisfies ChannelMessage)
  }, [
    isTwoScreen,
    roomRole,
    screen,
    level,
    mode,
    duoStyle,
    phase,
    cards,
    timeLeft,
    previewLeft,
    moves,
    lock,
    combo,
    lives,
    hints,
    resultTitle,
    resultNote,
    score,
    streakBest,
    playerNames,
    players,
    activePlayer,
    turnMessage,
  ])

  useEffect(() => {
    if (screen !== 'play' || phase !== 'active') return
    if (isTwoScreen && roomRole === 'guest') return

    if (allMatched) {
      if (isDuo) {
        const [first, second] = players
        if (first.score === second.score) {
          setResultTitle('Durang natija')
          setResultNote(`Ikkala jamoa ham ${first.score} ball to'pladi.`)
        } else {
          const winner = first.score > second.score ? first : second
          setResultTitle(`${winner.name} g'olib bo'ldi`)
          setResultNote(`Barcha juftlik topildi. ${winner.score} ball bilan oldinda yakunladi.`)
        }
      } else {
        setResultTitle('Ajoyib! Barcha juftlik topildi')
        setResultNote('Memory Rush master!')
      }
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
  }, [screen, phase, allMatched, isDuo, players, lives, timeLeft, isTwoScreen, roomRole])

  useEffect(() => {
    if (screen !== 'play' || phase !== 'preview') return
    if (isTwoScreen && roomRole === 'guest') return

    if (previewLeft <= 0) {
      setCards((prev) => prev.map((card) => ({ ...card, open: false })))
      setPhase('active')
      return
    }

    const id = window.setTimeout(() => setPreviewLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(id)
  }, [screen, phase, previewLeft, isTwoScreen, roomRole])

  useEffect(() => {
    if (phase !== 'active' || openedIds.length !== 2) return
    if (isTwoScreen && roomRole === 'guest') return

    setLock(true)
    const opened = cards.filter((card) => openedIds.includes(card.id))
    const match = opened[0].value === opened[1].value

    const id = window.setTimeout(() => {
      setCards((prev) =>
        prev.map((card) => {
          if (!openedIds.includes(card.id)) return card
          if (match) return { ...card, open: true, matched: true }
          return { ...card, open: false }
        }),
      )

      setMoves((prev) => prev + 1)

      if (match) {
        const nextCombo = combo + 1
        const bonus = 10 + nextCombo * 2
        setCombo(nextCombo)

        if (isDuo) {
          setPlayers((prev) =>
            prev.map((player, index) =>
              index === activePlayer
                ? {
                    ...player,
                    score: player.score + bonus,
                    matches: player.matches + 1,
                    streakBest: Math.max(player.streakBest, nextCombo),
                  }
                : player,
            ),
          )
          setTurnMessage(`${activePlayerName} juftlik topdi va navbatni saqlab qoldi.`)
        } else {
          setStreakBest((prev) => Math.max(prev, nextCombo))
          setScore((prev) => prev + bonus)
        }
      } else {
        setCombo(0)
        setLives((prev) => Math.max(0, prev - 1))
        if (isDuo) {
          const nextPlayer = activePlayer === 0 ? 1 : 0
          setActivePlayer(nextPlayer)
          setTurnMessage(`Navbat ${players[nextPlayer]?.name || `${nextPlayer + 1}-jamoa`} ga o'tdi.`)
        }
      }

      setLock(false)
    }, 650)

    return () => window.clearTimeout(id)
  }, [phase, openedIds, cards, combo, isDuo, activePlayer, activePlayerName, players, isTwoScreen, roomRole])

  const createRoom = () => {
    const nextRoomCode = generateRoomCode()
    setRoomCode(nextRoomCode)
    setJoinCode(nextRoomCode)
    setRoomRole('host')
    setConnectionNote('Room yaratildi. Ikkinchi ekranda shu code bilan kiring.')
  }

  const joinRoom = () => {
    const normalized = joinCode.trim().toUpperCase()
    if (!normalized) {
      setConnectionNote('Room code kiriting.')
      return
    }
    setRoomCode(normalized)
    setRoomRole('guest')
    setConnectionNote('Roomga ulanilyapti...')
  }

  const resetBoard = () => {
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
    setPlayers(createPlayers(playerNames))
    setActivePlayer(0)
    setTurnMessage(isDuo ? `${playerNames[0].trim() || '1-jamoa'} birinchi bo'lib boshlaydi.` : '')
    setResultTitle('')
    setResultNote('')
  }

  const start = () => {
    resetBoard()
    setScreen('play')
  }

  const openCard = (id: number) => {
    if (!canInteract) return
    if (openedIds.length >= 2) return

    if (isTwoScreen && roomRole === 'guest') {
      channelRef.current?.postMessage({
        type: 'action',
        senderId: clientIdRef.current,
        action: 'open-card',
        cardId: id,
      } satisfies ChannelMessage)
      return
    }

    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id || card.open || card.matched) return card
        return { ...card, open: true }
      }),
    )
  }

  const useHint = () => {
    if (!canInteract || hints <= 0) return

    if (isTwoScreen && roomRole === 'guest') {
      channelRef.current?.postMessage({
        type: 'action',
        senderId: clientIdRef.current,
        action: 'use-hint',
      } satisfies ChannelMessage)
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

  const statusText =
    phase === 'preview'
      ? `Eslab qoling: ${previewLeft}s`
      : isDuo
        ? turnMessage || `${activePlayerName} yurishi`
        : 'Juftliklarni toping!'

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
          <div className="mr-mode-switch">
            <button type="button" className={mode === 'solo' ? 'active' : ''} onClick={() => setMode('solo')}>1 kishilik</button>
            <button type="button" className={mode === 'duo' ? 'active' : ''} onClick={() => setMode('duo')}>2 kishilik</button>
          </div>
          <div className="mr-levels">
            <button type="button" className={level === 'easy' ? 'active' : ''} onClick={() => setLevel('easy')}>Oson</button>
            <button type="button" className={level === 'medium' ? 'active' : ''} onClick={() => setLevel('medium')}>O&apos;rta</button>
            <button type="button" className={level === 'hard' ? 'active' : ''} onClick={() => setLevel('hard')}>Qiyin</button>
          </div>
          {isDuo ? (
            <>
              <div className="mr-mode-switch">
                <button type="button" className={duoStyle === 'same-screen' ? 'active' : ''} onClick={() => setDuoStyle('same-screen')}>
                  Bitta ekran
                </button>
                <button type="button" className={duoStyle === 'two-screen' ? 'active' : ''} onClick={() => setDuoStyle('two-screen')}>
                  2 ta ekran
                </button>
              </div>
              <div className="mr-team-form">
                <label>
                  <span>1-jamoa nomi</span>
                  <input
                    type="text"
                    value={playerNames[0]}
                    onChange={(event) => setPlayerNames([event.target.value, playerNames[1]])}
                    placeholder="1-jamoa"
                  />
                </label>
                <label>
                  <span>2-jamoa nomi</span>
                  <input
                    type="text"
                    value={playerNames[1]}
                    onChange={(event) => setPlayerNames([playerNames[0], event.target.value])}
                    placeholder="2-jamoa"
                  />
                </label>
              </div>
              {duoStyle === 'two-screen' ? (
                <div className="mr-room">
                  <div className="mr-room-card">
                    <p className="mr-room-title">1-ekran: Host</p>
                    {roomRole === 'host' && roomCode ? <p className="mr-room-code">{roomCode}</p> : null}
                    <button type="button" className="mr-start" onClick={createRoom}>
                      {roomRole === 'host' && roomCode ? 'Yangi room yaratish' : 'Room yaratish'}
                    </button>
                    <button type="button" className="mr-start mr-secondary" onClick={start} disabled={roomRole !== 'host' || !roomCode}>
                      Sync o&apos;yinni boshlash
                    </button>
                  </div>
                  <div className="mr-room-card">
                    <p className="mr-room-title">2-ekran: Ulanish</p>
                    <input
                      className="mr-room-input"
                      type="text"
                      value={joinCode}
                      onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                      placeholder="Room code"
                    />
                    <button type="button" className="mr-start" onClick={joinRoom}>
                      Roomga kirish
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
          {!isDuo || duoStyle === 'same-screen' ? (
            <button type="button" className="mr-start" onClick={start}>Boshlash</button>
          ) : null}
          {connectionNote ? <p className="mr-connection-note">{connectionNote}</p> : null}
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
            {isDuo ? (
              <>
                <p>{players[0]?.name}: <strong>{players[0]?.score ?? 0}</strong> ball • {players[0]?.matches ?? 0} juftlik</p>
                <p>{players[1]?.name}: <strong>{players[1]?.score ?? 0}</strong> ball • {players[1]?.matches ?? 0} juftlik</p>
              </>
            ) : (
              <p>Ball: <strong>{score}</strong> • Eng yaxshi combo: <strong>x{streakBest}</strong></p>
            )}
            {isTwoScreen && roomRole === 'host' ? (
              <button type="button" className="mr-start" onClick={start}>Yana o&apos;ynash</button>
            ) : !isTwoScreen ? (
              <button type="button" className="mr-start" onClick={start}>Yana o&apos;ynash</button>
            ) : null}
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
          <div>{isDuo ? 'Navbat' : 'Ball'} <strong>{isDuo ? activePlayerName : score}</strong></div>
          <div>Combo <strong>x{combo}</strong></div>
          <div>Jon <strong>{'❤️'.repeat(lives) || '—'}</strong></div>
        </div>
        {isDuo ? (
          <div className="mr-players">
            {players.map((player, index) => (
              <article key={`${player.name}-${index}`} className={index === activePlayer ? 'mr-player active' : 'mr-player'}>
                <p>{player.name}</p>
                <strong>{player.score} ball</strong>
                <span>{player.matches} juftlik • best x{player.streakBest}</span>
              </article>
            ))}
          </div>
        ) : null}
        <div className="mr-tools">
          <button type="button" onClick={useHint} disabled={hints <= 0 || !canInteract || !canControlBoard}>
            Hint ({hints})
          </button>
          <p>{statusText}</p>
        </div>
        {isTwoScreen ? (
          <p className="mr-connection-note">
            Room: <strong>{roomCode}</strong> • Siz: <strong>{playerSeat === 0 ? players[0]?.name : players[1]?.name}</strong>
          </p>
        ) : null}
        <div className={level === 'hard' ? 'mr-grid hard' : level === 'medium' ? 'mr-grid medium' : 'mr-grid easy'}>
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={card.open || card.matched ? 'mr-card open' : 'mr-card'}
              onClick={() => openCard(card.id)}
              disabled={card.open || card.matched || !canInteract}
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
