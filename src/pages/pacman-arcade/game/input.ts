import type Phaser from 'phaser'
import type { Direction } from './movement'

type TouchInput = {
  hold: Direction | null
  swipe: Direction | null
}

type InputKeys = Record<'W' | 'A' | 'S' | 'D' | 'G', Phaser.Input.Keyboard.Key>

type InputState = {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  keys: InputKeys
}

export function readDesiredDirection(input: InputState): Direction | null {
  const touch = ((window as any).__pacTouchInput ?? { hold: null, swipe: null }) as TouchInput

  if (touch.swipe && touch.swipe !== 'none') {
    ;(window as any).__pacTouchInput = { ...touch, swipe: null }
    return touch.swipe
  }

  if (touch.hold && touch.hold !== 'none') return touch.hold

  if (input.cursors.left.isDown || input.keys.A.isDown) return 'left'
  if (input.cursors.right.isDown || input.keys.D.isDown) return 'right'
  if (input.cursors.up.isDown || input.keys.W.isDown) return 'up'
  if (input.cursors.down.isDown || input.keys.S.isDown) return 'down'

  return null
}
