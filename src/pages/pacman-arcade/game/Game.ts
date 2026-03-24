import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from './constants'
import { BootScene } from '../scenes/BootScene'
import { LevelScene } from '../scenes/LevelScene'

export function createPacGame(parent: string | HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#05060a',
    scene: [BootScene, LevelScene],
    pixelArt: false,
    antialias: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  })
}
