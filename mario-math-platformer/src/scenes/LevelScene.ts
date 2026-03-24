import Phaser from 'phaser'
import { showQuizOverlay } from '../ui/quizOverlay'
import {
  addScore,
  getLevelSecondsRemaining,
  getState,
  loseLife,
  resetForNewGame,
  resetLevelTimer,
  restartRunIfNoLives,
} from '../logic/state'

type QuizBlock = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
  quizId?: string
  solved?: boolean
}

export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; w: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key }
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private coins!: Phaser.Physics.Arcade.Group
  private quizBlocks!: Phaser.Physics.Arcade.Group
  private gateBarrier!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private gateVisual!: Phaser.GameObjects.Image
  private gateSensor!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private finishFlag!: Phaser.GameObjects.Image
  private hudText!: Phaser.GameObjects.Text
  private levelStatusText!: Phaser.GameObjects.Text
  private quizBusy = false
  private gateOpened = false
  private levelFinished = false
  private readonly startPosition = new Phaser.Math.Vector2(80, 420)

  constructor() {
    super('LevelScene')
  }

  create() {
    this.createLevel()
    this.createPlayer()
    this.createInput()
    this.createHud()
    this.createCollisions()

    resetLevelTimer()
    this.scale.on('resize', this.handleResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this)
    })
  }

  private createLevel() {
    this.physics.world.setBounds(0, 0, 2200, 540)
    this.cameras.main.setBounds(0, 0, 2200, 540)
    this.cameras.main.setBackgroundColor('#0b1020')

    const sky = this.add.rectangle(1100, 270, 2200, 540, 0x0b1020).setScrollFactor(0)
    sky.setDepth(-10)

    for (let i = 0; i < 20; i += 1) {
      this.add.circle(
        50 + i * 110,
        80 + (i % 3) * 26,
        2,
        i % 2 ? 0x8b5cf6 : 0x3b82f6,
        0.16,
      )
    }

    this.platforms = this.physics.add.staticGroup()

    for (let x = 64; x < 2200; x += 128) {
      this.platforms.create(x, 520, 'ground').refreshBody()
    }

    const platformPositions = [
      [280, 430],
      [460, 360],
      [650, 300],
      [840, 390],
      [1030, 330],
      [1240, 280],
      [1450, 360],
      [1660, 320],
      [1850, 260],
    ] as const
    platformPositions.forEach(([x, y]) => this.platforms.create(x, y, 'platform').refreshBody())

    this.coins = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    })

    const coinSpots = [
      [220, 385], [315, 390], [460, 320], [530, 320], [650, 260],
      [1030, 290], [1240, 240], [1660, 280], [1850, 220],
    ] as const

    coinSpots.forEach(([x, y]) => {
      const c = this.coins.create(x, y, 'coin') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      c.setCircle(8)
      c.body.setAllowGravity(false)
      c.body.moves = false
    })

    this.quizBlocks = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    })
    ;([
      [520, 260, 'qb-1'],
      [1120, 230, 'qb-2'],
      [1760, 210, 'qb-3'],
    ] as const).forEach(([x, y, quizId]) => {
      const block = this.quizBlocks.create(x, y, 'quiz-block') as QuizBlock
      block.body.setAllowGravity(false)
      block.body.moves = false
      block.setDataEnabled()
      block.setData('quizId', quizId)
      block.setData('solved', false)
    })

    this.gateVisual = this.add.image(2080, 460, 'gate').setOrigin(0.5, 1)
    this.gateBarrier = this.physics.add.sprite(2080, 460, 'gate')
    this.gateBarrier.setImmovable(true)
    this.gateBarrier.body.allowGravity = false
    this.gateBarrier.body.moves = false
    this.gateBarrier.setVisible(false)
    this.gateBarrier.setSize(26, 82)

    this.gateSensor = this.physics.add.sprite(2025, 450, 'gate-sensor')
    this.gateSensor.setVisible(false)
    this.gateSensor.setImmovable(true)
    this.gateSensor.body.allowGravity = false
    this.gateSensor.body.moves = false
    this.gateSensor.setSize(54, 100)

    this.finishFlag = this.add.image(2160, 460, 'finish-flag').setOrigin(0.5, 1)
    this.add.text(2110, 440, 'FINISH', { fontFamily: 'monospace', fontSize: '12px', color: '#d1fae5' })
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(this.startPosition.x, this.startPosition.y, 'player')
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
    }) as { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; w: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key }
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
  }

  private createCollisions() {
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.player, this.gateBarrier)

    this.physics.add.overlap(this.player, this.coins, (_player, coin) => {
      coin.destroy()
      addScore(2)
      this.flashStatus('+2 coin')
    })

    this.physics.add.overlap(this.player, this.quizBlocks, (_player, block) => {
      const quizBlock = block as QuizBlock
      if (quizBlock.getData('solved')) return
      void this.triggerQuiz('block', quizBlock)
    })

    this.physics.add.overlap(this.player, this.gateSensor, () => {
      if (this.gateOpened) return
      void this.triggerQuiz('gate')
    })
  }

  private async triggerQuiz(kind: 'block' | 'gate', block?: QuizBlock) {
    if (this.quizBusy || this.levelFinished) return
    this.quizBusy = true
    this.physics.world.pause()
    this.player.setVelocity(0, 0)

    const state = getState()
    const result = await showQuizOverlay({
      gradeMode: state.gradeMode,
      title: kind === 'gate' ? 'Gate Quiz' : 'Quiz Block',
      subtitle: kind === 'gate' ? 'Darvozani ochish uchun yeching' : "Block bonusni olish uchun javob bering",
      durationSec: 15,
    })

    if (result) {
      addScore(10)
      this.flashStatus('+10 to‘g‘ri javob')

      if (kind === 'block' && block) {
        block.setData('solved', true)
        block.setTexture('quiz-block-used')
      }

      if (kind === 'gate') {
        this.openGate()
      }
    } else {
      loseLife()
      const restarted = restartRunIfNoLives()
      this.flashStatus(restarted ? 'Lives tugadi. Run qayta boshlandi.' : 'Noto‘g‘ri! Level boshiga qaytdi.')
      if (restarted) resetLevelTimer()
      this.resetLevelPosition()
    }

    this.physics.world.resume()
    this.quizBusy = false
  }

  private openGate() {
    this.gateOpened = true
    this.gateVisual.setTexture('gate-open')
    this.gateBarrier.disableBody(true, true)
    this.flashStatus('Darvoza ochildi! Finishga boring.')
  }

  private resetLevelPosition() {
    this.player.setPosition(this.startPosition.x, this.startPosition.y)
    this.player.setVelocity(0, 0)
    this.cameras.main.stopFollow()
    this.cameras.main.scrollX = 0
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)

    if (getState().lives <= 0) {
      // restore gate/coins/blocks on fresh run after lives reset
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

  update() {
    const s = getState()
    const onGround = this.player.body.blocked.down || this.player.body.touching.down

    if (!this.quizBusy && !this.levelFinished) {
      const left = this.cursors.left.isDown || this.keys.a.isDown
      const right = this.cursors.right.isDown || this.keys.d.isDown
      const jumpPressed =
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keys.w) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space)

      if (left && !right) {
        this.player.setVelocityX(-220)
      } else if (right && !left) {
        this.player.setVelocityX(220)
      } else {
        this.player.setVelocityX(0)
      }

      if (jumpPressed && onGround) {
        this.player.setVelocityY(-430)
      }
    }

    if (this.player.y > 620 && !this.quizBusy) {
      loseLife()
      this.flashStatus('Pastga tushib ketdingiz! -1 life')
      if (restartRunIfNoLives()) {
        this.scene.restart()
        return
      }
      this.resetLevelPosition()
    }

    if (this.gateOpened && !this.levelFinished && this.player.x >= 2140) {
      this.levelFinished = true
      addScore(20)
      this.flashStatus('Level tugadi! +20 bonus')
      this.physics.world.pause()
      this.time.delayedCall(1200, () => {
        resetForNewGame()
        this.scene.restart()
      })
    }

    const timeLeft = getLevelSecondsRemaining()
    if (timeLeft <= 0 && !this.quizBusy && !this.levelFinished) {
      loseLife()
      resetLevelTimer()
      this.flashStatus('Vaqt tugadi! Level restart.')
      if (restartRunIfNoLives()) {
        this.scene.restart()
        return
      }
      this.resetLevelPosition()
    }

    const progress = Phaser.Math.Clamp((this.player.x / 2160) * 100, 0, 100)
    this.hudText.setText(
      `Score: ${s.score}   Lives: ${s.lives}   Time: ${timeLeft}s   Progress: ${Math.round(progress)}%`,
    )
  }
}

