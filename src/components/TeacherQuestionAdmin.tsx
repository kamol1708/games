import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  getTeacherItems,
  saveTeacherItemsToBackend,
  syncTeacherItemsFromBackend,
  type TeacherGameKey,
} from '../lib/teacherContent'

const SELECTED_GAME_STORAGE_KEY = 'teacher-question-admin-selected-game-v1'

type GameOption = {
  key: TeacherGameKey
  label: string
  subtitle: string
  badge: string
  formMode: 'generic' | 'unsupported' | 'word-search' | 'flag-race' | 'flag-player-race' | 'bilim-poyezdi'
  note?: string
}

type QuestionForm = {
  title: string
  story: string
  question: string
  subject: string
  stage: '1' | '2' | '3'
  option1: string
  option2: string
  option3: string
  option4: string
  correctOption: '1' | '2' | '3' | '4'
  timer: string
  hint: string
  difficulty: 'easy' | 'medium' | 'hard'
}

type TeacherQuestionItem = {
  title: string
  story?: string
  question: string
  text?: string
  variants: string[]
  options?: string[]
  answer: string
  correctOption: number
  timer: number
  seconds?: number
  hint?: string
  difficulty: 'easy' | 'medium' | 'hard'
  level?: 'easy' | 'medium' | 'hard'
  points?: number
  reward?: number
  category?: string
  subject?: string
  stage?: number
  gameKey: TeacherGameKey
  createdAt: number
}

type WordSearchForm = {
  word: string
}

type FlagCountryForm = {
  name: string
  code: string
  difficulty: 'easy' | 'medium' | 'hard'
}

type FlagPlayerForm = {
  country: string
  code: string
  player: string
  difficulty: 'easy' | 'medium' | 'hard'
}

type BilimQuestionForm = {
  subject: 'Math' | 'Science' | 'Logic'
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'mcq' | 'numeric'
  gradeModeA: boolean
  gradeModeB: boolean
  prompt: string
  option1: string
  option2: string
  option3: string
  option4: string
  answer: string
}

const gameOptions: GameOption[] = [
  { key: 'treasure-hunt', label: 'Treasure Hunt', subtitle: 'Xazina topish sarguzashti', badge: 'Adventure', formMode: 'generic' },
  { key: 'quiz-battle', label: 'Quiz Battle', subtitle: 'Tezkor viktorina jangi', badge: 'Quiz', formMode: 'generic' },
  { key: 'tug-of-war', label: 'Tug of War', subtitle: 'Jamoaviy savol tortishuvi', badge: 'Battle', formMode: 'generic' },
  { key: 'frog-pond', label: 'Frog Pond', subtitle: 'Qurbaqa bosqich savollari', badge: 'Frog', formMode: 'generic' },
  { key: 'word-search', label: 'Word Search', subtitle: 'So‘z topish o‘yini', badge: 'Words', formMode: 'word-search', note: 'Faqat so‘z ro‘yxati formatida' },
  { key: 'memory-rush', label: 'Memory Rush', subtitle: 'Xotira kartalari', badge: 'Memory', formMode: 'unsupported', note: 'Savol formasi ishlamaydi' },
  { key: 'football-challenge', label: 'Football Challenge', subtitle: 'Sport savollari', badge: 'Sport', formMode: 'generic' },
  { key: 'wheel-of-fortune', label: 'Wheel of Fortune', subtitle: 'Aylana savollar', badge: 'Wheel', formMode: 'generic' },
  { key: 'flag-race', label: 'Flag Race', subtitle: 'Bayroq poygasi', badge: 'Flags', formMode: 'flag-race' },
  { key: 'flag-player-race', label: 'Flag Player Race', subtitle: 'Futbolchi va davlat', badge: 'Players', formMode: 'flag-player-race' },
  { key: 'learning', label: 'Learning Hub', subtitle: 'Dars va mashq kontenti', badge: 'Learn', formMode: 'unsupported', note: 'Bu forma bilan mos emas' },
  { key: 'bilim-poyezdi', label: 'Bilim Poyezdi', subtitle: 'Stansiya savollari', badge: 'Train', formMode: 'bilim-poyezdi' },
]

const genericGameOptions = gameOptions.filter((item) => item.formMode === 'generic')

const initialForm: QuestionForm = {
  title: '',
  story: '',
  question: '',
  subject: '',
  stage: '1',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correctOption: '1',
  timer: '120',
  hint: '',
  difficulty: 'medium',
}

