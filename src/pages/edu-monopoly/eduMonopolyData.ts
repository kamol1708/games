export type EduSubject = 'Matematika' | 'Geografiya' | 'Tarix' | 'Ingliz tili' | 'Fizika' | 'Biologiya' | 'Kimyo'

export type EduTileType = 'start' | 'lesson' | 'chance' | 'chest' | 'tax' | 'rail' | 'utility' | 'jail' | 'free' | 'gotojail'

export type EduMonopolyTile = {
  id: number
  name: string
  type: EduTileType
  subject?: EduSubject
  reward?: number
  rent?: number
}

export type EduQuestion = {
  id: string
  subject: EduSubject
  question: string
  options: [string, string, string, string]
  answer: string
}

export type EduEventCard = {
  title: string
  text: string
  delta: number
  bonusRoll?: boolean
  grantCard?: 'shield' | 'steal' | 'upgrade'
  grantAmount?: number
}

export const WIN_SCORE = 1500
export const WIN_OWNED_TILES = 10

export const EDU_MONOPOLY_TILES: EduMonopolyTile[] = [
  { id: 0, name: 'Dars boshlandi', type: 'start' },
  { id: 1, name: 'Hisoblash hovlisi', type: 'lesson', subject: 'Matematika', reward: 120, rent: 80 },
  { id: 2, name: 'Class Bonus', type: 'chest' },
  { id: 3, name: 'Geometriya bog‘i', type: 'lesson', subject: 'Matematika', reward: 130, rent: 90 },
  { id: 4, name: 'Loyiha badali', type: 'tax' },
  { id: 5, name: 'Tarix ekspressi', type: 'rail', subject: 'Tarix', reward: 150, rent: 100 },
  { id: 6, name: 'Grammar gate', type: 'lesson', subject: 'Ingliz tili', reward: 120, rent: 80 },
  { id: 7, name: 'Surprise Task', type: 'chance' },
  { id: 8, name: 'Reading lane', type: 'lesson', subject: 'Ingliz tili', reward: 130, rent: 90 },
  { id: 9, name: 'Tarix maydoni', type: 'lesson', subject: 'Tarix', reward: 140, rent: 90 },
  { id: 10, name: 'Nazorat zonasi', type: 'jail' },
  { id: 11, name: 'Biologiya parki', type: 'lesson', subject: 'Biologiya', reward: 140, rent: 100 },
  { id: 12, name: 'Kimyo laboratoriyasi', type: 'utility', subject: 'Kimyo', reward: 150, rent: 100 },
  { id: 13, name: 'Reaksiya ko‘chasi', type: 'lesson', subject: 'Kimyo', reward: 150, rent: 100 },
  { id: 14, name: 'Fizika yo‘lagi', type: 'lesson', subject: 'Fizika', reward: 160, rent: 110 },
  { id: 15, name: 'Atlas ekspressi', type: 'rail', subject: 'Geografiya', reward: 160, rent: 110 },
  { id: 16, name: 'Tarix zalı', type: 'lesson', subject: 'Tarix', reward: 160, rent: 110 },
  { id: 17, name: 'Community Chest', type: 'chest' },
  { id: 18, name: 'Jamiyat darsi', type: 'lesson', subject: 'Tarix', reward: 170, rent: 120 },
  { id: 19, name: 'Algebra markazi', type: 'lesson', subject: 'Matematika', reward: 180, rent: 120 },
  { id: 20, name: 'Tanaffus maydoni', type: 'free' },
  { id: 21, name: 'Geografiya bog‘i', type: 'lesson', subject: 'Geografiya', reward: 180, rent: 120 },
  { id: 22, name: 'Surprise Task', type: 'chance' },
  { id: 23, name: 'Atlas avenue', type: 'lesson', subject: 'Geografiya', reward: 190, rent: 130 },
  { id: 24, name: 'Debate square', type: 'lesson', subject: 'Ingliz tili', reward: 190, rent: 130 },
  { id: 25, name: 'Biolab ekspressi', type: 'rail', subject: 'Biologiya', reward: 190, rent: 130 },
  { id: 26, name: 'Robototexnika yo‘li', type: 'lesson', subject: 'Fizika', reward: 200, rent: 140 },
  { id: 27, name: 'Formula avenue', type: 'lesson', subject: 'Matematika', reward: 200, rent: 140 },
  { id: 28, name: 'Maker lab', type: 'utility', subject: 'Fizika', reward: 200, rent: 140 },
  { id: 29, name: 'Okean orbitasi', type: 'lesson', subject: 'Geografiya', reward: 210, rent: 150 },
  { id: 30, name: 'Nazoratga qayt', type: 'gotojail' },
  { id: 31, name: 'Ekologiya maskani', type: 'lesson', subject: 'Biologiya', reward: 210, rent: 150 },
  { id: 32, name: 'Community Chest', type: 'chest' },
  { id: 33, name: 'Speaking street', type: 'lesson', subject: 'Ingliz tili', reward: 220, rent: 160 },
  { id: 34, name: 'Meros markazi', type: 'lesson', subject: 'Tarix', reward: 220, rent: 160 },
  { id: 35, name: 'Innovation ekspressi', type: 'rail', subject: 'Kimyo', reward: 230, rent: 170 },
  { id: 36, name: 'Surprise Task', type: 'chance' },
  { id: 37, name: 'Globus yo‘li', type: 'lesson', subject: 'Geografiya', reward: 230, rent: 170 },
  { id: 38, name: 'Imtihon badali', type: 'tax' },
  { id: 39, name: 'Mastery mile', type: 'lesson', subject: 'Fizika', reward: 240, rent: 180 },
]

