import Phaser from 'phaser'
import { TILE_SIZE } from '../game/constants'

function circleTexture(scene: Phaser.Scene, key: string, radius: number, color: number, stroke?: number) {
  const g = scene.add.graphics({ x: 0, y: 0 })
  g.fillStyle(color, 1)
  g.fillCircle(radius, radius, radius)
  if (stroke !== undefined) {
    g.lineStyle(2, stroke, 1)
    g.strokeCircle(radius, radius, radius - 1)
  }
  g.generateTexture(key, radius * 2, radius * 2)
  g.destroy()
}

function tileTexture(scene: Phaser.Scene, key: string, size: number, fill: number, stroke: number) {
  const g = scene.add.graphics({ x: 0, y: 0 })
  g.fillStyle(fill, 1)
  g.fillRect(0, 0, size, size)
  g.lineStyle(2, stroke, 1)
  g.strokeRect(1, 1, size - 2, size - 2)
  g.generateTexture(key, size, size)
  g.destroy()
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create() {
    tileTexture(this, 'wall', TILE_SIZE, 0x1f2f5f, 0x3c5ea7)
    circleTexture(this, 'pellet', 4, 0xf8fafc)
    circleTexture(this, 'power', 7, 0xf59e0b, 0xfef3c7)
    circleTexture(this, 'player', TILE_SIZE / 2 - 2, 0xfacc15, 0xfef08a)
    circleTexture(this, 'ghost-red', TILE_SIZE / 2 - 2, 0xef4444, 0xfca5a5)
    circleTexture(this, 'ghost-pink', TILE_SIZE / 2 - 2, 0xec4899, 0xf9a8d4)
    circleTexture(this, 'ghost-cyan', TILE_SIZE / 2 - 2, 0x06b6d4, 0xa5f3fc)
    circleTexture(this, 'ghost-orange', TILE_SIZE / 2 - 2, 0xf97316, 0xfdba74)
    circleTexture(this, 'ghost-frightened', TILE_SIZE / 2 - 2, 0x2563eb, 0x93c5fd)

    this.scene.start('LevelScene')
  }
}
