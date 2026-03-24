import { GRAMMAR_BANK, SPELLING_SOURCE, UNSCRAMBLE_BANK, VOCAB_BANK } from '../data/questions'
import type {
  ActivePuzzle,
  BoxCell,
  BoxKind,
  Difficulty,
  GameLogItem,
  GameSession,
  PuzzleQuestion,
  RoundCount,
  SetupConfig,
  Team,
} from '../types/game'

const BOX_LABELS: Record<BoxKind, string> = {
  word_puzzle: 'Word Puzzle',
  sentence_fix: 'Sentence Fix',
  vocab_match: 'Vocab Match',
  spelling_challenge: 'Spelling Challenge',
  bonus: 'Bonus',
  double_points: 'Double Points',
  bomb: 'Bomb',
}

const PUZZLE_KINDS: BoxKind[] = ['word_puzzle', 'sentence_fix', 'vocab_match', 'spelling_challenge']

const shuffle = <T,>(arr: T[]): T[] => {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

const uid = () => Math.random().toString(36).slice(2, 10)

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/[.!?]+$/g, '').replace(/\s+/g, ' ')
}

function makeBoxes(): BoxCell[] {
  const kinds: BoxKind[] = [
    'bomb', 'bomb', 'bomb',
    'bonus', 'bonus',
    'double_points', 'double_points',
    'word_puzzle', 'word_puzzle', 'word_puzzle', 'word_puzzle',
    'sentence_fix', 'sentence_fix', 'sentence_fix',
    'vocab_match', 'vocab_match', 'vocab_match',
    'spelling_challenge', 'spelling_challenge', 'spelling_challenge',
  ]

  return shuffle(kinds).map((kind, index) => ({
    id: index + 1,
    kind,
    opened: false,
    resolved: false,
    title: BOX_LABELS[kind],
  }))
}

function teamFromName(name: string, idx: number): Team {
  return {
    id: `team-${idx + 1}-${uid()}`,
    name: name.trim() || `Team ${idx + 1}`,
    points: 0,
    nextDouble: false,
  }
}

export function createNewSession(config: SetupConfig): GameSession {
  const teams = config.teamNames.slice(0, config.teamCount).map(teamFromName)
  return {
    teams,
    difficulty: config.difficulty,
    roundCount: config.roundCount,
    turnIndex: 0,
    turnNumber: 1,
    boxes: makeBoxes(),
    activePuzzle: null,
    gameOver: false,
    winnerTeamIds: [],
    logs: [{ id: uid(), message: 'O‘yin boshlandi', at: Date.now() }],
    projectorMode: false,
    usedQuestionIds: [],
  }
}

export function addLog(session: GameSession, message: string): GameSession {
  const logs: GameLogItem[] = [{ id: uid(), message, at: Date.now() }, ...session.logs].slice(0, 25)
  return { ...session, logs }
}

function nextTurnMeta(session: GameSession) {
  const nextTurnNumber = session.turnNumber + 1
  const nextIndex = (session.turnIndex + 1) % session.teams.length
  return { nextTurnNumber, nextIndex }
}

function computeWinnerIds(teams: Team[]) {
  const max = Math.max(...teams.map((t) => t.points))
  return teams.filter((t) => t.points === max).map((t) => t.id)
}

function maybeGameOver(session: GameSession): GameSession {
  const openedCount = session.boxes.filter((b) => b.opened).length
  if (session.turnNumber > session.roundCount || openedCount === session.boxes.length) {
    return {
      ...session,
      gameOver: true,
      activePuzzle: null,
      winnerTeamIds: computeWinnerIds(session.teams),
    }
  }
  return session
}

export function advanceTurn(session: GameSession): GameSession {
  const { nextTurnNumber, nextIndex } = nextTurnMeta(session)
  return maybeGameOver({ ...session, turnIndex: nextIndex, turnNumber: nextTurnNumber, activePuzzle: null })
}

