import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

type FirefliesProps = {
  count?: number
}

export function Fireflies({ count = 260 }: FirefliesProps) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 50
      arr[i * 3 + 1] = 0.8 + Math.random() * 7
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return arr
  }, [count])

  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.015
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d9ff8e" size={0.08} transparent opacity={0.72} depthWrite={false} />
    </points>
  )
}

type EventBurstProps = {
  color: string
  position: [number, number, number]
  trigger: number
}

export function EventBurst({ color, position, trigger }: EventBurstProps) {
  const ref = useRef<THREE.Points>(null)
  const dirs = useMemo(() => {
    return Array.from({ length: 48 }, () => {
      const v = new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.6, (Math.random() - 0.5) * 2)
      return v.normalize().multiplyScalar(0.08 + Math.random() * 0.12)
    })
  }, [trigger])
  const base = useMemo(() => new Float32Array(48 * 3).fill(0), [trigger])
  const life = useRef(0)
  const running = useRef(false)
  const seenTrigger = useRef(0)

  useFrame((_s, dt) => {
    if (!ref.current) return
    if (trigger !== seenTrigger.current) {
      seenTrigger.current = trigger
      life.current = 0
      running.current = trigger > 0
    }
    if (!running.current) {
      ref.current.visible = false
      return
    }
    ref.current.visible = true
    life.current = Math.min(1, life.current + dt * 1.7)
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    dirs.forEach((dir, i) => {
      const t = life.current
      attr.setXYZ(i, dir.x * t * 8, dir.y * t * 8 - t * t * 2, dir.z * t * 8)
    })
    attr.needsUpdate = true
    const mat = ref.current.material as THREE.PointsMaterial
    mat.opacity = Math.max(0, 1 - life.current)
    if (life.current >= 1) {
      life.current = 0
      running.current = false
      ref.current.visible = false
    }
  })

  return (
    <points ref={ref} position={position} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.13} transparent opacity={1} depthWrite={false} />
    </points>
  )
}
