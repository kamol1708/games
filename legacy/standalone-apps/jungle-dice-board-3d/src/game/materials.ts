import * as THREE from 'three'

export const COLORS = {
  bg: '#05070a',
  woodDark: '#3a2618',
  woodMid: '#6b4429',
  tileBase: '#141b28',
  tileTop: '#1b2434',
  glow: '#22d3ee',
  safe: '#64748b',
  trap: '#f43f5e',
  ladder: '#38bdf8',
  token1: '#38bdf8',
  token2: '#fb923c',
} as const

export function glowColor(hex: string) {
  return new THREE.Color(hex)
}
