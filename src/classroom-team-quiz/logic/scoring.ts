import type { Team } from './types'

export function scoreForAnswer(team: Team, basePoints: number, correct: boolean, negativeMarking: boolean, isDouble: boolean) {
  const multiplier = isDouble ? 2 : 1
  const points = basePoints * multiplier

  if (correct) {
    const nextStreak = team.streak + 1
    const comboBonus = nextStreak > 0 && nextStreak % 3 === 0 ? 50 : 0
    return {
      ...team,
      score: team.score + points + comboBonus,
      streak: nextStreak,
      reachedConfetti: team.reachedConfetti || team.score + points + comboBonus >= 2000,
    }
  }

  return {
    ...team,
    score: negativeMarking ? team.score - points : team.score,
    streak: 0,
    reachedConfetti: team.reachedConfetti,
  }
}
