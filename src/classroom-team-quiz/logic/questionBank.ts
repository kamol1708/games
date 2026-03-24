import type { Difficulty, GradeBand, QuizQuestion, Subject } from './types'

const pointsByDifficulty: Record<Difficulty, 150 | 250 | 400> = {
  easy: 150,
  medium: 250,
  hard: 400,
}

function q(
  id: string,
  subject: Subject,
  difficulty: Difficulty,
  question: string,
  type: QuizQuestion['type'],
  answer: string,
  options?: string[],
): QuizQuestion {
  return {
    id,
    subject,
    difficulty,
    points: pointsByDifficulty[difficulty],
    question,
    type,
    answer,
    options,
  }
}

function makeMathQuestions(gradeBand: GradeBand): QuizQuestion[] {
  const data: QuizQuestion[] = []
  const difficultyMap: Difficulty[] = ['easy', 'medium', 'hard']
  difficultyMap.forEach((difficulty, dIdx) => {
    for (let i = 1; i <= 15; i += 1) {
      const base = i + (dIdx + 1) * 4
      if (difficulty === 'easy') {
        const a = base + 5
        const b = base - 2
        const ans = String(a + b)
        data.push(q(`m-${gradeBand}-${difficulty}-${i}`, 'math', difficulty, `${a} + ${b} = ?`, 'mcq', ans, [ans, String(Number(ans) + 2), String(Number(ans) - 1), String(Number(ans) + 5)]))
      } else if (difficulty === 'medium') {
        const a = base + 8
        const b = (base % 7) + 3
        const ans = String(a * b)
        data.push(q(`m-${gradeBand}-${difficulty}-${i}`, 'math', difficulty, `${a} x ${b} = ?`, 'numeric', ans))
      } else {
        const a = base + 12
        const b = (base % 5) + 4
        const c = (base % 3) + 2
        const ans = String(a * b - c)
        data.push(q(`m-${gradeBand}-${difficulty}-${i}`, 'math', difficulty, `${a} x ${b} - ${c} = ?`, 'numeric', ans))
      }
    }
  })
  return data
}

const englishSentenceSets: Record<Difficulty, Array<[string, string]>> = {
  easy: [
    ['She go to school every day.', 'She goes to school every day.'],
    ['They is playing football.', 'They are playing football.'],
    ['He have a blue bag.', 'He has a blue bag.'],
    ['I am go to market now.', 'I am going to market now.'],
    ['We was happy yesterday.', 'We were happy yesterday.'],
    ['My father dont like tea.', "My father doesn't like tea."],
    ['The boys is in the class.', 'The boys are in the class.'],
    ['She can sings very well.', 'She can sing very well.'],
    ['I has two notebooks.', 'I have two notebooks.'],
    ['They doesnt study here.', "They don't study here."],
    ['Ali and Tom is friends.', 'Ali and Tom are friends.'],
    ['The cat eat fish.', 'The cat eats fish.'],
    ['We am late today.', 'We are late today.'],
    ['He do his homework.', 'He does his homework.'],
    ['My sister have long hair.', 'My sister has long hair.'],
  ],
  medium: [
    ['If I will see him, I tell him.', 'If I see him, I will tell him.'],
    ['She has went to the library.', 'She has gone to the library.'],
    ['He dont know the answer.', "He doesn't know the answer."],
    ['By next week we finish the project.', 'By next week we will finish the project.'],
    ['They was waiting since morning.', 'They have been waiting since morning.'],
    ['I am agree with your idea.', 'I agree with your idea.'],
    ['This book is more better.', 'This book is better.'],
    ['She suggested me to study.', 'She suggested that I study.'],
    ['He can to solve this.', 'He can solve this.'],
    ['Neither the teacher nor students was ready.', 'Neither the teacher nor students were ready.'],
    ['We discussed about the issue.', 'We discussed the issue.'],
    ['I look forward to meet you.', 'I look forward to meeting you.'],
    ['The news are surprising.', 'The news is surprising.'],
    ['He is married with a doctor.', 'He is married to a doctor.'],
    ['She said me the truth.', 'She told me the truth.'],
  ],
  hard: [
    ['Hardly had I reached when it started rain.', 'Hardly had I reached when it started raining.'],
    ['No sooner he arrived than we started.', 'No sooner had he arrived than we started.'],
    ['If I knew, I would have informed you.', 'If I had known, I would have informed you.'],
    ['Scarcely he had spoken when they left.', 'Scarcely had he spoken when they left.'],
    ['Not only he missed the train but lost his bag.', 'Not only did he miss the train but he also lost his bag.'],
    ['The report needs to revise urgently.', 'The report needs to be revised urgently.'],
    ['Each of the players have a badge.', 'Each of the players has a badge.'],
    ['He denied to take the money.', 'He denied taking the money.'],
    ['Had I knew this, I would refuse.', 'Had I known this, I would have refused.'],
    ['The committee have submitted its result.', 'The committee has submitted its result.'],
    ['She is one of the students who has won.', 'She is one of the students who have won.'],
    ['I wish I can solve this instantly.', 'I wish I could solve this instantly.'],
    ['He is senior than me in age.', 'He is senior to me in age.'],
    ['The principal as well as teachers are present.', 'The principal as well as the teachers is present.'],
    ['I prefer coffee than tea.', 'I prefer coffee to tea.'],
  ],
}

