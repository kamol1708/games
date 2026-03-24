import { getRequiredDifficulty, pickQuestion } from './questionBank'
import type {
  EventLogItem,
  GameState,
  Question,
  QuestionType,
  Settings,
  SetupForm,
  Subject,
  TeamRunState,
} from './types'

export const PRIZE_LADDER = [100, 200, 300, 500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000, 125_000, 250_000, 500_000, 1_000_000]
const SAFE_STEPS = new Set([5, 10])

export const DEFAULT_SETTINGS: Settings = {
  teamCount: 2,
  gradeBand: '8-9',
  enabledSubjects: {
    math: true,
    english: true,
    science: true,
    history: true,
    geography: true,
  },
  timerEnabled: true,
  timerSeconds: 25,
  negativeMarking: false,
  buzzerMode: false,
  buzzerWrongAllowsRebuzz: false,
  allowPass: true,
  passPenalty: 100,
  timeoutBehavior: 'WRONG',
  wrongAnswerPolicy: 'ELIMINATE',
  lifelineMode: 'PER_TEAM',
  sharedLifelinesUsed: {
    fiftyFifty: false,
    askAudience: false,
    phoneFriend: false,
  },
  enableTrueFalse: false,
  enableNumeric: true,
  showExplanationAfterReveal: true,
  teacherPinEnabled: true,
  teacherPin: '1234',
  winMode: 'FIRST_MILLION',
  totalQuestionsLimit: 30,
  bestOfRounds: 3,
}

const now = () => new Date().toLocaleTimeString('en-GB', { hour12: false })

const diffBias = {
  easy: [55, 80],
  medium: [40, 65],
  hard: [25, 55],
} as const

function logItem(text: string): EventLogItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: now(),
    text,
  }
}

function initialTeam(setup: SetupForm, index: number): TeamRunState {
  return {
    id: `team-${index + 1}`,
    name: setup.teamNames[index] || `Team ${index + 1}`,
    color: setup.teamColors[index],
    currentQuestionIndex: 0,
    currentWinnings: 0,
    safeMilestoneWinnings: 0,
    lifelinesUsed: {
      fiftyFifty: false,
      askAudience: false,
      phoneFriend: false,
    },
    eliminated: false,
    reentryCooldown: 0,
    roundsWon: 0,
  }
}

function getEnabledSubjects(settings: Settings): Subject[] {
  return (Object.keys(settings.enabledSubjects) as Subject[]).filter((s) => settings.enabledSubjects[s])
}

function getEnabledTypes(settings: Settings): QuestionType[] {
  const types: QuestionType[] = ['mcq']
  if (settings.enableNumeric) types.push('numeric')
  return types
}

function nextTeamIndex(teams: TeamRunState[], currentIndex: number): number {
  const total = teams.length
  for (let i = 1; i <= total; i += 1) {
    const idx = (currentIndex + i) % total
    const t = teams[idx]
    if (!t) continue
    if (!t.eliminated && t.reentryCooldown <= 0) return idx
  }
  return currentIndex
}

function updateCooldowns(teams: TeamRunState[]) {
  return teams.map((t) => ({ ...t, reentryCooldown: Math.max(0, t.reentryCooldown - 1) }))
}

function computeAudiencePoll(correctIndex: number, difficulty: 'easy' | 'medium' | 'hard'): [number, number, number, number] {
  const [minCorrect, maxCorrect] = diffBias[difficulty]
  const correct = Math.floor(Math.random() * (maxCorrect - minCorrect + 1)) + minCorrect
  const rest = 100 - correct
  const wrongIdx = [0, 1, 2, 3].filter((i) => i !== correctIndex)
  const a = Math.floor(Math.random() * (rest + 1))
  const b = Math.floor(Math.random() * (rest - a + 1))
  const c = rest - a - b
  const map: [number, number, number, number] = [0, 0, 0, 0]
  map[correctIndex] = correct
  map[wrongIdx[0] ?? 0] = a
  map[wrongIdx[1] ?? 1] = b
  map[wrongIdx[2] ?? 2] = c
  return map
}