function pickUnused<T extends { id: string; difficulty: Difficulty }>(items: T[], difficulty: Difficulty, used: string[]): T {
  const filtered = items.filter((q) => q.difficulty === difficulty)
  const preferred = filtered.filter((q) => !used.includes(q.id))
  const pool = preferred.length ? preferred : filtered
  return pool[Math.floor(Math.random() * pool.length)]
}

export function buildQuestionForBox(kind: BoxKind, difficulty: Difficulty, usedQuestionIds: string[]): PuzzleQuestion | undefined {
  if (kind === 'word_puzzle') {
    return pickUnused(UNSCRAMBLE_BANK, difficulty, usedQuestionIds)
  }
  if (kind === 'sentence_fix') {
    return pickUnused(GRAMMAR_BANK, difficulty, usedQuestionIds)
  }
  if (kind === 'vocab_match') {
    return pickUnused(VOCAB_BANK, difficulty, usedQuestionIds)
  }
  if (kind === 'spelling_challenge') {
    const source = pickUnused(SPELLING_SOURCE, difficulty, usedQuestionIds)
    return {
      type: 'spelling_challenge',
      id: source.id,
      difficulty: source.difficulty,
      prompt: `Type this word correctly: ${source.answer}`,
      answer: source.answer,
    }
  }
  return undefined
}

export function openBox(session: GameSession, boxId: number): GameSession {
  if (session.gameOver || session.activePuzzle) return session
  const box = session.boxes.find((b) => b.id === boxId)
  if (!box || box.opened) return session
  const activeTeam = session.teams[session.turnIndex]
  const boxes = session.boxes.map((b) => (b.id === boxId ? { ...b, opened: true } : b))

  if (box.kind === 'bonus') {
    const teams = session.teams.map((t, idx) => (idx === session.turnIndex ? { ...t, points: t.points + 20 } : t))
    return advanceTurn(addLog({ ...session, boxes, teams }, `${activeTeam.name} BONUS oldi (+20)`))
  }

  if (box.kind === 'double_points') {
    const teams = session.teams.map((t, idx) => (idx === session.turnIndex ? { ...t, nextDouble: true } : t))
    return advanceTurn(addLog({ ...session, boxes, teams }, `${activeTeam.name} DOUBLE POINTS oldi (keyingi savol x2)`))
  }

  if (box.kind === 'bomb') {
    const teams = session.teams.map((t, idx) => (idx === session.turnIndex ? { ...t, points: Math.max(0, t.points - 15) } : t))
    const activePuzzle: ActivePuzzle = {
      boxId,
      teamId: activeTeam.id,
      startedAt: Date.now(),
      timeLeft: 15,
      revealAnswer: false,
      resolved: false,
      bomb: true,
    }
    return addLog({ ...session, boxes, teams, activePuzzle }, `${activeTeam.name} bomba topdi (-15)`)
  }

  const question = buildQuestionForBox(box.kind, session.difficulty, session.usedQuestionIds)
  if (!question) return session

  const activePuzzle: ActivePuzzle = {
    boxId,
    teamId: activeTeam.id,
    startedAt: Date.now(),
    timeLeft: 15,
    revealAnswer: false,
    resolved: false,
    question,
  }

  return { ...session, boxes, activePuzzle, usedQuestionIds: [...session.usedQuestionIds, question.id] }
}

export function setPuzzleTime(session: GameSession, timeLeft: number): GameSession {
  if (!session.activePuzzle) return session
  return { ...session, activePuzzle: { ...session.activePuzzle, timeLeft } }
}

export function revealPuzzleAnswer(session: GameSession): GameSession {
  if (!session.activePuzzle) return session
  return { ...session, activePuzzle: { ...session.activePuzzle, revealAnswer: true } }
}

function markBoxResolved(boxes: BoxCell[], boxId: number) {
  return boxes.map((b) => (b.id === boxId ? { ...b, resolved: true } : b))
}