function makeEnglishQuestions(gradeBand: GradeBand): QuizQuestion[] {
  const data: QuizQuestion[] = []
  ;(['easy', 'medium', 'hard'] as Difficulty[]).forEach((difficulty) => {
    englishSentenceSets[difficulty].forEach(([bad, good], idx) => {
      data.push(q(`e-${gradeBand}-${difficulty}-${idx + 1}`, 'english', difficulty, `Correct the sentence: ${bad}`, 'sentence', good))
    })
  })
  return data
}

const scienceFacts: Record<Difficulty, Array<[string, string, string, string, string]>> = {
  easy: [
    ['Yer Quyosh atrofida aylanadi.', 'Yer Quyosh atrofida aylanadi', 'Quyosh Yer atrofida aylanadi', 'Yer faqat Oy atrofida aylanadi', 'Yer umuman aylanmaydi'],
    ['O‘simliklar oziqasini fotosintez orqali hosil qiladi.', 'Fotosintez orqali oziqa hosil qiladi', 'Faqat tuproqdan tayyor ovqat oladi', 'Faqat tunda oziqa ishlab chiqaradi', 'Qishda umuman oziqa ishlab chiqarmaydi'],
    ['Suv 0°C da muzlaydi.', '0°C da muzlaydi', '100°C da muzlaydi', 'Faqat tog‘da muzlaydi', 'Faqat idishda muzlaydi'],
    ['Yurakning asosiy vazifasi nima?', 'Qonni haydash', 'Faqat kislorod ishlab chiqarish', 'Ovqat hazm qilish', 'Suyak yasash'],
    ['Inson yashashi uchun nima zarur?', 'Kislorod', 'Faqat shakar', 'Faqat tuz', 'Faqat suv bug‘i'],
    ['Oy qanday osmon jismi?', 'Tabiiy yo‘ldosh', 'Yulduz', 'Sayyora emas, kometa', 'Sun’iy yo‘ldosh'],
    ['Tovush tarqalishi uchun nima kerak?', 'Muhit (havo, suyuqlik yoki qattiq jism)', 'Faqat vakuum', 'Faqat yorug‘lik', 'Hech narsa kerak emas'],
    ['Qaysi biri og‘irroq?', '1 kilogramm', '1 gramm', 'Ikkalasi teng', 'Aniqlab bo‘lmaydi'],
    ['Quyosh qaysi tomondan chiqadi?', 'Sharqdan', 'G‘arbdan', 'Shimoldan', 'Janubdan'],
    ['Qaysi material elektr tokini yaxshi o‘tkazadi?', 'Mis', 'Plastmassa', 'Yog‘och', 'Rezina'],
    ['Suyaklarning asosiy vazifasi nima?', 'Tanani tayanch bilan ta’minlash', 'Faqat terini himoya qilish', 'Faqat mushaklarni almashtirish', 'Faqat qon hosil qilish'],
    ['Yomg‘ir qanday hosil bo‘ladi?', 'Bulutdagi suv bug‘i kondensatsiyalanib tomchiga aylanganda', 'Daraxt bargidan to‘kilganda', 'Toshlar bug‘langanda', 'Faqat shamol esganda'],
    ['Baliqlar qanday nafas oladi?', 'Jabralar orqali', 'Faqat o‘pka orqali', 'Terisi orqali', 'Nafas olmaydi'],
    ['Muzning holati qanday?', 'Qattiq holatdagi suv', 'Gaz holatdagi suv', 'Plazma holatdagi suv', 'Yangi modda'],
    ['O‘simlik o‘sishi uchun eng muhim omil qaysi?', 'Quyosh nuri', 'Faqat oy nuri', 'Faqat qorong‘ilik', 'Yorug‘lik umuman kerak emas'],
  ],
  medium: [
    ['Hujayrada "energiya stansiyasi" deb qaysi organoid ataladi?', 'Mitoxondriya', 'Ribosoma', 'Yadro', 'Golji apparati'],
    ['Kislotalarning pH qiymati odatda qanday bo‘ladi?', '7 dan kichik', '7 ga teng', '7 dan katta', 'Doim 14'],
    ['Nyutonning ikkinchi qonuniga ko‘ra kuch formulasi qaysi?', 'F = m × a', 'F = m / t', 'F = v × t', 'F = m + a'],
    ['Bosimning SI birligi qaysi?', 'Paskal (Pa)', 'Vatt (W)', 'Amper (A)', 'Joul (J)'],
    ['Irsiy axborotni tashuvchi modda qaysi?', 'DNK', 'Suv', 'Kraxmal', 'Vitamin C'],
    ['Bug‘lanish qachon tezroq bo‘ladi?', 'Harorat yuqori bo‘lganda', 'Harorat pasayganda', 'Harorat o‘zgarmaganda', 'Faqat 0°C dan pastda'],
    ['Qavariq linza yorug‘likka qanday ta’sir qiladi?', 'Nurlarni bir nuqtaga yig‘adi', 'Nurlarni faqat sochadi', 'Faqat vakuumda ishlaydi', 'Rangga bog‘liq holda yo‘qoladi'],
    ['Nafas olayotgan havoda kislorod miqdori qanday?', 'Nafas chiqarilgan havodan ko‘proq', 'Nafas chiqarilgan havodan kamroq', 'Ikkalasida bir xil', 'Kislorod bo‘lmaydi'],
    ['Tezlik (velocity) tushunchasi nimani bildiradi?', 'Yo‘nalishga ega tezlikni', 'Faqat tezlanishni', 'Faqat siljishni', 'Faqat vaqtni'],
    ['Zamonaviy fizika nuqtai nazaridan atom qanday?', 'Bo‘linadigan tuzilishga ega', 'Mutlaqo bo‘linmaydi', 'Faqat kimyoda bo‘linadi', 'Faqat maktabda bo‘linmaydi'],
    ['Fotosintez natijasida nima hosil bo‘ladi?', 'Glyukoza va kislorod', 'Faqat azot', 'Faqat suv', 'Faqat karbonat angidrid'],
    ['Elektr toki kuchi qaysi birlikda o‘lchanadi?', 'Amper', 'Volt', 'Vatt', 'Om'],
    ['Tovush qaysi muhitda tezroq tarqaladi?', 'Po‘latda', 'Havoda', 'Vakuumda', 'Barcha muhitda bir xil'],
    ['Kimyoviy o‘zgarish natijasida nima yuz beradi?', 'Yangi modda hosil bo‘ladi', 'Modda o‘zgarmaydi', 'Faqat rang o‘zgaradi, xolos', 'Faqat kechasi sodir bo‘ladi'],
    ['Qondagi shakar miqdorini boshqarishda qaysi a’zo muhim?', 'Oshqozon osti bezi', 'O‘pka', 'Buyrak', 'Qalqonsimon bez'],
  ],
  hard: [
    ['Entropiya nimani ifodalaydi?', 'Tizimdagi tartibsizlik darajasini', 'Faqat haroratni', 'Faqat hajmni', 'Faqat bosimni'],
    ['Boyl-Mariott qonuniga ko‘ra doimiy haroratda bosim va hajm orasidagi bog‘lanish qanday?', 'Teskari proporsional', 'To‘g‘ri proporsional', 'Bog‘lanish yo‘q', 'Faqat gazga taalluqli emas'],
    ['Mitoz bo‘linishda nechta va qanday qiz hujayra hosil bo‘ladi?', '2 ta bir xil qiz hujayra', '4 ta bir xil qiz hujayra', '1 ta qiz hujayra', '2 ta har xil qiz hujayra'],
    ['Katalizatorning asosiy ta’siri nima?', 'Aktivatsiya energiyasini kamaytiradi', 'Aktivatsiya energiyasini oshiradi', 'Reaksiyani to‘liq to‘xtatadi', 'Energiyani butunlay yo‘q qiladi'],
    ['Metall o‘tkazgichda elektr tokini asosan nima hosil qiladi?', 'Erkin elektronlar harakati', 'Neytronlar harakati', 'Faqat protonlar harakati', 'Faqat ionlarning tinch holati'],
    ['Nur sinishi (refraksiya) nima?', 'Yorug‘likning muhit chegarasida yo‘nalishi o‘zgarishi', 'Faqat qaytish hodisasi', 'Faqat difraksiya', 'Faqat yutilish'],
    ['Allellar deganda nima tushuniladi?', 'Bir genning turli shakllari', 'Faqat turli oqsillar', 'Faqat turli organlar', 'Faqat xromosoma juftlari'],
    ['Potensial energiya nimaga bog‘liq?', 'Jismning holati (pozitsiyasi)ga', 'Faqat rangiga', 'Faqat hidiga', 'Faqat massasiga emas'],
    ['Kislota va asos reaksiyasidan odatda nima hosil bo‘ladi?', 'Tuz va suv', 'Faqat kislorod', 'Faqat uglerod', 'Faqat vodorod'],
    ['Inersiya nima?', 'Harakat holatini o‘zgartirishga qarshilik', 'Doimiy tezlikning o‘zi', 'Faqat suyuqliklarga xos xossa', 'Faqat tezlanish qiymati'],
    ['Atom yadrosida asosan qaysi zarralar bo‘ladi?', 'Proton va neytron', 'Faqat elektron', 'Faqat foton', 'Elektron va foton'],
    ['Vektor kattalik qanday belgilanadi?', 'Modul va yo‘nalishga ega', 'Faqat modulga ega', 'Faqat yo‘nalishga ega', 'Hech biriga ega emas'],
    ['Hujayraning tezkor energiya birligi qaysi?', 'ATP', 'DNK', 'Lipidlar', 'Kraxmal'],
    ['Radioaktiv izotop uchun yarim yemirilish davri qanday bo‘ladi?', 'Unga xos doimiy kattalik', 'Har kuni o‘zgarib turadi', 'Faqat bosimga bog‘liq', 'Faqat haroratga bog‘liq'],
    ['To‘lqinning chastotasi va davri orasidagi bog‘lanish qanday?', 'Teskari bog‘langan', 'To‘g‘ri bog‘langan', 'Umuman bog‘lanmagan', 'Faqat amplitudaga bog‘liq'],
  ],
}

