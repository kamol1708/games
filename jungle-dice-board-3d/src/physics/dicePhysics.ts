import * as CANNON from 'cannon-es'
import { detectTopFace } from './detectTopFace'

export type DiceRig = {
  body: CANNON.Body
  settleTimer: number
  isRolling: boolean
  lastResult: number | null
}

export function createDiceBody(material: CANNON.Material) {
  const body = new CANNON.Body({
    mass: 1.1,
    material,
    shape: new CANNON.Box(new CANNON.Vec3(0.55, 0.55, 0.55)),
    linearDamping: 0.18,
    angularDamping: 0.14,
    sleepSpeedLimit: 0.08,
    sleepTimeLimit: 0.8,
  })
  body.allowSleep = true
  return body
}

export function resetDiceBody(body: CANNON.Body, x: number, y: number, z: number) {
  body.wakeUp()
  body.position.set(x, y, z)
  body.velocity.setZero()
  body.angularVelocity.setZero()
  body.force.setZero()
  body.torque.setZero()
  body.quaternion.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
}

export function rollDice(body: CANNON.Body) {
  resetDiceBody(body, 0, 4.8, -3.8)
  const impulse = new CANNON.Vec3((Math.random() - 0.5) * 1.2, 5.8 + Math.random() * 1.4, 3.4 + Math.random() * 1.2)
  const worldPoint = new CANNON.Vec3((Math.random() - 0.5) * 0.25, 0.1, (Math.random() - 0.5) * 0.25)
  body.applyImpulse(impulse, body.position.vadd(worldPoint))
  body.torque.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40)
}

export function createDiceRig(material: CANNON.Material): DiceRig {
  return {
    body: createDiceBody(material),
    settleTimer: 0,
    isRolling: false,
    lastResult: null,
  }
}

export function updateDiceSettle(rig: DiceRig, dt: number): number | null {
  if (!rig.isRolling) return null
  const v = rig.body.velocity.length()
  const av = rig.body.angularVelocity.length()
  if (v < 0.1 && av < 0.1) {
    rig.settleTimer += dt
  } else {
    rig.settleTimer = 0
  }

  if (rig.settleTimer >= 1) {
    rig.isRolling = false
    rig.settleTimer = 0
    rig.lastResult = detectTopFace(rig.body.quaternion)
    return rig.lastResult
  }
  return null
}
