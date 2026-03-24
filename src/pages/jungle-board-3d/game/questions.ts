import { sample } from '../utils/math'

export type QuizDifficulty = 'easy' | 'medium' | 'hard'
export type QuizSubject = 'math' | 'geography' | 'biology'

export type RaceQuestion = {
  id: string
  subject: QuizSubject
  difficulty: QuizDifficulty
  prompt: string
  options: string[]
  correctIndex: number
}

const QUESTION_BANK: RaceQuestion[] = [
  { id: 'm-e-1', subject: 'math', difficulty: 'easy', prompt: '36 + 27 = ?', options: ['63', '61', '68', '62'], correctIndex: 0 },
  { id: 'm-e-2', subject: 'math', difficulty: 'easy', prompt: '72 ÷ 8 = ?', options: ['8', '9', '10', '7'], correctIndex: 1 },
  { id: 'm-e-3', subject: 'math', difficulty: 'easy', prompt: '15 × 6 = ?', options: ['80', '96', '90', '84'], correctIndex: 2 },
  { id: 'm-e-4', subject: 'math', difficulty: 'easy', prompt: '91 - 38 = ?', options: ['53', '49', '57', '52'], correctIndex: 0 },
  { id: 'g-e-1', subject: 'geography', difficulty: 'easy', prompt: 'Oʻzbekiston poytaxti?', options: ['Samarqand', 'Buxoro', 'Toshkent', 'Andijon'], correctIndex: 2 },
  { id: 'g-e-2', subject: 'geography', difficulty: 'easy', prompt: 'Eng katta qitʼa?', options: ['Afrika', 'Osiyo', 'Yevropa', 'Avstraliya'], correctIndex: 1 },
  { id: 'g-e-3', subject: 'geography', difficulty: 'easy', prompt: 'Sahara nima?', options: ['Dengiz', 'Okean', 'Choʻl', 'Vodiy'], correctIndex: 2 },
  { id: 'g-e-4', subject: 'geography', difficulty: 'easy', prompt: 'Yerda nechta okean bor?', options: ['4', '5', '6', '3'], correctIndex: 1 },
  { id: 'b-e-1', subject: 'biology', difficulty: 'easy', prompt: 'Qon haydaydigan organ?', options: ['Yurak', 'Jigar', 'Buyrak', 'Oʻpka'], correctIndex: 0 },
  { id: 'b-e-2', subject: 'biology', difficulty: 'easy', prompt: 'Fotosintez qayerda sodir bo‘ladi?', options: ['Ildizda', 'Bargda', 'Gulda', 'Po‘stloqda'], correctIndex: 1 },
  { id: 'b-e-3', subject: 'biology', difficulty: 'easy', prompt: 'Nafas olishda kerak gaz?', options: ['Azot', 'Vodorod', 'Kislorod', 'Metan'], correctIndex: 2 },
  { id: 'b-e-4', subject: 'biology', difficulty: 'easy', prompt: 'Suyaklar tizimi?', options: ['Nerv', 'Skelet', 'Mushak', 'Qon'], correctIndex: 1 },

  { id: 'm-m-1', subject: 'math', difficulty: 'medium', prompt: '11² = ?', options: ['111', '121', '101', '131'], correctIndex: 1 },
  { id: 'm-m-2', subject: 'math', difficulty: 'medium', prompt: '25% of 200 = ?', options: ['25', '40', '50', '60'], correctIndex: 2 },
  { id: 'm-m-3', subject: 'math', difficulty: 'medium', prompt: '2.5 × 4 = ?', options: ['10', '8', '12', '9'], correctIndex: 0 },
  { id: 'm-m-4', subject: 'math', difficulty: 'medium', prompt: '180 ÷ 15 = ?', options: ['10', '12', '15', '18'], correctIndex: 1 },
  { id: 'g-m-1', subject: 'geography', difficulty: 'medium', prompt: 'Nil daryosi qaysi qitʼada?', options: ['Osiyo', 'Afrika', 'Yevropa', 'Janubiy Amerika'], correctIndex: 1 },
  { id: 'g-m-2', subject: 'geography', difficulty: 'medium', prompt: 'Amazonka qaysi qitʼada?', options: ['Afrika', 'Osiyo', 'Janubiy Amerika', 'Avstraliya'], correctIndex: 2 },
  { id: 'g-m-3', subject: 'geography', difficulty: 'medium', prompt: 'Eng katta okean?', options: ['Atlantika', 'Tinch', 'Hind', 'Shimoliy Muz'], correctIndex: 1 },
  { id: 'g-m-4', subject: 'geography', difficulty: 'medium', prompt: 'Qora dengiz qaysi yarimsharda?', options: ['Janubiy', 'Shimoliy', 'Sharqiy', 'G‘arbiy'], correctIndex: 1 },
  { id: 'b-m-1', subject: 'biology', difficulty: 'medium', prompt: 'Xlorofill qayerda bo‘ladi?', options: ['Mitoxondriya', 'Xloroplast', 'Yadro', 'Ribosoma'], correctIndex: 1 },
  { id: 'b-m-2', subject: 'biology', difficulty: 'medium', prompt: 'DNK ochilmasi?', options: ['Dezoksiribonuklein kislota', 'Dinuklein kislota', 'Ribonuklein kislota', 'Deoksi kislota'], correctIndex: 0 },
  { id: 'b-m-3', subject: 'biology', difficulty: 'medium', prompt: 'Qonning suyuq qismi?', options: ['Plazma', 'Gemoglobin', 'Trombosit', 'Leykosit'], correctIndex: 0 },
  { id: 'b-m-4', subject: 'biology', difficulty: 'medium', prompt: 'Ko‘z rangini belgilovchi qism?', options: ['Kornea', 'Retina', 'Iris', 'Pupil'], correctIndex: 2 },

  { id: 'm-h-1', subject: 'math', difficulty: 'hard', prompt: '3x + 5 = 20, x = ?', options: ['5', '4', '6', '3'], correctIndex: 0 },
  { id: 'm-h-2', subject: 'math', difficulty: 'hard', prompt: '√196 = ?', options: ['12', '13', '14', '16'], correctIndex: 2 },
  { id: 'm-h-3', subject: 'math', difficulty: 'hard', prompt: '2/3 + 1/6 = ?', options: ['5/6', '4/6', '2/6', '3/6'], correctIndex: 0 },
  { id: 'm-h-4', subject: 'math', difficulty: 'hard', prompt: '15% of 320 = ?', options: ['46', '48', '52', '56'], correctIndex: 1 },
  { id: 'g-h-1', subject: 'geography', difficulty: 'hard', prompt: 'Meridianlar qaysi yo‘nalishda cho‘ziladi?', options: ['Sharq-G‘arb', 'Shimol-Janub', 'Diagonal', 'Aylana'], correctIndex: 1 },
  { id: 'g-h-2', subject: 'geography', difficulty: 'hard', prompt: 'Atmosferaning eng past qatlami?', options: ['Stratosfera', 'Termosfera', 'Troposfera', 'Mezosfera'], correctIndex: 2 },
  { id: 'g-h-3', subject: 'geography', difficulty: 'hard', prompt: 'Vulkanlar ko‘p uchraydigan mintaqa?', options: ['Arktika halqasi', 'Tinch okeani halqasi', 'Sahara', 'Amazonka'], correctIndex: 1 },
  { id: 'g-h-4', subject: 'geography', difficulty: 'hard', prompt: 'Eng chuqur okean botiqligi?', options: ['Mariana', 'Sunda', 'Puerto-Riko', 'Java'], correctIndex: 0 },
  { id: 'b-h-1', subject: 'biology', difficulty: 'hard', prompt: 'ATP asosan qayerda sintezlanadi?', options: ['Ribosoma', 'Mitoxondriya', 'Yadro', 'Lizozoma'], correctIndex: 1 },
  { id: 'b-h-2', subject: 'biology', difficulty: 'hard', prompt: 'Genetik axborotni tashuvchi molekula?', options: ['Oqsil', 'DNK', 'Lipid', 'Glyukoza'], correctIndex: 1 },
  { id: 'b-h-3', subject: 'biology', difficulty: 'hard', prompt: 'Fotosintezda ajralib chiqadigan gaz?', options: ['Azot', 'Kislorod', 'Karbonat angidrid', 'Vodorod'], correctIndex: 1 },
  { id: 'b-h-4', subject: 'biology', difficulty: 'hard', prompt: 'Qon ivishida asosiy hujayralar?', options: ['Eritrosit', 'Leykosit', 'Trombosit', 'Neyron'], correctIndex: 2 },
  { id: 'm-e-5', subject: 'math', difficulty: 'easy', prompt: '48 + 29 = ?', options: ['76', '77', '78', '79'], correctIndex: 1 },
  { id: 'g-e-5', subject: 'geography', difficulty: 'easy', prompt: 'Dunyodagi eng katta okean?', options: ['Hind', 'Atlantika', 'Tinch', 'Shimoliy Muz'], correctIndex: 2 },
  { id: 'b-e-5', subject: 'biology', difficulty: 'easy', prompt: 'Inson tanasida nafas olish organi?', options: ['Yurak', 'O‘pka', 'Jigar', 'Oshqozon'], correctIndex: 1 },
  { id: 'm-m-5', subject: 'math', difficulty: 'medium', prompt: '14 × 7 = ?', options: ['96', '97', '98', '99'], correctIndex: 2 },
  { id: 'g-m-5', subject: 'geography', difficulty: 'medium', prompt: 'Ekvator qaysi chiziq?', options: ['Bosh meridian', 'Shimoliy qutb chizig‘i', 'Yerning o‘rta chizig‘i', 'Tropik chiziq'], correctIndex: 2 },
  { id: 'b-m-5', subject: 'biology', difficulty: 'medium', prompt: 'Oqsillar nimadan tuzilgan?', options: ['Yog‘ kislotalari', 'Aminokislotalar', 'Monosaxaridlar', 'Nukleotidlar'], correctIndex: 1 },
  { id: 'm-h-5', subject: 'math', difficulty: 'hard', prompt: '2x - 7 = 19, x = ?', options: ['11', '12', '13', '14'], correctIndex: 2 },
  { id: 'g-h-5', subject: 'geography', difficulty: 'hard', prompt: 'Bosh meridian qaysi shahar orqali o‘tadi?', options: ['Parij', 'Madrid', 'Grinvich', 'Rim'], correctIndex: 2 },
  { id: 'b-h-5', subject: 'biology', difficulty: 'hard', prompt: 'Hujayraning boshqaruv markazi?', options: ['Sitoplazma', 'Yadro', 'Membrana', 'Vakuola'], correctIndex: 1 },
  { id: 'm-m-6', subject: 'math', difficulty: 'medium', prompt: '360 ÷ 9 = ?', options: ['35', '40', '45', '50'], correctIndex: 1 },
]

