import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, MeshReflectorMaterial } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import Board from './Board'
import Token from './Token'
import Dice from './Dice'
import CameraRig from './CameraRig'
import { BOARD_WORLD_SIZE, createSnakeTilePositions } from './constants'
import { Fireflies, EventBurst } from './Particles'
import { createPhysicsWorld, stepWorld } from '../physics/world'
import { createDiceRig, rollDice, updateDiceSettle } from '../physics/dicePhysics'
import type { SpecialTile } from '../logic/specials'
import type { GamePhase } from '../logic/turnMachine'

type Props = {
  phase: GamePhase
  players: Array<{ id: number; color: string; step: number }>
  currentPlayerIndex: number
  onDiceSettled: (value: number) => void
  rollRequestId: number
  specialsByFrom: Map<number, SpecialTile>
  landedStep: number | null
  eventBurst: { trigger: number; step: number | null; tone: 'trap' | 'ladder' | null }
  tokenPulse: [number, number]
}

function EnvironmentDecor() {
  const trees = useMemo(
    () => Array.from({ length: 48 }, (_, i) => {
      const r = 15 + Math.random() * 18
      const a = (i / 48) * Math.PI * 2 + Math.random() * 0.3
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 3 + Math.random() * 4.5, tr: 0.12 + Math.random() * 0.15, cr: 1.1 + Math.random() * 1.4 }
    }),
    [],
  )

  return (
    <group>
      <color attach="background" args={['#04070a']} />
      <fog attach="fog" args={['#08110e', 12, 56]} />
      <ambientLight intensity={0.35} color="#b8ffd2" />
      <directionalLight castShadow position={[11, 17, 8]} intensity={1.18} color="#ecfccb" shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-8, 8, 6]} intensity={0.7} color="#22d3ee" distance={30} />
      <pointLight position={[9, 8, -7]} intensity={0.55} color="#f59e0b" distance={26} />
      <spotLight castShadow position={[0, 15, -10]} angle={0.35} penumbra={0.7} intensity={0.7} color="#93c5fd" />

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial blur={[260, 70]} resolution={512} mixBlur={0.55} mixStrength={0.15} mirror={0.03} roughness={0.96} metalness={0.04} color="#102518" />
      </mesh>

      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh castShadow receiveShadow position={[0, t.h / 2, 0]}>
            <cylinderGeometry args={[t.tr * 0.7, t.tr, t.h, 8]} />
            <meshStandardMaterial color="#3c281a" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, t.h + 0.7, 0]}>
            <sphereGeometry args={[t.cr, 10, 10]} />
            <meshStandardMaterial color="#1f5b34" roughness={0.95} emissive="#102a19" emissiveIntensity={0.1} />
          </mesh>
        </group>
      ))}

      <Fireflies />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} blur={3.2} scale={BOARD_WORLD_SIZE + 10} far={18} />
    </group>
  )
}

function SceneInner(props: Props) {
  const tiles = useMemo(() => createSnakeTilePositions(), [])
  const physicsRef = useRef<ReturnType<typeof createPhysicsWorld> | null>(null)
  const diceRigRef = useRef<ReturnType<typeof createDiceRig> | null>(null)
  const lastRollId = useRef(-1)
  const burstPos = useMemo<[number, number, number]>(() => {
    if (!props.eventBurst.step) return [0, 1.8, 0]
    const tile = tiles[Math.max(0, props.eventBurst.step - 1)]
    return [tile.x, 1.8, tile.z]
  }, [props.eventBurst.step, tiles])

  useEffect(() => {
    const physics = createPhysicsWorld()
    const rig = createDiceRig(physics.materials.diceMat)
    physics.world.addBody(rig.body)
    physicsRef.current = physics
    diceRigRef.current = rig
    return () => {
      physics.world.removeBody(rig.body)
      physicsRef.current = null
      diceRigRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!diceRigRef.current) return
    if (props.rollRequestId === lastRollId.current) return
    lastRollId.current = props.rollRequestId
    if (props.rollRequestId <= 0) return
    rollDice(diceRigRef.current.body)
    diceRigRef.current.isRolling = true
    diceRigRef.current.settleTimer = 0
  }, [props.rollRequestId])

  useFrame((_state, dt) => {
    if (!physicsRef.current || !diceRigRef.current) return
    stepWorld(physicsRef.current.world, Math.min(0.05, dt))
    const result = updateDiceSettle(diceRigRef.current, dt)
    if (result != null) props.onDiceSettled(result)
  })

  return (
    <>
      <EnvironmentDecor />
      <Board tiles={tiles} specialsByFrom={props.specialsByFrom} activeSteps={props.players.map((p) => p.step)} landedStep={props.landedStep} />

      {props.players.map((p, idx) => (
        <Token
          key={p.id}
          color={p.color}
          active={idx === props.currentPlayerIndex}
          step={p.step}
          tilePositions={tiles}
          stackIndex={idx}
          moveProgressPulse={props.tokenPulse[idx]}
        />
      ))}

      <Dice body={diceRigRef.current?.body ?? null} highlight={props.phase === 'ROLLING'} />
      <EventBurst
        trigger={props.eventBurst.trigger}
        position={burstPos}
        color={props.eventBurst.tone === 'trap' ? '#f43f5e' : '#38bdf8'}
      />
      <CameraRig phase={props.phase} activeStep={props.players[props.currentPlayerIndex]?.step ?? 1} tilePositions={tiles} />
    </>
  )
}

export default function SceneRoot(props: Props) {
  return (
    <div className="absolute inset-0">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 16, 18], fov: 45 }}>
        <SceneInner {...props} />
      </Canvas>
    </div>
  )
}