const initialWordSearchForm: WordSearchForm = {
  word: '',
}

const initialFlagCountryForm: FlagCountryForm = {
  name: '',
  code: '',
  difficulty: 'medium',
}

const initialFlagPlayerForm: FlagPlayerForm = {
  country: '',
  code: '',
  player: '',
  difficulty: 'medium',
}

const initialBilimQuestionForm: BilimQuestionForm = {
  subject: 'Math',
  difficulty: 'medium',
  type: 'mcq',
  gradeModeA: true,
  gradeModeB: false,
  prompt: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  answer: '',
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function mapFormToItem(form: QuestionForm, selectedKey: TeacherGameKey): TeacherQuestionItem {
  const variants = [form.option1, form.option2, form.option3, form.option4].map((v) => v.trim()).filter(Boolean)
  const correctIdx = Math.max(0, Math.min(3, Number(form.correctOption) - 1))
  const safeAnswer = variants[correctIdx] ?? variants[0] ?? ''
  const timerNum = Number(form.timer)
  const timer = Number.isFinite(timerNum) && timerNum > 0 ? timerNum : 120
  const difficulty = form.difficulty
  const pointsByDifficulty = { easy: 10, medium: 15, hard: 20 } as const
  const rewardByDifficulty = { easy: 200, medium: 300, hard: 500 } as const
  const stage = selectedKey === 'frog-pond' ? Number(form.stage) : undefined
  const category = selectedKey === 'frog-pond' ? form.subject.trim() || 'Teacher savoli' : 'Bilim'
  return {
    title: form.title.trim(),
    story: emptyToUndefined(form.story),
    question: form.question.trim(),
    text: form.question.trim(),
    variants,
    options: variants,
    answer: safeAnswer,
    correctOption: correctIdx + 1,
    timer,
    seconds: timer,
    hint: emptyToUndefined(form.hint),
    difficulty,
    level: difficulty,
    points: pointsByDifficulty[difficulty],
    reward: rewardByDifficulty[difficulty],
    category,
    subject: selectedKey === 'frog-pond' ? form.subject.trim() : undefined,
    stage,
    gameKey: selectedKey,
    createdAt: Date.now(),
  }
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().slice(0, 2)
}

function mapWordSearchForm(form: WordSearchForm) {
  return form.word.trim().toUpperCase()
}

function mapFlagCountryForm(form: FlagCountryForm) {
  return {
    name: form.name.trim(),
    code: normalizeCode(form.code),
    difficulty: form.difficulty,
  }
}

function mapFlagPlayerForm(form: FlagPlayerForm) {
  return {
    country: form.country.trim(),
    code: normalizeCode(form.code),
    player: form.player.trim(),
    difficulty: form.difficulty,
  }
}

function mapBilimForm(form: BilimQuestionForm) {
  const options = [form.option1, form.option2, form.option3, form.option4].map((item) => item.trim()).filter(Boolean)
  return {
    id: `teacher-${Date.now()}`,
    subject: form.subject,
    difficulty: form.difficulty,
    type: form.type,
    gradeModes: [form.gradeModeA ? '5-7' : null, form.gradeModeB ? '8-11' : null].filter(Boolean),
    prompt: form.prompt.trim(),
    options: form.type === 'mcq' ? options : undefined,
    answer: form.answer.trim(),
  }
}

function getItemSearchText(key: TeacherGameKey, item: unknown, index: number) {
  if (key === 'word-search') {
    return typeof item === 'string' ? item : `word-${index + 1}`
  }

  if (key === 'flag-race' && item && typeof item === 'object') {
    const value = item as { name?: string; code?: string; difficulty?: string }
    return [value.name, value.code, value.difficulty].filter(Boolean).join(' ')
  }

  if (key === 'flag-player-race' && item && typeof item === 'object') {
    const value = item as { country?: string; code?: string; player?: string; difficulty?: string }
    return [value.country, value.code, value.player, value.difficulty].filter(Boolean).join(' ')
  }

  if (key === 'bilim-poyezdi' && item && typeof item === 'object') {
    const value = item as { prompt?: string; subject?: string; answer?: string }
    return [value.prompt, value.subject, value.answer].filter(Boolean).join(' ')
  }

  if (item && typeof item === 'object') {
    const value = item as Partial<TeacherQuestionItem>
    return [value.title, value.question, value.hint].filter(Boolean).join(' ')
  }

  return String(item ?? '')
}

function itemKeyForList(key: TeacherGameKey, item: unknown, index: number) {
  if (item && typeof item === 'object' && 'createdAt' in item && typeof item.createdAt === 'number') {
    return `${key}-${item.createdAt}-${index}`
  }

  return `${key}-${index}-${getItemSearchText(key, item, index)}`
}

export default function TeacherQuestionAdmin() {
  const [selectedKey, setSelectedKey] = useState<TeacherGameKey>(() => {
    if (typeof window === 'undefined') {
      return genericGameOptions[0]?.key ?? 'treasure-hunt'
    }

    const raw = window.localStorage.getItem(SELECTED_GAME_STORAGE_KEY)
    const fallback = genericGameOptions[0]?.key ?? 'treasure-hunt'
    return gameOptions.some((item) => item.key === raw) ? (raw as TeacherGameKey) : fallback
  })
  const [form, setForm] = useState<QuestionForm>(initialForm)
  const [wordForm, setWordForm] = useState<WordSearchForm>(initialWordSearchForm)
  const [flagCountryForm, setFlagCountryForm] = useState<FlagCountryForm>(initialFlagCountryForm)
  const [flagPlayerForm, setFlagPlayerForm] = useState<FlagPlayerForm>(initialFlagPlayerForm)
  const [bilimForm, setBilimForm] = useState<BilimQuestionForm>(initialBilimQuestionForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [version, setVersion] = useState(0)
  const [itemSearch, setItemSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showGamePicker, setShowGamePicker] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const selectedOption = useMemo(
    () => gameOptions.find((item) => item.key === selectedKey) ?? gameOptions[0],
    [selectedKey],
  )

  const items = useMemo(() => getTeacherItems<unknown>(selectedKey), [selectedKey, version])

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item, index) =>
        getItemSearchText(selectedKey, item, index).toLowerCase().includes(q),
    )
  }, [items, itemSearch, selectedKey])

  const handleChangeGame = (nextKey: TeacherGameKey) => {
    setSelectedKey(nextKey)
    setShowGamePicker(false)
    setError('')
    setSuccess('')
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SELECTED_GAME_STORAGE_KEY, selectedKey)
  }, [selectedKey])

  const handleFormChange = <K extends keyof QuestionForm>(key: K, value: QuestionForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setSuccess('')
  }

  const handleAdd = async () => {
    try {
      setIsSyncing(true)
      let payload: unknown

      if (selectedOption.formMode === 'generic') {
        const variants = [form.option1, form.option2, form.option3, form.option4].map((v) => v.trim()).filter(Boolean)
        if (form.title.trim().length < 2) {
          setError('Sarlavha kiriting.')
          return
        }
        if (selectedKey === 'frog-pond' && form.subject.trim().length < 2) {
          setError('Frog Pond uchun fan nomini kiriting.')
          return
        }
        if (form.question.trim().length < 4) {
          setError('Savol matnini kiriting.')
          return
        }
        if (variants.length < 2) {
          setError('Kamida 2 ta variant kiriting.')
          return
        }
        payload = mapFormToItem(form, selectedKey)
      } else if (selectedOption.formMode === 'word-search') {
        if (wordForm.word.trim().length < 3) {
          setError('Kamida 3 harfli so‘z kiriting.')
          return
        }
        payload = mapWordSearchForm(wordForm)
      } else if (selectedOption.formMode === 'flag-race') {
        const next = mapFlagCountryForm(flagCountryForm)
        if (next.name.length < 2 || next.code.length !== 2) {
          setError('Davlat nomi va 2 harfli country code kiriting.')
          return
        }
        payload = next
      } else if (selectedOption.formMode === 'flag-player-race') {
        const next = mapFlagPlayerForm(flagPlayerForm)
        if (next.country.length < 2 || next.player.length < 2 || next.code.length !== 2) {
          setError('Davlat, futbolchi va 2 harfli country code kiriting.')
          return
        }
        payload = next
      } else if (selectedOption.formMode === 'bilim-poyezdi') {
        const next = mapBilimForm(bilimForm)
        if (next.prompt.length < 4 || next.answer.length < 1) {
          setError('Savol matni va javobni kiriting.')
          return
        }
        if (next.gradeModes.length === 0) {
          setError('Kamida bitta sinf oralig‘ini tanlang.')
          return
        }
        if (next.type === 'mcq' && (!next.options || next.options.length < 2 || !next.options.includes(next.answer))) {
          setError('MCQ uchun variantlar kiriting va javob variantlar ichida bo‘lsin.')
          return
        }
        payload = next
      } else {
        setError(`${selectedOption.label} uchun forma yo‘q.`)
        return
      }

      const nextItems = [...items, payload]
      await saveTeacherItemsToBackend(selectedKey, nextItems)
      setVersion((v) => v + 1)
      setError('')
      setSuccess(`"${selectedOption.label}" o‘yiniga savol qo‘shildi.`)
      setShowAddForm(false)
      setShowGamePicker(false)
      setForm((prev) => ({ ...initialForm, timer: prev.timer || '120', difficulty: prev.difficulty }))
      setWordForm(initialWordSearchForm)
      setFlagCountryForm(initialFlagCountryForm)
      setFlagPlayerForm(initialFlagPlayerForm)
      setBilimForm(initialBilimQuestionForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saqlashda xatolik yuz berdi.')
      setSuccess('')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleClear = async () => {
    try {
      setIsSyncing(true)
      await saveTeacherItemsToBackend(selectedKey, [])
      setVersion((v) => v + 1)
      setError('')
      setSuccess(`${selectedOption.label} savollari tozalandi.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tozalashda xatolik yuz berdi.')
      setSuccess('')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (!showAddForm) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setShowAddForm(false)
      setShowGamePicker(false)
      setError('')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showAddForm])

  useEffect(() => {
    const openFromHeader = () => {
      setShowAddForm(true)
      setShowGamePicker(false)
      setError('')
      setSuccess('')
    }
    window.addEventListener('teacher-question-admin:open-add-modal', openFromHeader as EventListener)
    return () => window.removeEventListener('teacher-question-admin:open-add-modal', openFromHeader as EventListener)
  }, [])

  useEffect(() => {
    let ignore = false

    const run = async () => {
      try {
        setIsSyncing(true)
        await syncTeacherItemsFromBackend<TeacherQuestionItem>(selectedKey)
        if (!ignore) {
          setVersion((v) => v + 1)
        }
      } catch {
        // keep existing local data if backend read fails
      } finally {
        if (!ignore) {
          setIsSyncing(false)
        }
      }
    }

    void run()
    return () => {
      ignore = true
    }
  }, [selectedKey])

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_70px_rgba(0,0,0,.28)] backdrop-blur-xl sm:p-5">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-white">Savollar ro‘yxati</h4>
            <div className="flex items-center gap-2">
              <input
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Savol qidirish..."
                className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/35 focus:border-sky-300/30 focus:ring-2 focus:ring-sky-500/15"
              />
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                {filteredItems.length}/{items.length}
              </span>
              {isSyncing ? <span className="text-xs text-sky-200/80">Sync...</span> : null}
            </div>
          </div>
          {selectedOption.note ? (
            <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-400/10 p-3 text-xs text-amber-100/90">
              {selectedOption.label}: {selectedOption.note}
            </div>
          ) : null}

          <div className="mt-3 space-y-2">
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                Hozircha savol yo‘q. Teacher Control Center ichidagi <span className="text-sky-200">Savol qo‘shish</span> tugmasini bosib qo‘shing.
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <div key={itemKeyForList(selectedKey, item, index)} className="rounded-xl border border-white/10 bg-[#0c1018] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selectedKey === 'word-search'
                          ? `So‘z #${index + 1}`
                          : selectedKey === 'flag-race' && item && typeof item === 'object'
                            ? ((item as { name?: string }).name || `Flag #${index + 1}`)
                            : selectedKey === 'flag-player-race' && item && typeof item === 'object'
                              ? ((item as { player?: string }).player || `Player #${index + 1}`)
                              : selectedKey === 'bilim-poyezdi' && item && typeof item === 'object'
                                ? ((item as { prompt?: string }).prompt || `Savol #${index + 1}`)
                                : ((item as Partial<TeacherQuestionItem>).title || `Savol #${index + 1}`)}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">{getItemSearchText(selectedKey, item, index)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsSyncing(true)
                          const next = [...items.slice(0, index), ...items.slice(index + 1)]
                          await saveTeacherItemsToBackend(selectedKey, next)
                          setVersion((v) => v + 1)
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Savolni o‘chirishda xatolik.')
                        } finally {
                          setIsSyncing(false)
                        }
                      }}
                      className="rounded-lg border border-rose-300/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
                    >
                      O‘chirish
                    </button>
                  </div>

                  <div className="mt-2 rounded-lg border border-white/5 bg-black/25 p-2.5">
                    {selectedKey === 'word-search' ? (
                      <>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/40">So‘z</p>
                        <p className="mt-1 text-sm text-white/85">{String(item)}</p>
                      </>
                    ) : selectedKey === 'flag-race' && item && typeof item === 'object' ? (
                      <>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/40">Bayroq</p>
                        <p className="mt-1 text-sm text-white/85">
                          {(item as { name?: string }).name} · {(item as { code?: string }).code} · {(item as { difficulty?: string }).difficulty}
                        </p>
                      </>
                    ) : selectedKey === 'flag-player-race' && item && typeof item === 'object' ? (
                      <>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/40">Player Flag</p>
                        <p className="mt-1 text-sm text-white/85">
                          {(item as { country?: string }).country} · {(item as { code?: string }).code}
                        </p>
                        <p className="mt-1 text-sm text-sky-100">{(item as { player?: string }).player}</p>
                      </>
                    ) : selectedKey === 'bilim-poyezdi' && item && typeof item === 'object' ? (
                      <>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/40">Bilim Poyezdi Savoli</p>
                        <p className="mt-1 text-sm text-white/85">{(item as { prompt?: string }).prompt}</p>
                        <p className="mt-1 text-xs text-white/60">
                          {(item as { subject?: string }).subject} · {(item as { difficulty?: string }).difficulty} · {(item as { type?: string }).type}
                        </p>
                        {(item as { options?: string[] }).options?.length ? (
                          <div className="mt-2 grid gap-1">
                            {(item as { options: string[] }).options.map((variant, i) => (
                              <div key={`${index}-${i}`} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/75">
                                {i + 1}. {variant}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <p className="mt-2 text-xs text-emerald-200">Javob: {(item as { answer?: string }).answer}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/40">Savol</p>
                        <p className="mt-1 text-sm text-white/85">{(item as TeacherQuestionItem).question}</p>
                        {(item as TeacherQuestionItem).stage ? (
                          <p className="mt-1 text-xs text-amber-200/85">
                            Bosqich: {(item as TeacherQuestionItem).stage} · Fan: {(item as TeacherQuestionItem).subject ?? (item as TeacherQuestionItem).category ?? 'Teacher savoli'}
                          </p>
                        ) : null}
                        {(item as TeacherQuestionItem).story ? <p className="mt-2 text-xs text-white/55">Hikoya: {(item as TeacherQuestionItem).story}</p> : null}
                        {(item as TeacherQuestionItem).hint ? <p className="mt-1 text-xs text-sky-200/80">Hint: {(item as TeacherQuestionItem).hint}</p> : null}
                        <div className="mt-2 grid gap-1">
                          {((item as TeacherQuestionItem).variants ?? []).map((variant, i) => (
                            <div
                              key={`${(item as TeacherQuestionItem).createdAt}-${i}`}
                              className={`rounded-md border px-2 py-1 text-xs ${
                                i + 1 === (item as TeacherQuestionItem).correctOption
                                  ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
                                  : 'border-white/10 bg-white/5 text-white/75'
                              }`}
                            >
                              {i + 1}. {variant}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}

            {items.length > 0 && filteredItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                Qidiruv bo‘yicha natija topilmadi.
              </div>
            ) : null}
          </div>
      </div>

      {showAddForm && typeof document !== 'undefined'
        ? createPortal((
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black"
          onClick={() => {
            setShowAddForm(false)
            setShowGamePicker(false)
            setError('')
          }}
        >
          <div className="pointer-events-none fixed inset-0 bg-black" />
          <div className="relative z-[1] flex min-h-full w-full items-start justify-center p-3 sm:p-6">
            <div
              className="w-[min(1180px,100%)] animate-[teacher-admin-modal-drop_.22s_ease-out] rounded-3xl border border-white/10 bg-[#05070c] p-4 shadow-[0_28px_90px_rgba(0,0,0,.85)] sm:p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/80">Savol Qo‘shish</p>
                <h4 className="mt-1 text-lg font-semibold text-white">Katta modal forma</h4>
                <p className="mt-1 text-xs text-white/50">Formani to‘ldiring, o‘yinni tanlang va saqlang.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setShowGamePicker(false)
                  setError('')
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                Yopish ✕
              </button>
            </div>

              {selectedOption.formMode === 'generic' ? (
                <div className="grid max-h-[calc(100vh-210px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                  <input value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} placeholder="Sarlavha" className="h-11 rounded-xl border border-cyan-300/20 bg-[#081423] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20" />
                  <input value={form.story} onChange={(e) => handleFormChange('story', e.target.value)} placeholder="Hikoya" className="h-11 rounded-xl border border-violet-300/20 bg-[#100d22] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/20" />
                  {selectedKey === 'frog-pond' ? (
                    <>
                      <input value={form.subject} onChange={(e) => handleFormChange('subject', e.target.value)} placeholder="Fan: Matematika / Geografiya / Astronomiya" className="h-11 rounded-xl border border-emerald-300/20 bg-[#091712] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20" />
                      <select value={form.stage} onChange={(e) => handleFormChange('stage', e.target.value as QuestionForm['stage'])} className="h-11 rounded-xl border border-amber-300/20 bg-[#1a1208] px-3 text-sm text-white outline-none focus:border-amber-300/50 focus:ring-2 focus:ring-amber-500/20">
                        <option value="1">1-bosqich</option>
                        <option value="2">2-bosqich</option>
                        <option value="3">3-bosqich</option>
                      </select>
                    </>
                  ) : null}
                  <input value={form.question} onChange={(e) => handleFormChange('question', e.target.value)} placeholder="Savol" className="h-11 rounded-xl border border-fuchsia-300/20 bg-[#180b1d] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-fuchsia-300/50 focus:ring-2 focus:ring-fuchsia-400/20 sm:col-span-2" />
                  <input value={form.option1} onChange={(e) => handleFormChange('option1', e.target.value)} placeholder="1-variant" className="h-11 rounded-xl border border-sky-300/15 bg-[#0a1525] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-500/15" />
                  <input value={form.option2} onChange={(e) => handleFormChange('option2', e.target.value)} placeholder="2-variant" className="h-11 rounded-xl border border-sky-300/15 bg-[#0b1320] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-500/15" />
                  <input value={form.option3} onChange={(e) => handleFormChange('option3', e.target.value)} placeholder="3-variant" className="h-11 rounded-xl border border-emerald-300/15 bg-[#091712] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-500/15" />
                  <input value={form.option4} onChange={(e) => handleFormChange('option4', e.target.value)} placeholder="4-variant" className="h-11 rounded-xl border border-amber-300/15 bg-[#1a1208] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-500/15" />
                  <select value={form.correctOption} onChange={(e) => handleFormChange('correctOption', e.target.value as QuestionForm['correctOption'])} className="h-11 rounded-xl border border-emerald-300/20 bg-[#0a1713] px-3 text-sm text-white outline-none focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20">
                    <option value="1">Javob: 1</option>
                    <option value="2">Javob: 2</option>
                    <option value="3">Javob: 3</option>
                    <option value="4">Javob: 4</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={form.timer} onChange={(e) => handleFormChange('timer', e.target.value)} placeholder="120" inputMode="numeric" className="h-11 rounded-xl border border-orange-300/20 bg-[#1a1008] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-orange-300/50 focus:ring-2 focus:ring-orange-500/20" />
                    <select value={form.difficulty} onChange={(e) => handleFormChange('difficulty', e.target.value as QuestionForm['difficulty'])} className="h-11 rounded-xl border border-indigo-300/20 bg-[#100f1f] px-3 text-sm text-white outline-none focus:border-indigo-300/50 focus:ring-2 focus:ring-indigo-500/20">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <input value={form.hint} onChange={(e) => handleFormChange('hint', e.target.value)} placeholder="Hint" className="h-11 rounded-xl border border-teal-300/20 bg-[#081718] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-500/20 sm:col-span-2" />
                </div>
              ) : null}

              {selectedOption.formMode === 'word-search' ? (
                <div className="grid gap-3">
                  <input
                    value={wordForm.word}
                    onChange={(e) => {
                      setWordForm({ word: e.target.value })
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="So'z kiriting"
                    className="h-11 rounded-xl border border-emerald-300/20 bg-[#091712] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              ) : null}

              {selectedOption.formMode === 'flag-race' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={flagCountryForm.name}
                    onChange={(e) => {
                      setFlagCountryForm((prev) => ({ ...prev, name: e.target.value }))
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="Davlat nomi"
                    className="h-11 rounded-xl border border-sky-300/20 bg-[#081423] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-400/20"
                  />
                  <input
                    value={flagCountryForm.code}
                    onChange={(e) => {
                      setFlagCountryForm((prev) => ({ ...prev, code: normalizeCode(e.target.value) }))
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="US"
                    maxLength={2}
                    className="h-11 rounded-xl border border-violet-300/20 bg-[#100d22] px-3 text-sm uppercase text-white outline-none placeholder:text-slate-400 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                  <select
                    value={flagCountryForm.difficulty}
                    onChange={(e) => {
                      setFlagCountryForm((prev) => ({ ...prev, difficulty: e.target.value as FlagCountryForm['difficulty'] }))
                      setError('')
                      setSuccess('')
                    }}
                    className="h-11 rounded-xl border border-indigo-300/20 bg-[#100f1f] px-3 text-sm text-white outline-none focus:border-indigo-300/50 focus:ring-2 focus:ring-indigo-500/20 sm:col-span-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              ) : null}

              {selectedOption.formMode === 'flag-player-race' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={flagPlayerForm.country}
                    onChange={(e) => {
                      setFlagPlayerForm((prev) => ({ ...prev, country: e.target.value }))
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="Davlat nomi"
                    className="h-11 rounded-xl border border-sky-300/20 bg-[#081423] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-400/20"
                  />
                  <input
                    value={flagPlayerForm.code}
                    onChange={(e) => {
                      setFlagPlayerForm((prev) => ({ ...prev, code: normalizeCode(e.target.value) }))
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="AR"
                    maxLength={2}
                    className="h-11 rounded-xl border border-violet-300/20 bg-[#100d22] px-3 text-sm uppercase text-white outline-none placeholder:text-slate-400 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                  <input
                    value={flagPlayerForm.player}
                    onChange={(e) => {
                      setFlagPlayerForm((prev) => ({ ...prev, player: e.target.value }))
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="Futbolchi"
                    className="h-11 rounded-xl border border-fuchsia-300/20 bg-[#180b1d] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-fuchsia-300/50 focus:ring-2 focus:ring-fuchsia-400/20"
                  />
                  <select
                    value={flagPlayerForm.difficulty}
                    onChange={(e) => {
                      setFlagPlayerForm((prev) => ({ ...prev, difficulty: e.target.value as FlagPlayerForm['difficulty'] }))
                      setError('')
                      setSuccess('')
                    }}
                    className="h-11 rounded-xl border border-indigo-300/20 bg-[#100f1f] px-3 text-sm text-white outline-none focus:border-indigo-300/50 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              ) : null}

              {selectedOption.formMode === 'bilim-poyezdi' ? (
                <div className="grid max-h-[calc(100vh-210px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                  <select
                    value={bilimForm.subject}
                    onChange={(e) => {
                      setBilimForm((prev) => ({ ...prev, subject: e.target.value as BilimQuestionForm['subject'] }))
                      setError('')
                      setSuccess('')
                    }}
                    className="h-11 rounded-xl border border-cyan-300/20 bg-[#081423] px-3 text-sm text-white outline-none focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="Logic">Logic</option>
                  </select>
                  <select
                    value={bilimForm.difficulty}
                    onChange={(e) => {
                      setBilimForm((prev) => ({ ...prev, difficulty: e.target.value as BilimQuestionForm['difficulty'] }))
                      setError('')
                      setSuccess('')
                    }}
                    className="h-11 rounded-xl border border-indigo-300/20 bg-[#100f1f] px-3 text-sm text-white outline-none focus:border-indigo-300/50 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <select
                    value={bilimForm.type}
                    onChange={(e) => {
                      setBilimForm((prev) => ({ ...prev, type: e.target.value as BilimQuestionForm['type'] }))
                      setError('')
                      setSuccess('')
                    }}
                    className="h-11 rounded-xl border border-emerald-300/20 bg-[#091712] px-3 text-sm text-white outline-none focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="numeric">Numeric</option>
                  </select>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bilimForm.gradeModeA}
                        onChange={(e) => {
                          setBilimForm((prev) => ({ ...prev, gradeModeA: e.target.checked }))
                          setError('')
                          setSuccess('')
                        }}
                      />
                      5-7
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bilimForm.gradeModeB}
                        onChange={(e) => {
                          setBilimForm((prev) => ({ ...prev, gradeModeB: e.target.checked }))
                          setError('')
                          setSuccess('')
                        }}
                      />
                      8-11
                    </label>
                  </div>
                  <input
                    value={bilimForm.prompt}
                    onChange={(e) => {
                      setBilimForm((prev) => ({ ...prev, prompt: e.target.value }))
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="Savol matni"
                    className="h-11 rounded-xl border border-fuchsia-300/20 bg-[#180b1d] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-fuchsia-300/50 focus:ring-2 focus:ring-fuchsia-400/20 sm:col-span-2"
                  />
                  {bilimForm.type === 'mcq' ? (
                    <>
                      <input value={bilimForm.option1} onChange={(e) => { setBilimForm((prev) => ({ ...prev, option1: e.target.value })); setError(''); setSuccess('') }} placeholder="1-variant" className="h-11 rounded-xl border border-sky-300/15 bg-[#0a1525] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-500/15" />
                      <input value={bilimForm.option2} onChange={(e) => { setBilimForm((prev) => ({ ...prev, option2: e.target.value })); setError(''); setSuccess('') }} placeholder="2-variant" className="h-11 rounded-xl border border-sky-300/15 bg-[#0b1320] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-500/15" />
                      <input value={bilimForm.option3} onChange={(e) => { setBilimForm((prev) => ({ ...prev, option3: e.target.value })); setError(''); setSuccess('') }} placeholder="3-variant" className="h-11 rounded-xl border border-emerald-300/15 bg-[#091712] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-500/15" />
                      <input value={bilimForm.option4} onChange={(e) => { setBilimForm((prev) => ({ ...prev, option4: e.target.value })); setError(''); setSuccess('') }} placeholder="4-variant" className="h-11 rounded-xl border border-amber-300/15 bg-[#1a1208] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-500/15" />
                    </>
                  ) : null}
                  <input
                    value={bilimForm.answer}
                    onChange={(e) => {
                      setBilimForm((prev) => ({ ...prev, answer: e.target.value }))
                      setError('')
                      setSuccess('')
                    }}
                    placeholder={bilimForm.type === 'mcq' ? "To'g'ri variant matni" : "To'g'ri javob"}
                    className="h-11 rounded-xl border border-teal-300/20 bg-[#081718] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-500/20 sm:col-span-2"
                  />
                </div>
              ) : null}

              {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
              {success ? <p className="mt-3 text-sm text-emerald-300">{success}</p> : null}

              <div className="relative mt-3 flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button type="button" onClick={() => setShowGamePicker((v) => !v)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">
                    Qaysi o‘yinga qo‘shmoqchisiz? <span className="ml-1 text-sky-200">{selectedOption.label}</span>
                  </button>
                  {showGamePicker ? (
                    <div className="absolute left-0 top-full z-10 mt-2 w-[340px] max-w-[85vw] rounded-2xl border border-white/10 bg-[#080b13] p-2 shadow-[0_12px_30px_rgba(0,0,0,.45)]">
                      <div className="max-h-64 space-y-1 overflow-auto pr-1">
                      {gameOptions.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            if (item.formMode === 'unsupported') return
                            handleChangeGame(item.key)
                          }}
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                            item.formMode === 'unsupported'
                              ? 'cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35'
                              : selectedKey === item.key
                                ? 'border-sky-300/30 bg-sky-400/10 text-sky-100'
                                : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{item.label}</div>
                              <div className="mt-0.5 truncate text-xs opacity-75">{item.note ?? item.subtitle}</div>
                            </div>
                              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                                {item.formMode === 'unsupported' ? 'LOCK' : item.badge}
                              </span>
                          </div>
                        </button>
                      ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button type="button" onClick={() => void handleAdd()} disabled={isSyncing} className="rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(59,130,246,.28)] disabled:cursor-not-allowed disabled:opacity-50">
                  + Save / Qo‘shish
                </button>
                <button type="button" onClick={() => void handleClear()} disabled={isSyncing} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
                  Shu o‘yin savollarini tozalash
                </button>
              </div>
            </div>
          </div>
        </div>
        ), document.body)
        : null}
    </section>
  )
}
