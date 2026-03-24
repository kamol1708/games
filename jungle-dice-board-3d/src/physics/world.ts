import * as CANNON from 'cannon-es'

export function createPhysicsWorld() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -14, 0),
  })

  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true
  world.defaultContactMaterial.friction = 0.45
  world.defaultContactMaterial.restitution = 0.35

  const groundMat = new CANNON.Material('ground')
  const diceMat = new CANNON.Material('dice')

  const groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: groundMat,
  })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  groundBody.position.set(0, 0.86, 0)
  world.addBody(groundBody)

  const wallDistance = 5.8
  const wallHeight = 3
  const wallThickness = 0.3
  const walls = [
    { x: 0, y: 0.86 + wallHeight / 2, z: -wallDistance, sx: 12, sy: wallHeight, sz: wallThickness },
    { x: 0, y: 0.86 + wallHeight / 2, z: wallDistance, sx: 12, sy: wallHeight, sz: wallThickness },
    { x: -wallDistance, y: 0.86 + wallHeight / 2, z: 0, sx: wallThickness, sy: wallHeight, sz: 12 },
    { x: wallDistance, y: 0.86 + wallHeight / 2, z: 0, sx: wallThickness, sy: wallHeight, sz: 12 },
  ]

  for (const w of walls) {
    const body = new CANNON.Body({ mass: 0, material: groundMat })
    body.addShape(new CANNON.Box(new CANNON.Vec3(w.sx / 2, w.sy / 2, w.sz / 2)))
    body.position.set(w.x, w.y, w.z)
    world.addBody(body)
  }

  const contact = new CANNON.ContactMaterial(groundMat, diceMat, {
    friction: 0.34,
    restitution: 0.42,
  })
  world.addContactMaterial(contact)

  return { world, materials: { groundMat, diceMat } }
}

export function stepWorld(world: CANNON.World, dt: number) {
  const fixed = 1 / 60
  world.step(fixed, dt, 3)
}
