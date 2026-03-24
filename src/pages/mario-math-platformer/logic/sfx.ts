// @ts-nocheck
let audioCtx: AudioContext | null = null

function getCtx() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

function tone(freq: number, duration = 0.1, type: OscillatorType = 'sine', volume = 0.03, when = 0) {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const startAt = ctx.currentTime + when
  const endAt = startAt + duration

  osc.type = type
  osc.frequency.setValueAtTime(freq, startAt)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startAt)
  osc.stop(endAt + 0.01)
}

export function playCoinSfx() {
  tone(880, 0.05, 'triangle', 0.03)
  tone(1175, 0.06, 'triangle', 0.025, 0.03)
}

export function playJumpSfx() {
  tone(300, 0.05, 'square', 0.02)
  tone(420, 0.05, 'square', 0.02, 0.03)
}

export function playCorrectSfx() {
  tone(520, 0.08, 'triangle', 0.03)
  tone(660, 0.08, 'triangle', 0.03, 0.06)
  tone(880, 0.12, 'triangle', 0.035, 0.12)
}

export function playWrongSfx() {
  tone(220, 0.12, 'sawtooth', 0.028)
  tone(180, 0.16, 'sawtooth', 0.026, 0.08)
}

export function playGateOpenSfx() {
  tone(440, 0.06, 'square', 0.025)
  tone(660, 0.08, 'square', 0.03, 0.05)
  tone(990, 0.1, 'square', 0.03, 0.11)
}

export function playPauseToggleSfx(paused: boolean) {
  if (paused) {
    tone(480, 0.05, 'square', 0.02)
    tone(360, 0.07, 'square', 0.02, 0.05)
  } else {
    tone(360, 0.05, 'square', 0.02)
    tone(520, 0.08, 'square', 0.02, 0.04)
  }
}

export function playFinishLevelSfx(finalRun = false) {
  if (finalRun) {
    tone(523, 0.08, 'triangle', 0.025)
    tone(659, 0.08, 'triangle', 0.025, 0.07)
    tone(784, 0.1, 'triangle', 0.03, 0.14)
    tone(1046, 0.18, 'triangle', 0.035, 0.24)
    return
  }
  tone(523, 0.08, 'triangle', 0.025)
  tone(659, 0.08, 'triangle', 0.025, 0.07)
  tone(784, 0.14, 'triangle', 0.03, 0.14)
}
