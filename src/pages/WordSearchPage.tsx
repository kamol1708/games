import { useEffect, useMemo, useState } from 'react'
import './WordSearchPage.css'
import { useTeacherItems } from '../lib/useTeacherItems'

type Cell = {
  row: number
  col: number
}

type Placement = {
  word: string
  cells: Cell[]
}

type Puzzle = {
  grid: string[][]
  placements: Placement[]
}

type WordSearchPageProps = {
  onBack: () => void
}

const GRID_SIZE = 10
const ROUND_DURATION_SECONDS = 3 * 60
const WORDS = ['KITOB', 'MAKTAB', 'USTOZ', 'BILIM', 'QALAM', 'DAFTAR', 'OYIN', 'ZEHN']
const DIRECTIONS: Array<[number, number]> = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(list: T[]): T[] {
  const clone = [...list]
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    const temp = clone[i]
    clone[i] = clone[j]
    clone[j] = temp
  }
  return clone
}

function keyOf(cell: Cell) {
  return `${cell.row}-${cell.col}`
}

function buildPuzzle(customWords: string[] = []): Puzzle {
  const words = shuffle([...WORDS, ...customWords]).slice(0, 10)

  for (let tryCount = 0; tryCount < 45; tryCount += 1) {
    const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ''))
    const placements: Placement[] = []
    let failed = false

    for (const word of words) {
      let placed = false

      for (let attempt = 0; attempt < 250 && !placed; attempt += 1) {
        const [dr, dc] = DIRECTIONS[randomInt(0, DIRECTIONS.length - 1)]
        const startRow = randomInt(0, GRID_SIZE - 1)
        const startCol = randomInt(0, GRID_SIZE - 1)
        const cells: Cell[] = []

        for (let i = 0; i < word.length; i += 1) {
          const row = startRow + dr * i
          const col = startCol + dc * i
          cells.push({ row, col })
        }

        const inBounds = cells.every((cell) => cell.row >= 0 && cell.row < GRID_SIZE && cell.col >= 0 && cell.col < GRID_SIZE)
        if (!inBounds) {
          continue
        }

        const canWrite = cells.every((cell, index) => {
          const ch = grid[cell.row][cell.col]
          return ch === '' || ch === word[index]
        })
        if (!canWrite) {
          continue
        }

        cells.forEach((cell, index) => {
          grid[cell.row][cell.col] = word[index]
        })
        placements.push({ word, cells })
        placed = true
      }

      if (!placed) {
        failed = true
        break
      }
    }

    if (failed) {
      continue
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (!grid[row][col]) {
          grid[row][col] = alphabet[randomInt(0, alphabet.length - 1)]
        }
      }
    }

    return { grid, placements }
  }

  return {
    grid: Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => 'A')),
    placements: [],
  }
}

function buildWordCellMap(placements: Placement[]) {
  const map = new Map<string, Set<string>>()
  placements.forEach((item) => {
    map.set(item.word, new Set(item.cells.map((cell) => keyOf(cell))))
  })
  return map
}

function buildFoundCellSet(foundWords: string[], wordCellMap: Map<string, Set<string>>) {
  const all = new Set<string>()
  foundWords.forEach((word) => {
    const cellSet = wordCellMap.get(word)
    cellSet?.forEach((cellKey) => all.add(cellKey))
  })
  return all
}

