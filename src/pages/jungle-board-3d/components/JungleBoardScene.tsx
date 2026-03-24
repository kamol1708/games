import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Float, MeshReflectorMaterial, OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BOARD_WORLD_SIZE, TILE_SIZE, tileColor } from '../game/board'
import type { GamePhase, PlayerDef, TileDef } from '../game/types'

type SceneProps = {
  tiles: TileDef[]
  players: PlayerDef[]
  activePlayerIndex: number
  phase: GamePhase
  diceValue: number | null
  diceRolling: boolean
  diceSpinSeed: number
}

function dampVec3(current: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number) {
  current.lerp(target, 1 - Math.exp(-lambda * dt))
}

function Fireflies() {
  const positions = useMemo(() => {
    const arr = new Float32Array(520 * 3)
    for (let i = 0; i < 520; i += 1) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 52
      arr[i * 3 + 1] = 0.4 + Math.random() * 8.6
      arr[i * 3 + 2] = (Math.random() - 0.5) * 52
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.012
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < attr.count; i += 1) {
      const x = attr.getX(i)
      const z = attr.getZ(i)
      const base = (i % 16) * 0.12
      const y = 0.8 + base + Math.sin(state.clock.elapsedTime * 0.7 + i * 0.17) * 0.12
      attr.setXYZ(i, x, y, z)
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d9ff8e" size={0.075} opacity={0.72} transparent depthWrite={false} sizeAttenuation />
    </points>
  )
}

function FloatingMistBands() {
  const bands = useMemo(
    () =>
      Array.from({ length: 9 }, () => ({
        x: (Math.random() - 0.5) * 22,
        z: (Math.random() - 0.5) * 22,
        y: 0.35 + Math.random() * 0.9,
        s: 1.8 + Math.random() * 3,
        speed: 0.18 + Math.random() * 0.25,
        seed: Math.random() * Math.PI * 2,
      })),
    [],
  )
  const refs = useRef<Array<THREE.Mesh | null>>([])

  useFrame((state) => {
    refs.current.forEach((m, idx) => {
      const b = bands[idx]
      if (!m || !b) return
      m.position.x = b.x + Math.sin(state.clock.elapsedTime * b.speed + b.seed) * 0.7
      m.position.z = b.z + Math.cos(state.clock.elapsedTime * b.speed * 0.9 + b.seed) * 0.5
      m.rotation.z = Math.sin(state.clock.elapsedTime * 0.25 + b.seed) * 0.12
      ;(m.material as THREE.MeshBasicMaterial).opacity =
        0.09 + (Math.sin(state.clock.elapsedTime * 0.6 + b.seed) + 1) * 0.03
    })
  })

  return (
    <group>
      {bands.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[b.x, b.y, b.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[b.s * 1.9, b.s]} />
          <meshBasicMaterial color="#d9fff4" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function JungleAtmosphere() {
  const treePositions = useMemo(
    () =>
      Array.from({ length: 64 }, (_, i) => {
        const ring = 15 + Math.random() * 18
        const angle = (i / 64) * Math.PI * 2 + Math.random() * 0.4
        return {
          x: Math.cos(angle) * ring,
          z: Math.sin(angle) * ring,
          trunkH: 3 + Math.random() * 5,
          trunkR: 0.12 + Math.random() * 0.18,
          crownR: 1.1 + Math.random() * 1.7,
        }
      }),
    [],
  )

  const stones = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        x: (Math.random() - 0.5) * (BOARD_WORLD_SIZE + 8),
        z: (Math.random() - 0.5) * (BOARD_WORLD_SIZE + 8),
        s: 0.22 + Math.random() * 0.45,
        r: Math.random() * Math.PI,
      })),
    [],
  )

  return (
    <group>
      <color attach="background" args={['#030507']} />
      <fog attach="fog" args={['#0a0f16', 10, 54]} />

      <ambientLight intensity={0.36} color="#dbeafe" />
      <directionalLight
        castShadow
        position={[11, 18, 8]}
        intensity={1.22}
        color="#ecfccb"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00008}
      />
      <spotLight
        castShadow
        position={[-12, 14, -8]}
        angle={0.42}
        penumbra={0.85}
        intensity={0.95}
        color="#7dd3fc"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 7.5, 0]} intensity={0.62} color="#60a5fa" distance={32} />
      <pointLight position={[0, 4.2, 0]} intensity={0.34} color="#a78bfa" distance={18} />

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[110, 110]} />
        <MeshReflectorMaterial
          blur={[260, 60]}
          resolution={512}
          mixBlur={0.55}
          mixStrength={0.18}
          mirror={0.03}
          roughness={0.96}
          metalness={0.04}
          color="#111419"
          depthScale={0.18}
          minDepthThreshold={0.65}
          maxDepthThreshold={1.3}
        />
      </mesh>

      {stones.map((s) => (
        <mesh key={`stone-${s.x.toFixed(2)}-${s.z.toFixed(2)}`} castShadow receiveShadow position={[s.x, 0.12, s.z]} rotation={[0, s.r, 0]}>
          <boxGeometry args={[s.s * 1.2, s.s * 0.5, s.s]} />
          <meshStandardMaterial color="#344048" roughness={0.95} />
        </mesh>
      ))}

      {treePositions.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh castShadow receiveShadow position={[0, t.trunkH / 2, 0]}>
            <cylinderGeometry args={[t.trunkR * 0.7, t.trunkR, t.trunkH, 8]} />
            <meshStandardMaterial color="#39281d" roughness={0.92} />
          </mesh>
          <mesh castShadow position={[0, t.trunkH + 0.7, 0]}>
            <sphereGeometry args={[t.crownR, 12, 10]} />
            <meshStandardMaterial color="#1c5d34" roughness={0.95} emissive="#0d2a18" emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}

      <FloatingMistBands />
      <Fireflies />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.38} blur={3.2} scale={BOARD_WORLD_SIZE + 8} far={18} />
    </group>
  )
}

