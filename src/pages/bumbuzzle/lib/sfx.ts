let audioCtx: AudioContext | null = null

function ctx() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

function tone(freq: number, duration = 0.08, type: OscillatorType = 'sine', volume = 0.025, when = 0) {
  const c = ctx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  const start = c.currentTime + when
  const end = start + duration
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc.stop(end + 0.01)
}

export function playBumbuzzleCorrect() {
  tone(620, 0.07, 'triangle', 0.03)
  tone(820, 0.09, 'triangle', 0.03, 0.06)
}

export function playBumbuzzleWrong() {
  tone(220, 0.12, 'sawtooth', 0.025)
  tone(180, 0.14, 'sawtooth', 0.02, 0.08)
}

export function playBumbuzzleBomb() {
  tone(120, 0.12, 'square', 0.03)
  tone(90, 0.18, 'square', 0.028, 0.06)
  tone(70, 0.2, 'square', 0.02, 0.14)
}

export function playBumbuzzleBonus() {
  tone(720, 0.06, 'triangle', 0.028)
  tone(980, 0.07, 'triangle', 0.024, 0.05)
  tone(1240, 0.08, 'triangle', 0.022, 0.1)
}

export function playBumbuzzleWin() {
  tone(523, 0.08, 'triangle', 0.024)
  tone(659, 0.08, 'triangle', 0.024, 0.07)
  tone(784, 0.1, 'triangle', 0.028, 0.14)
  tone(1046, 0.16, 'triangle', 0.03, 0.24)
}
