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
    <div className="quiz-overlay">
      <div className="quiz-card">
        <p className="quiz-meta">QUIZ TILE • {quiz.question.category.toUpperCase()} • 15s</p>
        <h2>Answer to continue</h2>
        <p>{quiz.question.prompt}</p>

        <form
          className="quiz-row"
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
          <button className="btn btn-primary" type="submit">Submit</button>
        </form>

        <div className="quiz-footer">
          <span className={`timer-pill${danger ? ' danger' : ''}`}>{timerText}</span>
          <span className="error">{error}</span>
        </div>
      </div>
    </div>
  )
}