function makeScienceQuestions(gradeBand: GradeBand): QuizQuestion[] {
  const data: QuizQuestion[] = []
  ;(['easy', 'medium', 'hard'] as Difficulty[]).forEach((difficulty) => {
    scienceFacts[difficulty].forEach((item, idx) => {
      data.push(q(`s-${gradeBand}-${difficulty}-${idx + 1}`, 'science', difficulty, item[0], 'boolean', item[1], [item[1], item[2], item[3], item[4]]))
    })
  })
  return data
}

const historyFacts: Record<Difficulty, Array<[string, string, string, string, string]>> = {
  easy: [
    ['Amir Temur qaysi shaharda dafn etilgan?', 'Samarqandda', 'Buxoroda', 'Xivada', 'Toshkentda'],
    ['Misr ehromlari qaysi qadimiy sivilizatsiyaga tegishli?', 'Qadimgi Misrga', 'Qadimgi Yunonga', 'Qadimgi Rimga', 'Qadimgi Xitoyga'],
    ['Buyuk Xitoy devori qaysi davlatda joylashgan?', 'Xitoyda', 'Yaponiyada', 'Hindistonda', 'Koreyada'],
    ['Rim shahri qaysi davlat poytaxti?', 'Italiya', 'Ispaniya', 'Fransiya', 'Gretsiya'],
    ['Kolumb yangi qit’aga qaysi asrda borgan?', 'XV asr oxiri', 'X asr', 'XVIII asr', 'XX asr'],
    ['“Iliada” va “Odisseya” asarlari kimga tegishli?', 'Gomerga', 'Aristotelga', 'Platanga', 'Sokratga'],
    ['Samarqand va Buxoro tarixda nimasi bilan mashhur?', 'Ilm-fan va savdo markazlari bo‘lgani bilan', 'Faqat sport shaharlari bo‘lgani bilan', 'Faqat sanoat markazi bo‘lgani bilan', 'Tarixiy ahamiyati yo‘qligi bilan'],
    ['Qadimgi dunyoning mashhur mo‘jizalaridan biri qaysi?', 'Misr ehromlari', 'Eyfel minorasi', 'Burj Xalifa', 'Katta kanal'],
    ['O‘rta asrlarda asosiy aloqa yo‘llaridan biri qaysi bo‘lgan?', 'Buyuk Ipak yo‘li', 'Panama kanali', 'Atlantika tunneli', 'Kosmik yo‘l'],
    ['Tarixchilar o‘tmishni o‘rganishda nimadan foydalanadi?', 'Hujjat va manbalardan', 'Faqat taxmindan', 'Faqat filmlardan', 'Faqat internet izohlaridan'],
    ['Qaysi shahar Amir Temur davrida poytaxt bo‘lgan?', 'Samarqand', 'Andijon', 'Nukus', 'Namangan'],
    ['Qadimgi yunonlarda Olimpiya o‘yinlari qayerda boshlangan?', 'Yunonistonda', 'Rimda', 'Misrda', 'Xitoyda'],
    ['Qaysi daryo bo‘yida qadimgi Misr sivilizatsiyasi rivojlangan?', 'Nil daryosi bo‘yida', 'Volga daryosi bo‘yida', 'Amazonka bo‘yida', 'Sirdaryo bo‘yida'],
    ['“Registon” maydoni qaysi shaharda?', 'Samarqandda', 'Buxoroda', 'Xivada', 'Termizda'],
    ['Tarix fani asosan nimani o‘rganadi?', 'O‘tmishda yuz bergan voqealarni', 'Faqat kelajakni', 'Faqat tabiiy fanlarni', 'Faqat iqtisodiy hisob-kitobni'],
  ],
  medium: [
    ['Jaloliddin Manguberdi kim bo‘lgan?', 'Xorazmshohlar davlati sarkardasi', 'Misr fir’avni', 'Rim imperatori', 'Yunon faylasufi'],
    ['Ikkinchi jahon urushi qaysi yillarda bo‘lib o‘tgan?', '1939–1945', '1914–1918', '1950–1956', '1890–1896'],
    ['Birinchi jahon urushi qaysi yillarda bo‘lib o‘tgan?', '1914–1918', '1939–1945', '1900–1905', '1946–1950'],
    ['Mustaqillik kuni O‘zbekistonda qachon nishonlanadi?', '1-sentabr', '8-mart', '9-may', '14-yanvar'],
    ['Amir Temur saltanatini boshqarishda qaysi asar muhim hisoblanadi?', 'Temur tuzuklari', 'Qutadg‘u bilig', 'Devonu lug‘otit turk', 'Boburnoma'],
    ['Buyuk geografik kashfiyotlar davrida dengiz yo‘llari nega muhim bo‘lgan?', 'Yangi savdo yo‘llari ochilgan', 'Savdo to‘xtatilgan', 'Faqat harbiy maqsad bo‘lgan', 'Qit’alar yopilgan'],
    ['Qaysi alloma “Al-jabr va al-muqobala” asarini yozgan?', 'Muhammad al-Xorazmiy', 'Ahmad al-Farg‘oniy', 'Abu Rayhon Beruniy', 'Ibn Sino'],
    ['Abu Ali ibn Sino qaysi sohada mashhur bo‘lgan?', 'Tibbiyot va ilm-fan', 'Faqat harbiy ish', 'Faqat me’morchilik', 'Faqat musiqachilik'],
    ['Qadimgi Rimda boshqaruv shakllaridan biri qaysi bo‘lgan?', 'Respublika', 'Faqat monarxiya', 'Faqat teokratiya', 'Faqat konfederatsiya'],
    ['Qaysi shahar qadimda “Sharq gavhari” deb atalgan?', 'Samarqand', 'Moskva', 'Tokyo', 'Nyu-York'],
    ['“Boburnoma” asari muallifi kim?', 'Zahiriddin Muhammad Bobur', 'Alisher Navoiy', 'Amir Temur', 'Mashrab'],
    ['Qaysi davlatda fir’avnlar hukmronlik qilgan?', 'Qadimgi Misrda', 'Qadimgi Rimda', 'Qadimgi Xitoyda', 'Qadimgi Hindistonda'],
    ['Fransuz inqilobi qaysi yilda boshlangan?', '1789-yilda', '1689-yilda', '1889-yilda', '1989-yilda'],
    ['Sovuq urush asosan qanday qarama-qarshilik edi?', 'Siyosiy va mafkuraviy raqobat', 'Faqat sport musobaqasi', 'Faqat savdo urushi', 'Faqat diniy bahs'],
    ['Qadimiy yozma manbalar nima uchun muhim?', 'Tarixiy voqealarni aniqroq bilish uchun', 'Faqat bezak uchun', 'Faqat ko‘rgazma uchun', 'Amaliy ahamiyati yo‘q'],
  ],
  hard: [
    ['BMT (Birlashgan Millatlar Tashkiloti) qachon tuzilgan?', '1945-yilda', '1919-yilda', '1930-yilda', '1960-yilda'],
    ['YUNESKOning asosiy vazifasi nimaga qaratilgan?', 'Ta’lim, fan va madaniyatni qo‘llab-quvvatlashga', 'Faqat harbiy xavfsizlikka', 'Faqat bank tizimiga', 'Faqat sport musobaqalariga'],
    ['Qaysi alloma “Qonun fit-tibb” asarini yozgan?', 'Ibn Sino', 'Beruniy', 'Ulug‘bek', 'Farg‘oniy'],
    ['Mirzo Ulug‘bek asosan qaysi ilm sohasida mashhur?', 'Astronomiya', 'Adabiyot', 'Kimyo', 'Huquq'],
    ['Qaysi voqea O‘rta asrlar tugab, Yangi davr boshlanishi bilan bog‘liq deb qaraladi?', 'Buyuk geografik kashfiyotlar', 'Temir davrining boshlanishi', 'Qadimgi Misrning paydo bo‘lishi', 'Yozuvning ixtiro qilinishi'],
    ['“Jadidchilik” harakati nimani maqsad qilgan?', 'Ta’lim va jamiyatni isloh qilishni', 'Faqat harbiy kuchayishni', 'Faqat soliq oshirishni', 'Faqat savdoni cheklashni'],
    ['Qaysi shahar Temuriylar davrida yirik ilm markaziga aylangan?', 'Samarqand', 'Parij', 'Qohira', 'Dehli'],
    ['Qadimgi Yunonistonda demokratiya dastlab qaysi shaharda rivojlangan?', 'Afinada', 'Spartada', 'Rimda', 'Makedoniyada'],
    ['Mustamlakachilikdan ozod bo‘lish jarayoni qanday ataladi?', 'Dekolonizatsiya', 'Globalizatsiya', 'Industrializatsiya', 'Monopolizatsiya'],
    ['Qaysi urushdan keyin dunyo siyosatida “Sovuq urush” davri boshlangan?', 'Ikkinchi jahon urushidan keyin', 'Birinchi jahon urushidan keyin', 'Koreya urushidan oldin', 'Napoleon urushidan keyin'],
    ['Tarixda “manba” deganda nimani tushunamiz?', 'O‘tmish haqida ma’lumot beruvchi hujjat yoki dalilni', 'Faqat darslik rasmini', 'Faqat og‘zaki gapni', 'Faqat taxminni'],
    ['Qaysi davlatda “Renessans” harakati dastlab kuchli boshlangan?', 'Italiyada', 'Rossiyada', 'AQShda', 'Turkiyada'],
    ['Qadimgi Rimdagi “Senat” nima bo‘lgan?', 'Maslahat va boshqaruv organi', 'Faqat harbiy qo‘shin', 'Faqat diniy ibodatxona', 'Faqat savdo bozori'],
    ['Qaysi tarixiy asar Zahiriddin Boburning hayoti va voqealarini yoritadi?', 'Boburnoma', 'Temur tuzuklari', 'Hamsa', 'Shohnoma'],
    ['Tarixiy voqealarni vaqt bo‘yicha tartiblash qanday ataladi?', 'Xronologiya', 'Arxeologiya', 'Etnografiya', 'Kartografiya'],
  ],
}

