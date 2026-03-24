import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { BOARD_WORLD_SIZE, type TileWorldPos } from './constants'
import type { SpecialTile } from '../logic/specials'
import Tile from './Tile'

type Props = {
  tiles: TileWorldPos[]
  specialsByFrom: Map<number, SpecialTile>
  activeSteps: number[]
  landedStep?: number | null
}

export default function Board({ tiles, specialsByFrom, activeSteps, landedStep }: Props) {
  const activeSet = useMemo(() => new Set(activeSteps), [activeSteps])

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
        <boxGeometry args={[BOARD_WORLD_SIZE + 3, 1.12, BOARD_WORLD_SIZE + 3]} />
        <meshStandardMaterial color="#392417" roughness={0.88} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.06, 0]}>
        <boxGeometry args={[BOARD_WORLD_SIZE + 1.1, 0.12, BOARD_WORLD_SIZE + 1.1]} />
        <meshStandardMaterial color="#1a2b1d" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.1, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[BOARD_WORLD_SIZE * 0.46, BOARD_WORLD_SIZE * 0.57, 120]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 1.15, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[BOARD_WORLD_SIZE * 0.35, 80]} />
        <meshBasicMaterial color="#0d1320" transparent opacity={0.45} />
      </mesh>
      <Text position={[0, 1.2, 0]} rotation-x={-Math.PI / 2} fontSize={0.52} color="#eab308" anchorX="center" anchorY="middle">
        JUNGLE DICE RUN
      </Text>

      {tiles.map((tile) => (
        <Tile
          key={tile.index}
          tile={tile}
          special={specialsByFrom.get(tile.step)}
          active={activeSet.has(tile.step)}
          landed={landedStep === tile.step}
        />
      ))}
    </group>
  )
}
