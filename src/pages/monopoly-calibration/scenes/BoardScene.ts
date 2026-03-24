import Phaser from 'phaser'
import monopolyBoardImage from '../../../assets/monopoly.jpg'
import {
  TILE_COUNT,
  type TileMap,
  clearTileMap,
  exportTileMap,
  filledCount,
  getTilePosition,
  hasSavedTileMap,
  importTileMap,
  loadTileMap,
  saveTileMap,
  setTilePoint,
} from '../logic/positions'

type Marker = {
  circle: Phaser.GameObjects.Arc
  label: Phaser.GameObjects.Text
}

type TokenState = {
  tileIndex: number
  color: number
  active: boolean
  name: string
}

type SceneStatus = {
  calibrating: boolean
  selectedTile: number
  filled: number
  total: number
  hasSaved: boolean
  tokenTileIndices: number[]
}

const DEFAULT_TOKENS: TokenState[] = [
  { tileIndex: 0, color: 0x22d3ee, active: true, name: 'P1' },
  { tileIndex: 0, color: 0xfb7185, active: false, name: 'P2' },
  { tileIndex: 0, color: 0xfacc15, active: false, name: 'P3' },
  { tileIndex: 0, color: 0x86efac, active: false, name: 'P4' },
]

export class BoardScene extends Phaser.Scene {
  private board!: Phaser.GameObjects.Image
  private boardBounds = new Phaser.Geom.Rectangle(0, 0, 1, 1)

  private tileMap: TileMap = []
  private markers: Marker[] = []
  private selectedTile = 0
  private calibrating = false
  private draggingTile: number | null = null

  private tokenSprites: Phaser.GameObjects.Arc[] = []
  private tokenRings: Phaser.GameObjects.Arc[] = []
  private tokenLabels: Phaser.GameObjects.Text[] = []
  private tokenStates: TokenState[] = [...DEFAULT_TOKENS]
  private previewTokenIndex = 0

  private infoText!: Phaser.GameObjects.Text
  private animating = false

  constructor() {
    super('MonopolyBoardScene')
  }

  preload() {
    this.load.image('monopoly-board', monopolyBoardImage)
  }

  create() {
    this.tileMap = loadTileMap()
    this.calibrating = new URLSearchParams(window.location.search).get('calibrate') === '1'

    this.board = this.add.image(this.scale.width / 2, this.scale.height / 2, 'monopoly-board').setOrigin(0.5)
    this.fitBoard()

    this.createMarkers()
    this.createTokens()

    this.infoText = this.add
      .text(12, this.scale.height - 30, '', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        color: '#dbeafe',
        fontStyle: '600',
      })
      .setDepth(100)
      .setScrollFactor(0)

    this.board.setInteractive({ useHandCursor: this.calibrating })