function getLine(start: Cell, end: Cell): Cell[] | null {
  const rowDelta = end.row - start.row
  const colDelta = end.col - start.col
  if (rowDelta === 0 && colDelta === 0) {
    return [start]
  }

  let stepRow = 0
  let stepCol = 0

  if (rowDelta === 0) {
    stepCol = colDelta > 0 ? 1 : -1
  } else if (colDelta === 0) {
    stepRow = rowDelta > 0 ? 1 : -1
  } else if (Math.abs(rowDelta) === Math.abs(colDelta)) {
    stepRow = rowDelta > 0 ? 1 : -1
    stepCol = colDelta > 0 ? 1 : -1
  } else {
    return null
  }

  const length = Math.max(Math.abs(rowDelta), Math.abs(colDelta))
  return Array.from({ length: length + 1 }, (_, index) => ({
    row: start.row + stepRow * index,
    col: start.col + stepCol * index,
  }))
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function WordSearchPage({ onBack }: WordSearchPageProps) {
  const [teamA, setTeamA] = useState('1-Jamoa')
  const [teamB, setTeamB] = useState('2-Jamoa')
  const teacherItems = useTeacherItems<unknown>('word-search')
  const teacherWords = useMemo(() => {
    const normalized = teacherItems
      .map((item) => (typeof item === 'string' ? item.trim().toUpperCase() : ''))
      .filter((word) => /^[A-Z]+$/.test(word) && word.length >= 3 && word.length <= GRID_SIZE)
    return Array.from(new Set(normalized)).slice(0, 20)
  }, [teacherItems])

  const [puzzleA, setPuzzleA] = useState<Puzzle>(() => buildPuzzle(teacherWords))
  const [puzzleB, setPuzzleB] = useState<Puzzle>(() => buildPuzzle(teacherWords))

  const [startCellA, setStartCellA] = useState<Cell | null>(null)
  const [startCellB, setStartCellB] = useState<Cell | null>(null)
  const [hoverCellA, setHoverCellA] = useState<Cell | null>(null)
  const [hoverCellB, setHoverCellB] = useState<Cell | null>(null)

  const [foundWordsA, setFoundWordsA] = useState<string[]>([])
  const [foundWordsB, setFoundWordsB] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS)

  const wordCellMapA = useMemo(() => buildWordCellMap(puzzleA.placements), [puzzleA.placements])
  const wordCellMapB = useMemo(() => buildWordCellMap(puzzleB.placements), [puzzleB.placements])

  const foundCellSetA = useMemo(() => buildFoundCellSet(foundWordsA, wordCellMapA), [foundWordsA, wordCellMapA])
  const foundCellSetB = useMemo(() => buildFoundCellSet(foundWordsB, wordCellMapB), [foundWordsB, wordCellMapB])

  const previewCellsA = useMemo(() => {
    if (!startCellA) {
      return new Set<string>()
    }
    if (!hoverCellA) {
      return new Set<string>([keyOf(startCellA)])
    }
    const line = getLine(startCellA, hoverCellA)
    if (!line) {
      return new Set<string>([keyOf(startCellA)])
    }
    return new Set<string>(line.map((cell) => keyOf(cell)))
  }, [startCellA, hoverCellA])

  const previewCellsB = useMemo(() => {
    if (!startCellB) {
      return new Set<string>()
    }
    if (!hoverCellB) {
      return new Set<string>([keyOf(startCellB)])
    }
    const line = getLine(startCellB, hoverCellB)
    if (!line) {
      return new Set<string>([keyOf(startCellB)])
    }
    return new Set<string>(line.map((cell) => keyOf(cell)))
  }, [startCellB, hoverCellB])

  const scoreA = foundWordsA.length
  const scoreB = foundWordsB.length
  const completedA = foundWordsA.length === puzzleA.placements.length && puzzleA.placements.length > 0
  const completedB = foundWordsB.length === puzzleB.placements.length && puzzleB.placements.length > 0
  const timeUp = timeLeft <= 0
  const winnerTeam = completedA ? 0 : completedB ? 1 : null
  const gameLocked = winnerTeam !== null || timeUp

  const leaderLabel = useMemo(() => {
    if (scoreA === scoreB) {
      return 'Durrang'
    }
    return scoreA > scoreB ? teamA : teamB
  }, [scoreA, scoreB, teamA, teamB])

  const finishLabel = useMemo(() => {
    if (winnerTeam === 0) return `${teamA} g'olib!`
    if (winnerTeam === 1) return `${teamB} g'olib!`
    if (timeUp) {
      if (scoreA === scoreB) return "Vaqt tugadi. Durrang!"
      return scoreA > scoreB ? `Vaqt tugadi. ${teamA} g'olib!` : `Vaqt tugadi. ${teamB} g'olib!`
    }
    return ''
  }, [winnerTeam, timeUp, scoreA, scoreB, teamA, teamB])

  const resetPuzzle = () => {
    setPuzzleA(buildPuzzle(teacherWords))
    setPuzzleB(buildPuzzle(teacherWords))
    setFoundWordsA([])
    setFoundWordsB([])
    setStartCellA(null)
    setStartCellB(null)
    setHoverCellA(null)
    setHoverCellB(null)
    setTimeLeft(ROUND_DURATION_SECONDS)
  }

  useEffect(() => {
    if (gameLocked) {
      return
    }
    const id = window.setTimeout(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [timeLeft, gameLocked])

  const handleCellClick = (teamIndex: 0 | 1, cell: Cell) => {
    if (gameLocked) {
      return
    }
    if (teamIndex === 0) {
      if (completedA) {
        return
      }
      if (!startCellA) {
        setStartCellA(cell)
        setHoverCellA(cell)
        return
      }

      const line = getLine(startCellA, cell)
      if (!line || line.length < 2) {
        setStartCellA(cell)
        setHoverCellA(cell)
        return
      }

      const lineKeys = new Set(line.map((item) => keyOf(item)))
      const matched = puzzleA.placements.find((placement) => {
        if (foundWordsA.includes(placement.word)) {
          return false
        }
        const target = wordCellMapA.get(placement.word)
        if (!target || target.size !== lineKeys.size) {
          return false
        }
        for (const key of target) {
          if (!lineKeys.has(key)) {
            return false
          }
        }
        return true
      })

      if (matched) {
        setFoundWordsA((prev) => [...prev, matched.word])
      }
      setStartCellA(null)
      setHoverCellA(null)
      return
    }

    if (completedB) {
      return
    }
    if (!startCellB) {
      setStartCellB(cell)
      setHoverCellB(cell)
      return
    }

    const line = getLine(startCellB, cell)
    if (!line || line.length < 2) {
      setStartCellB(cell)
      setHoverCellB(cell)
      return
    }

    const lineKeys = new Set(line.map((item) => keyOf(item)))
    const matched = puzzleB.placements.find((placement) => {
      if (foundWordsB.includes(placement.word)) {
        return false
      }
      const target = wordCellMapB.get(placement.word)
      if (!target || target.size !== lineKeys.size) {
        return false
      }
      for (const key of target) {
        if (!lineKeys.has(key)) {
          return false
        }
      }
      return true
    })

    if (matched) {
      setFoundWordsB((prev) => [...prev, matched.word])
    }
    setStartCellB(null)
    setHoverCellB(null)
  }

  const winnerName = useMemo(() => {
    if (winnerTeam === 0) return teamA
    if (winnerTeam === 1) return teamB
    if (timeUp) {
      if (scoreA === scoreB) return null
      return scoreA > scoreB ? teamA : teamB
    }
    return null
  }, [winnerTeam, timeUp, scoreA, scoreB, teamA, teamB])

  const showResultModal = winnerTeam !== null || timeUp

  return (
    <main className="ws-page">
      <section className="ws-shell">
        <header className="ws-head">
          <button type="button" className="ws-back" onClick={onBack}>Orqaga</button>
          <h1>So&apos;z qidiruv o&apos;yini (2 jamoa)</h1>
          <div className="ws-head-actions">
            <div className={`ws-timer${timeLeft <= 60 ? ' is-danger' : ''}`} aria-live="polite">
              ⏱ {formatTimer(timeLeft)}
            </div>
            <button type="button" className="ws-reset" onClick={resetPuzzle}>Yangilash</button>
          </div>
        </header>

        <p className="ws-tip">
          Endi har bir jamoaning alohida harflar to&apos;plami bor.
          Har jamoa o&apos;z maydonida so&apos;zlarni topadi.
        </p>

        <section className="ws-score">
          <div className="ws-team-score team-a">
            <input value={teamA} onChange={(event) => setTeamA(event.target.value)} aria-label="1-jamoa nomi" />
            <strong>{scoreA} ball</strong>
          </div>
          <div className="ws-leader">Lider: <b>{leaderLabel}</b></div>
          <div className="ws-team-score team-b">
            <input value={teamB} onChange={(event) => setTeamB(event.target.value)} aria-label="2-jamoa nomi" />
            <strong>{scoreB} ball</strong>
          </div>
        </section>

        <section className="ws-boards">
          <article className="ws-board team-a">
            <h2>{teamA}</h2>
            <div className="ws-grid-wrap">
              <div className="ws-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {puzzleA.grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`
                    const selected = previewCellsA.has(cellKey)
                    const found = foundCellSetA.has(cellKey)
                    return (
                      <button
                        key={`a-${cellKey}`}
                        type="button"
                        className={`ws-cell${found ? ' is-team-a' : ''}${selected ? ' is-selected' : ''}`}
                        disabled={found || gameLocked}
                        onClick={() => handleCellClick(0, { row: rowIndex, col: colIndex })}
                        onMouseEnter={() => {
                          if (!gameLocked && !found && startCellA) {
                            setHoverCellA({ row: rowIndex, col: colIndex })
                          }
                        }}
                      >
                        {letter}
                      </button>
                    )
                  }),
                )}
              </div>
            </div>

            <aside className="ws-sidebar">
              <h3>So&apos;zlar</h3>
              <ul>
                {puzzleA.placements.map((item) => (
                  <li key={`a-${item.word}`} className={foundWordsA.includes(item.word) ? 'done team-a' : ''}>
                    {item.word}
                  </li>
                ))}
              </ul>
              <p className="ws-progress">
                Topildi: <strong>{foundWordsA.length}</strong> / {puzzleA.placements.length}
              </p>
            </aside>
          </article>

          <article className="ws-board team-b">
            <h2>{teamB}</h2>
            <div className="ws-grid-wrap">
              <div className="ws-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {puzzleB.grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`
                    const selected = previewCellsB.has(cellKey)
                    const found = foundCellSetB.has(cellKey)
                    return (
                      <button
                        key={`b-${cellKey}`}
                        type="button"
                        className={`ws-cell${found ? ' is-team-b' : ''}${selected ? ' is-selected' : ''}`}
                        disabled={found || gameLocked}
                        onClick={() => handleCellClick(1, { row: rowIndex, col: colIndex })}
                        onMouseEnter={() => {
                          if (!gameLocked && !found && startCellB) {
                            setHoverCellB({ row: rowIndex, col: colIndex })
                          }
                        }}
                      >
                        {letter}
                      </button>
                    )
                  }),
                )}
              </div>
            </div>

            <aside className="ws-sidebar">
              <h3>So&apos;zlar</h3>
              <ul>
                {puzzleB.placements.map((item) => (
                  <li key={`b-${item.word}`} className={foundWordsB.includes(item.word) ? 'done team-b' : ''}>
                    {item.word}
                  </li>
                ))}
              </ul>
              <p className="ws-progress">
                Topildi: <strong>{foundWordsB.length}</strong> / {puzzleB.placements.length}
              </p>
            </aside>
          </article>
        </section>

        {finishLabel ? <p className="ws-win">{finishLabel}</p> : null}
      </section>

      {showResultModal ? (
        <div className="ws-modal-overlay" role="presentation">
          <div className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-result-title">
            <p className="ws-modal-tag">Game Finished</p>
            <h2 id="ws-result-title">
              {winnerName ? `${winnerName} g'olib bo'ldi!` : "Durrang"}
            </h2>
            <p className="ws-modal-text">
              {winnerName ? 'Tabriklaymiz! 🎉' : "Ikkala jamoa ham bir xil natija ko'rsatdi."}
            </p>
            <p className="ws-modal-score">
              {teamA}: {scoreA} | {teamB}: {scoreB}
            </p>
            <div className="ws-modal-actions">
              <button type="button" className="ws-reset" onClick={resetPuzzle}>Qayta boshlash</button>
              <button type="button" className="ws-back" onClick={onBack}>Games sahifasi</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default WordSearchPage