export const EDU_MONOPOLY_QUESTIONS: Record<EduSubject, EduQuestion[]> = {
  Matematika: [
    { id: 'm1', subject: 'Matematika', question: 'Agar 3x + 5 = 20 bo‘lsa, x ni toping.', options: ['4', '5', '6', '7'], answer: '5' },
    { id: 'm2', subject: 'Matematika', question: 'Kvadratning tomoni 8 sm bo‘lsa, perimetri nechaga teng?', options: ['16', '24', '32', '64'], answer: '32' },
    { id: 'm3', subject: 'Matematika', question: '0.75 ning foiz ko‘rinishi qaysi?', options: ['7.5%', '75%', '57%', '750%'], answer: '75%' },
    { id: 'm4', subject: 'Matematika', question: '12 va 18 sonlarining EKUB ini toping.', options: ['3', '6', '9', '12'], answer: '6' },
    { id: 'm5', subject: 'Matematika', question: 'Agar y = 2x + 1 va x = 6 bo‘lsa, y nechaga teng?', options: ['11', '12', '13', '14'], answer: '13' },
    { id: 'm6', subject: 'Matematika', question: '3² + 4² ifodaning qiymati nechaga teng?', options: ['7', '12', '25', '49'], answer: '25' },
    { id: 'm7', subject: 'Matematika', question: '1/4 ning o‘nli kasr ko‘rinishi qaysi?', options: ['0.4', '0.25', '0.125', '0.75'], answer: '0.25' },
    { id: 'm8', subject: 'Matematika', question: 'Agar to‘g‘ri to‘rtburchakning tomonlari 9 va 6 bo‘lsa, yuzi nechaga teng?', options: ['15', '30', '54', '60'], answer: '54' },
  ],
  Geografiya: [
    { id: 'g1', subject: 'Geografiya', question: 'O‘zbekiston qaysi materikda joylashgan?', options: ['Yevropa', 'Osiyo', 'Afrika', 'Avstraliya'], answer: 'Osiyo' },
    { id: 'g2', subject: 'Geografiya', question: 'Dunyoning eng katta okeani qaysi?', options: ['Atlantika', 'Hind', 'Tinch', 'Shimoliy Muz'], answer: 'Tinch' },
    { id: 'g3', subject: 'Geografiya', question: 'Nil daryosi qaysi dengizga quyiladi?', options: ['Qizil dengiz', 'Kaspiy dengizi', 'O‘rta yer dengizi', 'Qora dengiz'], answer: 'O‘rta yer dengizi' },
    { id: 'g4', subject: 'Geografiya', question: 'Ekvator nima?', options: ['Daryo', 'Materik', 'Yerning o‘rta paralleli', 'Tog‘ tizmasi'], answer: 'Yerning o‘rta paralleli' },
    { id: 'g5', subject: 'Geografiya', question: 'Qaysi mamlakatning poytaxti Kanberra?', options: ['Kanada', 'Avstraliya', 'Avstriya', 'Yangi Zelandiya'], answer: 'Avstraliya' },
    { id: 'g6', subject: 'Geografiya', question: 'Sahara qaysi turdagi hudud?', options: ['O‘rmon', 'Cho‘l', 'Daryo', 'Yarimorol'], answer: 'Cho‘l' },
    { id: 'g7', subject: 'Geografiya', question: 'Qaysi qit’ada davlatlar soni eng ko‘p?', options: ['Afrika', 'Osiyo', 'Yevropa', 'Janubiy Amerika'], answer: 'Afrika' },
    { id: 'g8', subject: 'Geografiya', question: 'Kompas ignasi asosan qaysi yo‘nalishni ko‘rsatadi?', options: ['Sharq-g‘arb', 'Shimol-janub', 'Faqat sharq', 'Faqat janub'], answer: 'Shimol-janub' },
  ],
  Tarix: [
    { id: 't1', subject: 'Tarix', question: 'Amir Temur davlati poytaxti asosan qaysi shahar bo‘lgan?', options: ['Buxoro', 'Samarqand', 'Xiva', 'Shahrisabz'], answer: 'Samarqand' },
    { id: 't2', subject: 'Tarix', question: 'O‘zbekiston mustaqilligi qaysi yilda e’lon qilingan?', options: ['1989', '1990', '1991', '1992'], answer: '1991' },
    { id: 't3', subject: 'Tarix', question: 'Mirzo Ulug‘bek asosan qaysi sohada mashhur bo‘lgan?', options: ['Adabiyot', 'Astronomiya', 'Tabobat', 'Harbiy ish'], answer: 'Astronomiya' },
    { id: 't4', subject: 'Tarix', question: 'Jadidchilik harakati asosan nimaga qaratilgan edi?', options: ['Harbiy yurishlarga', 'Yangi ta’lim va islohotlarga', 'Faqat savdoga', 'Faqat siyosiy partiyaga'], answer: 'Yangi ta’lim va islohotlarga' },
    { id: 't5', subject: 'Tarix', question: 'Qadimgi Misr eng mashhur nimasi bilan tanilgan?', options: ['Piramidalar', 'Temir yo‘l', 'Kompas', 'Bosma kitob'], answer: 'Piramidalar' },
    { id: 't6', subject: 'Tarix', question: 'Buyuk Ipak yo‘li asosan nimaga xizmat qilgan?', options: ['Harbiy bazaga', 'Savdo va madaniy almashinuvga', 'Soliq yig‘ishga', 'Faqat dengiz yurishiga'], answer: 'Savdo va madaniy almashinuvga' },
    { id: 't7', subject: 'Tarix', question: 'Abu Rayhon Beruniy ko‘proq qaysi fanlarda mashhur?', options: ['Kimyo va biologiya', 'Geodeziya va astronomiya', 'Musiqa va teatr', 'Harbiy san’at'], answer: 'Geodeziya va astronomiya' },
    { id: 't8', subject: 'Tarix', question: 'Temuriylar davrida me’morchilik markazi bo‘lgan shahar qaysi?', options: ['Termiz', 'Nukus', 'Samarqand', 'Qo‘qon'], answer: 'Samarqand' },
  ],
  'Ingliz tili': [
    { id: 'e1', subject: 'Ingliz tili', question: 'Qaysi gap Present Perfect zamonida yozilgan?', options: ['I go to school.', 'I went to school.', 'I have done my homework.', 'I was doing homework.'], answer: 'I have done my homework.' },
    { id: 'e2', subject: 'Ingliz tili', question: 'Qaysi biri to‘g‘ri modal fe’l ishlatilgan gap?', options: ['She can to swim.', 'She can swim.', 'She cans swim.', 'She can swimming.'], answer: 'She can swim.' },
    { id: 'e3', subject: 'Ingliz tili', question: '“Book” so‘zining ko‘plik shakli qaysi?', options: ['Books', 'Bookes', 'Books', 'Bookies'], answer: 'Books' },
    { id: 'e4', subject: 'Ingliz tili', question: 'Qaysi biri second conditional?', options: ['If I see him, I call him.', 'If I saw him, I would call him.', 'If I will see him, I call him.', 'If I had seen him, I call him.'], answer: 'If I saw him, I would call him.' },
    { id: 'e5', subject: 'Ingliz tili', question: '“Beautiful” so‘zining to‘g‘ri darajasi qaysi?', options: ['Beautifuler', 'More beautiful', 'Beautifullest', 'Most beautifuler'], answer: 'More beautiful' },
    { id: 'e6', subject: 'Ingliz tili', question: 'Qaysi gapda article to‘g‘ri ishlatilgan?', options: ['He is a honest man.', 'He is an honest man.', 'He is honest man.', 'He is the honest man.'], answer: 'He is an honest man.' },
    { id: 'e7', subject: 'Ingliz tili', question: '“Went” qaysi fe’lning o‘tgan zamon shakli?', options: ['Go', 'Come', 'Do', 'Take'], answer: 'Go' },
    { id: 'e8', subject: 'Ingliz tili', question: 'Qaysi biri to‘g‘ri question form?', options: ['Where you are going?', 'Where are you going?', 'Where going are you?', 'You are going where?'], answer: 'Where are you going?' },
  ],
  Fizika: [
    { id: 'f1', subject: 'Fizika', question: 'Tezlikning vaqt bo‘yicha o‘zgarishi nima deyiladi?', options: ['Bosim', 'Tezlanish', 'Quvvat', 'Impuls'], answer: 'Tezlanish' },
    { id: 'f2', subject: 'Fizika', question: 'Elektr tok kuchining o‘lchov birligi qaysi?', options: ['Volt', 'Om', 'Amper', 'Vatt'], answer: 'Amper' },
    { id: 'f3', subject: 'Fizika', question: 'Quyosh sistemasidagi “Qizil sayyora” qaysi?', options: ['Mars', 'Venera', 'Merkuriy', 'Yupiter'], answer: 'Mars' },
    { id: 'f4', subject: 'Fizika', question: 'Yorug‘lik vakuumda taxminan qanday tezlikda tarqaladi?', options: ['300 km/s', '3 000 km/s', '300 000 km/s', '3 000 000 km/s'], answer: '300 000 km/s' },
    { id: 'f5', subject: 'Fizika', question: 'Jismning massasi qaysi asbob bilan o‘lchanadi?', options: ['Termometr', 'Tarozı', 'Voltmetr', 'Sekundomer'], answer: 'Tarozı' },
    { id: 'f6', subject: 'Fizika', question: 'Ish bajarish tezligini ifodalovchi kattalik qaysi?', options: ['Kuch', 'Tezlik', 'Quvvat', 'Og‘irlik'], answer: 'Quvvat' },
    { id: 'f7', subject: 'Fizika', question: 'Tovush vakuumda tarqaladimi?', options: ['Ha', 'Yo‘q', 'Faqat issiqda', 'Faqat sovuqda'], answer: 'Yo‘q' },
    { id: 'f8', subject: 'Fizika', question: 'Zichlik formulasi qaysi?', options: ['m/V', 'F/t', 'V/m', 's/t'], answer: 'm/V' },
  ],
  Biologiya: [
    { id: 'b1', subject: 'Biologiya', question: 'Fotosintezda o‘simliklar qaysi gazni yutadi?', options: ['Kislorod', 'Azot', 'Karbonat angidrid', 'Vodorod'], answer: 'Karbonat angidrid' },
    { id: 'b2', subject: 'Biologiya', question: 'Qon tarkibida kislorod tashuvchi modda qaysi?', options: ['Insulin', 'Gemoglobin', 'Adrenalin', 'Kalsiy'], answer: 'Gemoglobin' },
    { id: 'b3', subject: 'Biologiya', question: 'DNK ning asosiy vazifasi nima?', options: ['Ovqat hazm qilish', 'Irsiy axborotni saqlash', 'Energiya ishlab chiqarish', 'Qon haydash'], answer: 'Irsiy axborotni saqlash' },
    { id: 'b4', subject: 'Biologiya', question: 'Inson organizmida qaysi a’zo qonni haydaydi?', options: ['Jigar', 'Oshqozon', 'Yurak', 'Buyrak'], answer: 'Yurak' },
    { id: 'b5', subject: 'Biologiya', question: 'Hujayraning “energiya stansiyasi” nima deb ataladi?', options: ['Yadro', 'Mitoxondriya', 'Ribosoma', 'Membrana'], answer: 'Mitoxondriya' },
    { id: 'b6', subject: 'Biologiya', question: 'O‘simlik ildizining asosiy vazifasi nima?', options: ['Faqat gullash', 'Suv va mineral modda olish', 'Fotosintez qilish', 'Urug‘ tarqatish'], answer: 'Suv va mineral modda olish' },
    { id: 'b7', subject: 'Biologiya', question: 'Qaysi guruh umurtqali hayvonlarga kiradi?', options: ['Chuvalchang', 'Baliq', 'Askarida', 'Kapalak'], answer: 'Baliq' },
    { id: 'b8', subject: 'Biologiya', question: 'Nafas olish tizimining asosiy a’zosi qaysi?', options: ['Yurak', 'O‘pka', 'Miya', 'Jigar'], answer: 'O‘pka' },
  ],
  Kimyo: [
    { id: 'k1', subject: 'Kimyo', question: 'Davriy jadvalda O belgisi nimani bildiradi?', options: ['Oltingugurt', 'Osmiy', 'Kislorod', 'Oltin'], answer: 'Kislorod' },
    { id: 'k2', subject: 'Kimyo', question: 'Suvning formulasi qaysi?', options: ['CO2', 'H2O', 'O2', 'NaCl'], answer: 'H2O' },
    { id: 'k3', subject: 'Kimyo', question: 'Kislotalar tarkibida odatda qaysi ion bo‘ladi?', options: ['OH-', 'H+', 'Na+', 'Cl-'], answer: 'H+' },
    { id: 'k4', subject: 'Kimyo', question: 'Normal bosimda suv necha darajada qaynaydi?', options: ['90', '95', '100', '110'], answer: '100' },
    { id: 'k5', subject: 'Kimyo', question: 'NaCl moddasi qanday ataladi?', options: ['Shakar', 'Tuz', 'Suv', 'Kislota'], answer: 'Tuz' },
    { id: 'k6', subject: 'Kimyo', question: 'Havo tarkibida eng ko‘p uchraydigan gaz qaysi?', options: ['Kislorod', 'Azot', 'Karbonat angidrid', 'Argon'], answer: 'Azot' },
    { id: 'k7', subject: 'Kimyo', question: 'Metallarga xos xususiyat qaysi?', options: ['Sinuvchanlik', 'Elektr o‘tkazuvchanlik', 'Gazsimonlik', 'Shakarsimonlik'], answer: 'Elektr o‘tkazuvchanlik' },
    { id: 'k8', subject: 'Kimyo', question: 'pH qiymati 7 ga teng eritma qanday bo‘ladi?', options: ['Kislotali', 'Neytral', 'Ishqoriy', 'Zaharli'], answer: 'Neytral' },
  ],
}

