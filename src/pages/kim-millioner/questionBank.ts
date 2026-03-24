import type { Difficulty, GradeBand, Question, QuestionType, Subject } from './types'

const SUBJECTS: Subject[] = ['math', 'english', 'science', 'history', 'geography']
const GRADE_BANDS: GradeBand[] = ['5-7', '8-9', '10-11']

const difficultyForStep = (step: number): Difficulty => {
  if (step <= 5) return 'easy'
  if (step <= 10) return 'medium'
  return 'hard'
}

const shuffle = <T,>(items: T[]) => {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j] as T
    arr[j] = t as T
  }
  return arr
}

const makeMCQ = (
  id: string,
  subject: Subject,
  gradeBand: GradeBand,
  difficulty: Difficulty,
  text: string,
  options: [string, string, string, string],
  correctIndex: number,
  explanation: string,
): Question => ({
  id,
  subject,
  gradeBand,
  difficulty,
  type: 'mcq',
  text,
  options,
  correctIndex,
  explanation,
})

const makeTrueFalse = (
  id: string,
  subject: Subject,
  gradeBand: GradeBand,
  difficulty: Difficulty,
  text: string,
  answer: boolean,
  explanation: string,
): Question => ({
  id,
  subject,
  gradeBand,
  difficulty,
  type: 'true_false',
  text,
  options: ["To'g'ri", "Noto'g'ri", 'Ikkalasi ham', 'Bilmayman'],
  correctIndex: answer ? 0 : 1,
  explanation,
})

const makeNumeric = (
  id: string,
  subject: Subject,
  gradeBand: GradeBand,
  difficulty: Difficulty,
  text: string,
  answer: number,
  explanation: string,
): Question => ({
  id,
  subject,
  gradeBand,
  difficulty,
  type: 'numeric',
  text,
  options: ['0', '1', '2', '3'],
  correctIndex: 0,
  numericAnswer: answer,
  explanation,
})

