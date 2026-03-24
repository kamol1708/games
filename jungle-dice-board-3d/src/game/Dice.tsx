import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type * as CANNON from 'cannon-es'

type Props = {
  body: CANNON.Body | null
  highlight: boolean
}

function Pip({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.065, 12, 12]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
  )
}

function FacePips({ side }: { side: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const z = 0.561
  const map = {
    c: [0, 0, z],
    tl: [-0.23, 0.23, z],
    tr: [0.23, 0.23, z],
    bl: [-0.23, -0.23, z],
    br: [0.23, -0.23, z],
    ml: [-0.23, 0, z],
    mr: [0.23, 0, z],
  } as const
  const faces: Record<number, Array<keyof typeof map>> = {
    1: ['c'],
    2: ['tl', 'br'],
    3: ['tl', 'c', 'br'],
    4: ['tl', 'tr', 'bl', 'br'],
    5: ['tl', 'tr', 'c', 'bl', 'br'],
    6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'],
  }
  return (
    <group>
      {faces[side].map((key) => (
        <Pip key={key} position={map[key] as [number, number, number]} />
      ))}
    </group>
  )
}

export default function Dice({ body, highlight }: Props) {
  const ref = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)

  useFrame((_s, dt) => {
    if (!ref.current || !body) return
    ref.current.position.set(body.position.x, body.position.y, body.position.z)
    ref.current.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
    if (ring.current) {
      const mat = ring.current.material as THREE.MeshBasicMaterial
      mat.opacity = THREE.MathUtils.damp(mat.opacity, highlight ? 0.55 : 0.2, 8, dt)
    }
  })

  useEffect(() => {
    if (!ref.current || !body) return
    ref.current.position.set(body.position.x, body.position.y, body.position.z)
    ref.current.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
  }, [body])

  const faces = useMemo(
    () => [
      { rot: [0, 0, 0], side: 1 as const },
      { rot: [0, 0, Math.PI / 2], side: 2 as const },
      { rot: [Math.PI / 2, 0, 0], side: 3 as const },
      { rot: [-Math.PI / 2, 0, 0], side: 4 as const },
      { rot: [0, 0, -Math.PI / 2], side: 5 as const },
      { rot: [Math.PI, 0, 0], side: 6 as const },
    ],
    [],
  )

  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.16} metalness={0.28} />
      </mesh>
      {faces.map((f, idx) => (
        <group key={idx} rotation={f.rot as [number, number, number]}>
          <FacePips side={f.side} />
        </group>
      ))}
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, -0.72, 0]}>
        <ringGeometry args={[0.9, 1.18, 40]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}
