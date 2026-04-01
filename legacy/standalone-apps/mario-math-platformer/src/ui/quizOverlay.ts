import { generateMathQuestion, isCorrectNumericAnswer } from '../logic/questions'
import type { GradeMode } from '../logic/state'

type QuizOptions = {
  gradeMode: GradeMode
  title?: string
  subtitle?: string
  durationSec?: number
}

type OverlayElements = {
  root: HTMLElement
  title: HTMLElement
  meta: HTMLElement
  prompt: HTMLElement
  form: HTMLFormElement
  input: HTMLInputElement
  submit: HTMLButtonElement
  timer: HTMLElement
  error: HTMLElement
}

function getElements(): OverlayElements {
  const root = document.getElementById('quiz-overlay')
  const title = document.getElementById('quiz-title')
  const meta = document.getElementById('quiz-meta')
  const prompt = document.getElementById('quiz-prompt')
  const form = document.getElementById('quiz-form')
  const input = document.getElementById('quiz-input')
  const submit = document.getElementById('quiz-submit')
  const timer = document.getElementById('quiz-timer-pill')
  const error = document.getElementById('quiz-error')

  if (!root || !title || !meta || !prompt || !form || !input || !submit || !timer || !error) {
    throw new Error('Quiz overlay elements not found in index.html')
  }

  return {
    root,
    title,
    meta,
    prompt,
    form: form as HTMLFormElement,
    input: input as HTMLInputElement,
    submit: submit as HTMLButtonElement,
    timer,
    error,
  }
}

function openOverlay(root: HTMLElement) {
  root.classList.remove('hidden')
  root.setAttribute('aria-hidden', 'false')
}

function closeOverlay(root: HTMLElement) {
  root.classList.add('hidden')
  root.setAttribute('aria-hidden', 'true')
}

export function showQuizOverlay(options: QuizOptions): Promise<boolean> {
  const els = getElements()
  const q = generateMathQuestion(options.gradeMode)
  const durationSec = options.durationSec ?? 15

  openOverlay(els.root)
  els.title.textContent = options.title ?? 'Matematika savoli'
  els.meta.textContent = `${options.subtitle ?? 'To‘g‘ri javob bering'} · ${q.difficultyLabel} · ${durationSec}s`
  els.prompt.textContent = q.prompt
  els.input.value = ''
  els.input.readOnly = false
  els.error.textContent = ''
  els.submit.disabled = false
  els.timer.textContent = `${durationSec}s`
  els.timer.style.color = ''
  els.timer.style.borderColor = ''
  els.timer.style.background = ''

  let remaining = durationSec
  let settled = false
  let intervalId: number | null = null

  const cleanup = () => {
    if (intervalId != null) window.clearInterval(intervalId)
    els.form.removeEventListener('submit', onSubmit)
    els.submit.removeEventListener('click', onButtonClick)
    document.removeEventListener('keydown', onEsc)
    closeOverlay(els.root)
  }

  const finish = (result: boolean, resolve: (v: boolean) => void) => {
    if (settled) return
    settled = true
    cleanup()
    resolve(result)
  }

  const tickUi = () => {
    els.timer.textContent = `${remaining}s`
    if (remaining <= 5) {
      els.timer.style.color = '#fecaca'
      els.timer.style.borderColor = 'rgba(251,113,133,.35)'
      els.timer.style.background = 'rgba(244,63,94,.12)'
    } else if (remaining <= 10) {
      els.timer.style.color = '#fde68a'
      els.timer.style.borderColor = 'rgba(251,191,36,.35)'
      els.timer.style.background = 'rgba(245,158,11,.12)'
    }
  }

  const onEsc = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    els.error.textContent = 'Quiz ochiq paytda yopib bo‘lmaydi. Javob bering.'
  }

  return new Promise<boolean>((resolve) => {
    const submitCurrentAnswer = () => {
      const answer = els.input.value
      if (!answer.trim()) {
        els.error.textContent = 'Javob kiriting.'
        els.input.focus()
        return
      }
      els.submit.disabled = true
      els.input.readOnly = true
      finish(isCorrectNumericAnswer(answer, q.answer), resolve)
    }

    const onSubmit = (event: Event) => {
      event.preventDefault()
      submitCurrentAnswer()
    }

    const onButtonClick = (event: MouseEvent) => {
      event.preventDefault()
      submitCurrentAnswer()
    }

    els.form.addEventListener('submit', onSubmit)
    els.submit.addEventListener('click', onButtonClick)
    document.addEventListener('keydown', onEsc)

    intervalId = window.setInterval(() => {
      remaining -= 1
      tickUi()
      if (remaining <= 0) {
        finish(false, resolve)
      }
    }, 1000)

    tickUi()
    window.setTimeout(() => els.input.focus(), 20)
  })
}
