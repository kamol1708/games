import * as CANNON from 'cannon-es'

const FACE_MAP: Record<string, number> = {
  '+Y': 1,
  '-Y': 6,
  '+X': 2,
  '-X': 5,
  '+Z': 3,
  '-Z': 4,
}

export function detectTopFace(quaternion: CANNON.Quaternion): number {
  const axes = [
    { key: '+Y', v: new CANNON.Vec3(0, 1, 0) },
    { key: '-Y', v: new CANNON.Vec3(0, -1, 0) },
    { key: '+X', v: new CANNON.Vec3(1, 0, 0) },
    { key: '-X', v: new CANNON.Vec3(-1, 0, 0) },
    { key: '+Z', v: new CANNON.Vec3(0, 0, 1) },
    { key: '-Z', v: new CANNON.Vec3(0, 0, -1) },
  ]

  let bestKey = '+Y'
  let bestDot = -Infinity
  const worldUp = new CANNON.Vec3(0, 1, 0)

  for (const axis of axes) {
    const rotated = quaternion.vmult(axis.v)
    const dot = rotated.dot(worldUp)
    if (dot > bestDot) {
      bestDot = dot
      bestKey = axis.key
    }
  }

  return FACE_MAP[bestKey]
}