export const CHANCE_CARDS: EduEventCard[] = [
  { title: 'Sürpriz topshiriq', text: 'Loyihangiz school fair da g‘olib bo‘ldi. +120 bilim coin.', delta: 120 },
  { title: 'Tezkor revision', text: 'Qayta ko‘rib chiqish foyda berdi. Yana bir marta zar tashlang.', delta: 40, bonusRoll: true, grantCard: 'upgrade', grantAmount: 1 },
  { title: 'Uy vazifasi qolib ketdi', text: 'Homework kech topshirildi. -80 bilim coin.', delta: -80 },
  { title: 'Teacher praise', text: 'Faolligingiz uchun ustoz bonus berdi. +90 bilim coin.', delta: 90, grantCard: 'shield', grantAmount: 1 },
  { title: 'Kechikish', text: 'Darsga kech qoldingiz. -60 bilim coin.', delta: -60, grantCard: 'steal', grantAmount: 1 },
]

export const CHEST_CARDS: EduEventCard[] = [
  { title: 'Class bonus', text: 'Jamoangiz boshqa o‘quvchiga yordam berdi. +100 bilim coin.', delta: 100 },
  { title: 'Kutubxona jarimasi', text: 'Kitob kech topshirildi. -50 bilim coin.', delta: -50 },
  { title: 'Olimpiada yo‘llanmasi', text: 'Fan olimpiadasiga chiqish huquqi oldingiz. +130 bilim coin.', delta: 130, grantCard: 'steal', grantAmount: 1 },
  { title: 'Daftar xaridi', text: 'Yangi daftar va markerlar uchun xarajat qilindi. -40 bilim coin.', delta: -40 },
  { title: 'Club mentor', text: 'To‘garak murabbiyi jamoangizni maqtadi. +70 bilim coin va bonus yurish.', delta: 70, bonusRoll: true, grantCard: 'shield', grantAmount: 1 },
]