const queueByDifficulty: Record<QuizDifficulty, string[]> = {
  easy: [],
  medium: [],
  hard: [],
}

const lastAskedByDifficulty: Partial<Record<QuizDifficulty, string>> = {}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

function nextQuestionByDifficulty(difficulty: QuizDifficulty): RaceQuestion {
  const pool = QUESTION_BANK.filter((q) => q.difficulty === difficulty)
  if (pool.length === 0) return sample(QUESTION_BANK)

  if (queueByDifficulty[difficulty].length === 0) {
    queueByDifficulty[difficulty] = shuffle(pool.map((q) => q.id))
  }

  if (
    queueByDifficulty[difficulty].length > 1 &&
    lastAskedByDifficulty[difficulty] &&
    queueByDifficulty[difficulty][0] === lastAskedByDifficulty[difficulty]
  ) {
    const first = queueByDifficulty[difficulty][0]
    queueByDifficulty[difficulty][0] = queueByDifficulty[difficulty][1]
    queueByDifficulty[difficulty][1] = first
  }

  const id = queueByDifficulty[difficulty].shift() ?? pool[0].id
  lastAskedByDifficulty[difficulty] = id
  return pool.find((q) => q.id === id) ?? pool[0]
}

export function pickDifficultyByStep(step: number): QuizDifficulty {
  if (step >= 70) return 'hard'
  if (step >= 35) return 'medium'
  return 'easy'
}

export function buildRaceQuestions(difficulty: QuizDifficulty) {
  const pool = QUESTION_BANK.filter((q) => q.difficulty === difficulty)
  if (pool.length < 2) {
    const first = sample(QUESTION_BANK)
    let second = sample(QUESTION_BANK)
    while (second.id === first.id) second = sample(QUESTION_BANK)
    return [first, second] as const
  }

  const first = nextQuestionByDifficulty(difficulty)
  let second = nextQuestionByDifficulty(difficulty)
  while (second.id === first.id) second = nextQuestionByDifficulty(difficulty)
  return [first, second] as const
}

export function buildSingleQuestion(difficulty: QuizDifficulty) {
  return nextQuestionByDifficulty(difficulty)
}