function awardAnswer(teams: Team[], turnIndex: number, correct: boolean, fast: boolean) {
  return teams.map((team, idx) => {
    if (idx !== turnIndex) return team
    const multiplier = team.nextDouble ? 2 : 1
    if (!correct) {
      return { ...team, points: Math.max(0, team.points - 5), nextDouble: false }
    }
    const base = 10 * multiplier
    const bonus = fast ? 5 : 0
    return { ...team, points: team.points + base + bonus, nextDouble: false }
  })
}

export function submitPuzzleAnswer(session: GameSession, rawAnswer: string): GameSession {
  const puzzle = session.activePuzzle
  if (!puzzle || !puzzle.question || puzzle.resolved) return session
  const q = puzzle.question
  const answerText = rawAnswer.trim()
  const normalizedInput = normalizeText(answerText)
  const normalizedExpected = normalizeText(
    q.type === 'sentence_fix' ? q.corrected : q.type === 'vocab_match' ? q.answer : q.answer,
  )
  const correct = normalizedInput === normalizedExpected
  const elapsedSec = Math.floor((Date.now() - puzzle.startedAt) / 1000)
  const fast = correct && elapsedSec < 10
  const teams = awardAnswer(session.teams, session.turnIndex, correct, fast)
  const boxes = markBoxResolved(session.boxes, puzzle.boxId)
  const activeTeam = session.teams[session.turnIndex]
  const logMsg = correct
    ? `${activeTeam.name} to‘g‘ri javob berdi (+${(fast ? 15 : 10) * (activeTeam.nextDouble ? 2 : 1) / (activeTeam.nextDouble ? 2 : 1)}${fast ? ' + fast bonus' : ''})`
    : `${activeTeam.name} noto‘g‘ri javob berdi (-5)`

  const next = addLog({ ...session, teams, boxes, activePuzzle: { ...puzzle, resolved: true } }, logMsg)
  return advanceTurn({ ...next, activePuzzle: null })
}

export function forceMarkPuzzle(session: GameSession, correct: boolean): GameSession {
  const puzzle = session.activePuzzle
  if (!puzzle || !puzzle.question) return session
  const teams = awardAnswer(session.teams, session.turnIndex, correct, false)
  const boxes = markBoxResolved(session.boxes, puzzle.boxId)
  const activeTeam = session.teams[session.turnIndex]
  const next = addLog(
    { ...session, teams, boxes, activePuzzle: null },
    `${activeTeam.name}: teacher override (${correct ? 'to‘g‘ri' : 'noto‘g‘ri'})`,
  )
  return advanceTurn(next)
}

export function skipPuzzle(session: GameSession): GameSession {
  if (!session.activePuzzle) return session
  const boxes = markBoxResolved(session.boxes, session.activePuzzle.boxId)
  const activeTeam = session.teams[session.turnIndex]
  return advanceTurn(addLog({ ...session, boxes, activePuzzle: null }, `${activeTeam.name}: savol skip qilindi`))
}

export function closeBombModal(session: GameSession): GameSession {
  if (!session.activePuzzle?.bomb) return session
  const boxes = markBoxResolved(session.boxes, session.activePuzzle.boxId)
  return advanceTurn({ ...session, boxes, activePuzzle: null })
}

export function tickPuzzle(session: GameSession): GameSession {
  const puzzle = session.activePuzzle
  if (!puzzle || puzzle.bomb || puzzle.resolved) return session
  const timeLeft = Math.max(0, 15 - Math.floor((Date.now() - puzzle.startedAt) / 1000))
  if (timeLeft === puzzle.timeLeft) return session
  const next = setPuzzleTime(session, timeLeft)
  if (timeLeft > 0) return next
  return forceMarkPuzzle(next, false)
}

export function toggleProjectorMode(session: GameSession): GameSession {
  return { ...session, projectorMode: !session.projectorMode }
}