function computeFriendHint(correctIndex: number, difficulty: 'easy' | 'medium' | 'hard') {
  const [minCorrect, maxCorrect] = diffBias[difficulty]
  const confidence = Math.floor((minCorrect + maxCorrect) / 2)
  const chanceCorrect = confidence / 100
  const givesCorrect = Math.random() <= chanceCorrect
  if (givesCorrect) {
    return { optionIndex: correctIndex, confidence }
  }
  const wrong = [0, 1, 2, 3].filter((i) => i !== correctIndex)
  return { optionIndex: wrong[Math.floor(Math.random() * wrong.length)] ?? 0, confidence: Math.max(20, confidence - 20) }
}

function selectQuestion(state: GameState, activeTeamId: string): { question: Question | null; usedQuestionIds: string[] } {
  const team = state.teams.find((t) => t.id === activeTeamId)
  if (!team) return { question: null, usedQuestionIds: state.usedQuestionIds }
  const step = Math.min(team.currentQuestionIndex + 1, PRIZE_LADDER.length)
  const requiredDifficulty = getRequiredDifficulty(step)
  const q = pickQuestion({
    usedQuestionIds: state.usedQuestionIds,
    gradeBand: state.settings.gradeBand,
    enabledSubjects: getEnabledSubjects(state.settings),
    requiredDifficulty,
    enabledTypes: getEnabledTypes(state.settings),
  })
  if (!q) return { question: null, usedQuestionIds: state.usedQuestionIds }
  return {
    question: q,
    usedQuestionIds: [...state.usedQuestionIds, q.id],
  }
}

function evaluateWin(state: GameState): GameState {
  const maxScore = Math.max(...state.teams.map((t) => t.currentWinnings))
  const hasMillion = state.teams.find((t) => t.currentWinnings >= 1_000_000)

  if (state.settings.winMode === 'FIRST_MILLION' && hasMillion) {
    return {
      ...state,
      phase: 'GAME_END',
      winnerTeamId: hasMillion.id,
      winnerReason: `${hasMillion.name} 1,000,000 ga yetdi!`,
      stats: {
        ...state.stats,
        bestTeamScore: Math.max(state.stats.bestTeamScore, maxScore),
      },
      logs: [logItem(`${hasMillion.name} 1,000,000 ni oldi`), ...state.logs].slice(0, 200),
    }
  }

  if (state.settings.winMode === 'HIGHEST_AFTER_N' && state.questionCounter >= state.settings.totalQuestionsLimit) {
    const sorted = [...state.teams].sort((a, b) => b.currentWinnings - a.currentWinnings)
    const top = sorted[0]
    return {
      ...state,
      phase: 'GAME_END',
      winnerTeamId: top?.id ?? null,
      winnerReason: `${state.settings.totalQuestionsLimit} savoldan keyin eng yuqori summa`,
      stats: {
        ...state.stats,
        bestTeamScore: Math.max(state.stats.bestTeamScore, maxScore),
      },
    }
  }

  if (state.settings.winMode === 'BEST_OF_ROUNDS' && hasMillion) {
    const teams = state.teams.map((t) =>
      t.id === hasMillion.id
        ? {
            ...t,
            roundsWon: t.roundsWon + 1,
          }
        : t,
    )
    const updatedWinner = teams.find((t) => t.id === hasMillion.id)
    if ((updatedWinner?.roundsWon ?? 0) >= state.settings.bestOfRounds) {
      return {
        ...state,
        teams,
        phase: 'GAME_END',
        winnerTeamId: hasMillion.id,
        winnerReason: `${hasMillion.name} Best-of-${state.settings.bestOfRounds} ni yutdi`,
        stats: {
          ...state.stats,
          bestTeamScore: Math.max(state.stats.bestTeamScore, maxScore),
        },
      }
    }

    const resetTeams = teams.map((t) => ({
      ...t,
      currentQuestionIndex: 0,
      currentWinnings: 0,
      safeMilestoneWinnings: 0,
      eliminated: false,
      reentryCooldown: 0,
      lifelinesUsed: { fiftyFifty: false, askAudience: false, phoneFriend: false },
    }))

    return {
      ...state,
      teams: resetTeams,
      phase: 'ROUND_END',
      logs: [logItem(`${hasMillion.name} round yutdi. Keyingi round boshlanadi.`), ...state.logs].slice(0, 200),
    }
  }

  return {
    ...state,
    stats: {
      ...state.stats,
      bestTeamScore: Math.max(state.stats.bestTeamScore, maxScore),
    },
  }
}