function subjectTemplates(subject: Subject, difficulty: Difficulty) {
  if (subject === 'math') {
    if (difficulty === 'easy') {
      return [
        { mode: 'mcq' as QuestionType, q: '27 + 15 = ?', o: ['40', '41', '42', '43'] as [string, string, string, string], a: 2, e: '27+15 = 42.' },
        { mode: 'mcq', q: '9 × 7 = ?', o: ['56', '63', '72', '79'] as [string, string, string, string], a: 1, e: '9x7=63.' },
        { mode: 'mcq', q: '64 ning kvadrat ildizi?', o: ['6', '7', '8', '9'] as [string, string, string, string], a: 2, e: 'sqrt(64)=8.' },
        { mode: 'true_false', q: '15 juft son.', tf: false, e: '15 toq son.' },
        { mode: 'numeric', q: '120 ni 10 ga bo‘lsak nechchi?', n: 12, e: '120/10=12.' },
        { mode: 'mcq', q: '1/2 foizda qancha?', o: ['25%', '50%', '75%', '100%'] as [string, string, string, string], a: 1, e: '0.5 = 50%.' },
      ]
    }
    if (difficulty === 'medium') {
      return [
        { mode: 'mcq' as QuestionType, q: '3^4 = ?', o: ['27', '64', '81', '16'] as [string, string, string, string], a: 2, e: '3*3*3*3=81.' },
        { mode: 'numeric', q: 'x + 14 = 39. x = ?', n: 25, e: '39-14=25.' },
        { mode: 'mcq', q: 'sin 30° qiymati?', o: ['1', '1/2', 'sqrt(3)/2', '0'] as [string, string, string, string], a: 1, e: 'sin30 = 1/2.' },
        { mode: 'true_false', q: 'Pi taxminan 3.14.', tf: true, e: 'To‘g‘ri.' },
        { mode: 'mcq', q: '2x=18 bo‘lsa x=?', o: ['6', '7', '8', '9'] as [string, string, string, string], a: 3, e: 'x=9.' },
        { mode: 'mcq', q: '12% of 250 = ?', o: ['20', '25', '30', '35'] as [string, string, string, string], a: 2, e: '0.12*250=30.' },
      ]
    }
    return [
      { mode: 'mcq' as QuestionType, q: 'lim x→0 (sinx/x)=?', o: ['0', '1', '∞', 'mavjud emas'] as [string, string, string, string], a: 1, e: 'Mashhur limit 1.' },
      { mode: 'mcq', q: 'd/dx (x^3)=?', o: ['x^2', '2x', '3x^2', '3x'] as [string, string, string, string], a: 2, e: 'Hosila 3x^2.' },
      { mode: 'numeric', q: 'log2(32)=?', n: 5, e: '2^5=32.' },
      { mode: 'mcq', q: 'det |1 2; 3 4| = ?', o: ['-2', '2', '10', '0'] as [string, string, string, string], a: 0, e: '1*4-2*3=-2.' },
      { mode: 'true_false', q: 'Kompleks i^2 = -1.', tf: true, e: 'To‘g‘ri.' },
      { mode: 'mcq', q: 'Integral ∫0..1 x dx', o: ['1', '1/2', '2', '0'] as [string, string, string, string], a: 1, e: 'x^2/2 from 0 to1 =1/2.' },
    ]
  }

  if (subject === 'english') {
    if (difficulty === 'easy') {
      return [
        { mode: 'mcq' as QuestionType, q: '“Apple” so‘zining tarjimasi?', o: ['Olma', 'Nok', 'Uzum', 'Shaftoli'] as [string, string, string, string], a: 0, e: 'Apple = olma.' },
        { mode: 'mcq', q: 'She ___ a student.', o: ['am', 'is', 'are', 'be'] as [string, string, string, string], a: 1, e: 'She is.' },
        { mode: 'true_false', q: '“They are happy” present tense.', tf: true, e: 'To‘g‘ri.' },
        { mode: 'mcq', q: 'Go so‘zining past formasi?', o: ['goed', 'went', 'gone', 'goes'] as [string, string, string, string], a: 1, e: 'Past simple: went.' },
        { mode: 'mcq', q: '“Book” bu ...', o: ['Fe’l', 'Sifat', 'Ot', 'Ravish'] as [string, string, string, string], a: 2, e: 'Book ot.' },
        { mode: 'mcq', q: 'I ___ football every day.', o: ['play', 'plays', 'played', 'playing'] as [string, string, string, string], a: 0, e: 'I play.' },
      ]
    }
    if (difficulty === 'medium') {
      return [
        { mode: 'mcq' as QuestionType, q: 'If I ___ rich, I would travel.', o: ['am', 'was', 'were', 'be'] as [string, string, string, string], a: 2, e: 'Second conditional: were.' },
        { mode: 'mcq', q: 'They have ___ the work.', o: ['finish', 'finished', 'finishing', 'finishes'] as [string, string, string, string], a: 1, e: 'Present perfect: finished.' },
        { mode: 'true_false', q: '“Had done” Past Perfect.', tf: true, e: 'To‘g‘ri.' },
        { mode: 'mcq', q: 'Synonym of “quick”', o: ['slow', 'rapid', 'weak', 'late'] as [string, string, string, string], a: 1, e: 'Quick = rapid.' },
        { mode: 'mcq', q: 'Choose correct: Neither Ali nor his friends ___ here.', o: ['is', 'are', 'was', 'be'] as [string, string, string, string], a: 1, e: 'Nearest subject plural.' },
        { mode: 'mcq', q: '“Since 2020” usually works with ...', o: ['Past Simple', 'Present Perfect', 'Future', 'Past Perfect'] as [string, string, string, string], a: 1, e: 'Since + Present Perfect.' },
      ]
    }
    return [
      { mode: 'mcq' as QuestionType, q: 'By the time we arrived, they ___ dinner.', o: ['finished', 'have finished', 'had finished', 'finish'] as [string, string, string, string], a: 2, e: 'Earlier past: had finished.' },
      { mode: 'mcq', q: 'Third conditional marker:', o: ['If + past', 'If + had + V3', 'If + V1', 'If + will'] as [string, string, string, string], a: 1, e: 'Third cond pattern.' },
      { mode: 'true_false', q: '“Not only ... but also ...” da fe’l ko‘pincha yaqin subyektga moslashadi.', tf: true, e: 'Ko‘p hollarda shunday.' },
      { mode: 'mcq', q: 'Academic “hedging” means ...', o: ['absolute certainty', 'careful claim', 'joke style', 'short text'] as [string, string, string, string], a: 1, e: 'Hedging = ehtiyotkor ifoda.' },
      { mode: 'mcq', q: 'Choose formal connector', o: ['so', 'because of that', 'therefore', 'anyway'] as [string, string, string, string], a: 2, e: 'Therefore formalroq.' },
      { mode: 'mcq', q: 'Passive of “People speak English here.”', o: ['English spoke here.', 'English is spoken here.', 'English speaks here.', 'English has spoken here.'] as [string, string, string, string], a: 1, e: 'Is spoken.' },
    ]
  }

  if (subject === 'science') {
    if (difficulty === 'easy') {
      return [
        { mode: 'mcq' as QuestionType, q: 'Suv formulasi?', o: ['H2O', 'CO2', 'O2', 'NaCl'] as [string, string, string, string], a: 0, e: 'H2O.' },
        { mode: 'mcq', q: 'Inson nafas olayotganda asosan qaysi gaz kerak?', o: ['Azot', 'Kislorod', 'Vodorod', 'Geliy'] as [string, string, string, string], a: 1, e: 'Kislorod.' },
        { mode: 'true_false', q: 'Quyosh yulduz hisoblanadi.', tf: true, e: 'To‘g‘ri.' },
        { mode: 'mcq', q: 'Yer Quyosh atrofida taxminan nechchi kunda aylanadi?', o: ['30', '100', '365', '500'] as [string, string, string, string], a: 2, e: '365 kun.' },
        { mode: 'mcq', q: 'Fotosintezda o‘simlik qaysi gazni yutadi?', o: ['O2', 'CO2', 'N2', 'He'] as [string, string, string, string], a: 1, e: 'CO2 yutiladi.' },
        { mode: 'mcq', q: 'Qon aylanishida asosiy nasos a’zo?', o: ['Jigar', 'Yurak', 'Buyrak', 'O‘pka'] as [string, string, string, string], a: 1, e: 'Yurak.' },
      ]
    }
    if (difficulty === 'medium') {
      return [
        { mode: 'mcq' as QuestionType, q: 'Elektr toki birligi?', o: ['Volt', 'Amper', 'Om', 'Vatt'] as [string, string, string, string], a: 1, e: 'Amper.' },
        { mode: 'mcq', q: 'pH=7 ...', o: ['kislotali', 'ishqoriy', 'neytral', 'metall'] as [string, string, string, string], a: 2, e: 'Neytral.' },
        { mode: 'true_false', q: 'Mitozda 2 qiz hujayra hosil bo‘ladi.', tf: true, e: 'Ha, 2 ta.' },
        { mode: 'mcq', q: 'DNK spiral tuzilishini ochgan olimlar', o: ['Tesla-Edison', 'Watson-Crick', 'Newton-Galileo', 'Mendel-Darwin'] as [string, string, string, string], a: 1, e: 'Watson va Crick.' },
        { mode: 'mcq', q: 'Yorug‘lik tezligi yaqin qiymati', o: ['3*10^8 m/s', '3*10^6 m/s', '3*10^4 m/s', '300 m/s'] as [string, string, string, string], a: 0, e: '3x10^8.' },
        { mode: 'mcq', q: 'Orbital p uchun l = ?', o: ['0', '1', '2', '3'] as [string, string, string, string], a: 1, e: 'p orbital: l=1.' },
      ]
    }
    return [
      { mode: 'mcq' as QuestionType, q: 'Avogadro soni?', o: ['6.02×10^23', '9.8', '3.14', '1.6×10^-19'] as [string, string, string, string], a: 0, e: '6.02×10^23.' },
      { mode: 'mcq', q: 'Heisenberg noaniqlik printsipi juftligi', o: ['massa-harorat', 'pozitsiya-impuls', 'zaryad-kuchlanish', 'bosim-hajm'] as [string, string, string, string], a: 1, e: 'x va p.' },
      { mode: 'true_false', q: 'CRISPR-Cas9 gen tahriri uchun ishlatiladi.', tf: true, e: 'To‘g‘ri.' },
      { mode: 'mcq', q: 'Kvant nazariyasi asoschilaridan biri', o: ['Planck', 'Aristotel', 'Ptolemey', 'Fleming'] as [string, string, string, string], a: 0, e: 'Max Planck.' },
      { mode: 'mcq', q: 'PCR asosan nima qiladi?', o: ['DNK ko‘paytiradi', 'Protein eritadi', 'Yorug‘lik hosil qiladi', 'Qon tozalaydi'] as [string, string, string, string], a: 0, e: 'DNA amplification.' },
      { mode: 'mcq', q: 'Nisbiylik nazariyasi bilan bog‘liq olim', o: ['Einstein', 'Faraday', 'Lavoisier', 'Bohr'] as [string, string, string, string], a: 0, e: 'Einstein.' },
    ]
  }

  if (subject === 'history') {
    if (difficulty === 'easy') {
      return [
        { mode: 'mcq' as QuestionType, q: 'Amir Temur qaysi asrda yashagan?', o: ['XIV', 'X', 'XVIII', 'XX'] as [string, string, string, string], a: 0, e: 'XIV asr.' },
        { mode: 'mcq', q: 'Mustaqillik kuni (O‘zbekiston)?', o: ['1-sentabr', '8-dekabr', '9-may', '21-mart'] as [string, string, string, string], a: 0, e: '1-sentabr.' },
        { mode: 'true_false', q: 'Qadimgi sivilizatsiyalar ko‘pincha daryo bo‘yida rivojlangan.', tf: true, e: 'Ha.' },
        { mode: 'mcq', q: 'Buyuk Ipak yo‘li nima bilan mashhur?', o: ['kosmos', 'savdo', 'sport', 'meditsina'] as [string, string, string, string], a: 1, e: 'Savdo yo‘li.' },
        { mode: 'mcq', q: 'Konstitutsiya kuni', o: ['8-dekabr', '1-iyun', '14-yanvar', '31-avgust'] as [string, string, string, string], a: 0, e: '8-dekabr.' },
        { mode: 'mcq', q: 'Qadimgi Rim poytaxti?', o: ['Afina', 'Rim', 'Parij', 'Berlin'] as [string, string, string, string], a: 1, e: 'Rim.' },
      ]
    }
    if (difficulty === 'medium') {
      return [
        { mode: 'mcq' as QuestionType, q: 'Renessans markazlaridan biri', o: ['Florensiya', 'Toshkent', 'Delhi', 'Pekin'] as [string, string, string, string], a: 0, e: 'Florensiya.' },
        { mode: 'mcq', q: 'Birinchi jahon urushi boshlangan yil', o: ['1905', '1914', '1920', '1939'] as [string, string, string, string], a: 1, e: '1914.' },
        { mode: 'true_false', q: 'UN tashkiloti 1945-yilda tashkil etilgan.', tf: true, e: 'To‘g‘ri.' },
        { mode: 'mcq', q: 'Sovuq urush asosan qaysi ikki blok o‘rtasida?', o: ['AQSH va SSSR', 'Fransiya va Germaniya', 'Yaponiya va Xitoy', 'Hindiston va Pokiston'] as [string, string, string, string], a: 0, e: 'AQSH-SSSR.' },
        { mode: 'mcq', q: 'Qadimgi Misr yozuvi?', o: ['Runa', 'Ieroglif', 'Latin', 'Kiril'] as [string, string, string, string], a: 1, e: 'Ieroglif.' },
        { mode: 'mcq', q: 'Temuriylar davri ilm markazi sifatida mashhur shahar', o: ['Samarqand', 'Moskva', 'Madrid', 'Seul'] as [string, string, string, string], a: 0, e: 'Samarqand.' },
      ]
    }
    return [
      { mode: 'mcq' as QuestionType, q: 'Vestfaliya tinchligi (1648) nimani mustahkamladi?', o: ['feodalizm', 'milliy suverenitet', 'qullik', 'kolonializm tugashi'] as [string, string, string, string], a: 1, e: 'Davlat suvereniteti.' },
      { mode: 'mcq', q: 'Fransuz inqilobi boshlangan yil', o: ['1776', '1789', '1812', '1917'] as [string, string, string, string], a: 1, e: '1789.' },
      { mode: 'true_false', q: 'Marshall rejasi II jahon urushidan keyin Yevropa tiklanishiga qaratilgan.', tf: true, e: 'To‘g‘ri.' },
      { mode: 'mcq', q: 'Industrial Revolution birinchi bo‘lib qayerda boshlandi?', o: ['Fransiya', 'Britaniya', 'Rossiya', 'Italiya'] as [string, string, string, string], a: 1, e: 'Britaniya.' },
      { mode: 'mcq', q: 'Birinchi sun’iy yo‘ldosh', o: ['Apollo', 'Sputnik 1', 'Voyager', 'Hubble'] as [string, string, string, string], a: 1, e: 'Sputnik 1.' },
      { mode: 'mcq', q: 'Antik demokratiya bilan mashhur shahar-davlat', o: ['Sparta', 'Afina', 'Rim', 'Memfis'] as [string, string, string, string], a: 1, e: 'Afina.' },
    ]
  }

  if (difficulty === 'easy') {
    return [
      { mode: 'mcq' as QuestionType, q: 'Dunyoning eng katta okeani', o: ['Atlantika', 'Tinch', 'Hind', 'Shimoliy Muz'] as [string, string, string, string], a: 1, e: 'Tinch okeani.' },
      { mode: 'mcq', q: 'O‘zbekistonning poytaxti', o: ['Buxoro', 'Samarqand', 'Toshkent', 'Nukus'] as [string, string, string, string], a: 2, e: 'Toshkent.' },
      { mode: 'true_false', q: 'Afrika hududi jihatidan Yevropadan katta.', tf: true, e: 'Ancha katta.' },
      { mode: 'mcq', q: 'Eng uzun daryo (maktab darajasida ko‘p qabul qilingan)', o: ['Nil', 'Amazonka', 'Yanszi', 'Volga'] as [string, string, string, string], a: 0, e: 'Ko‘p darslikda Nil.' },
      { mode: 'mcq', q: 'Qaysi materik eng sovuq?', o: ['Afrika', 'Antarktida', 'Janubiy Amerika', 'Yevropa'] as [string, string, string, string], a: 1, e: 'Antarktida.' },
      { mode: 'mcq', q: 'Ekvator nimani bildiradi?', o: ['0° kenglik', '0° uzunlik', '180° meridian', 'qutb'] as [string, string, string, string], a: 0, e: '0° latitude.' },
    ]
  }
  if (difficulty === 'medium') {
    return [
      { mode: 'mcq' as QuestionType, q: 'GMT/UTC markaziy meridiani qayerdan o‘tadi?', o: ['Paris', 'Greenwich', 'Rome', 'Tokyo'] as [string, string, string, string], a: 1, e: 'Greenwich.' },
      { mode: 'mcq', q: 'Musson iqlimi ko‘proq qaysi hududga xos?', o: ['Janubiy Osiyo', 'Sahara', 'Antarktida', 'Skandinaviya'] as [string, string, string, string], a: 0, e: 'Janubiy Osiyo.' },
      { mode: 'true_false', q: 'Amazonka havzasi tropik o‘rmonlarga boy.', tf: true, e: 'To‘g‘ri.' },
      { mode: 'mcq', q: 'Eng baland tog‘ cho‘qqisi', o: ['K2', 'Everest', 'Elbrus', 'Kilimanjaro'] as [string, string, string, string], a: 1, e: 'Everest.' },
      { mode: 'mcq', q: 'Cho‘l iqlimining asosiy belgisi', o: ['Ko‘p yog‘in', 'Kam yog‘in', 'Qorli qish', 'Doimiy tuman'] as [string, string, string, string], a: 1, e: 'Kam yog‘in.' },
      { mode: 'mcq', q: 'Qaysi qit’ada davlatlar soni eng ko‘p?', o: ['Afrika', 'Avstraliya', 'Janubiy Amerika', 'Shimoliy Amerika'] as [string, string, string, string], a: 0, e: 'Afrika.' },
    ]
  }
  return [
    { mode: 'mcq' as QuestionType, q: 'El-Nino hodisasi asosan qaysi okeanga bog‘liq?', o: ['Tinch', 'Atlantika', 'Hind', 'Shimoliy Muz'] as [string, string, string, string], a: 0, e: 'Pacific.' },
    { mode: 'mcq', q: 'Demografik o‘tish modelida tug‘ilish ham o‘lim ham past bosqich', o: ['1-bosqich', '2-bosqich', '3-bosqich', '4-bosqich'] as [string, string, string, string], a: 3, e: '4-bosqich.' },
    { mode: 'true_false', q: 'Tektonik plitalar harakati zilzilalarga sabab bo‘lishi mumkin.', tf: true, e: 'Ha.' },
    { mode: 'mcq', q: 'Qaysi hududda subtropik O‘rta dengiz iqlimi ko‘p uchraydi?', o: ['Kaliforniya', 'Sibir', 'Grinlandiya', 'Markaziy Sahara'] as [string, string, string, string], a: 0, e: 'Kaliforniya tipik.' },
    { mode: 'mcq', q: 'Urbanizatsiya deganda ...', o: ['qishloqlashish', 'shaharlashuv', 'muzlash', 'o‘rmonlashuv'] as [string, string, string, string], a: 1, e: 'Shaharlashuv.' },
    { mode: 'mcq', q: 'Koriolis kuchi asosan nimaga ta’sir qiladi?', o: ['tog‘ balandligi', 'havo va okean oqimlari yo‘nalishi', 'quyosh harorati', 'yer massasi'] as [string, string, string, string], a: 1, e: 'Oqimlar yo‘nalishi.' },
  ]
}

