import Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { LevelScene } from '../scenes/LevelScene'

export function createGame(parent: string | HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: '#0b1020',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 900, x: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540,
    },
    scene: [BootScene, LevelScene],
  })
}

