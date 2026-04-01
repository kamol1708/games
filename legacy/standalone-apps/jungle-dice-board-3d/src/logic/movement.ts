import { TILE_COUNT } from '../game/constants'

export function computeTargetStep(current: number, dice: number, exactRoll: boolean) {
  const proposed = current + dice
  if (exactRoll && proposed > TILE_COUNT) return current
  return Math.min(TILE_COUNT, proposed)
}

export async function animateStepMovement(params: {
  fromStep: number
  toStep: number
  setStep: (step: number) => void
  delayMs: number
}) {
  const { fromStep, toStep, setStep, delayMs } = params
  if (fromStep === toStep) return
  const dir = fromStep < toStep ? 1 : -1
  let step = fromStep
  while (step !== toStep) {
    step += dir
    setStep(step)
    await new Promise<void>((resolve) => window.setTimeout(resolve, delayMs))
  }
}
