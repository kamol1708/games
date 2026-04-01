export const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function sample<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}
