import Phaser from 'phaser'
import {
  BASE_GHOST_FRIGHTENED_SPEED,
  BASE_GHOST_SPEED,
  BASE_PLAYER_SPEED,
  CENTER_EPSILON,
  GAME_HEIGHT,
  GAME_WIDTH,
  GHOST_STARTS,
  LEVEL_SPEED_SCALE_STEP,
  MAZE_LAYOUT,
  PLAYER_START,
  STORAGE_LEVEL_KEY,
  TILE_SIZE,
} from '../game/constants'
import type { EduSettings } from '../game/eduSettings'
import { DEFAULT_EDU_SETTINGS, loadEduSettings } from '../game/eduSettings'
import { chooseGhostDirection } from '../game/pathfinding'
import {
  blockedDirections,
  canMove,
  isIntersection,
  stepGridEntity,
  tileToWorldCenter,
  type Direction,
  type GridEntity,
  worldToTile,
} from '../game/movement'
import { readDesiredDirection } from '../game/input'
import { QuizManager, type QuizTrigger } from '../game/quizManager'

type GhostEntity = GridEntity & {
  sprite: Phaser.GameObjects.Image
  key: string
  frightenedUntil: number
  home: { tx: number; ty: number }
  scatter: { tx: number; ty: number }
  decisionTileKey: string
}

type PlayerEntity = GridEntity & {
  sprite: Phaser.GameObjects.Image
}

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']
const QUIZ_GATES = new Set<string>(['1,1', '17,1', '1,20', '17,20', '9,10'])

function k(tx: number, ty: number) {
  return `${tx},${ty}`
}

function speedScale(level: number) {
  return 1 + (Math.max(1, level) - 1) * LEVEL_SPEED_SCALE_STEP
}

function loadLevel() {
  const raw = Number(window.localStorage.getItem(STORAGE_LEVEL_KEY) ?? 1)
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1
}

function saveLevel(level: number) {
  window.localStorage.setItem(STORAGE_LEVEL_KEY, String(Math.max(1, Math.floor(level))))
}

export class LevelScene extends Phaser.Scene {
  private grid = MAZE_LAYOUT.map((row) => row.split(''))
  private gridRows: string[] = Array.from(MAZE_LAYOUT)
  private pelletSprites = new Map<string, Phaser.GameObjects.Image>()
  private pellets = new Set<string>()
  private powerPellets = new Set<string>()

  private player!: PlayerEntity
  private ghosts: GhostEntity[] = []

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: Record<'W' | 'A' | 'S' | 'D' | 'G', Phaser.Input.Keyboard.Key>

  private score = 0
  private lives = 3
  private level = 1

  private levelText!: Phaser.GameObjects.Text
  private hudText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text

  private debugOn = false
  private debugGraphics!: Phaser.GameObjects.Graphics
  private debugText!: Phaser.GameObjects.Text
  private debugCenter!: Phaser.GameObjects.Arc

  private quizManager = new QuizManager(() => this.getEduSettings())
  private isQuizActive = false
  private pendingQuizTrigger: QuizTrigger | null = null
  private pelletsEaten = 0
  private usedGates = new Set<string>()
  private slowUntil = 0
  private playerInfected = false
  private infectedGhosts = new Set<number>([0])

  constructor() {
    super('LevelScene')
  }

