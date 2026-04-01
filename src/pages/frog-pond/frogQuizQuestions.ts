export type FrogQuizQuestion = {
  subject: string
  question: string
  options: [string, string, string, string]
  answer: string
}

type QuestionTuple = [string, [string, string, string, string], string]

function shuffleQuestions<T>(items: T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const temp = next[index]
    next[index] = next[randomIndex]
    next[randomIndex] = temp
  }
  return next
}

function makeBank(subject: string, tuples: QuestionTuple[]): FrogQuizQuestion[] {
  return tuples.map(([question, options, answer]) => ({ subject, question, options, answer }))
}

function buildStageFromBanks(...banks: FrogQuizQuestion[][]) {
  const mixed = shuffleQuestions(banks.flat())
  return Array.from({ length: 7 }, (_, levelIndex) => mixed.filter((_, questionIndex) => questionIndex % 7 === levelIndex))
}

const stageOneMath = makeBank('Matematika', [
  ['8 + 7 nechaga teng?', ['13', '14', '15', '16'], '15'],
  ['45 - 18 nechaga teng?', ['25', '26', '27', '28'], '27'],
  ['6 × 7 nechaga teng?', ['36', '40', '42', '48'], '42'],
  ['56 ni 8 ga bo‘lsak nechaga teng?', ['6', '7', '8', '9'], '7'],
  ['Agar x + 9 = 17 bo‘lsa, x ni toping.', ['6', '7', '8', '9'], '8'],
  ['Agar 3x = 21 bo‘lsa, x nechaga teng?', ['5', '6', '7', '8'], '7'],
  ['1/2 ning 20 dagi qiymati nechaga teng?', ['8', '10', '12', '14'], '10'],
  ['1/4 ning 36 dagi qiymati nechaga teng?', ['7', '8', '9', '10'], '9'],
  ['0.5 sonining foiz ko‘rinishi qaysi?', ['5%', '15%', '50%', '500%'], '50%'],
  ['0.25 sonining kasr ko‘rinishi qaysi?', ['1/2', '1/3', '1/4', '1/5'], '1/4'],
  ['Tomoni 9 sm bo‘lgan kvadratning perimetri nechaga teng?', ['27', '32', '36', '40'], '36'],
  ['Uzunligi 8 sm, eni 5 sm bo‘lgan to‘g‘ri to‘rtburchakning yuzi nechaga teng?', ['13', '26', '40', '45'], '40'],
  ['Aylana radiusi 6 bo‘lsa, diametri nechaga teng?', ['6', '10', '12', '18'], '12'],
  ['36 ning kvadrat ildizi nechaga teng?', ['5', '6', '7', '8'], '6'],
  ['2² + 3² ifodaning qiymatini toping.', ['11', '12', '13', '14'], '13'],
  ['72 sonining 10% i nechaga teng?', ['7.2', '8.2', '9.2', '10.2'], '7.2'],
  ['Bir son 24 ga teng. Uning 3/4 qismi nechaga teng?', ['16', '18', '20', '22'], '18'],
  ['5, 10, 15, 20 ketma-ketligidagi keyingi son qaysi?', ['22', '23', '24', '25'], '25'],
  ['Agar b = 4 bo‘lsa, 3b + 2 ifodaning qiymatini toping.', ['12', '13', '14', '15'], '14'],
  ['Tomonlari 3, 4 va 5 bo‘lgan uchburchak qanday uchburchak?', ['Teng tomonli', 'To‘g‘ri burchakli', 'O‘tmas burchakli', 'Teng yonli'], 'To‘g‘ri burchakli'],
  ['15% ning 200 dagi qiymati nechaga teng?', ['20', '25', '30', '35'], '30'],
  ['Agar x/4 = 5 bo‘lsa, x nechaga teng?', ['18', '20', '22', '24'], '20'],
  ['84 va 126 sonlarining EKUB ini toping.', ['14', '21', '28', '42'], '42'],
  ['6 va 15 sonlarining EKUK ini toping.', ['20', '25', '30', '45'], '30'],
  ['2.4 + 1.8 yig‘indisi nechaga teng?', ['4.0', '4.1', '4.2', '4.3'], '4.2'],
  ['Perimetri 28 sm bo‘lgan kvadratning tomoni nechaga teng?', ['6', '7', '8', '9'], '7'],
  ['120 gradusli markaziy burchak aylananing necha ulushiga teng?', ['1/4', '1/3', '1/2', '2/3'], '1/3'],
  ['Agar 2y - 5 = 13 bo‘lsa, y ni toping.', ['7', '8', '9', '10'], '9'],
  ['40 ning 0.3 qismi nechaga teng?', ['10', '12', '14', '16'], '12'],
  ['Agar sonning 1/6 qismi 8 bo‘lsa, sonning o‘zi nechaga teng?', ['42', '46', '48', '52'], '48'],
])