    this.board.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.calibrating) return
      if (this.draggingTile !== null) return
      const local = this.clampPointerToBoard(pointer.worldX, pointer.worldY)
      this.tileMap = setTilePoint(this.tileMap, this.selectedTile, local.x, local.y, this.boardBounds)
      this.redrawMarkers()
      this.updateTokenPositions()
      this.updateStatus()
      this.emitStatus()
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.calibrating || this.draggingTile === null || !pointer.isDown) return
      const local = this.clampPointerToBoard(pointer.worldX, pointer.worldY)
      this.tileMap = setTilePoint(this.tileMap, this.draggingTile, local.x, local.y, this.boardBounds)
      this.redrawMarkers()
      this.updateTokenPositions()
      this.updateStatus()
      this.emitStatus()
    })

    this.input.on('pointerup', () => {
      this.draggingTile = null
    })

    this.input.keyboard?.on('keydown-N', () => this.nextTile())
    this.input.keyboard?.on('keydown-P', () => this.prevTile())
    this.input.keyboard?.on('keydown-LEFT', () => this.movePreviewBy(-1))
    this.input.keyboard?.on('keydown-UP', () => this.movePreviewBy(-1))
    this.input.keyboard?.on('keydown-RIGHT', () => this.movePreviewBy(1))
    this.input.keyboard?.on('keydown-DOWN', () => this.movePreviewBy(1))

    this.scale.on('resize', () => {
      this.fitBoard()
      this.redrawMarkers()
      this.updateTokenPositions()
      this.updateStatus()
    })

    this.updateMarkerVisibility()
    this.updateTokenPositions()
    this.updateStatus()
    this.emitStatus()
  }

  private fitBoard() {
    const maxW = this.scale.width * 0.96
    const maxH = this.scale.height * 0.96

    const texW = this.board.texture.getSourceImage().width
    const texH = this.board.texture.getSourceImage().height
    const scale = Math.min(maxW / texW, maxH / texH)

    this.board.setDisplaySize(texW * scale, texH * scale)
    this.board.setPosition(this.scale.width / 2, this.scale.height / 2)

    const bounds = this.board.getBounds()
    this.boardBounds.setTo(bounds.x, bounds.y, bounds.width, bounds.height)
    this.infoText?.setPosition(12, this.scale.height - 30)
  }

  private createMarkers() {
    this.markers = []
    for (let i = 0; i < TILE_COUNT; i += 1) {
      const circle = this.add.circle(0, 0, 9, 0x38bdf8, 0.9).setDepth(30)
      const label = this.add
        .text(0, 0, String(i), {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '13px',
          color: '#ffffff',
          fontStyle: '700',
        })
        .setOrigin(0.5)
        .setDepth(31)

      circle.setInteractive({ useHandCursor: true })
      circle.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.calibrating) return
        this.selectedTile = i
        this.draggingTile = i
        const local = this.clampPointerToBoard(pointer.worldX, pointer.worldY)
        this.tileMap = setTilePoint(this.tileMap, i, local.x, local.y, this.boardBounds)
        this.redrawMarkers()
        this.updateTokenPositions()
        this.updateStatus()
        this.emitStatus()
      })

      this.markers.push({ circle, label })
    }
    this.redrawMarkers()
  }

  private createTokens() {
    this.tokenSprites = []
    this.tokenRings = []
    this.tokenLabels = []

    for (let i = 0; i < 4; i += 1) {
      const token = this.add.circle(0, 0, 11, 0xffffff, 1).setDepth(40)
      token.setStrokeStyle(2, 0x0f172a, 1)
      const ring = this.add.circle(0, 0, 18, 0xffffff, 0).setDepth(39)
      ring.setStrokeStyle(3, 0x67e8f9, 0.95)
      const label = this.add
        .text(0, 0, `P${i + 1}`, {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '11px',
          color: '#ffffff',
          fontStyle: '700',
        })
        .setOrigin(0.5)
        .setDepth(41)

      this.tokenSprites.push(token)
      this.tokenRings.push(ring)
      this.tokenLabels.push(label)
    }
  }

  private clampPointerToBoard(x: number, y: number) {
    const cx = Phaser.Math.Clamp(x, this.boardBounds.left, this.boardBounds.right)
    const cy = Phaser.Math.Clamp(y, this.boardBounds.top, this.boardBounds.bottom)
    return { x: cx, y: cy }
  }

  private redrawMarkers() {
    for (let i = 0; i < TILE_COUNT; i += 1) {
      const marker = this.markers[i] as Marker
      const pos = getTilePosition(i, this.boardBounds, this.tileMap)
      marker.circle.setPosition(pos.x, pos.y)
      marker.label.setPosition(pos.x, pos.y)

      const isSelected = i === this.selectedTile
      marker.circle.setRadius(isSelected ? 12 : 9)
      marker.circle.setFillStyle(isSelected ? 0xf97316 : 0x38bdf8, 0.9)
      marker.circle.setStrokeStyle(isSelected ? 3 : 1, isSelected ? 0xffedd5 : 0xffffff, isSelected ? 1 : 0.65)
    }
  }

  private updateTokenPositions() {
    const offsets = [
      { x: -14, y: -14 },
      { x: 14, y: -14 },
      { x: -14, y: 14 },
      { x: 14, y: 14 },
    ]

    this.tokenStates.forEach((tokenState, idx) => {
      const pos = getTilePosition(tokenState.tileIndex, this.boardBounds, this.tileMap)
      const offset = offsets[idx] ?? { x: 0, y: 0 }
      const x = pos.x + offset.x
      const y = pos.y + offset.y

      const circle = this.tokenSprites[idx]
      const ring = this.tokenRings[idx]
      const label = this.tokenLabels[idx]

      if (!circle || !ring || !label) return

      circle.setPosition(x, y)
      circle.setFillStyle(tokenState.color, 1)
      circle.setVisible(!tokenState.name.startsWith('__hidden'))

      ring.setPosition(x, y)
      ring.setVisible(tokenState.active)

      label.setPosition(x, y - 18)
      label.setText(tokenState.name)
      label.setVisible(!tokenState.name.startsWith('__hidden'))
    })
  }

  private updateMarkerVisibility() {
    this.board.input?.enabled && (this.board.input.cursor = this.calibrating ? 'pointer' : 'default')
    this.markers.forEach((marker) => {
      marker.circle.setVisible(this.calibrating)
      marker.label.setVisible(this.calibrating)
      marker.circle.input && (marker.circle.input.enabled = this.calibrating)
    })
  }

  private updateStatus() {
    const active = this.tokenStates.findIndex((t) => t.active)
    const text = this.calibrating
      ? `Calibration ON • Tile ${this.selectedTile} • Filled ${filledCount(this.tileMap)}/${TILE_COUNT}`
      : `Calibration OFF • Active P${active >= 0 ? active + 1 : 1} • Tokens ${this.tokenStates.map((t) => t.tileIndex).join(', ')}`
    this.infoText?.setText(text)
  }

  private emitStatus() {
    const payload: SceneStatus = {
      calibrating: this.calibrating,
      selectedTile: this.selectedTile,
      filled: filledCount(this.tileMap),
      total: TILE_COUNT,
      hasSaved: hasSavedTileMap(),
      tokenTileIndices: this.tokenStates.map((t) => t.tileIndex),
    }
    ;(window as any).__monoStatus = payload
  }

  setCalibrationMode(value: boolean) {
    this.calibrating = value
    this.draggingTile = null
    this.updateMarkerVisibility()
    this.updateStatus()
    this.emitStatus()
  }

  getCalibrationMode() {
    return this.calibrating
  }

  getSelectedTile() {
    return this.selectedTile
  }

  setSelectedTile(index: number) {
    this.selectedTile = Phaser.Math.Wrap(Math.floor(index), 0, TILE_COUNT)
    this.redrawMarkers()
    this.updateStatus()
    this.emitStatus()
  }

  nextTile() {
    this.setSelectedTile(this.selectedTile + 1)
  }

  prevTile() {
    this.setSelectedTile(this.selectedTile - 1)
  }

  saveMap() {
    saveTileMap(this.tileMap)
    this.emitStatus()
  }

  loadMap() {
    this.tileMap = loadTileMap()
    this.redrawMarkers()
    this.updateTokenPositions()
    this.updateStatus()
    this.emitStatus()
  }

  clearMap() {
    clearTileMap()
    this.tileMap = loadTileMap()
    this.redrawMarkers()
    this.updateTokenPositions()
    this.updateStatus()
    this.emitStatus()
  }

  exportMap() {
    return exportTileMap(this.tileMap)
  }

  importMap(text: string) {
    const parsed = importTileMap(text)
    if (!parsed) return false
    this.tileMap = parsed
    saveTileMap(this.tileMap)
    this.redrawMarkers()
    this.updateTokenPositions()
    this.updateStatus()
    this.emitStatus()
    return true
  }

  movePreviewBy(step: number) {
    if (!this.calibrating) return
    this.tokenStates[this.previewTokenIndex] = {
      ...this.tokenStates[this.previewTokenIndex],
      tileIndex: Phaser.Math.Wrap(this.tokenStates[this.previewTokenIndex].tileIndex + step, 0, TILE_COUNT),
    }
    this.updateTokenPositions()
    this.updateStatus()
    this.emitStatus()
  }

  setTokens(tokens: TokenState[]) {
    const next = [...DEFAULT_TOKENS]
    for (let i = 0; i < Math.min(4, tokens.length); i += 1) {
      next[i] = { ...tokens[i] }
    }
    this.tokenStates = next
    this.updateTokenPositions()
    this.updateStatus()
    this.emitStatus()
  }

  async animateTokenPath(playerIndex: number, path: number[]) {
    if (this.animating || path.length === 0) return
    const idx = Phaser.Math.Clamp(playerIndex, 0, this.tokenStates.length - 1)
    this.animating = true

    for (const tileIndex of path) {
      this.tokenStates[idx] = { ...this.tokenStates[idx], tileIndex }
      const pos = getTilePosition(tileIndex, this.boardBounds, this.tileMap)
      const offsets = [
        { x: -14, y: -14 },
        { x: 14, y: -14 },
        { x: -14, y: 14 },
        { x: 14, y: 14 },
      ]
      const offset = offsets[idx] ?? { x: 0, y: 0 }
      const circle = this.tokenSprites[idx]
      const ring = this.tokenRings[idx]
      const label = this.tokenLabels[idx]

      await new Promise<void>((resolve) => {
        this.tweens.add({
          targets: [circle, ring, label],
          x: pos.x + offset.x,
          y: (_target: Phaser.GameObjects.GameObject, key: string) => {
            if (key === 'y' && _target === label) return pos.y + offset.y - 18
            return pos.y + offset.y
          },
          duration: 220,
          ease: 'Sine.inOut',
          onComplete: () => resolve(),
        })
      })
    }

    this.animating = false
    this.emitStatus()
  }

  showFloating(text: string, tileIndex: number, color = '#ffffff') {
    const pos = getTilePosition(tileIndex, this.boardBounds, this.tileMap)
    const label = this.add
      .text(pos.x, pos.y - 28, text, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: '700',
        color,
      })
      .setOrigin(0.5)
      .setDepth(120)

    this.tweens.add({
      targets: label,
      y: label.y - 34,
      alpha: 0,
      duration: 850,
      ease: 'Sine.out',
      onComplete: () => label.destroy(),
    })
  }

  getStatus() {
    return {
      calibrating: this.calibrating,
      selectedTile: this.selectedTile,
      filled: filledCount(this.tileMap),
      total: TILE_COUNT,
      hasSaved: hasSavedTileMap(),
      tokenTileIndices: this.tokenStates.map((t) => t.tileIndex),
    }
  }
}