  create() {
    this.level = loadLevel()
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,G') as Record<'W' | 'A' | 'S' | 'D' | 'G', Phaser.Input.Keyboard.Key>

    this.createBoard()
    this.createEntities()
    this.createHud()
    this.createDebug()

    this.input.keyboard?.on('keydown-G', () => {
      this.debugOn = !this.debugOn
      this.debugGraphics.setVisible(this.debugOn)
      this.debugText.setVisible(this.debugOn)
      this.debugCenter.setVisible(this.debugOn)
    })

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-G')
    })
  }

  private getEduSettings(): EduSettings {
    const getter = (window as any).__pacGetEduSettings as (() => EduSettings) | undefined
    if (getter) {
      try {
        return getter()
      } catch {
        return loadEduSettings()
      }
    }
    return DEFAULT_EDU_SETTINGS
  }

  private getActiveTeamInfo() {
    const settings = this.getEduSettings()
    if (!settings.classroom.enabled) return { idx: null as number | null, name: undefined as string | undefined }
    const teamGetter = (window as any).__pacGetActiveTeamIndex as (() => number) | undefined
    const idx = typeof teamGetter === 'function' ? teamGetter() : 0
    return { idx, name: settings.classroom.teams[idx] ?? `Jamoa ${idx + 1}` }
  }

  private emitQuizResult(pointsDelta: number, correct: boolean, trigger: QuizTrigger) {
    const info = this.getActiveTeamInfo()
    const cb = (window as any).__pacOnQuizResult as
      | ((payload: { teamIdx: number | null; pointsDelta: number; correct: boolean; trigger: QuizTrigger }) => void)
      | undefined
    cb?.({ teamIdx: info.idx, pointsDelta, correct, trigger })
  }

  private enqueueQuiz(trigger: QuizTrigger) {
    if (this.isQuizActive || this.pendingQuizTrigger) return
    this.pendingQuizTrigger = trigger
  }

  private async runQuiz(trigger: QuizTrigger) {
    this.isQuizActive = true
    ;(window as any).__pacTouchInput = { hold: null, swipe: null }

    const team = this.getActiveTeamInfo()
    const settings = this.getEduSettings()

    this.statusText.setText(`Quiz: ${team.name ?? 'Player'} javob bermoqda...`)

    const outcome = await this.quizManager.ask(trigger, team.name)

    let scoreDelta = 0

    if (outcome.correct) {
      if (trigger === 'power-pellet') {
        scoreDelta += 100
        const now = this.time.now
        this.ghosts.forEach((ghost) => {
          ghost.frightenedUntil = Math.max(ghost.frightenedUntil, now) + 2000
          ghost.sprite.setTexture('ghost-frightened')
        })
      } else if (trigger === 'pellet-milestone') {
        scoreDelta += 120
        if (Math.random() < 0.2) this.lives += 1
      } else {
        scoreDelta += 150
      }
    } else if (outcome.status === 'skip') {
      scoreDelta -= settings.skipCost
    } else {
      if (settings.wrongPenalty === 'lose-points') {
        scoreDelta -= 90
      } else if (settings.wrongPenalty === 'lose-life') {
        this.loseLife()
      } else if (settings.wrongPenalty === 'slow-player') {
        this.slowUntil = this.time.now + 3000
      } else if (settings.wrongPenalty === 'end-frightened') {
        this.ghosts.forEach((ghost) => {
          ghost.frightenedUntil = 0
          ghost.sprite.setTexture(ghost.key)
        })
      }
    }

    if (scoreDelta !== 0) {
      this.score = Math.max(0, this.score + scoreDelta)
    }

    this.emitQuizResult(scoreDelta, outcome.correct, trigger)
    this.statusText.setText(
      outcome.correct
        ? `To'g'ri! +${Math.max(0, scoreDelta)} reward`
        : outcome.status === 'skip'
          ? `Skip. -${settings.skipCost} ball`
          : `Xato javob. Penalty qo'llandi.`,
    )

    this.isQuizActive = false
    this.updateHud()
  }

  private createBoard() {
    this.gridRows = this.grid.map((r) => r.join(''))
    this.pelletSprites.clear()
    this.pellets.clear()
    this.powerPellets.clear()
    this.pelletsEaten = 0
    this.usedGates.clear()

    const wallGroup = this.add.group()

    for (let ty = 0; ty < this.grid.length; ty += 1) {
      for (let tx = 0; tx < this.grid[ty].length; tx += 1) {
        const ch = this.grid[ty][tx]
        const c = tileToWorldCenter(tx, ty)

        if (ch === '#') {
          const wall = this.add.image(c.x, c.y, 'wall')
          wall.setAlpha(0.95)
          wallGroup.add(wall)
          continue
        }

        if (ch === '.') {
          const p = this.add.image(c.x, c.y, 'pellet').setScale(0.75)
          this.pellets.add(k(tx, ty))
          this.pelletSprites.set(k(tx, ty), p)
        }

        if (ch === 'o') {
          const p = this.add.image(c.x, c.y, 'power').setScale(0.9)
          this.powerPellets.add(k(tx, ty))
          this.pelletSprites.set(k(tx, ty), p)
        }
      }
    }

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT)
      .setDepth(-20)
      .setFillStyle(0x05060a, 1)
  }

  private createEntities() {
    const pCenter = tileToWorldCenter(PLAYER_START.x, PLAYER_START.y)
    const pSpeed = BASE_PLAYER_SPEED * speedScale(this.level)

    this.player = {
      sprite: this.add.image(pCenter.x, pCenter.y, 'player').setDepth(6),
      tx: PLAYER_START.x,
      ty: PLAYER_START.y,
      x: pCenter.x,
      y: pCenter.y,
      currentDirection: 'none',
      desiredDirection: 'none',
      speed: pSpeed,
    }
    this.playerInfected = false
    this.infectedGhosts = new Set<number>([0])

    const ghostKeys = ['ghost-red', 'ghost-pink', 'ghost-cyan', 'ghost-orange']

    this.ghosts = GHOST_STARTS.map((start, idx) => {
      const c = tileToWorldCenter(start.x, start.y)
      const gSpeed = BASE_GHOST_SPEED * speedScale(this.level)
      const scatterTargets = [
        { tx: 1, ty: 1 },
        { tx: 17, ty: 1 },
        { tx: 1, ty: 20 },
        { tx: 17, ty: 20 },
      ]
      return {
        sprite: this.add.image(c.x, c.y, ghostKeys[idx % ghostKeys.length]).setDepth(5),
        tx: start.x,
        ty: start.y,
        x: c.x,
        y: c.y,
        currentDirection: idx % 2 === 0 ? 'left' : 'right',
        desiredDirection: idx % 2 === 0 ? 'left' : 'right',
        speed: gSpeed,
        key: ghostKeys[idx % ghostKeys.length],
        frightenedUntil: 0,
        home: { tx: start.x, ty: start.y },
        scatter: scatterTargets[idx],
        decisionTileKey: '',
      }
    })
    this.statusText?.setText('Qizil aylana sizni quvmoqda. Undan qoching!')
  }

  private createHud() {
    this.levelText = this.add
      .text(10, 8, '', {
        color: '#cbd5e1',
        fontSize: '14px',
        fontStyle: '700',
      })
      .setDepth(20)

    this.hudText = this.add
      .text(10, 28, '', {
        color: '#e2e8f0',
        fontSize: '14px',
      })
      .setDepth(20)

    this.statusText = this.add
      .text(10, 48, '', {
        color: '#93c5fd',
        fontSize: '12px',
      })
      .setDepth(20)

    this.updateHud()
  }

  private createDebug() {
    this.debugGraphics = this.add.graphics().setDepth(30).setVisible(false)
    this.debugText = this.add
      .text(10, 66, '', { color: '#93c5fd', fontSize: '12px', fontFamily: 'monospace' })
      .setDepth(30)
      .setVisible(false)

    this.debugCenter = this.add.circle(0, 0, 3, 0x22d3ee, 1).setDepth(31).setVisible(false)

    this.debugGraphics.lineStyle(1, 0x1e3a8a, 0.4)
    for (let x = 0; x <= GAME_WIDTH; x += TILE_SIZE) {
      this.debugGraphics.lineBetween(x, 0, x, GAME_HEIGHT)
    }
    for (let y = 0; y <= GAME_HEIGHT; y += TILE_SIZE) {
      this.debugGraphics.lineBetween(0, y, GAME_WIDTH, y)
    }
  }

  private updateHud() {
    this.levelText.setText(`PAC EDU  •  Level ${this.level}`)
    this.hudText.setText(`Score: ${this.score}  Lives: ${this.lives}  Pellets: ${this.pellets.size + this.powerPellets.size}`)
  }

  private nearestUninfectedGhostTile(fromX: number, fromY: number): { tx: number; ty: number } | null {
    let best: { tx: number; ty: number } | null = null
    let bestDist = Number.POSITIVE_INFINITY
    this.ghosts.forEach((ghost, idx) => {
      if (this.infectedGhosts.has(idx)) return
      const d = Phaser.Math.Distance.Between(fromX, fromY, ghost.x, ghost.y)
      if (d < bestDist) {
        bestDist = d
        best = { tx: ghost.tx, ty: ghost.ty }
      }
    })
    return best
  }

  private chooseFleeDirection(tx: number, ty: number, threatX: number, threatY: number, current: Direction) {
    const open = DIRECTIONS.filter((d) => canMove(this.gridRows, tx, ty, d))
    if (open.length === 0) return current
    let best = open[0]
    let bestScore = -Infinity
    for (const dir of open) {
      const candidate = tileToWorldCenter(
        tx + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0),
        ty + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0),
      )
      const score = Phaser.Math.Distance.Between(candidate.x, candidate.y, threatX, threatY)
      if (score > bestScore) {
        bestScore = score
        best = dir
      }
    }
    return best
  }

  private chooseTowardDirection(tx: number, ty: number, targetX: number, targetY: number, current: Direction) {
    const open = DIRECTIONS.filter((d) => canMove(this.gridRows, tx, ty, d))
    if (open.length === 0) return current
    let best = open[0]
    let bestScore = Number.POSITIVE_INFINITY
    for (const dir of open) {
      const candidate = tileToWorldCenter(
        tx + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0),
        ty + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0),
      )
      const score = Phaser.Math.Distance.Between(candidate.x, candidate.y, targetX, targetY)
      if (score < bestScore) {
        bestScore = score
        best = dir
      }
    }
    return best
  }

  private setDesiredDirectionFromInput() {
    const desired = readDesiredDirection({ cursors: this.cursors, keys: this.keys })
    if (desired) this.player.desiredDirection = desired
  }

  private applyEntityVisual(entity: GridEntity & { sprite: Phaser.GameObjects.Image }) {
    entity.sprite.setPosition(entity.x, entity.y)
    if (entity.currentDirection === 'left') entity.sprite.setRotation(Math.PI)
    if (entity.currentDirection === 'right') entity.sprite.setRotation(0)
    if (entity.currentDirection === 'up') entity.sprite.setRotation(-Math.PI / 2)
    if (entity.currentDirection === 'down') entity.sprite.setRotation(Math.PI / 2)
  }

  private consumePelletAtPlayerCenter() {
    const tx = this.player.tx
    const ty = this.player.ty
    const center = tileToWorldCenter(tx, ty)
    if (Math.abs(this.player.x - center.x) > CENTER_EPSILON || Math.abs(this.player.y - center.y) > CENTER_EPSILON) return
    const key = k(tx, ty)
    const settings = this.getEduSettings()

    if (this.pellets.has(key)) {
      this.pellets.delete(key)
      this.pelletSprites.get(key)?.destroy()
      this.pelletSprites.delete(key)
      this.pelletsEaten += 1
      this.score += 10

      if (
        settings.triggers.pelletMilestone &&
        this.pelletsEaten > 0 &&
        this.pelletsEaten % settings.triggers.pelletMilestoneEvery === 0
      ) {
        this.enqueueQuiz('pellet-milestone')
      }

      this.updateHud()
      return
    }

    if (this.powerPellets.has(key)) {
      this.powerPellets.delete(key)
      this.pelletSprites.get(key)?.destroy()
      this.pelletSprites.delete(key)
      this.score += 50
      const now = this.time.now
      for (const ghost of this.ghosts) {
        ghost.frightenedUntil = now + 7000
        ghost.sprite.setTexture('ghost-frightened')
      }

      if (settings.triggers.powerPellet) this.enqueueQuiz('power-pellet')
      this.updateHud()
    }
  }

  private checkQuizGateTrigger() {
    const settings = this.getEduSettings()
    if (!settings.triggers.quizGate) return
    const key = k(this.player.tx, this.player.ty)
    if (!QUIZ_GATES.has(key)) return
    if (this.usedGates.has(key)) return
    this.usedGates.add(key)
    this.enqueueQuiz('quiz-gate')
  }

  private updateGhosts(dt: number) {
    const playerTile = worldToTile(this.player.x, this.player.y)
    const now = this.time.now

    for (let idx = 0; idx < this.ghosts.length; idx += 1) {
      const ghost = this.ghosts[idx]
      const ghostTile = worldToTile(ghost.x, ghost.y)
      const frightened = ghost.frightenedUntil > now
      const ghostIsInfected = this.infectedGhosts.has(idx)

      ghost.speed = (frightened ? BASE_GHOST_FRIGHTENED_SPEED : BASE_GHOST_SPEED) * speedScale(this.level)
      if (ghostIsInfected) ghost.speed *= 1.06

      if (ghostIsInfected) {
        if (ghost.sprite.texture.key !== 'ghost-red') ghost.sprite.setTexture('ghost-red')
      } else if (!frightened && ghost.sprite.texture.key !== ghost.key) {
        ghost.sprite.setTexture(ghost.key)
      }

      const center = tileToWorldCenter(ghostTile.tx, ghostTile.ty)
      const atCenter = Math.abs(ghost.x - center.x) <= CENTER_EPSILON && Math.abs(ghost.y - center.y) <= CENTER_EPSILON
      const blockedAhead = atCenter && !canMove(this.gridRows, ghostTile.tx, ghostTile.ty, ghost.currentDirection)

      const decisionKey = `${ghostTile.tx},${ghostTile.ty}`
      const needsDecision = atCenter && (blockedAhead || isIntersection(this.gridRows, ghostTile.tx, ghostTile.ty))
      const forceRecompute = ghost.currentDirection === 'none' || blockedAhead
      if (needsDecision && (ghost.decisionTileKey !== decisionKey || forceRecompute)) {
        ghost.decisionTileKey = decisionKey
        if (ghostIsInfected) {
          if (this.playerInfected) {
            const prey: { tx: number; ty: number } | null = this.nearestUninfectedGhostTile(ghost.x, ghost.y)
            if (prey) {
              const preyCenter = tileToWorldCenter(prey.tx, prey.ty)
              ghost.desiredDirection = this.chooseTowardDirection(
                ghostTile.tx,
                ghostTile.ty,
                preyCenter.x,
                preyCenter.y,
                ghost.currentDirection,
              )
            } else {
              ghost.desiredDirection = this.chooseFleeDirection(ghostTile.tx, ghostTile.ty, this.player.x, this.player.y, ghost.currentDirection)
            }
          } else {
            ghost.desiredDirection = this.chooseTowardDirection(
              ghostTile.tx,
              ghostTile.ty,
              this.player.x,
              this.player.y,
              ghost.currentDirection,
            )
          }
        } else if (this.playerInfected) {
          ghost.desiredDirection = this.chooseFleeDirection(ghostTile.tx, ghostTile.ty, this.player.x, this.player.y, ghost.currentDirection)
        } else if (frightened) {
          const opens = DIRECTIONS.filter((d) => canMove(this.gridRows, ghostTile.tx, ghostTile.ty, d))
          ghost.desiredDirection = opens[Math.floor(Math.random() * opens.length)] ?? ghost.currentDirection
        } else {
          ghost.desiredDirection = chooseGhostDirection(
            this.gridRows,
            ghostTile,
            playerTile,
            ghost.currentDirection,
          )
        }
      }

      stepGridEntity(ghost, this.gridRows, dt, CENTER_EPSILON)
      if (!atCenter) ghost.decisionTileKey = ''
      this.applyEntityVisual(ghost)

      const distance = Phaser.Math.Distance.Between(ghost.x, ghost.y, this.player.x, this.player.y)
      if (distance <= TILE_SIZE * 0.45) {
        if (!this.playerInfected && ghostIsInfected) {
          this.playerInfected = true
          this.player.sprite.setTexture('ghost-red')
          this.statusText.setText("Siz yuqtirildingiz! Endi qolgan aylanalarni birga quving!")
          continue
        }

        if (this.playerInfected && !ghostIsInfected) {
          this.infectedGhosts.add(idx)
          ghost.sprite.setTexture('ghost-red')
          this.score += 140
          this.statusText.setText(`Yuqtirildi! Qolganlari: ${this.ghosts.length - this.infectedGhosts.size}`)
          continue
        }

        if (frightened && !ghostIsInfected) {
          this.score += 200
          const home = tileToWorldCenter(ghost.home.tx, ghost.home.ty)
          ghost.x = home.x
          ghost.y = home.y
          ghost.currentDirection = 'none'
          ghost.desiredDirection = 'none'
          ghost.decisionTileKey = ''
          ghost.frightenedUntil = 0
          ghost.sprite.setTexture(ghost.key)
          this.applyEntityVisual(ghost)
          this.updateHud()
        } else if (!this.playerInfected && !ghostIsInfected) {
          this.loseLife()
          return
        }
      }
    }

    if (this.playerInfected && this.infectedGhosts.size >= this.ghosts.length) {
      this.statusText.setText("Barcha aylanalar yuqtirildi! Zombie jamoa g'olib!")
    }
  }

  private loseLife() {
    this.lives -= 1
    if (this.lives <= 0) {
      this.lives = 3
      this.level = 1
      saveLevel(this.level)
      this.score = 0
      this.resetRound(true)
      return
    }
    this.resetRound(false)
  }

  private resetRound(fullReset: boolean) {
    if (fullReset) {
      this.grid = MAZE_LAYOUT.map((row) => row.split(''))
      this.children.removeAll()
      this.createBoard()
      this.createEntities()
      this.createHud()
      this.createDebug()
      this.debugOn = false
      this.debugGraphics.setVisible(false)
      this.debugText.setVisible(false)
      this.debugCenter.setVisible(false)
      this.pendingQuizTrigger = null
      this.isQuizActive = false
      this.slowUntil = 0
      this.playerInfected = false
      this.infectedGhosts = new Set<number>([0])
      return
    }

    const pCenter = tileToWorldCenter(PLAYER_START.x, PLAYER_START.y)
    this.player.x = pCenter.x
    this.player.y = pCenter.y
    this.player.tx = PLAYER_START.x
    this.player.ty = PLAYER_START.y
    this.player.currentDirection = 'none'
    this.player.desiredDirection = 'none'
    this.playerInfected = false
    this.player.sprite.setTexture('player')
    this.applyEntityVisual(this.player)

    this.infectedGhosts = new Set<number>([0])
    this.ghosts.forEach((ghost, idx) => {
      const c = tileToWorldCenter(ghost.home.tx, ghost.home.ty)
      ghost.x = c.x
      ghost.y = c.y
      ghost.tx = ghost.home.tx
      ghost.ty = ghost.home.ty
      ghost.currentDirection = 'none'
      ghost.desiredDirection = 'none'
      ghost.decisionTileKey = ''
      ghost.frightenedUntil = 0
      ghost.sprite.setTexture(idx === 0 ? 'ghost-red' : ghost.key)
      this.applyEntityVisual(ghost)
    })

    this.updateHud()
  }

  private maybeAdvanceLevel() {
    if (this.pellets.size + this.powerPellets.size > 0) return

    this.level += 1
    saveLevel(this.level)
    this.grid = MAZE_LAYOUT.map((row) => row.split(''))
    this.children.removeAll()
    this.createBoard()
    this.createEntities()
    this.createHud()
    this.createDebug()
    this.debugOn = false
    this.debugGraphics.setVisible(false)
    this.debugText.setVisible(false)
    this.debugCenter.setVisible(false)
    this.pendingQuizTrigger = null
    this.isQuizActive = false
    this.slowUntil = 0
  }

  update(_: number, delta: number) {
    const dt = Math.min(1 / 30, delta / 1000)

    if (this.isQuizActive) {
      this.updateHud()
      return
    }

    this.setDesiredDirectionFromInput()

    const slowFactor = this.time.now < this.slowUntil ? 0.6 : 1
    this.player.speed = BASE_PLAYER_SPEED * speedScale(this.level) * slowFactor

    stepGridEntity(this.player, this.gridRows, dt, CENTER_EPSILON)
    this.applyEntityVisual(this.player)

    this.consumePelletAtPlayerCenter()
    this.checkQuizGateTrigger()
    this.updateGhosts(dt)
    this.maybeAdvanceLevel()
    this.updateHud()

    if (this.pendingQuizTrigger) {
      const trigger = this.pendingQuizTrigger
      this.pendingQuizTrigger = null
      void this.runQuiz(trigger)
      return
    }

    if (this.debugOn) {
      const tile = worldToTile(this.player.x, this.player.y)
      const center = tileToWorldCenter(tile.tx, tile.ty)
      const blocked = blockedDirections(this.gridRows, tile.tx, tile.ty)
      this.debugText.setText(
        `tile: (${tile.tx},${tile.ty})\ncurrent: ${this.player.currentDirection}\ndesired: ${this.player.desiredDirection}\nblocked U:${Number(blocked.up)} D:${Number(blocked.down)} L:${Number(blocked.left)} R:${Number(blocked.right)}\nquizActive:${this.isQuizActive ? 1 : 0}`,
      )
      this.debugCenter.setPosition(center.x, center.y)
    }
  }
}
