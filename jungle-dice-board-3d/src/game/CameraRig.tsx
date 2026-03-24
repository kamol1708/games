import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { TileWorldPos } from './constants'
import type { GamePhase } from '../logic/turnMachine'

type Props = {
  phase: GamePhase
  activeStep: number
  tilePositions: TileWorldPos[]
}

function dampVec3(current: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number) {
  current.lerp(target, 1 - Math.exp(-lambda * dt))
}

export default function CameraRig({ phase, activeStep, tilePositions }: Props) {
  const { camera } = useThree()
  const desiredPos = useRef(new THREE.Vector3(0, 16, 18))
  const desiredLook = useRef(new THREE.Vector3(0, 1.2, 0))

  useFrame((_s, dt) => {
    const tile = tilePositions[Math.max(0, activeStep - 1)]
    if (!tile) return

    if (phase === 'ROLLING') {
      desiredPos.current.set(0, 8.7, 6.8)
      desiredLook.current.set(0, 2.1, -3.8)
    } else {
      desiredPos.current.set(tile.x + 7.6, 8.8, tile.z + 8.7)
      desiredLook.current.set(tile.x, 1.25, tile.z)
    }

    dampVec3(camera.position, desiredPos.current, 4.1, dt)
    camera.lookAt(desiredLook.current)
  })

  return null
}
