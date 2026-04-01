import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Float, MeshReflectorMaterial, OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { tileColor, TILE_SIZE } from '../game/board'
import type { GamePhase, PlayerDef, TileDef } from '../game/types'

function dampVec3(current: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number) {
  current.lerp(target, 1 - Math.exp(-lambda * dt))
}

type SceneProps = {
  tiles: TileDef[]
  players: PlayerDef[]
  activePlayerIndex: number
  phase: GamePhase
  diceValue: number | null
  diceRolling: boolean
  diceSpinSeed: number
}

function Fireflies() {
  const points = useMemo(() => {
    const data = new Float32Array(240 * 3)
    for (let i = 0; i < 240; i += 1) {
      data[i * 3 + 0] = (Math.random() - 0.5) * 40
      data[i * 3 + 1] = 0.5 + Math.random() * 5.5
      data[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return data
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
    const pos = ref.current.geometry.attributes.position
    for (let i = 0; i < pos.count; i += 1) {
      const baseY = pos.getY(i)
      pos.setY(i, baseY + Math.sin(state.clock.elapsedTime * 0.7 + i) * 0.002)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b6ff8d" size={0.07} transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function JungleEnvironment() {
  const treePositions = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const ring = 16 + Math.random() * 10
        const angle = (i / 42) * Math.PI * 2 + Math.random() * 0.3
        return {
          x: Math.cos(angle) * ring,
          z: Math.sin(angle) * ring,
          h: 2.8 + Math.random() * 3,
          r: 0.16 + Math.random() * 0.18,
          crown: 1.2 + Math.random() * 1.2,
        }
      }),
    [],
  )

  return (
    <group>
      <color attach="background" args={['#05070a']} />
      <fog attach="fog" args={['#08110d', 14, 42]} />

      <ambientLight intensity={0.42} color="#a7f3d0" />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.25}
        color="#d9f99d"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00008}
      />
      <spotLight
        castShadow
        position={[-10, 12, -8]}
        angle={0.4}
        penumbra={0.7}
        intensity={0.8}
        color="#7dd3fc"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.02, 0]}>
        <planeGeometry args={[90, 90]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={512}
          mixBlur={0.6}
          mixStrength={0.18}
          mirror={0.05}
          roughness={0.95}
          metalness={0.02}
          color="#17311f"
          depthScale={0.2}
          minDepthThreshold={0.6}
          maxDepthThreshold={1.4}
        />
      </mesh>

      {treePositions.map((t, idx) => (
        <group key={idx} position={[t.x, 0, t.z]}>
          <mesh castShadow receiveShadow position={[0, t.h / 2, 0]}>
            <cylinderGeometry args={[t.r * 0.7, t.r, t.h, 8]} />
            <meshStandardMaterial color="#3a2c1d" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, t.h + 0.8, 0]}>
            <sphereGeometry args={[t.crown, 10, 10]} />
            <meshStandardMaterial color="#1f5d36" roughness={0.95} emissive="#0f2416" emissiveIntensity={0.08} />
          </mesh>
        </group>
      ))}

      <Fireflies />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} blur={2.4} scale={24} far={10} />
    </group>
  )
}

function Board({ tiles }: { tiles: TileDef[] }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[14.5, 1.1, 14.5]} />
        <meshStandardMaterial color="#3a2416" roughness={0.9} metalness={0.12} />
      </mesh>
      <mesh receiveShadow position={[0, 1.11, 0]}>
        <boxGeometry args={[11.2, 0.12, 11.2]} />
        <meshStandardMaterial color="#1b2f1f" roughness={0.95} />
      </mesh>

      {tiles.map((tile) => (
        <Tile key={tile.index} tile={tile} />
      ))}
    </group>
  )
}

function Tile({ tile }: { tile: TileDef }) {
  const color = tileColor(tile.eventType)
  const isStart = tile.eventType === 'start'
  const isFinish = tile.eventType === 'finish'
  const y = 1.16

  return (
    <group position={[tile.x, y, tile.z]}>
      <RoundedBox args={[TILE_SIZE, 0.28, TILE_SIZE]} radius={0.08} castShadow receiveShadow>
        <meshStandardMaterial color="#1f2937" roughness={0.8} metalness={0.15} />
      </RoundedBox>
      <RoundedBox args={[TILE_SIZE - 0.12, 0.1, TILE_SIZE - 0.12]} radius={0.06} position={[0, 0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={isStart ? '#123f2a' : isFinish ? '#4a2d0d' : '#111827'} roughness={0.6} metalness={0.2} emissive={color} emissiveIntensity={0.16} />
      </RoundedBox>
      <mesh position={[0, 0.175, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.45, 0.62, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>
      <Text
        position={[0, 0.22, 0]}
        rotation-x={-Math.PI / 2}
        fontSize={0.34}
        color={isStart || isFinish ? '#f8fafc' : '#dbeafe'}
        anchorX="center"
        anchorY="middle"
      >
        {tile.index === 0 ? 'S' : tile.index === tilesCountMinusOne(24) ? 'F' : String(tile.index)}
      </Text>
    </group>
  )
}

function tilesCountMinusOne(n: number) {
  return n - 1
}

function Token({ player, active, stackIndex, target }: { player: PlayerDef; active: boolean; stackIndex: number; target: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null)
  const wobble = useRef(Math.random() * Math.PI * 2)

  useFrame((state, dt) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const desired = new THREE.Vector3(target.x, target.y + (active ? 0.05 : 0), target.z)
    dampVec3(ref.current.position, desired, 10, dt)
    ref.current.position.y += Math.sin(t * 8 + wobble.current) * 0.005
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, active ? t * 0.6 : 0, 0.02)
  })

  return (
    <group ref={ref} position={[target.x, target.y, target.z]}>
      <Float speed={active ? 1.6 : 0.8} rotationIntensity={0.08} floatIntensity={0.07}>
        <mesh castShadow>
          <cylinderGeometry args={[0.28, 0.34, 0.55, 20]} />
          <meshStandardMaterial color={player.color} roughness={0.35} metalness={0.35} emissive={player.color} emissiveIntensity={active ? 0.25 : 0.1} />
        </mesh>
        <mesh castShadow position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial color={'#f8fafc'} roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.28, 0]}>
          <ringGeometry args={[0.35 + stackIndex * 0.03, 0.4 + stackIndex * 0.03, 24]} />
          <meshBasicMaterial color={player.color} transparent opacity={0.65} />
        </mesh>
      </Float>
    </group>
  )
}

