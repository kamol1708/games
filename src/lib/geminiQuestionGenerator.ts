type GeminiQuestion = {
  text?: unknown
  options?: unknown
  answer?: unknown
}

export type GeneratedQuestion = {
  text: string
  options: string[]
  answer: string
}

type GenerateInput = {
  subject: string
  count: number
  difficulty: 'easy' | 'medium' | 'hard'
}

type GeminiResponse = {
  error?: {
    code?: number
    message?: string
    status?: string
  }
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

function unwrapJsonText(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('```')) {
    return trimmed
  }

  return trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

function parseArrayPayload(payload: unknown): GeminiQuestion[] {
  if (Array.isArray(payload)) {
    return payload as GeminiQuestion[]
  }

  if (payload && typeof payload === 'object') {
    const nested = (payload as { questions?: unknown }).questions
    if (Array.isArray(nested)) {
      return nested as GeminiQuestion[]
    }
  }

  return []
}

function normalizeQuestion(raw: GeminiQuestion): GeneratedQuestion | null {
  const text = typeof raw.text === 'string' ? raw.text.trim() : ''
  const optionsRaw = Array.isArray(raw.options) ? raw.options : []
  const options = optionsRaw
    .map((item) => (typeof item === 'string' || typeof item === 'number' ? String(item).trim() : ''))
    .filter(Boolean)
  const answer = typeof raw.answer === 'string' || typeof raw.answer === 'number' ? String(raw.answer).trim() : ''

  if (!text || options.length < 2 || !answer) {
    return null
  }

  if (!options.includes(answer)) {
    options[0] = answer
  }

  return {
    text,
    options: options.slice(0, 4),
    answer,
  }
}

function questionKey(question: GeneratedQuestion): string {
  return question.text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function dedupeQuestions(questions: GeneratedQuestion[]): GeneratedQuestion[] {
  const seen = new Set<string>()
  const unique: GeneratedQuestion[] = []
  for (const question of questions) {
    const key = questionKey(question)
    if (!key || seen.has(key)) {
      continue
    }
    seen.add(key)
    unique.push(question)
  }
  return unique
}

function buildPrompt(input: GenerateInput) {
  const levelLabel =
    input.difficulty === 'easy' ? 'oson' : input.difficulty === 'medium' ? "o'rta" : 'qiyin'

  return [
    'Siz maktab oquvchilari uchun test yaratuvchi yordamchisiz.',
    `Fan: ${input.subject}.`,
    `Qiyinlik: ${levelLabel}.`,
    `Savollar soni: ${input.count}.`,
    'Barcha savollar fan bilan bevosita bog‘liq bo‘lsin.',
    'Boshqa fanlardan savol yozmang.',
    'Faqat JSON qaytaring.',
    'Format: [{"text":"savol","options":["A","B","C","D"],"answer":"to‘g‘ri variant matni"}]',
    'Har savolda 4 ta variant bo‘lsin.',
    'answer maydoni options ichidagi aynan bir matn bo‘lsin.',
    'Hech qanday izoh, markdown, kod blok yoki qo‘shimcha matn yozmang.',
  ].join('\n')
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = next[i]
    next[i] = next[j]
    next[j] = temp
  }
  return next
}

function buildMathFallback(count: number, difficulty: GenerateInput['difficulty']): GeneratedQuestion[] {
  const ranges =
    difficulty === 'easy'
      ? { min: 2, max: 20, mulMin: 2, mulMax: 9 }
      : difficulty === 'medium'
        ? { min: 10, max: 80, mulMin: 3, mulMax: 12 }
        : { min: 30, max: 180, mulMin: 4, mulMax: 16 }

  const items: GeneratedQuestion[] = []
  const used = new Set<string>()
  let attempts = 0

  while (items.length < count && attempts < count * 8) {
    attempts += 1
    const i = items.length
    const mode = i % 4
    if (mode === 0) {
      const a = randomInt(ranges.min, ranges.max)
      const b = randomInt(ranges.min, ranges.max)
      const answer = String(a + b)
      const q: GeneratedQuestion = {
        text: `${a} + ${b} = ?`,
        answer,
        options: shuffle([answer, String(a + b + 2), String(Math.max(0, a + b - 3)), String(a + b + 5)]),
      }
      const key = questionKey(q)
      if (!used.has(key)) {
        used.add(key)
        items.push(q)
      }
      continue
    }

    if (mode === 1) {
      const a = randomInt(ranges.min + 8, ranges.max + 25)
      const b = randomInt(ranges.min, a - 1)
      const answer = String(a - b)
      const q: GeneratedQuestion = {
        text: `${a} − ${b} = ?`,
        answer,
        options: shuffle([answer, String(a - b + 2), String(Math.max(0, a - b - 4)), String(a - b + 7)]),
      }
      const key = questionKey(q)
      if (!used.has(key)) {
        used.add(key)
        items.push(q)
      }
      continue
    }

    if (mode === 2) {
      const a = randomInt(ranges.mulMin, ranges.mulMax)
      const b = randomInt(ranges.mulMin, ranges.mulMax)
      const answer = String(a * b)
      const q: GeneratedQuestion = {
        text: `${a} × ${b} = ?`,
        answer,
        options: shuffle([answer, String(a * b + 3), String(Math.max(0, a * b - 2)), String(a * b + 8)]),
      }
      const key = questionKey(q)
      if (!used.has(key)) {
        used.add(key)
        items.push(q)
      }
      continue
    }

    const divisor = randomInt(ranges.mulMin, ranges.mulMax)
    const quotient = randomInt(ranges.mulMin + 1, ranges.mulMax + 7)
    const dividend = divisor * quotient
    const answer = String(quotient)
    const q: GeneratedQuestion = {
      text: `${dividend} ÷ ${divisor} = ?`,
      answer,
      options: shuffle([answer, String(quotient + 2), String(Math.max(1, quotient - 1)), String(quotient + 5)]),
    }
    const key = questionKey(q)
    if (!used.has(key)) {
      used.add(key)
      items.push(q)
    }
  }
  return items
}

function repeatBank(bank: GeneratedQuestion[], count: number): GeneratedQuestion[] {
  return shuffle(bank)
    .slice(0, Math.min(count, bank.length))
    .map((item) => ({
      text: item.text,
      answer: item.answer,
      options: shuffle(item.options),
    }))
}

function buildSubjectFallback(input: GenerateInput): GeneratedQuestion[] {
  const key = input.subject.trim().toLowerCase()
  if (key.includes('matem')) {
    return buildMathFallback(input.count, input.difficulty)
  }

  if (key.includes('fizik')) {
    return repeatBank(
      [
        { text: 'SI tizimida kuch birligi qaysi?', options: ['Nyuton', 'Joul', 'Vatt', 'Pascal'], answer: 'Nyuton' },
        { text: 'Yorug‘lik vakuumda taxminan necha tezlikda tarqaladi?', options: ['300 000 km/s', '30 000 km/s', '3 000 km/s', '150 000 km/s'], answer: '300 000 km/s' },
        { text: 'Tok kuchi qanday asbob bilan o‘lchanadi?', options: ['Ampermetr', 'Voltmeter', 'Barometr', 'Termometr'], answer: 'Ampermetr' },
        { text: 'Jismning harakatga qarshilik xossasi nima deyiladi?', options: ['Inersiya', 'Impuls', 'Quvvat', 'Bosim'], answer: 'Inersiya' },
        { text: 'Elektr kuchlanishi birligi qaysi?', options: ['Volt', 'Amper', 'Om', 'Kulon'], answer: 'Volt' },
      ],
      input.count,
    )
  }

  if (key.includes('biolog')) {
    return repeatBank(
      [
        { text: 'Hujayraning boshqaruv markazi qaysi organoid?', options: ['Yadro', 'Ribosoma', 'Mitoxondriya', 'Vakuola'], answer: 'Yadro' },
        { text: 'Fotosintez asosan qaysi organoiddan foydalanadi?', options: ['Xloroplast', 'Yadro', 'Lizozoma', 'Sentriol'], answer: 'Xloroplast' },
        { text: 'Qon tarkibida kislorod tashuvchi modda qaysi?', options: ['Gemoglobin', 'Insulin', 'Adrenalin', 'Kraxmal'], answer: 'Gemoglobin' },
        { text: 'DNK nimani saqlaydi?', options: ['Irsiy axborotni', 'Faqat energiyani', 'Faqat suvni', 'Faqat vitaminlarni'], answer: 'Irsiy axborotni' },
        { text: 'Odam tanasidagi eng katta a’zo qaysi?', options: ['Teri', 'Yurak', 'Jigar', 'O‘pka'], answer: 'Teri' },
      ],
      input.count,
    )
  }

  if (key.includes('kimyo')) {
    return repeatBank(
      [
        { text: 'Suvning kimyoviy formulasi qaysi?', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 'H2O' },
        { text: 'pH qiymati 7 bo‘lgan muhit qanday?', options: ['Neytral', 'Kislotali', 'Ishqoriy', 'Gazsimon'], answer: 'Neytral' },
        { text: 'Davriy jadvalda O belgisi qaysi element?', options: ['Kislorod', 'Oltin', 'Kaliy', 'Temir'], answer: 'Kislorod' },
        { text: 'Tuz hosil bo‘lishi odatda nimadan bo‘ladi?', options: ['Kislota + ishqor', 'Suv + gaz', 'Metall + yorug‘lik', 'Yog‘ + shakar'], answer: 'Kislota + ishqor' },
        { text: 'CO2 nima?', options: ['Karbonat angidrid', 'Kislorod', 'Vodorod', 'Azot'], answer: 'Karbonat angidrid' },
      ],
      input.count,
    )
  }

  if (key.includes('informat')) {
    return repeatBank(
      [
        { text: 'Kompyuterning “miyasi” qaysi qism?', options: ['CPU', 'Monitor', 'Klaviatura', 'Sichqoncha'], answer: 'CPU' },
        { text: 'RAM nimaga xizmat qiladi?', options: ['Vaqtinchalik xotira', 'Doimiy elektr manbai', 'Internet tezligi', 'Ovoz chiqarish'], answer: 'Vaqtinchalik xotira' },
        { text: '1 bayt nechta bitdan iborat?', options: ['8', '4', '16', '32'], answer: '8' },
        { text: 'Brauzerga misol qaysi?', options: ['Chrome', 'Excel', 'Windows', 'Python'], answer: 'Chrome' },
        { text: 'Algoritm nima?', options: ['Muammoni yechish ketma-ketligi', 'Faqat dastur tili', 'Monitor turi', 'Qattiq disk'], answer: 'Muammoni yechish ketma-ketligi' },
      ],
      input.count,
    )
  }

  if (key.includes('tarix')) {
    return repeatBank(
      [
        { text: 'Amir Temur qaysi asrda yashagan?', options: ['XIV asr', 'X asr', 'XVIII asr', 'XX asr'], answer: 'XIV asr' },
        { text: 'Mustaqil O‘zbekiston Respublikasi qachon e’lon qilingan?', options: ['1991-yil', '1985-yil', '2000-yil', '1975-yil'], answer: '1991-yil' },
        { text: 'Buyuk Ipak yo‘li asosan nimaga xizmat qilgan?', options: ['Savdo va madaniy almashinuvga', 'Faqat harbiy yurishga', 'Faqat sportga', 'Faqat sayohatga'], answer: 'Savdo va madaniy almashinuvga' },
        { text: 'Qadimgi Misrda mashhur daryo qaysi?', options: ['Nil', 'Amazonka', 'Gang', 'Yanszi'], answer: 'Nil' },
        { text: 'Renessans davri ko‘proq qaysi hududda boshlangan?', options: ['Italiya', 'Meksika', 'Avstraliya', 'Yaponiya'], answer: 'Italiya' },
      ],
      input.count,
    )
  }

  if (key.includes('geograf')) {
    return repeatBank(
      [
        { text: 'Qaysi qit’a eng katta?', options: ['Osiyo', 'Afrika', 'Yevropa', 'Avstraliya'], answer: 'Osiyo' },
        { text: 'Dunyoning eng katta okeani qaysi?', options: ['Tinch okeani', 'Atlantika okeani', 'Hind okeani', 'Shimoliy muz okeani'], answer: 'Tinch okeani' },
        { text: 'Ekvator nima?', options: ['Yerning teng yarmiga ajratuvchi chiziq', 'Eng baland tog‘', 'Eng uzun daryo', 'Iqlim qurilmasi'], answer: 'Yerning teng yarmiga ajratuvchi chiziq' },
        { text: 'O‘zbekiston qaysi qit’ada joylashgan?', options: ['Osiyo', 'Yevropa', 'Afrika', 'Janubiy Amerika'], answer: 'Osiyo' },
        { text: 'Qaysi yo‘nalish sharqni bildiradi?', options: ['E', 'N', 'S', 'W'], answer: 'E' },
      ],
      input.count,
    )
  }

  if (key.includes('ingliz')) {
    return repeatBank(
      [
        { text: '"Book" so‘zining ma’nosi qaysi?', options: ['Kitob', 'Qalam', 'Stol', 'Deraza'], answer: 'Kitob' },
        { text: 'To‘g‘ri tarjimani tanlang: "Apple"', options: ['Olma', 'Nok', 'Anor', 'Uzum'], answer: 'Olma' },
        { text: 'Qaysi biri fe’l?', options: ['Run', 'Blue', 'Table', 'Happy'], answer: 'Run' },
        { text: '"Good morning" qachon ishlatiladi?', options: ['Ertalab', 'Kechqurun', 'Tun yarmida', 'Faqat darsdan keyin'], answer: 'Ertalab' },
        { text: '"He ___ a student." bo‘sh joyni to‘ldiring.', options: ['is', 'are', 'am', 'be'], answer: 'is' },
      ],
      input.count,
    )
  }

  if (key.includes('ona tili')) {
    return repeatBank(
      [
        { text: 'Qaysi biri fe’l?', options: ['Yozmoq', 'Ko‘k', 'Katta', 'Tez'], answer: 'Yozmoq' },
        { text: 'Antonimni toping: "issiq"', options: ['Sovuq', 'Iliq', 'Yorug‘', 'Quruq'], answer: 'Sovuq' },
        { text: 'So‘z turkumlaridan biri qaysi?', options: ['Ot', 'Ildiz', 'Bo‘g‘in', 'Gap'], answer: 'Ot' },
        { text: '"Kitob" so‘zi qaysi turkumga kiradi?', options: ['Ot', 'Fe’l', 'Sifat', 'Son'], answer: 'Ot' },
        { text: 'Maqolni davom ettiring: "Mehnat qilgan..."', options: ['Topadi', 'Uxlab qoladi', 'Yutqazadi', 'Adashadi'], answer: 'Topadi' },
      ],
      input.count,
    )
  }

  return repeatBank(
    [
      { text: `${input.subject}: Asosiy tushunchani aniqlang.`, options: ['To‘g‘ri javob', 'Noto‘g‘ri 1', 'Noto‘g‘ri 2', 'Noto‘g‘ri 3'], answer: 'To‘g‘ri javob' },
      { text: `${input.subject}: Qaysi variant fan bo‘yicha to‘g‘ri?`, options: ['A variant', 'B variant', 'C variant', 'D variant'], answer: 'A variant' },
      { text: `${input.subject}: Atamani tanlang.`, options: ['Asosiy atama', 'Begona atama', 'Noaniq atama', 'Noto‘g‘ri atama'], answer: 'Asosiy atama' },
    ],
    input.count,
  )
}

export async function generateQuestionsWithGemini(input: GenerateInput): Promise<GeneratedQuestion[]> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim()
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY topilmadi. .env faylini tekshiring.")
  }

  const modelAttempts: Array<{ version: 'v1beta' | 'v1'; model: string }> = [
    { version: 'v1beta', model: 'gemini-1.5-flash-latest' },
    { version: 'v1beta', model: 'gemini-1.5-flash' },
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1beta', model: 'gemini-2.0-flash-lite' },
    { version: 'v1', model: 'gemini-2.0-flash' },
    { version: 'v1', model: 'gemini-2.0-flash-lite' },
  ]
  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [{ text: buildPrompt(input) }],
      },
    ],
    generationConfig: {
      temperature: 0.35,
    },
  })

  const attemptErrors: string[] = []
  let bestUnique: GeneratedQuestion[] = []

  for (const attempt of modelAttempts) {
    const { version, model } = attempt
    const url =
      `https://generativelanguage.googleapis.com/${version}/models/${encodeURIComponent(model)}` +
      `:generateContent?key=${encodeURIComponent(apiKey)}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      })

      const payload = (await response.json().catch(() => null)) as GeminiResponse | null

      if (!response.ok) {
        const detail = payload?.error?.message || `HTTP ${response.status}`
        attemptErrors.push(`${version}/${model}: ${detail}`)
        continue
      }

      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) {
        attemptErrors.push(`${version}/${model}: empty content`)
        continue
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(unwrapJsonText(rawText))
      } catch {
        attemptErrors.push(`${version}/${model}: invalid JSON`)
        continue
      }

      const normalized = parseArrayPayload(parsed)
        .map((question) => normalizeQuestion(question))
        .filter((question): question is GeneratedQuestion => question !== null)
      const unique = dedupeQuestions(normalized)

      if (!unique.length) {
        attemptErrors.push(`${version}/${model}: no valid questions`)
        continue
      }

      if (unique.length > bestUnique.length) {
        bestUnique = unique
      }

      if (unique.length >= input.count) {
        return unique.slice(0, input.count)
      }

      attemptErrors.push(`${version}/${model}: unique ${unique.length}/${input.count}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown fetch error'
      attemptErrors.push(`${version}/${model}: ${message}`)
    }
  }

  const hasQuotaError = attemptErrors.some((entry) => {
    const text = entry.toLowerCase()
    return text.includes('quota') || text.includes('exceeded') || text.includes('429') || text.includes('rate limit')
  })

  if (hasQuotaError) {
    return dedupeQuestions(buildSubjectFallback(input)).slice(0, input.count)
  }

  if (bestUnique.length > 0) {
    return bestUnique.slice(0, input.count)
  }

  const reason = attemptErrors[attemptErrors.length - 1] || 'Noma’lum xatolik'
  throw new Error(`AI so'rovi ishlamadi. Oxirgi xatolik: ${reason}`)
}