function makeHistoryQuestions(gradeBand: GradeBand): QuizQuestion[] {
  const data: QuizQuestion[] = []
  ;(['easy', 'medium', 'hard'] as Difficulty[]).forEach((difficulty) => {
    historyFacts[difficulty].forEach((item, idx) => {
      data.push(q(`h-${gradeBand}-${difficulty}-${idx + 1}`, 'history', difficulty, item[0], 'boolean', item[1], [item[1], item[2], item[3], item[4]]))
    })
  })
  return data
}

export const QUESTION_BANK: Record<GradeBand, QuizQuestion[]> = {
  '5-7': [
    ...makeMathQuestions('5-7'),
    ...makeEnglishQuestions('5-7'),
    ...makeScienceQuestions('5-7'),
    ...makeHistoryQuestions('5-7'),
  ],
  '8-9': [
    ...makeMathQuestions('8-9'),
    ...makeEnglishQuestions('8-9'),
    ...makeScienceQuestions('8-9'),
    ...makeHistoryQuestions('8-9'),
  ],
  '10-11': [
    ...makeMathQuestions('10-11'),
    ...makeEnglishQuestions('10-11'),
    ...makeScienceQuestions('10-11'),
    ...makeHistoryQuestions('10-11'),
  ],
}

export function questionsFor(gradeBand: GradeBand, subject: Subject, difficulty: Difficulty) {
  return QUESTION_BANK[gradeBand].filter((q) => q.subject === subject && q.difficulty === difficulty)
}