function Dice({ value, rolling, spinSeed }: { value: number | null; rolling: boolean; spinSeed: number }) {
  const group = useRef<THREE.Group>(null)
  const targetRot = useRef(new THREE.Euler())

  useFrame((_s, dt) => {
    if (!group.current) return
    if (rolling) {
      group.current.rotation.x += dt * (8 + (spinSeed % 5))
      group.current.rotation.y += dt * (12 + ((spinSeed + 3) % 5))
      group.current.rotation.z += dt * (10 + ((spinSeed + 1) % 5))
      return
    }

    const v = value ?? 1
    const map: Record<number, [number, number, number]> = {
      1: [0, 0, 0],
      2: [0, 0, Math.PI / 2],
      3: [Math.PI / 2, 0, 0],
      4: [-Math.PI / 2, 0, 0],
      5: [0, 0, -Math.PI / 2],
      6: [Math.PI, 0, 0],
    }
    const [x, y, z] = map[v]
    targetRot.current.set(x, y, z)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRot.current.x, 8, dt)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRot.current.y, 8, dt)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetRot.current.z, 8, dt)
  })

  return (
    <group ref={group} position={[0, 2.35, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.18} metalness={0.3} />
      </mesh>
      {[[-0.4,0,0],[0.4,0,0],[0,-0.4,0],[0,0.4,0],[0,0,-0.4],[0,0,0.4]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <circleGeometry args={[0.08, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  )
}

function CameraRig({
  tiles,
  players,
  activePlayerIndex,
  diceRolling,
}: {
  tiles: TileDef[]
  players: PlayerDef[]
  activePlayerIndex: number
  diceRolling: boolean
}) {
  const { camera } = useThree()
  const lookAt = useRef(new THREE.Vector3(0, 1.2, 0))
  const desiredPos = useRef(new THREE.Vector3(0, 12, 14))

  useFrame((_state, dt) => {
    const active = players[activePlayerIndex]
    const tile = tiles[active.tileIndex]
    if (!tile) return

    if (diceRolling) {
      desiredPos.current.set(0, 8.5, 7.8)
      lookAt.current.set(0, 1.8, 0)
    } else {
      desiredPos.current.set(tile.x + 7.5, 8.4, tile.z + 8.8)
      lookAt.current.set(tile.x, 1.3, tile.z)
    }

    dampVec3(camera.position, desiredPos.current, 4.5, dt)
    const currentLook = new THREE.Vector3()
    camera.getWorldDirection(currentLook)
    const temp = new THREE.Vector3().copy(lookAt.current)
    camera.lookAt(temp)
  })

  return null
}

function SceneContent(props: SceneProps) {
  const tilePositionMap = useMemo(() => {
    const map = new Map<number, THREE.Vector3>()
    const stacks = new Map<number, number>()
    for (const player of props.players) {
      stacks.set(player.tileIndex, (stacks.get(player.tileIndex) ?? 0) + 1)
    }
    const offsets = new Map<number, number>()
    props.players.forEach((player) => {
      const idx = offsets.get(player.tileIndex) ?? 0
      offsets.set(player.tileIndex, idx + 1)
      const tile = props.tiles[player.tileIndex]
      const spread = 0.34
      const localX = ((idx % 2) - 0.5) * spread
      const localZ = (Math.floor(idx / 2) - 0.5) * spread
      map.set(player.id, new THREE.Vector3(tile.x + localX, 1.62, tile.z + localZ))
    })
    return map
  }, [props.players, props.tiles])

  return (
    <>
      <JungleEnvironment />
      <Board tiles={props.tiles} />
      <Dice value={props.diceValue} rolling={props.diceRolling} spinSeed={props.diceSpinSeed} />

      {props.players.map((player, idx) => (
        <Token
          key={player.id}
          player={player}
          active={idx === props.activePlayerIndex}
          stackIndex={idx}
          target={tilePositionMap.get(player.id)!}
        />
      ))}

      <CameraRig tiles={props.tiles} players={props.players} activePlayerIndex={props.activePlayerIndex} diceRolling={props.diceRolling} />

      <OrbitControls enablePan={false} enableRotate={false} enableZoom={false} />
    </>
  )
}

export default function JungleBoardScene(props: SceneProps) {
  return (
    <div className="canvas-wrap">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 11, 14], fov: 45 }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  )
}
