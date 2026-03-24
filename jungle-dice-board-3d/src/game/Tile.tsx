import { RoundedBox, Text } from '@react-three/drei'
import { useMemo, useState } from 'react'
import type { TileWorldPos } from './constants'
import { TILE_SIZE } from './constants'
import type { SpecialTile } from '../logic/specials'

type Props = {
  tile: TileWorldPos
  special?: SpecialTile
  active?: boolean
  landed?: boolean
}

function tileTone(special?: SpecialTile) {
  if (!special) return '#64748b'
  return special.type === 'trap' ? '#f43f5e' : '#38bdf8'
}

export default function Tile({ tile, special, active = false, landed = false }: Props) {
  const [hovered, setHovered] = useState(false)
  const emissive = tileTone(special)
  const ringOpacity = active ? 0.95 : landed ? 0.82 : hovered ? 0.6 : 0.28
  const label = tile.step === 1 ? 'START' : tile.step === 100 ? 'FINISH' : String(tile.step)
  const fontSize = tile.step === 100 ? 0.13 : tile.step >= 10 ? 0.17 : 0.2
  const glyph = special ? (special.type === 'trap' ? '↓' : '↑') : null
  const topColor = useMemo(() => (tile.step === 1 ? '#10291f' : tile.step === 100 ? '#3a240f' : '#151c2a'), [tile.step])

  return (
    <group position={[tile.x, 1.14, tile.z]}>
      <RoundedBox args={[TILE_SIZE, 0.22, TILE_SIZE]} radius={0.08} castShadow receiveShadow>
        <meshStandardMaterial color="#1a2231" roughness={0.84} metalness={0.18} />
      </RoundedBox>
      <RoundedBox
        args={[TILE_SIZE - 0.06, 0.09, TILE_SIZE - 0.06]}
        radius={0.06}
        position={[0, 0.09, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={topColor}
          roughness={0.58}
          metalness={0.22}
          emissive={emissive}
          emissiveIntensity={active ? 0.42 : landed ? 0.28 : hovered ? 0.2 : 0.08}
        />
      </RoundedBox>

      <mesh position={[0, 0.144, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.22, 0.36, 24]} />
        <meshBasicMaterial color={emissive} transparent opacity={ringOpacity} />
      </mesh>

      <Text position={[0, 0.145, 0]} rotation-x={-Math.PI / 2} fontSize={fontSize} color="#f8fafc" anchorX="center" anchorY="middle">
        {label}
      </Text>

      {glyph ? (
        <Text position={[0, 0.205, 0]} rotation-x={-Math.PI / 2} fontSize={0.15} color={emissive} anchorX="center" anchorY="middle">
          {glyph}
        </Text>
      ) : null}
    </group>
  )
}
