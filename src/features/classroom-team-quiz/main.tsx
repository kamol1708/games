import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ClassroomTeamQuizApp from './App'

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <StrictMode>
      <ClassroomTeamQuizApp />
    </StrictMode>,
  )
}
