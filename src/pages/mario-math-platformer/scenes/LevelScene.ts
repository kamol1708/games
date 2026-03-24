// @ts-nocheck
import Phaser from 'phaser'
import { showQuizOverlay } from '../ui/quizOverlay'
import {
  addScore,
  advanceLevel,
  getLevelSecondsRemaining,
  getState,
  getTotalLevels,
  loseLife,
  resetForNewGame,
  resetLevelTimer,
  shiftLevelTimerStart,
} from '../logic/state'
import {
  playCoinSfx,
  playCorrectSfx,
  playFinishLevelSfx,
  playGateOpenSfx,
  playJumpSfx,
  playPauseToggleSfx,
  playWrongSfx,
} from '../logic/sfx'

type QuizBlock = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
  quizId?: string
  solved?: boolean
}

type LevelLayout = {
  width: number
  start: [number, number]
  platforms: Array<[number, number]>
  coins: Array<[number, number]>
  quizBlocks: Array<[number, number, string]>
  gateX: number
  gateY: number
  sensorX: number
  sensorY: number
  finishX: number
  finishY: number
}

type MovingPlatformMeta = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  minX: number
  maxX: number
  speed: number
}

const PRESET_LEVEL_LAYOUTS: Record<number, LevelLayout> = {
  1: {
    width: 2200,
    start: [80, 420],
    platforms: [
      [280, 430],
      [460, 360],
      [650, 300],
      [840, 390],
      [1030, 330],
      [1240, 280],
      [1450, 360],
      [1660, 320],
      [1850, 260],
    ],
    coins: [
      [220, 385], [315, 390], [460, 320], [530, 320], [650, 260],
      [1030, 290], [1240, 240], [1660, 280], [1850, 220],
    ],
    quizBlocks: [
      [520, 260, 'qb-1'],
      [1120, 230, 'qb-2'],
      [1760, 210, 'qb-3'],
    ],
    gateX: 2080,
    gateY: 460,
    sensorX: 2025,
    sensorY: 450,
    finishX: 2160,
    finishY: 460,
  },
  2: {
    width: 2550,
    start: [90, 420],
    platforms: [
      [260, 410],
      [420, 350],
      [580, 290],
      [770, 250],
      [970, 320],
      [1170, 390],
      [1360, 330],
      [1540, 270],
      [1720, 220],
      [1900, 300],
      [2080, 360],
      [2260, 290],
    ],
    coins: [
      [200, 370], [300, 370], [420, 310], [580, 250], [770, 210],
      [970, 280], [1170, 350], [1360, 290], [1540, 230], [1720, 180],
      [1900, 260], [2260, 250],
    ],
    quizBlocks: [
      [640, 230, 'qb-1'],
      [1480, 210, 'qb-2'],
      [2200, 230, 'qb-3'],
    ],
    gateX: 2410,
    gateY: 460,
    sensorX: 2350,
    sensorY: 450,
    finishX: 2500,
    finishY: 460,
  },
  3: {
    width: 2520,
    start: [90, 420],
    platforms: [
      [250, 430],
      [390, 390],
      [530, 350],
      [670, 320],
      [820, 300],
      [980, 330],
      [1140, 360],
      [1300, 330],
      [1470, 300],
      [1640, 270],
      [1810, 300],
      [1980, 340],
      [2150, 310],
      [2320, 280],
    ],
    coins: [
      [210, 390], [250, 390], [390, 350], [530, 310], [670, 280],
      [820, 260], [980, 290], [1140, 320], [1300, 290], [1470, 260],
      [1640, 230], [1810, 260], [1980, 300], [2150, 270], [2320, 240],
    ],
    quizBlocks: [
      [560, 280, 'qb-1'],
      [1500, 230, 'qb-2'],
      [2200, 240, 'qb-3'],
    ],
    gateX: 2405,
    gateY: 460,
    sensorX: 2345,
    sensorY: 450,
    finishX: 2490,
    finishY: 460,
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function generateProceduralLevelLayout(level: number): LevelLayout {
  let width = 2260 + (level - 1) * 120
  const platforms: Array<[number, number]> = []
  const coins: Array<[number, number]> = []
  const quizBlocks: Array<[number, number, string]> = []

  const platformCount = 12 + Math.min(level, 8)
  const difficulty = clamp(level, 4, 10)
  const maxStepUp = 34 + Math.floor((difficulty - 4) * 2)
  const maxStepDown = 42 + Math.floor((difficulty - 4) * 2)
  const minGap = 126
  const maxGap = 146 + Math.floor((difficulty - 4) * 4)

  let x = 230
  let y = 418

  for (let i = 0; i < platformCount; i += 1) {
    // Periodic "breather" platforms make long runs fair on projector play.
    const breather = i % 5 === 0 && i !== 0
    const dx = breather ? 124 : clamp(minGap + ((i + difficulty) % 4) * 9, minGap, maxGap)

    const wave = Math.round(Math.sin((i + difficulty) * 0.72) * 16)
    const biasUp = (i % 6 === 2 || i % 6 === 3) ? -10 : 8
    let nextY = y + wave + biasUp

    // Keep vertical deltas in a jump-safe range.
    nextY = clamp(nextY, y - maxStepUp, y + maxStepDown)
    nextY = clamp(nextY, 258, 430)

    // Avoid consecutive ultra-high platforms that feel unfair.
    if (y <= 300 && nextY <= 305) {
      nextY = clamp(nextY + 24, 258, 430)
    }

    platforms.push([x, nextY])
    coins.push([x, nextY - 40])

    if (i % 4 === 1) {
      coins.push([x + 36, nextY - 46])
    }
    if (breather) {
      coins.push([x - 30, nextY - 28])
    }

    x += dx
    y = nextY
  }

  width = Math.max(width, x + 240)

  coins.push([160, 460], [300, 460], [width - 360, 460], [width - 210, 460])

  const quizIndices = [
    Math.floor(platformCount * 0.28),
    Math.floor(platformCount * 0.56),
    Math.floor(platformCount * 0.82),
  ]
  quizIndices.forEach((idx, n) => {
    const p = platforms[clamp(idx, 0, platforms.length - 1)]
    quizBlocks.push([p[0] + 10, clamp(p[1] - 30, 170, 440), `qb-${n + 1}`])
  })

  const gateX = width - 120
  const gateY = 460
  const sensorX = gateX - 55
  const sensorY = 450
  const finishX = width - 30
  const finishY = 460

  return {
    width,
    start: [90, 420],
    platforms,
    coins,
    quizBlocks,
    gateX,
    gateY,
    sensorX,
    sensorY,
    finishX,
    finishY,
  }
}

export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: {
    a: Phaser.Input.Keyboard.Key
    d: Phaser.Input.Keyboard.Key
    w: Phaser.Input.Keyboard.Key
    space: Phaser.Input.Keyboard.Key
    p: Phaser.Input.Keyboard.Key
    esc: Phaser.Input.Keyboard.Key
    r: Phaser.Input.Keyboard.Key
    enter: Phaser.Input.Keyboard.Key
  }
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private movingPlatforms!: Phaser.Physics.Arcade.Group
  private coins!: Phaser.Physics.Arcade.Group
  private quizBlocks!: Phaser.Physics.Arcade.Group
  private hazards!: Phaser.Physics.Arcade.Group
  private gateBarrier!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private gateVisual!: Phaser.GameObjects.Image
  private gateSensor!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private finishFlag!: Phaser.GameObjects.Image
  private finishLabel!: Phaser.GameObjects.Text
  private hudText!: Phaser.GameObjects.Text
  private levelStatusText!: Phaser.GameObjects.Text
  private pauseTitleText!: Phaser.GameObjects.Text
  private pauseBodyText!: Phaser.GameObjects.Text
  private endModalBg!: Phaser.GameObjects.Rectangle
  private endModalPanel!: Phaser.GameObjects.Rectangle
  private endModalTitle!: Phaser.GameObjects.Text
  private endModalBody!: Phaser.GameObjects.Text
  private endModalPulseTween?: Phaser.Tweens.Tween
  private levelIntroBg!: Phaser.GameObjects.Rectangle
  private levelIntroTitle!: Phaser.GameObjects.Text
  private levelIntroBody!: Phaser.GameObjects.Text
  private quizBusy = false
  private gateOpened = false
  private levelFinished = false
  private isPausedByUser = false
  private showingEndModal = false
  private endModalKind: 'gameover' | 'victory' | null = null
  private userPauseStartAt = 0
  private levelIntroActive = false
  private levelIntroStartedAt = 0
  private startPosition = new Phaser.Math.Vector2(80, 420)
  private levelWidth = 2200
  private currentLevel = 1
  private movingPlatformTracks: MovingPlatformMeta[] = []
  private hazardHitCooldownUntil = 0
  private gateQuizRemaining = 1
  private gateQuizRequired = 1
  private spikePulseTween?: Phaser.Tweens.Tween
  private touchJumpPrev = false

  constructor() {
    super('LevelScene')
  }

  create() {
    // Scene restart uses the same instance, so runtime flags must be reset manually.
    this.quizBusy = false
    this.gateOpened = false
    this.levelFinished = false
    this.isPausedByUser = false
    this.showingEndModal = false
    this.endModalKind = null
    this.userPauseStartAt = 0
    this.levelIntroActive = false
    this.levelIntroStartedAt = 0
    this.movingPlatformTracks = []
    this.hazardHitCooldownUntil = 0
    this.gateQuizRequired = 1
    this.gateQuizRemaining = 1
    this.spikePulseTween?.stop()
    this.spikePulseTween = undefined
    this.endModalPulseTween?.stop()
    this.endModalPulseTween = undefined

    this.currentLevel = getState().currentLevel
    this.gateQuizRequired = this.currentLevel >= 10 ? 3 : 1
    this.gateQuizRemaining = this.gateQuizRequired
    this.createLevel()
    this.createPlayer()
    this.createInput()
    this.createHud()
    this.createCollisions()

    this.physics.world.resume()
    this.showLevelIntro()

    resetLevelTimer()
    this.scale.on('resize', this.handleResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this)
    })
  }

  private getLayout() {
    return PRESET_LEVEL_LAYOUTS[this.currentLevel] ?? generateProceduralLevelLayout(this.currentLevel)
  }

  private alignQuizBlockY(x: number, fallbackY: number, platforms: Array<[number, number]>) {
    let nearest: [number, number] | null = null
    let bestDx = Number.POSITIVE_INFINITY
    for (const p of platforms) {
      const dx = Math.abs(p[0] - x)
      if (dx < bestDx) {
        bestDx = dx
        nearest = p
      }
    }
    if (!nearest || bestDx > 120) return fallbackY
    // Put the quiz block on/near the platform line so player won't fall after trigger.
    return clamp(nearest[1] - 30, 170, 440)
  }

  private createLevel() {
    const layout = this.getLayout()
    this.levelWidth = layout.width
    this.startPosition.set(layout.start[0], layout.start[1])

    this.physics.world.setBounds(0, 0, this.levelWidth, 540)
    this.cameras.main.setBounds(0, 0, this.levelWidth, 540)
    this.cameras.main.setBackgroundColor('#0b1020')

    this.add.rectangle(this.levelWidth / 2, 270, this.levelWidth, 540, 0x0b1020).setDepth(-20)

    for (let i = 0; i < Math.ceil(this.levelWidth / 110) + 4; i += 1) {
      this.add.circle(
        40 + i * 110,
        70 + (i % 4) * 22,
        2,
        i % 2 ? 0x8b5cf6 : 0x3b82f6,
        0.14,
      ).setDepth(-18)
    }

    this.add.text(18, 88, `LEVEL ${this.currentLevel}`, {
      fontFamily: 'ui-sans-serif, system-ui',
      fontSize: '12px',
      color: '#a5b4fc',
      backgroundColor: 'rgba(15,23,42,0.55)',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(100)

    this.platforms = this.physics.add.staticGroup()
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true })
    this.hazards = this.physics.add.group({ allowGravity: false, immovable: true })

    for (let x = 64; x < this.levelWidth; x += 128) {
      this.platforms.create(x, 520, 'ground').refreshBody()
    }
    layout.platforms.forEach(([x, y]) => this.platforms.create(x, y, 'platform').refreshBody())
    this.createAdvancedSegments(layout)

    this.coins = this.physics.add.group({ allowGravity: false, immovable: true })
    layout.coins.forEach(([x, y]) => {
      const c = this.coins.create(x, y, 'coin')
      c.setCircle(8)
      c.body.setAllowGravity(false)
      c.body.moves = false
    })

    this.quizBlocks = this.physics.add.group({ allowGravity: false, immovable: true })
    layout.quizBlocks.forEach(([x, y, quizId]) => {
      const fixedY = this.alignQuizBlockY(x, y, layout.platforms)
      const block = this.quizBlocks.create(x, fixedY, 'quiz-block') as QuizBlock
      block.body.setAllowGravity(false)
      block.body.moves = false
      block.setDataEnabled()
      block.setData('quizId', quizId)
      block.setData('solved', false)
    })

    this.gateVisual = this.add.image(layout.gateX, layout.gateY, 'gate').setOrigin(0.5, 1)
    this.gateBarrier = this.physics.add.sprite(layout.gateX, layout.gateY, 'gate')
    this.gateBarrier.setImmovable(true)
    this.gateBarrier.body.allowGravity = false
    this.gateBarrier.body.moves = false
    this.gateBarrier.setVisible(false)
    this.gateBarrier.setSize(26, 82)

    this.gateSensor = this.physics.add.sprite(layout.sensorX, layout.sensorY, 'gate-sensor')
    this.gateSensor.setVisible(false)
    this.gateSensor.setImmovable(true)
    this.gateSensor.body.allowGravity = false
    this.gateSensor.body.moves = false
    this.gateSensor.setSize(54, 100)

    this.finishFlag = this.add.image(layout.finishX, layout.finishY, 'finish-flag').setOrigin(0.5, 1)
    const finishText = this.currentLevel >= 10 ? 'BOSS FINISH' : 'FINISH'
    this.finishLabel = this.add.text(layout.finishX - (this.currentLevel >= 10 ? 72 : 50), layout.finishY - 20, finishText, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: this.currentLevel >= 10 ? '#fbcfe8' : '#d1fae5',
    })
  }

  private createAdvancedSegments(layout: LevelLayout) {
    if (this.currentLevel < 7) return

    const difficulty = clamp(this.currentLevel, 7, 10)
    const movingCount = this.currentLevel >= 9 ? 3 : 2
    const candidatePlatforms = layout.platforms.slice(2, Math.max(3, layout.platforms.length - 2))

    for (let i = 0; i < movingCount; i += 1) {
      const idx = Math.floor(((i + 1) / (movingCount + 1)) * candidatePlatforms.length)
      const base = candidatePlatforms[clamp(idx, 0, candidatePlatforms.length - 1)]
      const x = base[0] + (i % 2 === 0 ? -18 : 18)
      const y = clamp(base[1] - 55, 235, 410)
      const mover = this.movingPlatforms.create(x, y, 'platform-moving') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      mover.body.setAllowGravity(false)
      mover.body.moves = true
      mover.setImmovable(true)
      const range = 70 + (difficulty - 7) * 14
      const speed = (i % 2 === 0 ? 1 : -1) * (50 + (difficulty - 7) * 10)
      mover.setVelocityX(speed)
      this.movingPlatformTracks.push({
        sprite: mover,
        minX: x - range,
        maxX: x + range,
        speed,
      })

      this.add.text(x - 22, y - 22, 'M', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#99f6e4',
      }).setAlpha(0.7)
    }

    const hazardCount = 2 + (this.currentLevel >= 9 ? 1 : 0)
    for (let i = 0; i < hazardCount; i += 1) {
      const ratio = (i + 1) / (hazardCount + 1)
      const hx = Math.round(layout.width * (0.18 + ratio * 0.62))
      const hy = 497
      const spikes = this.hazards.create(hx, hy, 'spikes') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      spikes.body.setAllowGravity(false)
      spikes.body.moves = false
      spikes.setImmovable(true)
      spikes.setSize(94, 14)
      spikes.setOffset(1, 6)
    }

    if (this.hazards.getLength() > 0) {
      this.spikePulseTween?.stop()
      this.spikePulseTween = this.tweens.add({
        targets: this.hazards.getChildren(),
        alpha: { from: 0.78, to: 1 },
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(this.startPosition.x, this.startPosition.y, 'player')
    this.player.setCircle(14)
    this.player.setOffset(2, 2)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0.02)
    this.player.setDragX(900)
    this.player.setMaxVelocity(240, 700)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
  }

  private createInput() {
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      p: Phaser.Input.Keyboard.KeyCodes.P,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    }) as any
  }

  private createHud() {
    this.hudText = this.add
      .text(14, 12, '', {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '16px',
        color: '#eef2ff',
        backgroundColor: 'rgba(5,6,10,0.45)',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100)

    this.levelStatusText = this.add
      .text(14, 52, '', {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '12px',
        color: '#bfdbfe',
        backgroundColor: 'rgba(5,6,10,0.45)',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100)

    this.pauseTitleText = this.add
      .text(480, 220, 'PAUSED', {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '34px',
        fontStyle: '700',
        color: '#ffffff',
        backgroundColor: 'rgba(5,6,10,0.72)',
        padding: { x: 22, y: 12 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200)
      .setVisible(false)

    this.pauseBodyText = this.add
      .text(480, 275, "P yoki Esc bosib davom eting", {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '14px',
        color: '#bfdbfe',
        backgroundColor: 'rgba(5,6,10,0.62)',
        padding: { x: 14, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200)
      .setVisible(false)

    this.endModalBg = this.add
      .rectangle(480, 270, 960, 540, 0x000000, 0.68)
      .setScrollFactor(0)
      .setDepth(290)
      .setVisible(false)

    this.endModalPanel = this.add
      .rectangle(480, 270, 500, 220, 0x0b1220, 0.98)
      .setStrokeStyle(2, 0x334155, 0.9)
      .setScrollFactor(0)
      .setDepth(300)
      .setVisible(false)

    this.endModalTitle = this.add
      .text(480, 228, '', {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '28px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(301)
      .setVisible(false)

    this.endModalBody = this.add
      .text(480, 292, '', {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '14px',
        color: '#dbeafe',
        align: 'center',
        wordWrap: { width: 430 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(301)
      .setVisible(false)

    this.levelIntroBg = this.add
      .rectangle(480, 270, 960, 540, 0x020617, 0.35)
      .setScrollFactor(0)
      .setDepth(240)
      .setVisible(false)

    this.levelIntroTitle = this.add
      .text(480, 250, '', {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '38px',
        fontStyle: '700',
        color: '#ffffff',
        stroke: '#0f172a',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(241)
      .setVisible(false)

    this.levelIntroBody = this.add
      .text(480, 295, 'Tayyorlaning...', {
        fontFamily: 'ui-sans-serif, system-ui',
        fontSize: '14px',
        color: '#bfdbfe',
        backgroundColor: 'rgba(5,6,10,0.55)',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(241)
      .setVisible(false)
  }

  private createCollisions() {
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.player, this.movingPlatforms)
    this.physics.add.collider(this.player, this.gateBarrier)

    this.physics.add.overlap(this.player, this.coins, (_player, coin) => {
      coin.destroy()
      addScore(2)
      playCoinSfx()
      this.flashStatus('+2 coin')
    })

    this.physics.add.overlap(this.player, this.quizBlocks, (_player, block) => {
      const quizBlock = block as QuizBlock
      if (quizBlock.getData('solved') || this.isPausedByUser) return
      void this.triggerQuiz('block', quizBlock)
    })

    this.physics.add.overlap(this.player, this.gateSensor, () => {
      if (this.gateOpened || this.isPausedByUser) return
      void this.triggerQuiz('gate')
    })

    this.physics.add.overlap(this.player, this.hazards, () => {
      if (this.isPausedByUser || this.quizBusy || this.levelFinished || this.showingEndModal || this.levelIntroActive) return
      const now = this.time.now
      if (now < this.hazardHitCooldownUntil) return
      this.hazardHitCooldownUntil = now + 600
      this.handleLifeLossAndReset('Spikega tegdingiz! -1 life')
    })
  }

  private setUserPaused(paused: boolean) {
    if (this.levelFinished || this.quizBusy || this.showingEndModal) return
    if (this.isPausedByUser === paused) return

    this.isPausedByUser = paused
    this.pauseTitleText.setVisible(paused)
    this.pauseBodyText.setVisible(paused)
    playPauseToggleSfx(paused)

    if (paused) {
      this.userPauseStartAt = Date.now()
      this.physics.world.pause()
      this.player.setVelocity(0, 0)
      this.flashStatus('O‘yin pauseda')
      return
    }

    if (this.userPauseStartAt) {
      shiftLevelTimerStart(Date.now() - this.userPauseStartAt)
    }
    this.userPauseStartAt = 0
    this.physics.world.resume()
    this.flashStatus('Davom etildi')
  }

  private toggleUserPause() {
    this.setUserPaused(!this.isPausedByUser)
  }

  private getCarryFromMovingPlatform() {
    if (!this.movingPlatformTracks.length) return 0
    const pBody = this.player.body
    if (!pBody || (!pBody.blocked.down && !pBody.touching.down)) return 0

    const playerBottom = pBody.y + pBody.height
    const playerCenterX = pBody.x + pBody.width / 2
    for (const mover of this.movingPlatformTracks) {
      const body = mover.sprite.body
      if (!body || !body.enable) continue
      const withinX = playerCenterX >= body.x - 6 && playerCenterX <= body.x + body.width + 6
      const nearTop = Math.abs(playerBottom - body.y) <= 8
      if (withinX && nearTop && pBody.velocity.y >= -20) {
        return body.velocity.x
      }
    }
    return 0
  }

  private showLevelIntro() {
    this.levelIntroActive = true
    this.levelIntroStartedAt = Date.now()
    this.levelIntroTitle.setText(`LEVEL ${this.currentLevel}`)
    this.levelIntroBody.setText(this.currentLevel === 1 ? 'Boshladik!' : `Bosqich ${this.currentLevel}/10`)
    this.levelIntroBg.setAlpha(0.35)
    this.levelIntroTitle.setAlpha(1)
    this.levelIntroBody.setAlpha(1)
    this.levelIntroBg.setVisible(true)
    this.levelIntroTitle.setVisible(true)
    this.levelIntroBody.setVisible(true)
    this.physics.world.pause()
    this.player?.setVelocity?.(0, 0)

    this.time.delayedCall(950, () => {
      if (!this.scene.isActive()) return
      this.levelIntroActive = false
      shiftLevelTimerStart(Date.now() - this.levelIntroStartedAt)
      this.levelIntroStartedAt = 0
      this.tweens.add({
        targets: [this.levelIntroBg, this.levelIntroTitle, this.levelIntroBody],
        alpha: 0,
        duration: 220,
        onComplete: () => {
          this.levelIntroBg.setVisible(false)
          this.levelIntroTitle.setVisible(false)
          this.levelIntroBody.setVisible(false)
          if (!this.quizBusy && !this.showingEndModal && !this.isPausedByUser && !this.levelFinished) {
            this.physics.world.resume()
          }
        },
      })
    })
  }

  private showEndModal(kind: 'gameover' | 'victory') {
    this.showingEndModal = true
    this.endModalKind = kind
    this.levelFinished = true
    this.quizBusy = false
    this.isPausedByUser = false
    this.levelIntroActive = false
    this.physics.world.pause()
    this.player.setVelocity(0, 0)

    const s = getState()
    this.endModalBg.setVisible(true)
    this.endModalPanel.setVisible(true)
    this.endModalTitle.setVisible(true)
    this.endModalBody.setVisible(true)
    this.endModalPulseTween?.stop()
    this.endModalPulseTween = undefined
    this.endModalPanel.setSize(500, 220)
    this.endModalPanel.setFillStyle(0x0b1220, 0.98)
    this.endModalPanel.setStrokeStyle(2, 0x334155, 0.9)
    this.endModalPanel.setScale(1)
    this.endModalTitle.setScale(1)

    if (kind === 'victory') {
      const bossFinal = this.currentLevel >= getTotalLevels()
      if (bossFinal) {
        this.endModalTitle.setText('BOSS CLEARED!')
        this.endModalTitle.setColor('#fde68a')
        this.endModalPanel.setSize(560, 240)
        this.endModalPanel.setFillStyle(0x1a1206, 0.98)
        this.endModalPanel.setStrokeStyle(2, 0xf59e0b, 0.95)
        this.endModalBody.setText(
          `Level 10 boss gate yengildi.\nFinal Score: ${s.score} · Lives: ${s.lives}\n\nAjoyib! Enter yoki R ni bosib yangi run boshlang.`,
        )
        this.endModalPulseTween = this.tweens.add({
          targets: [this.endModalPanel, this.endModalTitle],
          scale: { from: 0.992, to: 1.02 },
          duration: 520,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        })
      } else {
        this.endModalTitle.setText('VICTORY!')
        this.endModalTitle.setColor('#bbf7d0')
        this.endModalBody.setText(
          `Barcha level tugadi.\nScore: ${s.score} · Lives: ${s.lives}\n\nEnter yoki R ni bosib qayta boshlang.`,
        )
      }
      return
    }

    this.endModalTitle.setText('GAME OVER')
    this.endModalTitle.setColor('#fecaca')
    this.endModalPanel.setFillStyle(0x170d11, 0.98)
    this.endModalPanel.setStrokeStyle(2, 0xfb7185, 0.9)
    this.endModalBody.setText(`Lives tugadi.\nScore: ${s.score}\n\nEnter yoki R ni bosib qayta boshlang.`)
  }

  private restartRunFromModal() {
    if (!this.showingEndModal) return
    this.showingEndModal = false
    this.endModalKind = null
    this.endModalBg.setVisible(false)
    this.endModalPanel.setVisible(false)
    this.endModalTitle.setVisible(false)
    this.endModalBody.setVisible(false)
    this.endModalPulseTween?.stop()
    this.endModalPulseTween = undefined
    resetForNewGame()
    resetLevelTimer()
    this.scene.restart()
  }

  private handleLifeLossAndReset(reasonText: string) {
    loseLife()
    playWrongSfx()
    if (getState().lives <= 0) {
      this.flashStatus(reasonText)
      this.showEndModal('gameover')
      return
    }
    this.flashStatus(reasonText)
    this.resetLevelPosition()
  }

  private async triggerQuiz(kind: 'block' | 'gate', block?: QuizBlock) {
    if (this.quizBusy || this.levelFinished || this.isPausedByUser) return
    this.quizBusy = true
    this.physics.world.pause()
    this.player.setVelocity(0, 0)
    const pausedAt = Date.now()

    const state = getState()
    const result = await showQuizOverlay({
      gradeMode: state.gradeMode,
      title: kind === 'gate' ? 'Gate Quiz' : 'Quiz Block',
      subtitle: kind === 'gate' ? 'Darvozani ochish uchun yeching' : "Block bonusni olish uchun javob bering",
      durationSec: 15,
    })
    shiftLevelTimerStart(Date.now() - pausedAt)

    if (result) {
      addScore(10)
      playCorrectSfx()
      this.flashStatus('+10 to‘g‘ri javob')

      if (kind === 'block' && block) {
        block.setData('solved', true)
        block.setTexture('quiz-block-used')
      }

      if (kind === 'gate') {
        if (this.gateQuizRemaining > 1) {
          this.gateQuizRemaining -= 1
          this.gateVisual.setTint(0xf59e0b)
          this.time.delayedCall(180, () => this.gateVisual?.clearTint())
          this.flashStatus(`Boss Gate: yana ${this.gateQuizRemaining} ta quiz kerak`)
        } else {
          this.gateQuizRemaining = 0
          this.openGate()
        }
      }
    } else {
      this.handleLifeLossAndReset('Noto‘g‘ri! Level boshiga qaytdi.')
      if (this.showingEndModal) {
        this.quizBusy = false
        return
      }
    }

    this.physics.world.resume()
    this.quizBusy = false
  }

  private openGate() {
    this.gateOpened = true
    this.gateVisual.setTexture('gate-open')
    this.gateVisual.clearTint()
    this.gateBarrier.disableBody(true, true)
    playGateOpenSfx()
    this.flashStatus(this.gateQuizRequired > 1 ? 'Boss darvozasi ochildi! Finishga boring.' : 'Darvoza ochildi! Finishga boring.')
  }

  private resetLevelPosition() {
    this.player.setPosition(this.startPosition.x, this.startPosition.y)
    this.player.setVelocity(0, 0)
    this.cameras.main.stopFollow()
    this.cameras.main.scrollX = 0
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)

    if (getState().lives <= 0) {
      this.scene.restart()
    }
  }

  private flashStatus(text: string) {
    this.levelStatusText.setText(text)
    this.tweens.killTweensOf(this.levelStatusText)
    this.levelStatusText.setAlpha(1)
    this.tweens.add({
      targets: this.levelStatusText,
      alpha: 0.85,
      duration: 250,
      yoyo: true,
      repeat: 1,
    })
  }

  private handleResize() {
    // Phaser FIT handles scaling; this exists to keep listener lifecycle explicit.
  }

  private handleLevelComplete() {
    if (this.levelFinished) return
    this.levelFinished = true
    this.physics.world.pause()

    const totalLevels = getTotalLevels()
    const isFinalLevel = this.currentLevel >= totalLevels

    addScore(isFinalLevel ? 30 : 20)
    playFinishLevelSfx(isFinalLevel)

    if (!isFinalLevel && advanceLevel()) {
      this.flashStatus(`Level ${this.currentLevel} tugadi! Keyingi level yuklanmoqda...`)
      this.time.delayedCall(1300, () => {
        resetLevelTimer()
        this.scene.restart()
      })
      return
    }

    this.flashStatus('Barcha level tugadi!')
    this.showEndModal('victory')
  }

  update() {
    if (this.levelIntroActive) {
      if (
        Phaser.Input.Keyboard.JustDown(this.keys.p) ||
        Phaser.Input.Keyboard.JustDown(this.keys.esc) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space)
      ) {
        // ignore input during level intro
      }
      const s = getState()
      const timeLeft = getLevelSecondsRemaining()
      this.hudText.setText(
        `Lvl: ${s.currentLevel}/${getTotalLevels()}   Score: ${s.score}   Lives: ${s.lives}   Time: ${timeLeft}s   Progress: 0%`,
      )
      return
    }

    if (this.showingEndModal) {
      if (
        Phaser.Input.Keyboard.JustDown(this.keys.enter) ||
        Phaser.Input.Keyboard.JustDown(this.keys.r)
      ) {
        this.restartRunFromModal()
      }
      return
    }

    if (!this.quizBusy && !this.levelFinished && !this.isPausedByUser && this.movingPlatformTracks.length) {
      for (const mover of this.movingPlatformTracks) {
        const body = mover.sprite.body
        if (!body || !body.enable) continue
        if (mover.sprite.x <= mover.minX && body.velocity.x < 0) {
          mover.sprite.setVelocityX(Math.abs(mover.speed))
        } else if (mover.sprite.x >= mover.maxX && body.velocity.x > 0) {
          mover.sprite.setVelocityX(-Math.abs(mover.speed))
        }
      }
    }

    if (!this.quizBusy && !this.levelFinished && !this.isPausedByUser) {
      const carryVx = this.getCarryFromMovingPlatform()
      if (carryVx) {
        this.player.x += carryVx * (this.game.loop.delta / 1000)
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p) || Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      if (!this.quizBusy && !this.levelFinished && !this.levelIntroActive) {
        this.toggleUserPause()
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.space) && this.isPausedByUser) {
      this.toggleUserPause()
    }

    const s = getState()
    const onGround = this.player.body.blocked.down || this.player.body.touching.down
    const touchInput = (window as any).__marioTouchControls ?? { left: false, right: false, jump: false }

    if (!this.quizBusy && !this.levelFinished && !this.isPausedByUser) {
      const left = this.cursors.left.isDown || this.keys.a.isDown || !!touchInput.left
      const right = this.cursors.right.isDown || this.keys.d.isDown || !!touchInput.right
      const jumpFromTouch = !!touchInput.jump && !this.touchJumpPrev
      this.touchJumpPrev = !!touchInput.jump
      const jumpPressed =
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keys.w) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space) ||
        jumpFromTouch

      if (left && !right) {
        this.player.setVelocityX(-220)
      } else if (right && !left) {
        this.player.setVelocityX(220)
      } else {
        this.player.setVelocityX(0)
      }

      if (jumpPressed && onGround) {
        this.player.setVelocityY(-520)
        playJumpSfx()
      }
    } else {
      this.touchJumpPrev = !!touchInput.jump
    }

    if (this.player.y > 620 && !this.quizBusy && !this.isPausedByUser) {
      this.handleLifeLossAndReset('Pastga tushib ketdingiz! -1 life')
      if (this.showingEndModal) return
    }

    if (this.gateOpened && !this.levelFinished && this.player.x >= this.finishFlag.x - 20) {
      this.handleLevelComplete()
    }

    const timeLeft = getLevelSecondsRemaining()
    if (timeLeft <= 0 && !this.quizBusy && !this.levelFinished && !this.isPausedByUser) {
      resetLevelTimer()
      this.handleLifeLossAndReset('Vaqt tugadi! Level restart.')
      if (this.showingEndModal) return
    }

    const progress = Phaser.Math.Clamp((this.player.x / Math.max(1, this.levelWidth - 40)) * 100, 0, 100)
    const gateStatus = !this.gateOpened && this.gateQuizRequired > 1 ? `   Gate:${this.gateQuizRemaining}/${this.gateQuizRequired}` : ''
    this.hudText.setText(
      `Lvl: ${s.currentLevel}/${getTotalLevels()}   Score: ${s.score}   Lives: ${s.lives}   Time: ${timeLeft}s   Progress: ${Math.round(progress)}%${gateStatus}`,
    )
  }
}
