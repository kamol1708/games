import { useEffect, useMemo, useState } from 'react'
import type { PendingQuiz } from '../game/types'

type Props = {
  quiz: PendingQuiz
  onSubmit: (answer: string) => void
  onTimeout: () => void
}

export default function QuizModal({ quiz, onSubmit, onTimeout }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setValue('')
    setError('')
  }, [quiz.question.prompt])

  useEffect(() => {
    if (quiz.timeLeft <= 0) {
      onTimeout()
    }
  }, [quiz.timeLeft, onTimeout])

  const danger = quiz.timeLeft <= 5
  const timerText = useMemo(() => `${quiz.timeLeft}s`, [quiz.timeLeft])

  return (
    <div className="jb3d-quiz-overlay">
      <div className="jb3d-quiz-card">
        <p className="jb3d-quiz-meta">QUIZ TILE • {quiz.question.category.toUpperCase()} • 15s</p>
        <h2>Answer to continue</h2>
        <p>{quiz.question.prompt}</p>

        <form
          className="jb3d-quiz-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (!value.trim()) {
              setError('Please enter an answer')
              return
            }
            setError('')
            onSubmit(value)
          }}
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your answer"
          />
          <button className="jb3d-btn jb3d-btn-primary" type="submit">Submit</button>
        </form>

        <div className="jb3d-quiz-footer">
          <span className={`jb3d-timer-pill${danger ? ' danger' : ''}`}>{timerText}</span>
          <span className="jb3d-error">{error}</span>
        </div>
      </div>
    </div>
  )
}