const stageOneGeography = makeBank('Python', [
  ['Python tilida ro‘yxat qaysi qavs bilan yoziladi?', ['()', '[]', '{}', '<>'], '[]'],
  ['`len("salom")` natijasi nima bo‘ladi?', ['4', '5', '6', 'Xato'], '5'],
  ['Qaysi funksiya matnni kichik harflarga o‘tkazadi?', ['lower()', 'small()', 'down()', 'min()'], 'lower()'],
  ['`print(3 * "ab")` nimani chiqaradi?', ['ababab', 'ab3', 'Xato', 'ab ab ab'], 'ababab'],
  ['Python’da izoh yozish uchun qaysi belgi ishlatiladi?', ['//', '#', '--', '/*'], '#'],
  ['`type(12.5)` nimani qaytaradi?', ['int', 'float', 'str', 'bool'], 'float'],
  ['Qaysi kalit so‘z shart operatorida ishlatiladi?', ['repeat', 'if', 'case', 'loop'], 'if'],
  ['`bool(0)` natijasi nima?', ['True', 'False', '0', 'None'], 'False'],
  ['`range(3)` odatda qaysi sonlarni beradi?', ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3, 2, 1'], '0, 1, 2'],
  ['Satrning birinchi belgisini olish uchun `s = "python"` bo‘lsa qaysi yozuv to‘g‘ri?', ['s[1]', 's[0]', 's.first()', 's{0}'], 's[0]'],
  ['`list.append(x)` nima qiladi?', ['Ro‘yxatni tozalaydi', 'Element qo‘shadi', 'Element o‘chiradi', 'Ro‘yxatni saralaydi'], 'Element qo‘shadi'],
  ['Python’da lug‘at turi qaysi?', ['list', 'tuple', 'dict', 'set'], 'dict'],
  ['`input()` funksiyasi odatda nima qaytaradi?', ['int', 'float', 'str', 'bool'], 'str'],
  ['Qaysi operator teng emaslikni bildiradi?', ['<>', '!=', '!==', '~='], '!='],
  ['`5 // 2` natijasi nima?', ['2', '2.5', '3', '1'], '2'],
  ['`5 % 2` natijasi nima?', ['2', '2.5', '1', '0'], '1'],
  ['`"7" + "3"` natijasi qanday bo‘ladi?', ['10', '73', 'Xato', '7 3'], '73'],
  ['Qaysi kalit so‘z funksiya yaratadi?', ['func', 'define', 'def', 'lambda'], 'def'],
  ['`for` sikli nimada qulay?', ['Faqat son saqlashda', 'Takrorlanuvchi yurishlarda', 'Faqat xatoni tutishda', 'Faqat fayl ochishda'], 'Takrorlanuvchi yurishlarda'],
  ['`my_list = [1, 2, 3]`; `my_list[-1]` nima beradi?', ['1', '2', '3', 'Xato'], '3'],
  ['`int("12")` natijasi nima?', ['"12"', '12', '12.0', 'Xato'], '12'],
  ['`"python".upper()` natijasi nima?', ['python', 'PYTHON', 'Python', 'Xato'], 'PYTHON'],
  ['Tuple qaysi qavs bilan yoziladi?', ['[]', '{}', '()', '<>'], '()'],
  ['`while` sikli qachon ishlaydi?', ['Shart true bo‘lsa', 'Faqat bir marta', 'Faqat list bilan', 'Hech qachon'], 'Shart true bo‘lsa'],
  ['`a = 10`; `a += 3` dan keyin `a` nechaga teng?', ['10', '13', '7', '103'], '13'],
  ['Qaysi qiymat mantiqiy turga kiradi?', ['"True"', '1', 'True', 'yes'], 'True'],
  ['`set` ning asosiy xususiyati nima?', ['Tartib saqlaydi', 'Faqat son saqlaydi', 'Takroriy elementlarni ushlamaydi', 'Faqat matn saqlaydi'], 'Takroriy elementlarni ushlamaydi'],
  ['`print("Hello", "World")` nimani chiqaradi?', ['HelloWorld', 'Hello World', '["Hello", "World"]', 'Xato'], 'Hello World'],
  ['`"python"[1:4]` natijasi nima?', ['pyt', 'yth', 'ytho', 'tho'], 'yth'],
  ['Python’da xatoni tutish uchun qaysi blok ishlatiladi?', ['check/except', 'try/except', 'if/error', 'safe/catch'], 'try/except'],
])

const stageOneAstronomy = makeBank('Geografiya', [
  ['O‘zbekiston poytaxti qaysi shahar?', ['Samarqand', 'Buxoro', 'Toshkent', 'Nukus'], 'Toshkent'],
  ['Dunyodagi eng katta okean qaysi?', ['Atlantika', 'Hind', 'Tinch', 'Shimoliy Muz'], 'Tinch'],
  ['Afrika qit’asidagi eng baland tog‘ qaysi?', ['And', 'Everest', 'Kilimanjaro', 'Alp'], 'Kilimanjaro'],
  ['Nil daryosi qaysi qit’ada joylashgan?', ['Osiyo', 'Afrika', 'Yevropa', 'Janubiy Amerika'], 'Afrika'],
  ['Qaysi materik eng kichik hisoblanadi?', ['Avstraliya', 'Yevropa', 'Afrika', 'Antarktida'], 'Avstraliya'],
  ['Qaysi cho‘l Afrikada joylashgan?', ['Gobi', 'Sahara', 'Qizilqum', 'Atakama'], 'Sahara'],
  ['Yer sharida nechta okean bor?', ['3', '4', '5', '6'], '5'],
  ['Amazonka daryosi qaysi qit’ada oqadi?', ['Afrika', 'Osiyo', 'Janubiy Amerika', 'Yevropa'], 'Janubiy Amerika'],
  ['Everest tog‘i qaysi tog‘ tizmasida joylashgan?', ['Alp', 'Himolay', 'Tyanshan', 'And'], 'Himolay'],
  ['Fransiyaning poytaxti qaysi?', ['Madrid', 'Rim', 'Parij', 'Berlin'], 'Parij'],
  ['Qaysi davlat orollar mamlakati sifatida mashhur?', ['Qozog‘iston', 'Yaponiya', 'Afg‘oniston', 'Shveysariya'], 'Yaponiya'],
  ['Volga daryosi qaysi mamlakatda joylashgan?', ['Rossiya', 'Braziliya', 'Hindiston', 'Misr'], 'Rossiya'],
  ['Qaysi okean O‘zbekiston hududiga tutashmaydi?', ['Tinch okean', 'Atlantika okean', 'Hind okean', 'Barchasi'], 'Barchasi'],
  ['Qaysi materik doimiy muzliklar bilan qoplangan?', ['Afrika', 'Antarktida', 'Avstraliya', 'Yevropa'], 'Antarktida'],
  ['Ispaniyaning mashhur Barselona shahri qaysi qit’ada?', ['Osiyo', 'Afrika', 'Yevropa', 'Shimoliy Amerika'], 'Yevropa'],
  ['Eng uzun daryolardan biri bo‘lgan Missisipi qaysi qit’ada?', ['Shimoliy Amerika', 'Yevropa', 'Osiyo', 'Afrika'], 'Shimoliy Amerika'],
  ['Qaysi davlat ikki qit’ada joylashgan deb qaraladi?', ['Turkiya', 'Misr', 'Braziliya', 'Kanada'], 'Turkiya'],
  ['Toshkent shahri qaysi daryo havzasiga yaqin joylashgan?', ['Sirdaryo', 'Nil', 'Dunay', 'Amazonka'], 'Sirdaryo'],
  ['Qaysi dengiz eng sho‘r suvli yirik suv havzalaridan biri?', ['Orol dengizi', 'Qora dengiz', 'Qizil dengiz', 'Kaspiy dengizi'], 'Qizil dengiz'],
  ['Machu Picchu qaysi davlatda joylashgan?', ['Peru', 'Meksika', 'Chili', 'Argentina'], 'Peru'],
  ['Qaysi davlatning poytaxti Tokio?', ['Xitoy', 'Janubiy Koreya', 'Yaponiya', 'Tailand'], 'Yaponiya'],
  ['Niagara sharsharasi qaysi ikki davlat chegarasida joylashgan?', ['AQSH va Kanada', 'Meksika va AQSH', 'Braziliya va Argentina', 'Fransiya va Germaniya'], 'AQSH va Kanada'],
  ['Suvning eng katta tabiiy zahirasi ko‘proq qayerda to‘plangan?', ['Daryolarda', 'Ko‘llarda', 'Okeanlarda', 'Bulutlarda'], 'Okeanlarda'],
  ['Qaysi shahar Buyuk Britaniya poytaxti?', ['London', 'Dublin', 'Manchester', 'Glazgo'], 'London'],
  ['Fuji tog‘i qaysi mamlakatda?', ['Xitoy', 'Yaponiya', 'Nepal', 'Indoneziya'], 'Yaponiya'],
  ['Sahara cho‘li asosan qaysi iqlim mintaqasida joylashgan?', ['Sovuq', 'Mo‘tadil', 'Tropik quruq', 'Mussonli'], 'Tropik quruq'],
  ['Orol dengizi qaysi mintaqada joylashgan?', ['Markaziy Osiyo', 'Janubiy Amerika', 'G‘arbiy Yevropa', 'Shimoliy Afrika'], 'Markaziy Osiyo'],
  ['Qaysi qit’ada eng ko‘p davlatlar joylashgan?', ['Osiyo', 'Afrika', 'Yevropa', 'Janubiy Amerika'], 'Afrika'],
  ['Sydney Opera House qaysi shaharda joylashgan?', ['Melburn', 'Sidney', 'Brisben', 'Pert'], 'Sidney'],
  ['Yer sharidagi eng sovuq materik qaysi?', ['Yevropa', 'Antarktida', 'Osiyo', 'Shimoliy Amerika'], 'Antarktida'],
])

const stageTwoMath = makeBank('Matematika', [
  ['Agar 7x - 9 = 47 bo‘lsa, x ni toping.', ['6', '7', '8', '9'], '8'],
  ['240 ning 35% i nechaga teng?', ['72', '78', '84', '90'], '84'],
  ['Agar 3(x + 4) = 27 bo‘lsa, x ni toping.', ['4', '5', '6', '7'], '5'],
  ['Katetlari 9 va 12 bo‘lgan to‘g‘ri burchakli uchburchakning gipotenuzasi nechaga teng?', ['13', '14', '15', '16'], '15'],
  ['Agar sonning 40% i 56 bo‘lsa, son nechaga teng?', ['120', '130', '140', '150'], '140'],
  ['2.4 ning 1.5 ga ko‘paytmasi nechaga teng?', ['3.4', '3.6', '3.8', '4.0'], '3.6'],
  ['Agar x² = 144 bo‘lsa, x ning musbat qiymati nechaga teng?', ['10', '11', '12', '13'], '12'],
  ['Tomonlari 14 sm va 9 sm bo‘lgan to‘g‘ri to‘rtburchakning perimetri nechaga teng?', ['42', '44', '46', '48'], '46'],
  ['5/8 ning 96 dagi qiymatini toping.', ['48', '54', '60', '64'], '60'],
  ['Agar 4a - 3 = 29 bo‘lsa, a ni toping.', ['7', '8', '9', '10'], '8'],
  ['125 ning 0.24 qismi nechaga teng?', ['25', '28', '30', '32'], '30'],
  ['Agar aylana diametri 22 bo‘lsa, radiusi nechaga teng?', ['9', '10', '11', '12'], '11'],
  ['Perimetri 60 sm bo‘lgan kvadratning yuzi nechaga teng?', ['196', '225', '256', '289'], '225'],
  ['Agar 6x + 5 = 53 bo‘lsa, x ni toping.', ['7', '8', '9', '10'], '8'],
  ['48 va 180 sonlarining EKUB ini toping.', ['6', '10', '12', '18'], '12'],
  ['Agar sonning 3/5 qismi 42 bo‘lsa, son nechaga teng?', ['60', '65', '70', '75'], '70'],
  ['Trapetsiyaning asoslari 10 va 14, balandligi 6 bo‘lsa, yuzi nechaga teng?', ['60', '66', '72', '78'], '72'],
  ['0.375 sonining kasr ko‘rinishi qaysi?', ['3/8', '5/8', '7/16', '9/20'], '3/8'],
  ['Agar 9y - 15 = 48 bo‘lsa, y ni toping.', ['6', '7', '8', '9'], '7'],
  ['15, 21 va 35 sonlarining EKUK ini toping.', ['105', '115', '120', '135'], '105'],
  ['Agar funksiyada y = 3x - 4 va x = 9 bo‘lsa, y nechaga teng?', ['21', '23', '25', '27'], '23'],
  ['2³ + 4³ ifodaning qiymati nechaga teng?', ['64', '68', '72', '76'], '72'],
  ['Romb diagonallari 8 va 14 bo‘lsa, yuzi nechaga teng?', ['48', '52', '56', '60'], '56'],
  ['Agar 0.6x = 18 bo‘lsa, x ni toping.', ['24', '28', '30', '32'], '30'],
  ['Bir son 84 ga teng. Uning 5/7 qismi nechaga teng?', ['56', '58', '60', '62'], '60'],
  ['To‘g‘ri burchakli uchburchakda katetlari teng bo‘lsa, u qanday uchburchak bo‘ladi?', ['Turli tomonli', 'Teng yonli', 'Teng tomonli', 'O‘tmas burchakli'], 'Teng yonli'],
  ['Agar 14% sonning o‘zi 350 ga nisbatan topilsa, qiymat nechaga teng?', ['42', '46', '49', '52'], '49'],
  ['Agar 8x - 11 = 45 bo‘lsa, x ni toping.', ['6', '7', '8', '9'], '7'],
  ['12 va 18 sonlarining geometrik o‘rtasiga eng yaqin son qaysi?', ['14', '15', '16', '17'], '15'],
  ['Agar kub qirrasi 4 bo‘lsa, hajmi nechaga teng?', ['48', '56', '64', '72'], '64'],
])

const stageTwoGeography = makeBank('Python', [
  ['`numbers = [2, 4, 6]`; `sum(numbers)` natijasi nima?', ['10', '12', '14', 'Xato'], '12'],
  ['`sorted([3, 1, 2])` natijasi qaysi?', ['[3, 2, 1]', '[1, 2, 3]', '(1, 2, 3)', 'Xato'], '[1, 2, 3]'],
  ['`{"a": 1, "b": 2}["b"]` natijasi nima?', ['1', '2', '"b"', 'Xato'], '2'],
  ['Qaysi metod satr boshidagi va oxiridagi bo‘sh joylarni olib tashlaydi?', ['trim()', 'strip()', 'clean()', 'erase()'], 'strip()'],
  ['`for i in range(1, 5)` da oxirgi qiymat qaysi bo‘ladi?', ['3', '4', '5', '1'], '4'],
  ['`list.pop()` odatda nima qiladi?', ['Listni nusxalaydi', 'Oxirgi elementni olib tashlaydi', 'Birinchi elementni qo‘shadi', 'Listni saralaydi'], 'Oxirgi elementni olib tashlaydi'],
  ['`dict.keys()` nimani qaytaradi?', ['Faqat qiymatlarni', 'Kalitlarni', 'Juftliklarni', 'Faqat sonlarni'], 'Kalitlarni'],
  ['`"python".find("th")` natijasi nima?', ['1', '2', '3', '-1'], '2'],
  ['List comprehension qaysi yozuvga misol bo‘ladi?', ['[x * 2 for x in nums]', 'for x => nums', 'nums.map(x)', 'list(nums => x)'], '[x * 2 for x in nums]'],
  ['`x = None`; `x is None` natijasi nima?', ['True', 'False', 'None', 'Xato'], 'True'],
  ['`and` operatori qachon `True` beradi?', ['Ikkalasidan biri true bo‘lsa', 'Faqat ikkalasi ham true bo‘lsa', 'Faqat ikkalasi false bo‘lsa', 'Doim'], 'Faqat ikkalasi ham true bo‘lsa'],
  ['`or` operatori qachon `False` beradi?', ['Bittasi true bo‘lsa', 'Ikkalasi ham true bo‘lsa', 'Faqat ikkalasi ham false bo‘lsa', 'Doim'], 'Faqat ikkalasi ham false bo‘lsa'],
  ['`enumerate(items)` nimada foydali?', ['Faqat saralashda', 'Indeks va qiymatni birga olishda', 'Faqat print qilishda', 'Faqat dict uchun'], 'Indeks va qiymatni birga olishda'],
  ['`zip(a, b)` odatda nima qiladi?', ['Ro‘yxatni bo‘ladi', 'Ikki ketma-ketlikni juftlaydi', 'Faqat sonlarni qo‘shadi', 'Satrdan list yasaydi'], 'Ikki ketma-ketlikni juftlaydi'],
  ['`"a,b,c".split(",")` natijasi qaysi?', ['"a b c"', "['a', 'b', 'c']", '[a,b,c]', 'Xato'], "['a', 'b', 'c']"],
  ['F-string qaysi yozuvda to‘g‘ri?', ['f"Salom {ism}"', '"Salom {ism}"', 'format"Salom"', 'strf(ism)'], 'f"Salom {ism}"'],
  ['`abs(-7)` natijasi nima?', ['-7', '7', '0', 'Xato'], '7'],
  ['`min([8, 3, 5])` natijasi nima?', ['8', '3', '5', '0'], '3'],
  ['`max([8, 3, 5])` natijasi nima?', ['8', '3', '5', '0'], '8'],
  ['`tuple` haqida to‘g‘ri fikr qaysi?', ['Uni oson o‘zgartirish mumkin', 'U o‘zgarmas tur', 'Faqat matn saqlaydi', 'Faqat 2 elementli bo‘ladi'], 'U o‘zgarmas tur'],
  ['`set([1, 1, 2, 3])` natijasi nechta noyob element beradi?', ['2', '3', '4', '1'], '3'],
  ['`items = [1, 2]`; `items.extend([3, 4])` dan keyin list qanday bo‘ladi?', ['[1, 2, [3, 4]]', '[1, 2, 3, 4]', '[3, 4]', 'Xato'], '[1, 2, 3, 4]'],
  ['`"hello".replace("l", "x")` natijasi nima?', ['hexxo', 'hexlo', 'hello', 'hxllo'], 'hexxo'],
  ['Qaysi holatda `IndexError` chiqishi mumkin?', ['Listdagi yo‘q indeksga murojaat qilinsa', 'Son qo‘shilganda', 'String chop etilganda', 'If ishlaganda'], 'Listdagi yo‘q indeksga murojaat qilinsa'],
  ['`import math` dan keyin ildiz olish uchun ko‘p ishlatiladigan funksiya qaysi?', ['math.root()', 'math.sqrt()', 'math.square()', 'math.pow2()'], 'math.sqrt()'],
  ['`lambda x: x + 1` bu nima?', ['Class', 'Anonim funksiya', 'List', 'Modul'], 'Anonim funksiya'],
  ['`all([True, True, False])` natijasi nima?', ['True', 'False', 'None', 'Xato'], 'False'],
  ['`any([False, False, True])` natijasi nima?', ['True', 'False', 'None', 'Xato'], 'True'],
  ['`reversed([1, 2, 3])` bilan bog‘liq to‘g‘ri fikr qaysi?', ['Teskari yurish imkonini beradi', 'Listni o‘chiradi', 'Sonlarni qo‘shadi', 'Faqat string uchun'], 'Teskari yurish imkonini beradi'],
  ['`.py` kengaytmasi odatda nimani bildiradi?', ['Rasm fayli', 'Python fayli', 'Audio fayl', 'Jadval fayli'], 'Python fayli'],
])

const stageTwoAstronomy = makeBank('Geografiya', [
  ['Ekvator Yer sharini nechta yarimsharga ajratadi?', ['2', '3', '4', '5'], '2'],
  ['0° meridian qaysi nom bilan mashhur?', ['Toshkent meridiani', 'Grinvich meridiani', 'Qutb chizig‘i', 'Saraton tropigi'], 'Grinvich meridiani'],
  ['Musson iqlimi qaysi hududlarda ko‘proq uchraydi?', ['Markaziy Osiyoda', 'Janubiy va Janubi-Sharqiy Osiyoda', 'Shimoliy Afrikada', 'Antarktidada'], 'Janubiy va Janubi-Sharqiy Osiyoda'],
  ['Qaysi tog‘ tizmasi Yevropa va Osiyo chegaralaridan biri sifatida olinadi?', ['And', 'Ural', 'Alp', 'Kordilyera'], 'Ural'],
  ['Daryo deltasi odatda qayerda hosil bo‘ladi?', ['Manbada', 'Dengiz yoki ko‘lga quyilish joyida', 'Sharsharada', 'Tog‘ cho‘qqisida'], 'Dengiz yoki ko‘lga quyilish joyida'],
  ['Passat shamollari qaysi yo‘nalishda esadi?', ['Qutbdan ekvatorga', 'Subtropiklardan ekvatorga', 'Ekvatordan qutbga', 'Faqat sharqdan g‘arbga'], 'Subtropiklardan ekvatorga'],
  ['Qaysi okean Yevropa, Afrika va Amerika orasida joylashgan?', ['Hind', 'Tinch', 'Atlantika', 'Shimoliy Muz'], 'Atlantika'],
  ['Tog‘ muzliklari ko‘proq nimaning manbai hisoblanadi?', ['Cho‘l qumlarining', 'Daryo suvlarining', 'Vulqonlarning', 'Shamollarning'], 'Daryo suvlarining'],
  ['Qaysi tabiiy zona yil bo‘yi nam va issiq bo‘lishi bilan ajralib turadi?', ['Tundra', 'Tayga', 'Ekvatorial o‘rmon', 'Cho‘l'], 'Ekvatorial o‘rmon'],
  ['Yer po‘stidagi plitalar to‘qnashadigan hududlarda ko‘proq nima kuzatiladi?', ['Faqat ko‘llar', 'Zilzila va tog‘ hosil bo‘lishi', 'Faqat o‘rmonlar', 'Faqat muzliklar'], 'Zilzila va tog‘ hosil bo‘lishi'],
  ['Golfstrim oqimi qaysi okeanga tegishli?', ['Tinch', 'Atlantika', 'Hind', 'Shimoliy Muz'], 'Atlantika'],
  ['Aholi eng zich joylashgan qit’alardan biri qaysi?', ['Avstraliya', 'Antarktida', 'Osiyo', 'Janubiy Amerika'], 'Osiyo'],
  ['Qaysi ko‘l maydoni jihatidan dunyodagi eng yirik ko‘llardan biri?', ['Baykal', 'Kaspiy', 'Issiqko‘l', 'Viktoriya'], 'Kaspiy'],
  ['Dunyo xaritasida masshtab nima uchun kerak?', ['Rang tanlash uchun', 'Masofani kichraytirib ko‘rsatish uchun', 'Faqat bezak uchun', 'Ob-havoni o‘zgartirish uchun'], 'Masofani kichraytirib ko‘rsatish uchun'],
  ['Qaysi mintaqada yerosti suvlaridan foydalanish ayniqsa muhim?', ['Nam o‘rmonlarda', 'Cho‘llarda', 'Muzliklarda', 'Tundrada'], 'Cho‘llarda'],
  ['Vulqonlar ko‘p bo‘lgan Tinch okean atrofi hududi nima deb ataladi?', ['Sokin halqa', 'Oltin kamar', 'Olov halqasi', 'Muz zonasi'], 'Olov halqasi'],
  ['Qaysi daryo Xitoy, Laos, Tailand va Vetnam orqali oqadi?', ['Mekong', 'Nil', 'Dunay', 'Yanszi'], 'Mekong'],
  ['Kontinental iqlim uchun qaysi belgi xos?', ['Harorat farqi kichik', 'Yoz issiq, qish sovuq', 'Yil bo‘yi yog‘in ko‘p', 'Faqat bahor mavjud'], 'Yoz issiq, qish sovuq'],
  ['Baykal ko‘li nimasi bilan mashhur?', ['Eng sho‘r ko‘l', 'Eng chuqur ko‘llardan biri', 'Eng issiq ko‘l', 'Eng kichik ko‘l'], 'Eng chuqur ko‘llardan biri'],
  ['Qaysi mamlakatda Sagrada Familia joylashgan?', ['Italiya', 'Ispaniya', 'Portugaliya', 'Fransiya'], 'Ispaniya'],
  ['Vaqt mintaqalari asosan nimaga asoslanadi?', ['Daryo uzunligiga', 'Meridianlarga', 'Tog‘ balandligiga', 'Yog‘in miqdoriga'], 'Meridianlarga'],
  ['Qaysi tabiiy ofat ko‘pincha okean tubidagi zilziladan keyin yuz beradi?', ['Qurg‘oqchilik', 'Tsunami', 'Qor ko‘chkisi', 'Bo‘ron'], 'Tsunami'],
  ['Sharqiy Afrikadagi Buyuk Rift vodiysi nimaga misol bo‘ladi?', ['Muzlik zonasi', 'Plitalar ajralish hududi', 'Cho‘l platosi', 'Daryo deltasi'], 'Plitalar ajralish hududi'],
  ['Qaysi daryo Germaniya poytaxti Berlin yaqin hududlari bilan bog‘liq?', ['Reyn', 'Dunay', 'Shpre', 'Volga'], 'Shpre'],
  ['Suv ayirg‘ich chizig‘i nimani bildiradi?', ['Ikki iqlim mintaqasini', 'Ikki daryo havzasi chegarasini', 'Ikki davlat chegarasini', 'Ikki tog‘ cho‘qqisini'], 'Ikki daryo havzasi chegarasini'],
  ['Antarktida nega alohida qit’a sifatida muhim?', ['Aholisi eng ko‘p', 'Iqlim va muzliklar laboratoriyasi', 'Eng katta cho‘l emas', 'Okeansiz hudud'], 'Iqlim va muzliklar laboratoriyasi'],
  ['Qaysi jarayon tog‘ jinslarining parchalanishiga olib keladi?', ['Migratsiya', 'Nurash', 'Urbanizatsiya', 'Fotosintez'], 'Nurash'],
  ['Qaysi davlat Janubiy yarimsharda joylashgan?', ['Kanada', 'Avstraliya', 'Rossiya', 'Norvegiya'], 'Avstraliya'],
  ['Cho‘l vohasi nimani anglatadi?', ['Qorli tog‘ hududi', 'Cho‘ldagi suvli va yashil hudud', 'Dengiz qo‘ltig‘i', 'Vulqon etagi'], 'Cho‘ldagi suvli va yashil hudud'],
  ['Iqlim o‘zgarishining muhim oqibatlaridan biri qaysi?', ['Muzliklarning erishi', 'Meridianlarning ko‘payishi', 'Qit’alarning yo‘qolishi', 'Kunlarning qisqarishi'], 'Muzliklarning erishi'],
])

const stageThreeMath = makeBank('Matematika', [
  ['Agar 2x + 3y = 29 va x = 4 bo‘lsa, y ni toping.', ['6', '7', '8', '9'], '7'],
  ['Agar sonning 35% i 91 bo‘lsa, son nechaga teng?', ['240', '250', '260', '270'], '260'],
  ['x² - 49 = 0 tenglamaning musbat yechimi nechaga teng?', ['5', '6', '7', '8'], '7'],
  ['Trapetsiyaning asoslari 12 va 18, balandligi 7 bo‘lsa, yuzi nechaga teng?', ['95', '100', '105', '110'], '105'],
  ['0.625 sonining kasr ko‘rinishi qaysi?', ['5/8', '3/5', '7/10', '9/16'], '5/8'],
  ['Agar 7x + 2 = 65 bo‘lsa, x ni toping.', ['7', '8', '9', '10'], '9'],
  ['Qirrasi 5 bo‘lgan kubning to‘la sirt yuzasi nechaga teng?', ['100', '125', '150', '175'], '150'],
  ['6, 12, 24, 48 ketma-ketligidagi keyingi son qaysi?', ['72', '84', '96', '100'], '96'],
  ['Agar aylana radiusi 14 bo‘lsa, diametri nechaga teng?', ['21', '24', '28', '32'], '28'],
  ['15 va 25 sonlarining EKUK ini toping.', ['50', '60', '75', '90'], '75'],
  ['Agar 4y - 11 = 53 bo‘lsa, y ni toping.', ['14', '15', '16', '17'], '16'],
  ['Bir sonning 5/6 qismi 50 bo‘lsa, sonning o‘zi nechaga teng?', ['54', '56', '58', '60'], '60'],
  ['To‘g‘ri burchakli uchburchakda katetlari 5 va 12 bo‘lsa, gipotenuza nechaga teng?', ['11', '12', '13', '14'], '13'],
  ['Agar funksiyada y = 5x - 8 va x = 7 bo‘lsa, y nechaga teng?', ['25', '27', '29', '31'], '27'],
  ['Agar 1.8 + 2.75 = ? bo‘lsa, javobni toping.', ['4.45', '4.55', '4.65', '4.75'], '4.55'],
  ['Romb diagonallari 16 va 10 bo‘lsa, yuzi nechaga teng?', ['64', '72', '80', '88'], '80'],
  ['Agar 9% sonning o‘zi 600 dan topilsa, qiymat nechaga teng?', ['48', '52', '54', '56'], '54'],
  ['Agar 3(x - 2) = 24 bo‘lsa, x ni toping.', ['8', '9', '10', '11'], '10'],
  ['8 va 20 sonlarining EKUB ini toping.', ['2', '4', '6', '8'], '4'],
  ['Agar kvadratning yuzi 196 bo‘lsa, tomoni nechaga teng?', ['12', '13', '14', '15'], '14'],
  ['0.04 sonining foiz ko‘rinishi qaysi?', ['0.4%', '4%', '40%', '400%'], '4%'],
  ['Agar 2³ + 5³ ifodani hisoblasak nechaga teng bo‘ladi?', ['129', '131', '133', '135'], '133'],
  ['Agar a = 9 va b = 4 bo‘lsa, 2a + 3b ifodaning qiymati nechaga teng?', ['28', '29', '30', '31'], '30'],
  ['Perimetri 72 bo‘lgan kvadratning yuzi nechaga teng?', ['289', '300', '324', '361'], '324'],
  ['Agar sonning 0.2 qismi 18 bo‘lsa, son nechaga teng?', ['80', '85', '90', '95'], '90'],
  ['10, 17, 24, 31 ketma-ketligidagi keyingi son qaysi?', ['35', '36', '37', '38'], '38'],
  ['Agar 6x - 13 = 41 bo‘lsa, x ni toping.', ['7', '8', '9', '10'], '9'],
  ['Doiraning diametri 30 bo‘lsa, radiusi nechaga teng?', ['12', '13', '14', '15'], '15'],
  ['3/5 ning 150 dagi qiymati nechaga teng?', ['80', '85', '90', '95'], '90'],
  ['Agar parallelogramm asosi 16 va balandligi 9 bo‘lsa, yuzi nechaga teng?', ['134', '140', '144', '150'], '144'],
])

const stageThreeGeography = makeBank('Python', [
  ['`nums = [1, 2, 3, 4]`; `nums[1:3]` natijasi qaysi?', ['[1, 2]', '[2, 3]', '[2, 3, 4]', '[1, 2, 3]'], '[2, 3]'],
  ['`dict.get("key")` metodining afzalligi nimada?', ['Doim xato beradi', 'Kalit bo‘lmasa ham xavfsiz qiymat qaytarishi mumkin', 'Faqat list uchun ishlaydi', 'Faqat son qaytaradi'], 'Kalit bo‘lmasa ham xavfsiz qiymat qaytarishi mumkin'],
  ['`open("a.txt", "w")` rejimi odatda nima qiladi?', ['Faqat o‘qiydi', 'Yozadi yoki yangidan yaratadi', 'Faqat oxiriga qo‘shadi', 'Faqat binar o‘qiydi'], 'Yozadi yoki yangidan yaratadi'],
  ['`with open(...) as f:` yozuvi nimaga qulay?', ['Faylni avtomatik yopishga', 'Faqat print uchun', 'Kod tezligini 100x oshirishga', 'List yaratishga'], 'Faylni avtomatik yopishga'],
  ['`x = [1, 2]`; `y = x`; `y.append(3)` dan keyin `x` qanday bo‘ladi?', ['[1, 2]', '[1, 2, 3]', '[3]', 'Xato'], '[1, 2, 3]'],
  ['`copy()` ko‘pincha nima uchun ishlatiladi?', ['Nusxa olish uchun', 'Saralash uchun', 'O‘chirish uchun', 'Print qilish uchun'], 'Nusxa olish uchun'],
  ['Recursive funksiya nima?', ['Faqat class ichidagi funksiya', 'O‘zini chaqiradigan funksiya', 'Faqat bir marta ishlaydigan funksiya', 'Faqat lambda'], 'O‘zini chaqiradigan funksiya'],
  ['`import random`; tasodifiy butun son olish uchun keng ishlatiladigan funksiya qaysi?', ['random.int()', 'random.randint()', 'random.number()', 'random.whole()'], 'random.randint()'],
  ['`list.sort()` bilan `sorted(list)` orasidagi farq nimada?', ['Ikkalasi ham bir xil va doim yangi list qaytaradi', '`sort()` listni joyida o‘zgartiradi, `sorted()` yangi natija beradi', '`sorted()` xato beradi', '`sort()` faqat tuple uchun'], '`sort()` listni joyida o‘zgartiradi, `sorted()` yangi natija beradi'],
  ['`__name__ == "__main__"` tekshiruvi odatda nima uchun qo‘yiladi?', ['Faqat rang berish uchun', 'Fayl to‘g‘ridan-to‘g‘ri ishga tushirilganini bilish uchun', 'List uzunligini topish uchun', 'Importni taqiqlash uchun'], 'Fayl to‘g‘ridan-to‘g‘ri ishga tushirilganini bilish uchun'],
  ['Exception’ni ushlagandan keyin alohida kodni har doim ishlatish uchun qaysi blok ishlatiladi?', ['final', 'finally', 'after', 'always'], 'finally'],
  ['`map(str, [1, 2, 3])` nimaga xizmat qiladi?', ['Elementlarni satrga o‘tkazishga', 'Listni o‘chirishga', 'Faqat qo‘shishga', 'Faqat ekranga chiqarishga'], 'Elementlarni satrga o‘tkazishga'],
  ['`filter()` funksiyasi nimaga xizmat qiladi?', ['Elementlarni tanlashga', 'Faqat tartiblashga', 'Faqat ko‘paytirishga', 'Stringni kesishga'], 'Elementlarni tanlashga'],
  ['Generator ifoda qaysi yozuvga yaqin?', ['(x*x for x in nums)', '[x*x for x in nums]', '{x:x*x}', 'gen[x]'], '(x*x for x in nums)'],
  ['`yield` qaysi tushuncha bilan bog‘liq?', ['Class merosi', 'Generator funksiyasi', 'Fayl yozish', 'Matn almashtirish'], 'Generator funksiyasi'],
  ['`is` operatori ko‘proq nimani tekshiradi?', ['Qiymat tengligini', 'Obyekt identifikatorini', 'Faqat matn uzunligini', 'Faqat bool turini'], 'Obyekt identifikatorini'],
  ['`==` operatori asosan nimani tekshiradi?', ['Qiymat tengligini', 'Xotira manzilini', 'Faqat class nomini', 'Fayl borligini'], 'Qiymat tengligini'],
  ['Decorator nima uchun ishlatiladi?', ['Funksiya yoki metod xulqini o‘rash/kengaytirish uchun', 'Faqat list yaratish uchun', 'Faqat print uchun', 'Modulni o‘chirish uchun'], 'Funksiya yoki metod xulqini o‘rash/kengaytirish uchun'],
  ['`@property` decoratorining foydasi nimada?', ['Metodni atribut kabi ishlatishga', 'Fayl ochishga', 'Loopni tezlatishga', 'Dict yaratishga'], 'Metodni atribut kabi ishlatishga'],
  ['Class’dan obyekt yaratish jarayoni nima deyiladi?', ['Import', 'Instantiation', 'Iteration', 'Decoration'], 'Instantiation'],
  ['`self` odatda class metodida nimani bildiradi?', ['Global o‘zgaruvchini', 'Joriy obyektning o‘zini', 'Fayl nomini', 'Tasodifiy qiymatni'], 'Joriy obyektning o‘zini'],
  ['`super()` ko‘proq nimada qo‘l keladi?', ['Meros olganda ota class metodiga murojaatda', 'Fayl yozishda', 'Set yaratishda', 'Lambda yozishda'], 'Meros olganda ota class metodiga murojaatda'],
  ['`pip` nimaga xizmat qiladi?', ['Python paketlarini o‘rnatishga', 'Kod yozishga', 'Faylni siqishga', 'Faqat test ishlatishga'], 'Python paketlarini o‘rnatishga'],
  ['Virtual environment nimaga foydali?', ['Har loyiha uchun paketlarni alohida saqlashga', 'Monitor yorqinligini oshirishga', 'Internetni tezlatishga', 'Faqat print uchun'], 'Har loyiha uchun paketlarni alohida saqlashga'],
  ['`requirements.txt` odatda nimani saqlaydi?', ['Rasm fayllarni', 'Loyihadagi paketlar ro‘yxatini', 'Faqat testlarni', 'Parollarni'], 'Loyihadagi paketlar ro‘yxatini'],
  ['PEP 8 nima bilan bog‘liq?', ['Kod uslubi tavsiyalari bilan', 'Ma’lumotlar bazasi bilan', 'Tarmoq protokoli bilan', 'Grafika bilan'], 'Kod uslubi tavsiyalari bilan'],
  ['`pytest` ko‘proq nimada ishlatiladi?', ['Test yozish va ishga tushirishda', 'Rasm chizishda', 'Audio o‘ynatishda', 'Fayl siqishda'], 'Test yozish va ishga tushirishda'],
  ['`assert` operatori ko‘pincha nimaga kerak?', ['Shartni tekshirishga', 'Import qilishga', 'Class yaratishga', 'Loop to‘xtatishga'], 'Shartni tekshirishga'],
  ['`break` operatori nima qiladi?', ['Siklni darhol to‘xtatadi', 'Funksiyani yaratadi', 'Listga qo‘shadi', 'Xatoni yashiradi'], 'Siklni darhol to‘xtatadi'],
  ['`continue` operatori nima qiladi?', ['Siklni butunlay tugatadi', 'Joriy iteratsiyani tashlab keyingisiga o‘tadi', 'Funksiyani qaytaradi', 'Faylni yopadi'], 'Joriy iteratsiyani tashlab keyingisiga o‘tadi'],
])

const stageThreeAstronomy = makeBank('Geografiya', [
  ['Yog‘in soyasi effekti ko‘proq qaysi hududda kuzatiladi?', ['Tog‘larning shamolga teskari yonbag‘rida', 'Daryo deltalarida', 'Muzlik markazida', 'Okean tubida'], 'Tog‘larning shamolga teskari yonbag‘rida'],
  ['El-Nino hodisasi asosan qaysi okean bilan bog‘liq?', ['Atlantika', 'Tinch', 'Hind', 'Shimoliy Muz'], 'Tinch'],
  ['Demografik portlash nimani anglatadi?', ['Aholining keskin tez o‘sishi', 'Shaharlar kamayishi', 'Iqlim sovushi', 'Daryolar qurishi'], 'Aholining keskin tez o‘sishi'],
  ['Qaysi davlat hududi ikki materikda joylashgani uchun transkontinental hisoblanadi?', ['Braziliya', 'Turkiya', 'Hindiston', 'Yaponiya'], 'Turkiya'],
  ['Subduktsiya zonasi nima bilan bog‘liq?', ['Bir plitaning boshqasi ostiga kirishi', 'Daryo deltasi kengayishi', 'Muzlik erishi', 'Cho‘l shamollari'], 'Bir plitaning boshqasi ostiga kirishi'],
  ['Aholi zichligi eng yuqori hududlar ko‘proq qayerlarda joylashadi?', ['Suv va transportga qulay tekisliklarda', 'Faqat baland tog‘larda', 'Antarktida ichkarisida', 'Cho‘llarning markazida'], 'Suv va transportga qulay tekisliklarda'],
  ['Gulf Stream oqimi Yevropaga qanday ta’sir ko‘rsatadi?', ['Iqlimni yumshatadi', 'Doimiy qurg‘oqchilik keltiradi', 'Yer qimirlashini kuchaytiradi', 'Tog‘larni balandlashtiradi'], 'Iqlimni yumshatadi'],
  ['Qaysi ko‘rsatkich mamlakat rivojlanishini taqqoslashda ko‘p ishlatiladi?', ['Mutlaq kenglik', 'HDI', 'Meridian soni', 'Bulut balandligi'], 'HDI'],
  ['Urbanizatsiya nimani anglatadi?', ['Qishloqlashuvni', 'Shahar aholisi ulushining oshishini', 'Yomg‘ir ko‘payishini', 'Tog‘ hosil bo‘lishini'], 'Shahar aholisi ulushining oshishini'],
  ['Qaysi mintaqa seysmiklik jihatdan eng faol hududlardan biri?', ['Tinch okean olov halqasi', 'Sahara markazi', 'Amazonka deltasi', 'Sharqiy Yevropa tekisligi'], 'Tinch okean olov halqasi'],
  ['Arid iqlim nimani bildiradi?', ['Sovuq va nam', 'Issiq va sernam', 'Quruq va yog‘ini kam', 'Faqat shamolli'], 'Quruq va yog‘ini kam'],
  ['Qaysi daryo havzasi dunyodagi eng katta suv yig‘ish havzalaridan biri?', ['Amazonka', 'Dunay', 'Amudaryo', 'Temza'], 'Amazonka'],
  ['GIS qisqartmasi nimani anglatadi?', ['Geografik informatsion tizim', 'Global internet sistemi', 'Geologik izlanish stansiyasi', 'Gidrologik integral sxema'], 'Geografik informatsion tizim'],
  ['Aholi migratsiyasining iqtisodiy sababi ko‘proq nimaga bog‘liq?', ['Ish o‘rinlari va daromadga', 'Faqat tog‘larga', 'Faqat shamolga', 'Okean oqimiga'], 'Ish o‘rinlari va daromadga'],
  ['Qaysi davlatlar oralig‘idagi Panama kanali qaysi ikki okeanni bog‘laydi?', ['Tinch va Atlantika', 'Hind va Atlantika', 'Tinch va Shimoliy Muz', 'Faqat ko‘llarni'], 'Tinch va Atlantika'],
  ['Qurg‘oqchil hududlarda sug‘orma dehqonchilikning asosiy sharti nima?', ['Barqaror suv manbasi', 'Faqat muzlik', 'Faqat shamol', 'Faqat balandlik'], 'Barqaror suv manbasi'],
  ['Qaysi tabiiy ofat Richter shkalasi bilan o‘lchanadi?', ['Tsunami', 'Zilzila', 'Qurg‘oqchilik', 'Bo‘ron'], 'Zilzila'],
  ['Metropoliten hudud nimani anglatadi?', ['Faqat qishloq markazini', 'Yirik shahar va uning atrof iqtisodiy hududini', 'Faqat portni', 'Faqat tog‘ tizmasini'], 'Yirik shahar va uning atrof iqtisodiy hududini'],
  ['Permafrost termini nimani bildiradi?', ['Doimiy muzlagan gruntni', 'Issiq cho‘lni', 'Tropik yomg‘irni', 'Vulqon kulini'], 'Doimiy muzlagan gruntni'],
  ['Antropogen landshaft nima?', ['Faqat tabiiy o‘rmon', 'Inson faoliyati ta’sirida o‘zgargan landshaft', 'Faqat muzlik', 'Faqat tog‘ cho‘qqisi'], 'Inson faoliyati ta’sirida o‘zgargan landshaft'],
  ['Qaysi omil ko‘pincha daryo rejimini belgilaydi?', ['Faqat shamol', 'Oziqlanish manbai va iqlim', 'Faqat tog‘ rangi', 'Faqat ko‘l chuqurligi'], 'Oziqlanish manbai va iqlim'],
  ['Aholining tabiiy o‘sishi qaysi ikki ko‘rsatkich farqiga bog‘liq?', ['Tug‘ilish va o‘lim', 'Migratsiya va eksport', 'Yog‘in va bug‘lanish', 'Shamol va bosim'], 'Tug‘ilish va o‘lim'],
  ['Qaysi hududda savanna landshafti keng tarqalgan?', ['Ekvatorial nam o‘rmon markazida', 'Subekvatorial Afrikada', 'Antarktidada', 'Shimoliy Muz okeanida'], 'Subekvatorial Afrikada'],
  ['Tektonik ko‘llar nimaning natijasida hosil bo‘ladi?', ['Plitalar harakati va yer po‘sti yoriqlari natijasida', 'Faqat yomg‘irdan', 'Faqat muz erishidan', 'Faqat vulqon kulidan'], 'Plitalar harakati va yer po‘sti yoriqlari natijasida'],
  ['Dunyo okeanidagi tuzlilikka eng kuchli ta’sir qiluvchi omillardan biri qaysi?', ['Bug‘lanish va yog‘in nisbati', 'Faqat qirg‘oq rangi', 'Faqat kemalar soni', 'Faqat quyosh chiqishi'], 'Bug‘lanish va yog‘in nisbati'],
  ['Hududning geosiyosiy ahamiyati ko‘proq nimaga bog‘liq bo‘lishi mumkin?', ['Joylashuv, resurs va transport yo‘llariga', 'Faqat hayvonlar soniga', 'Faqat ob-havoga', 'Faqat tog‘ nomiga'], 'Joylashuv, resurs va transport yo‘llariga'],
  ['Qaysi mintaqada musson shamollari mavsumiy yo‘nalish almashadi?', ['Janubiy Osiyoda', 'Sahro markazida', 'Grenlandiyada', 'Antarktida ichkarisida'], 'Janubiy Osiyoda'],
  ['Hududning absolut balandligi nimaga nisbatan olinadi?', ['Daryo sathiga', 'Dengiz sathiga', 'Bulutlarga', 'Qutbga'], 'Dengiz sathiga'],
  ['Qaysi jarayon shamol ta’sirida relyefni o‘zgartiradi?', ['Eol jarayonlari', 'Tektonik sikl', 'Biotik muvozanat', 'Demografik o‘tish'], 'Eol jarayonlari'],
  ['Barqaror rivojlanish tushunchasi nimani ko‘zlaydi?', ['Faqat tez foyda olishni', 'Tabiat, iqtisod va jamiyat muvozanatini', 'Faqat sanoatni ko‘paytirishni', 'Faqat shaharlashuvni'], 'Tabiat, iqtisod va jamiyat muvozanatini'],
])

export function buildStageOneQuestions() {
  return buildStageFromBanks(stageOneMath, stageOneGeography, stageOneAstronomy)
}

export function buildStageTwoQuestions() {
  return buildStageFromBanks(stageTwoMath, stageTwoGeography, stageTwoAstronomy)
}

export function buildStageThreeQuestions() {
  return buildStageFromBanks(stageThreeMath, stageThreeGeography, stageThreeAstronomy)
}

export const frogQuizQuestions: FrogQuizQuestion[][] = buildStageOneQuestions()
export const frogQuizStageTwoQuestions: FrogQuizQuestion[][] = buildStageTwoQuestions()
export const frogQuizStageThreeQuestions: FrogQuizQuestion[][] = buildStageThreeQuestions()