function generateBank() {
  const questions: Question[] = []
  let id = 1

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

  for (const difficulty of difficulties) {
    for (const subject of SUBJECTS) {
      const templates = subjectTemplates(subject, difficulty)
      templates.forEach((tpl, index) => {
        const gradeBand = GRADE_BANDS[index % GRADE_BANDS.length] as GradeBand
        const qid = `mq-${id++}`
        if (tpl.mode === 'true_false') {
          questions.push(makeTrueFalse(qid, subject, gradeBand, difficulty, tpl.q, Boolean((tpl as any).tf), tpl.e))
          return
        }
        if (tpl.mode === 'numeric') {
          questions.push(makeNumeric(qid, subject, gradeBand, difficulty, tpl.q, Number((tpl as any).n), tpl.e))
          return
        }
        questions.push(makeMCQ(qid, subject, gradeBand, difficulty, tpl.q, tpl.o as [string, string, string, string], tpl.a as number, tpl.e))
      })
    }
  }

  return questions
}

export const QUESTION_BANK = generateBank()

export function getRequiredDifficulty(step: number): Difficulty {
  return difficultyForStep(step)
}

type PickInput = {
  usedQuestionIds: string[]
  gradeBand: GradeBand
  enabledSubjects: Subject[]
  requiredDifficulty: Difficulty
  enabledTypes: QuestionType[]
}

function scoreQuestion(q: Question, input: PickInput) {
  let score = 0
  if (q.gradeBand === input.gradeBand) score += 6
  if (q.difficulty === input.requiredDifficulty) score += 5
  if (input.enabledSubjects.includes(q.subject)) score += 4
  if (input.enabledTypes.includes(q.type)) score += 3
  return score
}

export function pickQuestion(input: PickInput): Question | null {
  const used = new Set(input.usedQuestionIds)
  const basePool = QUESTION_BANK.filter((q) => !used.has(q.id))
  const pool = basePool.length > 0 ? basePool : QUESTION_BANK

  const filtered = pool.filter(
    (q) => input.enabledSubjects.includes(q.subject) && input.enabledTypes.includes(q.type),
  )

  const candidatePool = filtered.length > 0 ? filtered : pool
  const ranked = candidatePool
    .map((q) => ({ q, score: scoreQuestion(q, input) }))
    .sort((a, b) => b.score - a.score)

  if (ranked.length === 0) return null
  const topScore = ranked[0]?.score ?? 0
  const top = ranked.filter((r) => r.score >= topScore - 1).map((r) => r.q)
  return shuffle(top)[0] ?? null
}
