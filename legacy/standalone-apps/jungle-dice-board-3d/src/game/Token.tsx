import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { TileWorldPos } from './constants'
import { TOKEN_BASE_Y } from './constants'

type Props = {
  color: string
  active: boolean
  step: number
  tilePositions: TileWorldPos[]
  stackIndex: number
  moveProgressPulse: number
}

export default function Token({ color, active, step, tilePositions, stackIndex, moveProgressPulse }: Props) {
  const ref = useRef<THREE.Group>(null)
  const bobSeed = useRef(Math.random() * Math.PI * 2)
  const currentTarget = useMemo(() => {
    const tile = tilePositions[Math.max(0, step - 1)]
    const offsets = [
      [-0.18, -0.14],
      [0.18, 0.14],
    ] as const
    const [ox, oz] = offsets[stackIndex % 2] ?? [0, 0]
    return new THREE.Vector3(tile.x + ox, TOKEN_BASE_Y, tile.z + oz)
  }, [step, tilePositions, stackIndex])

  useFrame((state, dt) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const desiredY = currentTarget.y + (active ? 0.05 : 0) + Math.sin((t + bobSeed.current) * 6) * 0.008 + moveProgressPulse * 0.06
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, currentTarget.x, 9, dt)
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, currentTarget.z, 9, dt)
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, desiredY, 10, dt)
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, active ? t * 0.8 : 0.2, 6, dt)
  })

  return (
    <group ref={ref} position={[currentTarget.x, currentTarget.y, currentTarget.z]}>
      <Float speed={active ? 1.4 : 0.8} rotationIntensity={0.06} floatIntensity={0.05}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.26, 0.52, 20]} />
          <meshStandardMaterial color={color} roughness={0.28} metalness={0.4} emissive={color} emissiveIntensity={active ? 0.28 : 0.12} />
        </mesh>
        <mesh castShadow position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial color="#eff6ff" roughness={0.15} metalness={0.6} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.22, 0]}>
          <ringGeometry args={[0.28, 0.36, 28]} />
          <meshBasicMaterial color={color} transparent opacity={active ? 0.9 : 0.55} />
        </mesh>
      </Float>
    </group>
  )
}