function BoardFrameDecor() {
  const railLen = BOARD_WORLD_SIZE + 1.4
  const off = (BOARD_WORLD_SIZE + 0.9) / 2
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[BOARD_WORLD_SIZE + 2.6, 1.06, BOARD_WORLD_SIZE + 2.6]} />
        <meshStandardMaterial color="#3a2417" roughness={0.86} metalness={0.14} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.03, 0]}>
        <boxGeometry args={[BOARD_WORLD_SIZE + 0.9, 0.12, BOARD_WORLD_SIZE + 0.9]} />
        <meshStandardMaterial color="#1a2b1d" roughness={0.95} />
      </mesh>

      {[
        [0, 1.22, off, railLen, 0.12, 0.16],
        [0, 1.22, -off, railLen, 0.12, 0.16],
        [off, 1.22, 0, 0.16, 0.12, railLen],
        [-off, 1.22, 0, 0.16, 0.12, railLen],
      ].map((args, i) => (
        <mesh key={`rail-${i}`} position={args.slice(0, 3) as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={args.slice(3) as [number, number, number]} />
          <meshStandardMaterial color="#8a5f2a" emissive="#f59e0b" emissiveIntensity={0.12} roughness={0.45} metalness={0.2} />
        </mesh>
      ))}

      <mesh position={[0, 1.1, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[BOARD_WORLD_SIZE * 0.45, BOARD_WORLD_SIZE * 0.57, 120]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} />
      </mesh>

      <mesh position={[0, 1.16, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[BOARD_WORLD_SIZE * 0.34, 80]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.32} />
      </mesh>

      <Text position={[0, 1.2, 0]} rotation-x={-Math.PI / 2} fontSize={0.62} color="#eab308" anchorX="center" anchorY="middle">
        JUNGLE RUN
      </Text>
    </group>
  )
}

function TileGlyph({ tile }: { tile: TileDef }) {
  if (tile.eventType === 'safe') return null
  const glyph =
    tile.eventType === 'start' ? 'S' :
    tile.eventType === 'finish' ? 'F' :
    tile.eventType === 'trap' ? '!' :
    tile.eventType === 'boost' ? '↑' : '✦'
  const color = tileColor(tile.eventType)
  return (
    <Text
      position={[0, 0.205, 0]}
      rotation-x={-Math.PI / 2}
      fontSize={0.16}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {glyph}
    </Text>
  )
}

function EventJumpArc({ tile }: { tile: TileDef }) {
  if ((tile.eventType !== 'trap' && tile.eventType !== 'boost') || typeof tile.jumpTo !== 'number') return null
  const dir = tile.eventType === 'boost' ? 1 : -1
  return (
    <group position={[0, 0.14, 0]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <torusGeometry args={[0.28, 0.02, 8, 24, Math.PI * 1.35]} />
        <meshBasicMaterial color={tile.eventType === 'boost' ? '#38bdf8' : '#f43f5e'} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0.18 * dir, 0.01, -0.05]} rotation={[-Math.PI / 2, 0, dir > 0 ? -0.5 : 2.65]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshBasicMaterial color={tile.eventType === 'boost' ? '#38bdf8' : '#f43f5e'} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function Tile({ tile, active }: { tile: TileDef; active: boolean }) {
  const color = tileColor(tile.eventType)
  const isSpecial = tile.eventType !== 'safe'

  return (
    <group position={[tile.x, 1.12, tile.z]}>
      <RoundedBox args={[TILE_SIZE, 0.2, TILE_SIZE]} radius={0.07} castShadow receiveShadow>
        <meshStandardMaterial color="#1a2332" roughness={0.82} metalness={0.18} />
      </RoundedBox>
      <RoundedBox args={[TILE_SIZE - 0.05, 0.085, TILE_SIZE - 0.05]} radius={0.05} position={[0, 0.083, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={tile.eventType === 'safe' ? '#121826' : '#151f31'}
          roughness={0.58}
          metalness={0.24}
          emissive={color}
          emissiveIntensity={active ? 0.42 : isSpecial ? 0.22 : 0.08}
        />
      </RoundedBox>
      <mesh position={[0, 0.133, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.23, 0.36, 24]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.95 : 0.5} />
      </mesh>
      <Text
        position={[0, 0.145, 0]}
        rotation-x={-Math.PI / 2}
        fontSize={tile.step >= 100 ? 0.15 : tile.step >= 10 ? 0.17 : 0.2}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
      >
        {String(tile.step)}
      </Text>
      <TileGlyph tile={tile} />
      <EventJumpArc tile={tile} />
    </group>
  )
}

function BoardTiles({ tiles, players }: { tiles: TileDef[]; players: PlayerDef[] }) {
  const occupied = useMemo(() => new Set(players.map((p) => p.tileIndex)), [players])
  return (
    <group>
      {tiles.map((tile) => (
        <Tile key={tile.index} tile={tile} active={occupied.has(tile.index)} />
      ))}
    </group>
  )
}

function Token({ player, active, target, offsetIndex }: { player: PlayerDef; active: boolean; target: THREE.Vector3; offsetIndex: number }) {
  const ref = useRef<THREE.Group>(null)
  const seed = useRef(Math.random() * Math.PI * 2)

  useFrame((state, dt) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const desired = new THREE.Vector3(target.x, target.y + (active ? 0.04 : 0), target.z)
    ref.current.position.lerp(desired, 1 - Math.exp(-10 * dt))
    ref.current.position.y += Math.sin(t * 7 + seed.current) * (active ? 0.006 : 0.003)
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, active ? t * 0.8 : 0, 6, dt)
  })

  return (
    <group ref={ref} position={[target.x, target.y, target.z]}>
      <Float speed={active ? 1.5 : 0.9} rotationIntensity={0.05} floatIntensity={0.08}>
        <mesh castShadow>
          <capsuleGeometry args={[0.18, 0.34, 8, 16]} />
          <meshStandardMaterial color={player.color} roughness={0.35} metalness={0.35} emissive={player.color} emissiveIntensity={active ? 0.3 : 0.14} />
        </mesh>
        <mesh castShadow position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#ecfeff" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.2, 0]}>
          <ringGeometry args={[0.25 + offsetIndex * 0.05, 0.31 + offsetIndex * 0.05, 24]} />
          <meshBasicMaterial color={player.color} transparent opacity={0.75} />
        </mesh>
      </Float>
    </group>
  )
}

function DiceNumbers() {
  const half = 0.425
  const configs = [
    { n: '1', pos: [0, 0, half + 0.008] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
    { n: '2', pos: [half + 0.008, 0, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
    { n: '3', pos: [0, half + 0.008, 0] as [number, number, number], rot: [-Math.PI / 2, 0, 0] as [number, number, number] },
    { n: '4', pos: [0, -half - 0.008, 0] as [number, number, number], rot: [Math.PI / 2, 0, 0] as [number, number, number] },
    { n: '5', pos: [-half - 0.008, 0, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number] },
    { n: '6', pos: [0, 0, -half - 0.008] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] },
  ]

  return (
    <group>
      {configs.map((c) => (
        <Text
          key={c.n}
          position={c.pos}
          rotation={c.rot}
          fontSize={0.22}
          color="#0b1220"
          anchorX="center"
          anchorY="middle"
        >
          {c.n}
        </Text>
      ))}
    </group>
  )
}

function Dice({ value, rolling, spinSeed }: { value: number | null; rolling: boolean; spinSeed: number }) {
  const ref = useRef<THREE.Group>(null)
  const targetRot = useRef(new THREE.Euler())

  useFrame((_s, dt) => {
    if (!ref.current) return
    if (rolling) {
      ref.current.rotation.x += dt * (5.5 + (spinSeed % 3))
      ref.current.rotation.y += dt * (7.5 + ((spinSeed + 2) % 3))
      ref.current.rotation.z += dt * (6.2 + ((spinSeed + 1) % 3))
      ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, 2.35, 8, dt)
      return
    }

    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, 2.35, 8, dt)
    const map: Record<number, [number, number, number]> = {
      // Ensure the value shown on the TOP face is the actual rolled value.
      // Face placement in DiceNumbers:
      // +Z=1, +X=2, +Y=3, -Y=4, -X=5, -Z=6
      1: [-Math.PI / 2, 0, 0], // +Z -> +Y
      2: [0, 0, Math.PI / 2], // +X -> +Y
      3: [0, 0, 0], // +Y stays +Y
      4: [Math.PI, 0, 0], // -Y -> +Y
      5: [0, 0, -Math.PI / 2], // -X -> +Y
      6: [Math.PI / 2, 0, 0], // -Z -> +Y
    }
    const [x, y, z] = map[value ?? 1]
    targetRot.current.set(x, y, z)
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, targetRot.current.x, 8, dt)
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetRot.current.y, 8, dt)
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, targetRot.current.z, 8, dt)
  })

  return (
    <group ref={ref} position={[0, 2.2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.85, 0.85]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.3} />
      </mesh>
      <DiceNumbers />
      <mesh position={[0, -0.54, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.46, 0.62, 40]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={rolling ? 0.65 : 0.25} />
      </mesh>
    </group>
  )
}

function CameraRig({ tiles, players, activePlayerIndex, diceRolling }: { tiles: TileDef[]; players: PlayerDef[]; activePlayerIndex: number; diceRolling: boolean }) {
  const { camera } = useThree()
  const desiredPos = useRef(new THREE.Vector3(0, 15.5, 18))
  const desiredLook = useRef(new THREE.Vector3(0, 1.2, 0))

  useFrame((_state, dt) => {
    if (!diceRolling) return
    const active = players[activePlayerIndex]
    const tile = tiles[active.tileIndex]
    if (!tile) return

    if (diceRolling) {
      desiredPos.current.set(0, 8.8, 7.3)
      desiredLook.current.set(0, 2.2, 0)
    } else {
      desiredPos.current.set(tile.x + 7.6, 8.7, tile.z + 8.7)
      desiredLook.current.set(tile.x, 1.25, tile.z)
    }

    dampVec3(camera.position, desiredPos.current, 4.3, dt)
    camera.lookAt(desiredLook.current)
  })

  return null
}

function SceneContent(props: SceneProps) {
  const tokenTargets = useMemo(() => {
    const countByTile = new Map<number, number>()
    return props.players.map((player) => {
      const idx = countByTile.get(player.tileIndex) ?? 0
      countByTile.set(player.tileIndex, idx + 1)
      const tile = props.tiles[player.tileIndex]
      const offsets = [
        [-0.16, -0.12],
        [0.16, 0.12],
      ] as const
      const [ox, oz] = offsets[idx % offsets.length] ?? [0, 0]
      return {
        player,
        offsetIndex: idx,
        target: new THREE.Vector3(tile.x + ox, 1.58, tile.z + oz),
      }
    })
  }, [props.players, props.tiles])

  return (
    <>
      <JungleAtmosphere />
      <BoardFrameDecor />
      <BoardTiles tiles={props.tiles} players={props.players} />
      <Dice value={props.diceValue} rolling={props.diceRolling} spinSeed={props.diceSpinSeed} />

      {tokenTargets.map(({ player, target, offsetIndex }, idx) => (
        <Token key={player.id} player={player} active={idx === props.activePlayerIndex} target={target} offsetIndex={offsetIndex} />
      ))}

      <CameraRig tiles={props.tiles} players={props.players} activePlayerIndex={props.activePlayerIndex} diceRolling={props.diceRolling} />
      <OrbitControls
        enablePan
        enableRotate
        enableZoom
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.35}
        maxPolarAngle={1.45}
        minDistance={8}
        maxDistance={28}
      />
    </>
  )
}

export default function JungleBoardScene(props: SceneProps) {
  return (
    <div className="jb3d-canvas-wrap">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 15, 18], fov: 44 }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  )
}
