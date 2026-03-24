import Phaser from 'phaser'
import { BoardScene } from '../scenes/BoardScene'

export function createMonopolyCalibrationGame(container: HTMLDivElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: container.clientWidth || 1200,
    height: container.clientHeight || 760,
    backgroundColor: '#020617',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BoardScene],
  })
}