export function createInitialState(settings: Settings = DEFAULT_SETTINGS): GameState {
  return {
    phase: 'SETUP',
    settings,
    teams: [],
    activeTeamId: null,
    buzzedTeamId: null,
    currentQuestion: null,
    usedQuestionIds: [],
    hiddenOptionIndexes: [],
    selectedOptionIndex: null,
    answerRevealed: false,
    isCorrect: null,
    timerLeft: settings.timerSeconds,
    timerPaused: false,
    pauseReason: 'none',
    audiencePoll: null,
    friendSuggestion: null,
    logs: [logItem('Million Quiz initialized')],
    questionCounter: 0,
    cycleTurnCounter: 0,
    winnerTeamId: null,
    winnerReason: null,
    teacherVerified: false,
    lastAnswerTeamId: null,
    lastAnswerCorrect: null,
    stats: {
      totalQuestionsAsked: 0,
      bestTeamScore: 0,
    },
  }
}

export type Action =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'START_GAME'; payload: SetupForm }
  | { type: 'NEXT_QUESTION' }
  | { type: 'BUZZ_IN'; payload: string }
  | { type: 'SET_TIMER'; payload: number }
  | { type: 'TIMEOUT' }
  | { type: 'SELECT_OPTION'; payload: number }
  | { type: 'CONFIRM_OPTION' }
  | { type: 'SUBMIT_NUMERIC'; payload: number }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'ROUND_NEXT_TEAM' }
  | { type: 'USE_5050' }
  | { type: 'USE_AUDIENCE' }
  | { type: 'USE_FRIEND' }
  | { type: 'CLOSE_LIFELINE_MODAL' }
  | { type: 'PASS' }
  | { type: 'WALK_AWAY' }
  | { type: 'TEACHER_VERIFY'; payload: string }
  | { type: 'TEACHER_LOGOUT' }
  | { type: 'TEACHER_SKIP' }
  | { type: 'TEACHER_FORCE_CORRECT' }
  | { type: 'TEACHER_FORCE_WRONG' }
  | { type: 'TEACHER_ADJUST_MONEY'; payload: { teamId: string; delta: number } }
  | { type: 'TEACHER_SWITCH_TEAM'; payload: string }
  | { type: 'TEACHER_TOGGLE_EXPLANATION'; payload: boolean }
  | { type: 'RESET_GAME' }

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.payload }
      return { ...state, settings }
    }

    case 'START_GAME': {
      const teamCount = action.payload.teamCount
      const teams = Array.from({ length: teamCount }).map((_, i) => initialTeam(action.payload, i))
      const activeTeamId = teams[0]?.id ?? null
      const seeded: GameState = {
        ...state,
        phase: 'QUESTION',
        teams,
        activeTeamId,
        buzzedTeamId: null,
        currentQuestion: null,
        usedQuestionIds: [],
        hiddenOptionIndexes: [],
        selectedOptionIndex: null,
        answerRevealed: false,
        isCorrect: null,
        timerLeft: state.settings.timerSeconds,
        timerPaused: false,
        pauseReason: 'none' as const,
        audiencePoll: null,
        friendSuggestion: null,
        questionCounter: 0,
        cycleTurnCounter: 0,
        winnerTeamId: null,
        winnerReason: null,
        teacherVerified: !state.settings.teacherPinEnabled,
        stats: {
          ...state.stats,
          totalQuestionsAsked: 0,
        },
        logs: [logItem('New game started'), ...state.logs].slice(0, 200),
      }
      const picked = selectQuestion(seeded, activeTeamId ?? teams[0]?.id ?? '')
      return {
        ...seeded,
        currentQuestion: picked.question,
        usedQuestionIds: picked.usedQuestionIds,
      }
    }

    case 'BUZZ_IN': {
      if (state.phase !== 'QUESTION') return state
      const team = state.teams.find((t) => t.id === action.payload)
      if (!team || team.eliminated) return state
      if (state.settings.buzzerMode && state.buzzedTeamId) return state
      return {
        ...state,
        activeTeamId: team.id,
        buzzedTeamId: team.id,
        logs: [logItem(`${team.name} birinchi bosdi`), ...state.logs].slice(0, 200),
      }
    }

    case 'NEXT_QUESTION': {
      if (state.phase === 'GAME_END' || !state.activeTeamId) return state
      const picked = selectQuestion(state, state.activeTeamId)
      return {
        ...state,
        phase: 'QUESTION',
        buzzedTeamId: null,
        currentQuestion: picked.question,
        usedQuestionIds: picked.usedQuestionIds,
        hiddenOptionIndexes: [],
        selectedOptionIndex: null,
        answerRevealed: false,
        isCorrect: null,
        timerLeft: state.settings.timerSeconds,
        timerPaused: false,
        pauseReason: 'none',
        audiencePoll: null,
        friendSuggestion: null,
      }
    }

    case 'SET_TIMER': {
      return { ...state, timerLeft: Math.max(0, action.payload) }
    }

    case 'TIMEOUT': {
      if (!state.settings.timerEnabled || state.phase === 'GAME_END' || state.phase === 'REVEAL') return state
      if (state.settings.timeoutBehavior === 'PASS_NEXT') {
        const currentIndex = state.teams.findIndex((t) => t.id === state.activeTeamId)
        const cooled = updateCooldowns(state.teams)
        const nextIndex = nextTeamIndex(cooled, currentIndex < 0 ? 0 : currentIndex)
        const nextTeam = cooled[nextIndex]
        const picked = selectQuestion({ ...state, teams: cooled }, nextTeam?.id ?? state.activeTeamId ?? '')
        return {
          ...state,
          teams: cooled,
          activeTeamId: nextTeam?.id ?? state.activeTeamId,
          phase: 'QUESTION',
          currentQuestion: picked.question,
          usedQuestionIds: picked.usedQuestionIds,
          timerLeft: state.settings.timerSeconds,
          hiddenOptionIndexes: [],
          selectedOptionIndex: null,
          answerRevealed: false,
          isCorrect: null,
          logs: [logItem('Vaqt tugadi. Navbat keyingi jamoaga o‘tdi.'), ...state.logs].slice(0, 200),
        }
      }
      return gameReducer(state, { type: 'TEACHER_FORCE_WRONG' })
    }

    case 'SELECT_OPTION': {
      if (state.phase !== 'QUESTION') return state
      if (state.settings.buzzerMode && !state.buzzedTeamId) return state
      return {
        ...state,
        selectedOptionIndex: action.payload,
        phase: 'LOCKED',
      }
    }

    case 'CONFIRM_OPTION': {
      if (!state.currentQuestion || state.selectedOptionIndex === null || state.phase !== 'LOCKED') return state
      const isCorrect = state.selectedOptionIndex === state.currentQuestion.correctIndex
      const teams = [...state.teams]
      const idx = teams.findIndex((t) => t.id === state.activeTeamId)
      if (idx < 0) return state
      const team = { ...teams[idx] }

      if (isCorrect) {
        const nextStep = Math.min(team.currentQuestionIndex + 1, PRIZE_LADDER.length)
        team.currentQuestionIndex = nextStep
        team.currentWinnings = PRIZE_LADDER[nextStep - 1] ?? team.currentWinnings
        if (SAFE_STEPS.has(nextStep)) {
          team.safeMilestoneWinnings = team.currentWinnings
        }
        teams[idx] = team
        const next = evaluateWin({
          ...state,
          teams,
          phase: 'REVEAL',
          answerRevealed: true,
          isCorrect: true,
          timerPaused: true,
          pauseReason: 'none',
          lastAnswerTeamId: team.id,
          lastAnswerCorrect: true,
          questionCounter: state.questionCounter + 1,
          stats: {
            ...state.stats,
            totalQuestionsAsked: state.stats.totalQuestionsAsked + 1,
          },
          logs: [logItem(`${team.name} to‘g‘ri javob berdi`), ...state.logs].slice(0, 200),
        })
        return next
      }

      team.currentWinnings = team.safeMilestoneWinnings
      if (state.settings.negativeMarking) {
        team.currentWinnings = Math.max(0, team.currentWinnings - 100)
      }
      team.eliminated = true
      team.reentryCooldown = 0
      teams[idx] = team

      const activeTeams = teams.filter((t) => !t.eliminated)

      if (activeTeams.length > 0) {
        return {
          ...state,
          teams,
          phase: 'REVEAL',
          answerRevealed: true,
          isCorrect: false,
          timerPaused: true,
          pauseReason: 'none',
          winnerTeamId: null,
          winnerReason: null,
          lastAnswerTeamId: team.id,
          lastAnswerCorrect: false,
          questionCounter: state.questionCounter + 1,
          stats: {
            ...state.stats,
            totalQuestionsAsked: state.stats.totalQuestionsAsked + 1,
          },
          logs: [logItem(`${team.name} noto‘g‘ri javob berdi`), ...state.logs].slice(0, 200),
        }
      }

      const sorted = [...teams].sort((a, b) => b.currentWinnings - a.currentWinnings)
      const top = sorted[0] ?? null

      return {
        ...state,
        teams,
        phase: 'GAME_END',
        answerRevealed: true,
        isCorrect: false,
        timerPaused: true,
        pauseReason: 'none',
        winnerTeamId: top?.id ?? null,
        winnerReason: `Faol jamoa qolmadi. O'yin tugadi.`,
        lastAnswerTeamId: team.id,
        lastAnswerCorrect: false,
        questionCounter: state.questionCounter + 1,
        stats: {
          ...state.stats,
          totalQuestionsAsked: state.stats.totalQuestionsAsked + 1,
        },
        logs: [logItem(`${team.name} noto‘g‘ri javob berdi`), ...state.logs].slice(0, 200),
      }
    }

    case 'SUBMIT_NUMERIC': {
      if (state.phase !== 'QUESTION' || !state.currentQuestion || state.currentQuestion.type !== 'numeric') return state
      if (state.settings.buzzerMode && !state.buzzedTeamId) return state
      return {
        ...state,
        selectedOptionIndex: action.payload === state.currentQuestion.numericAnswer ? state.currentQuestion.correctIndex : -1,
        phase: 'LOCKED',
      }
    }

    case 'REVEAL_ANSWER': {
      if (!state.currentQuestion) return state
      return {
        ...state,
        phase: 'REVEAL',
        answerRevealed: true,
        timerPaused: true,
      }
    }

    case 'ROUND_NEXT_TEAM': {
      if (!state.teams.length) return state
      if (state.settings.buzzerMode) {
        const resetState: GameState = {
          ...state,
          phase: 'QUESTION',
          buzzedTeamId: null,
          hiddenOptionIndexes: [],
          selectedOptionIndex: null,
          answerRevealed: false,
          isCorrect: null,
          timerLeft: state.settings.timerSeconds,
          timerPaused: false,
          pauseReason: 'none' as const,
          audiencePoll: null,
          friendSuggestion: null,
        }
        const picked = selectQuestion(resetState, resetState.activeTeamId ?? resetState.teams[0]?.id ?? '')
        return {
          ...resetState,
          currentQuestion: picked.question,
          usedQuestionIds: picked.usedQuestionIds,
        }
      }

      const currentIndex = state.teams.findIndex((t) => t.id === state.activeTeamId)
      const cooled = updateCooldowns(state.teams)
      const nextIndex = nextTeamIndex(cooled, currentIndex < 0 ? 0 : currentIndex)
      const nextTeam = cooled[nextIndex]
      const activeTeamId = nextTeam?.id ?? state.activeTeamId
      const resetState: GameState = {
        ...state,
        teams: cooled,
        activeTeamId,
        buzzedTeamId: null,
        phase: 'QUESTION',
        hiddenOptionIndexes: [],
        selectedOptionIndex: null,
        answerRevealed: false,
        isCorrect: null,
        timerLeft: state.settings.timerSeconds,
        timerPaused: false,
        pauseReason: 'none' as const,
        audiencePoll: null,
        friendSuggestion: null,
        cycleTurnCounter: state.cycleTurnCounter + 1,
      }
      const picked = selectQuestion(resetState, activeTeamId ?? '')
      return {
        ...resetState,
        currentQuestion: picked.question,
        usedQuestionIds: picked.usedQuestionIds,
      }
    }

    case 'USE_5050': {
      if (!state.currentQuestion || state.phase !== 'QUESTION') return state
      const canUseShared = state.settings.lifelineMode === 'SHARED' && !state.settings.sharedLifelinesUsed.fiftyFifty
      const teamIndex = state.teams.findIndex((t) => t.id === state.activeTeamId)
      if (teamIndex < 0) return state
      const team = state.teams[teamIndex] as TeamRunState
      const canUseTeam = state.settings.lifelineMode === 'PER_TEAM' && !team.lifelinesUsed.fiftyFifty
      if (!canUseShared && !canUseTeam) return state

      const wrongOptions = [0, 1, 2, 3].filter((i) => i !== state.currentQuestion?.correctIndex)
      const shuffled = wrongOptions.sort(() => Math.random() - 0.5)
      const hidden = shuffled.slice(0, 2)

      const teams = [...state.teams]
      if (state.settings.lifelineMode === 'PER_TEAM') {
        teams[teamIndex] = {
          ...team,
          lifelinesUsed: {
            ...team.lifelinesUsed,
            fiftyFifty: true,
          },
        }
      }

      return {
        ...state,
        teams,
        hiddenOptionIndexes: hidden,
        settings:
          state.settings.lifelineMode === 'SHARED'
            ? {
                ...state.settings,
                sharedLifelinesUsed: { ...state.settings.sharedLifelinesUsed, fiftyFifty: true },
              }
            : state.settings,
        logs: [logItem(`${team.name} 50:50 lifeline ishlatdi`), ...state.logs].slice(0, 200),
      }
    }

    case 'USE_AUDIENCE': {
      if (!state.currentQuestion || state.phase !== 'QUESTION') return state
      const teamIndex = state.teams.findIndex((t) => t.id === state.activeTeamId)
      if (teamIndex < 0) return state
      const team = state.teams[teamIndex] as TeamRunState
      const canUseShared = state.settings.lifelineMode === 'SHARED' && !state.settings.sharedLifelinesUsed.askAudience
      const canUseTeam = state.settings.lifelineMode === 'PER_TEAM' && !team.lifelinesUsed.askAudience
      if (!canUseShared && !canUseTeam) return state

      const poll = computeAudiencePoll(state.currentQuestion.correctIndex, state.currentQuestion.difficulty)
      const teams = [...state.teams]
      if (state.settings.lifelineMode === 'PER_TEAM') {
        teams[teamIndex] = {
          ...team,
          lifelinesUsed: { ...team.lifelinesUsed, askAudience: true },
        }
      }

      return {
        ...state,
        teams,
        audiencePoll: poll,
        timerPaused: true,
        pauseReason: 'audience',
        settings:
          state.settings.lifelineMode === 'SHARED'
            ? {
                ...state.settings,
                sharedLifelinesUsed: { ...state.settings.sharedLifelinesUsed, askAudience: true },
              }
            : state.settings,
        logs: [logItem(`${team.name} Ask the Audience ishlatdi`), ...state.logs].slice(0, 200),
      }
    }

    case 'USE_FRIEND': {
      if (!state.currentQuestion || state.phase !== 'QUESTION') return state
      const teamIndex = state.teams.findIndex((t) => t.id === state.activeTeamId)
      if (teamIndex < 0) return state
      const team = state.teams[teamIndex] as TeamRunState
      const canUseShared = state.settings.lifelineMode === 'SHARED' && !state.settings.sharedLifelinesUsed.phoneFriend
      const canUseTeam = state.settings.lifelineMode === 'PER_TEAM' && !team.lifelinesUsed.phoneFriend
      if (!canUseShared && !canUseTeam) return state

      const suggestion = computeFriendHint(state.currentQuestion.correctIndex, state.currentQuestion.difficulty)
      const teams = [...state.teams]
      if (state.settings.lifelineMode === 'PER_TEAM') {
        teams[teamIndex] = {
          ...team,
          lifelinesUsed: { ...team.lifelinesUsed, phoneFriend: true },
        }
      }

      return {
        ...state,
        teams,
        friendSuggestion: suggestion,
        timerPaused: true,
        pauseReason: 'friend',
        settings:
          state.settings.lifelineMode === 'SHARED'
            ? {
                ...state.settings,
                sharedLifelinesUsed: { ...state.settings.sharedLifelinesUsed, phoneFriend: true },
              }
            : state.settings,
        logs: [logItem(`${team.name} Phone a Friend ishlatdi`), ...state.logs].slice(0, 200),
      }
    }

    case 'CLOSE_LIFELINE_MODAL': {
      return {
        ...state,
        timerPaused: false,
        pauseReason: 'none',
        audiencePoll: null,
        friendSuggestion: null,
      }
    }

    case 'PASS': {
      if (!state.settings.allowPass || !state.activeTeamId) return state
      const teams = [...state.teams]
      const idx = teams.findIndex((t) => t.id === state.activeTeamId)
      if (idx < 0) return state
      const team = { ...teams[idx] }
      team.currentWinnings = Math.max(0, team.currentWinnings - state.settings.passPenalty)
      teams[idx] = team

      const currentIndex = idx
      const cooled = updateCooldowns(teams)
      const nextIndex = nextTeamIndex(cooled, currentIndex)
      const nextTeam = cooled[nextIndex]
      const picked = selectQuestion({ ...state, teams: cooled }, nextTeam?.id ?? '')

      return {
        ...state,
        teams: cooled,
        activeTeamId: nextTeam?.id ?? state.activeTeamId,
        phase: 'QUESTION',
        currentQuestion: picked.question,
        usedQuestionIds: picked.usedQuestionIds,
        timerLeft: state.settings.timerSeconds,
        hiddenOptionIndexes: [],
        selectedOptionIndex: null,
        answerRevealed: false,
        isCorrect: null,
        logs: [logItem(`${team.name} pass qildi (-$${state.settings.passPenalty})`), ...state.logs].slice(0, 200),
      }
    }

    case 'WALK_AWAY': {
      if (!state.activeTeamId) return state
      const teams = state.teams.map((t) =>
        t.id === state.activeTeamId
          ? {
              ...t,
              safeMilestoneWinnings: Math.max(t.safeMilestoneWinnings, t.currentWinnings),
            }
          : t,
      )
      const currentIndex = teams.findIndex((t) => t.id === state.activeTeamId)
      const cooled = updateCooldowns(teams)
      const nextIndex = nextTeamIndex(cooled, currentIndex)
      const nextTeam = cooled[nextIndex]
      const picked = selectQuestion({ ...state, teams: cooled }, nextTeam?.id ?? '')

      return {
        ...state,
        teams: cooled,
        activeTeamId: nextTeam?.id ?? state.activeTeamId,
        phase: 'QUESTION',
        currentQuestion: picked.question,
        usedQuestionIds: picked.usedQuestionIds,
        logs: [logItem('Walk Away tanlandi'), ...state.logs].slice(0, 200),
      }
    }

    case 'TEACHER_VERIFY': {
      const ok = action.payload === state.settings.teacherPin
      return {
        ...state,
        teacherVerified: ok,
        logs: [logItem(ok ? 'Teacher panel unlocked' : 'Teacher PIN xato'), ...state.logs].slice(0, 200),
      }
    }

    case 'TEACHER_LOGOUT': {
      return { ...state, teacherVerified: false }
    }

    case 'TEACHER_SKIP': {
      return gameReducer({
        ...state,
        logs: [logItem('Teacher: question skipped'), ...state.logs].slice(0, 200),
      }, { type: 'ROUND_NEXT_TEAM' })
    }

    case 'TEACHER_FORCE_CORRECT': {
      if (!state.currentQuestion) return state
      const forced = {
        ...state,
        selectedOptionIndex: state.currentQuestion.correctIndex,
        phase: 'LOCKED' as const,
        logs: [logItem('Teacher: force correct'), ...state.logs].slice(0, 200),
      }
      return gameReducer(forced, { type: 'CONFIRM_OPTION' })
    }

    case 'TEACHER_FORCE_WRONG': {
      if (!state.currentQuestion) return state
      const wrong = [0, 1, 2, 3].find((idx) => idx !== state.currentQuestion?.correctIndex) ?? 0
      const forced = {
        ...state,
        selectedOptionIndex: wrong,
        phase: 'LOCKED' as const,
        logs: [logItem('Teacher: force wrong'), ...state.logs].slice(0, 200),
      }
      return gameReducer(forced, { type: 'CONFIRM_OPTION' })
    }

    case 'TEACHER_ADJUST_MONEY': {
      const teams = state.teams.map((t) =>
        t.id === action.payload.teamId
          ? {
              ...t,
              currentWinnings: Math.max(0, t.currentWinnings + action.payload.delta),
            }
          : t,
      )
      return {
        ...state,
        teams,
        logs: [logItem(`Teacher: ${action.payload.delta >= 0 ? '+' : ''}${action.payload.delta} pul`), ...state.logs].slice(0, 200),
      }
    }

    case 'TEACHER_SWITCH_TEAM': {
      return {
        ...state,
        activeTeamId: action.payload,
        phase: 'QUESTION',
        logs: [logItem('Teacher: active team switched'), ...state.logs].slice(0, 200),
      }
    }

    case 'TEACHER_TOGGLE_EXPLANATION': {
      return {
        ...state,
        settings: {
          ...state.settings,
          showExplanationAfterReveal: action.payload,
        },
      }
    }

    case 'RESET_GAME': {
      return {
        ...createInitialState(state.settings),
        logs: [logItem('Game reset'), ...state.logs].slice(0, 200),
      }
    }

    default:
      return state
  }
}
