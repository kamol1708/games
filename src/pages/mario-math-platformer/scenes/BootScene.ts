// @ts-nocheck
import Phaser from 'phaser'

function rectTexture(scene: Phaser.Scene, key: string, width: number, height: number, color: number, stroke?: number) {
  const g = scene.add.graphics()
  if (stroke != null) {
    g.lineStyle(2, stroke, 1)
  }
  g.fillStyle(color, 1)
  g.fillRoundedRect(0, 0, width, height, 6)
  if (stroke != null) {
    g.strokeRoundedRect(0, 0, width, height, 6)
  }
  g.generateTexture(key, width, height)
  g.destroy()
}

function circleTexture(scene: Phaser.Scene, key: string, radius: number, color: number, stroke?: number) {
  const size = radius * 2 + 4
  const g = scene.add.graphics()
  if (stroke != null) g.lineStyle(2, stroke, 1)
  g.fillStyle(color, 1)
  g.fillCircle(size / 2, size / 2, radius)
  if (stroke != null) g.strokeCircle(size / 2, size / 2, radius)
  g.generateTexture(key, size, size)
  g.destroy()
}

function spikeTexture(scene: Phaser.Scene, key: string, width: number, height: number, color: number, stroke?: number) {
  const g = scene.add.graphics()
  if (stroke != null) g.lineStyle(2, stroke, 1)
  g.fillStyle(color, 1)
  const spikeCount = 5
  const spikeW = width / spikeCount
  g.beginPath()
  g.moveTo(0, height)
  for (let i = 0; i < spikeCount; i += 1) {
    const x = i * spikeW
    g.lineTo(x + spikeW * 0.25, height)
    g.lineTo(x + spikeW * 0.5, height * 0.2)
    g.lineTo(x + spikeW * 0.75, height)
  }
  g.lineTo(width, height)
  g.lineTo(width, 0)
  g.lineTo(0, 0)
  g.closePath()
  g.fillPath()
  if (stroke != null) g.strokePath()
  g.generateTexture(key, width, height)
  g.destroy()
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create() {
    circleTexture(this, 'player', 14, 0x60a5fa, 0xdbebff)
    rectTexture(this, 'ground', 128, 40, 0x1f2937, 0x475569)
    rectTexture(this, 'platform', 120, 22, 0x374151, 0x64748b)
    rectTexture(this, 'platform-moving', 120, 22, 0x0f766e, 0x99f6e4)
    circleTexture(this, 'coin', 8, 0xfbbf24, 0xfef3c7)
    spikeTexture(this, 'spikes', 96, 20, 0xef4444, 0xfecaca)
    rectTexture(this, 'quiz-block', 34, 34, 0xf59e0b, 0xfef3c7)
    rectTexture(this, 'quiz-block-used', 34, 34, 0x6b7280, 0xe5e7eb)
    rectTexture(this, 'gate', 24, 78, 0xfb7185, 0xffe4e6)
    rectTexture(this, 'gate-open', 24, 78, 0x10b981, 0xd1fae5)
    rectTexture(this, 'gate-sensor', 48, 96, 0x000000, 0x000000)
    rectTexture(this, 'finish-flag', 20, 100, 0x34d399, 0xa7f3d0)

    this.scene.start('LevelScene')
  }
}
