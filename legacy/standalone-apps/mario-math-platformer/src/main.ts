import { createGame } from './game/Game'
import './style.css'
import { getState, loadState, resetForNewGame, setGradeMode, type GradeMode } from './logic/state'

loadState()

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('#app not found')
}

app.innerHTML = `
  <div class="shell topbar">
    <div class="brand">
      <h1>Mario-style Platformer + Math Quiz (Phaser 3)</h1>
      <p>Har quiz block yoki gate oldida matematika savoli chiqadi. To‘g‘ri javob bering.</p>
    </div>
    <div class="controls">
      <label for="grade-mode">Grade mode</label>
      <select id="grade-mode">
        <option value="5-7">5-7</option>
        <option value="8-11">8-11</option>
      </select>
      <button id="reset-run-btn" type="button">Reset run</button>
    </div>
  </div>
  <div class="game-wrap">
    <div id="game-root" aria-label="Math platformer game canvas"></div>
  </div>
`

const gradeSelect = document.querySelector<HTMLSelectElement>('#grade-mode')
const resetBtn = document.querySelector<HTMLButtonElement>('#reset-run-btn')
const gameRoot = document.querySelector<HTMLDivElement>('#game-root')

if (!gradeSelect || !resetBtn || !gameRoot) {
  throw new Error('Required UI elements missing')
}

gradeSelect.value = getState().gradeMode
gradeSelect.addEventListener('change', (e) => {
  setGradeMode((e.currentTarget as HTMLSelectElement).value as GradeMode)
})

resetBtn.addEventListener('click', () => {
  resetForNewGame()
  window.location.reload()
})

createGame(gameRoot)

