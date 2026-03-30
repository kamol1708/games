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
  ['Agar 4x + 6 = 30 bo‘lsa, x ni toping.', ['5', '6', '7', '8'], '6'],
  ['15% ning 200 dagi qiymati nechaga teng?', ['20', '25', '30', '35'], '30'],
  ['Tomoni 11 sm bo‘lgan kvadratning perimetri nechaga teng?', ['33', '40', '44', '48'], '44'],
  ['7 va 13 sonlarining yig‘indisini 3 ga ko‘paytirsak nechaga teng bo‘ladi?', ['50', '60', '63', '70'], '60'],
  ['0.8 sonining foiz ko‘rinishi qaysi?', ['8%', '18%', '80%', '800%'], '80%'],
  ['Agar x/5 = 9 bo‘lsa, x nechaga teng?', ['35', '40', '45', '50'], '45'],
  ['12 sm va 9 sm tomonli to‘g‘ri to‘rtburchakning yuzi nechaga teng?', ['21', '42', '96', '108'], '108'],
  ['3² + 5² ifodaning qiymatini toping.', ['28', '30', '32', '34'], '34'],
  ['Agar 2y - 7 = 15 bo‘lsa, y ni toping.', ['9', '10', '11', '12'], '11'],
  ['1/4 ning 64 dagi qiymati nechaga teng?', ['12', '14', '16', '18'], '16'],
  ['36 ning kvadrat ildizi nechaga teng?', ['4', '5', '6', '7'], '6'],
  ['Agar 5x - 8 = 27 bo‘lsa, x ni toping.', ['5', '6', '7', '8'], '7'],
  ['72 sonining 25% i nechaga teng?', ['16', '18', '20', '24'], '18'],
  ['Agar uchta ketma-ket sonning o‘rtanchasi 14 bo‘lsa, ularning yig‘indisi nechaga teng?', ['39', '42', '45', '48'], '42'],
  ['Aylana radiusi 9 bo‘lsa, diametri nechaga teng?', ['9', '14', '18', '27'], '18'],
  ['2.5 + 1.75 yig‘indisi qaysi?', ['4.05', '4.15', '4.25', '4.35'], '4.25'],
  ['84 va 126 sonlarining EKUB ini toping.', ['14', '21', '28', '42'], '42'],
  ['Agar 3a = 45 bo‘lsa, a nechaga teng?', ['12', '13', '14', '15'], '15'],
  ['Tomonlari 6, 8 va 10 bo‘lgan uchburchak qanday uchburchak?', ['Teng tomonli', 'To‘g‘ri burchakli', 'O‘tmas burchakli', 'Teng yonli'], 'To‘g‘ri burchakli'],
  ['0.45 sonining kasr ko‘rinishi qaysi?', ['9/20', '4/5', '3/4', '2/9'], '9/20'],
  ['Agar 9x + 3 = 57 bo‘lsa, x ni toping.', ['5', '6', '7', '8'], '6'],
  ['Bir son 18 ga teng. Uning 2/3 qismi nechaga teng?', ['10', '11', '12', '13'], '12'],
  ['Perimetri 52 sm bo‘lgan kvadratning tomoni nechaga teng?', ['11', '12', '13', '14'], '13'],
  ['Agar b = 7 bo‘lsa, 4b - 9 ifodaning qiymatini toping.', ['17', '18', '19', '20'], '19'],
  ['5, 8, 11, 14 ketma-ketligidagi keyingi son qaysi?', ['15', '16', '17', '18'], '17'],
  ['Agar 2x + 3y = 18 va x = 3 bo‘lsa, y nechaga teng?', ['3', '4', '5', '6'], '4'],
  ['40 ning 0.3 qismi nechaga teng?', ['10', '12', '14', '16'], '12'],
  ['Agar sonning 1/6 qismi 8 bo‘lsa, sonning o‘zi nechaga teng?', ['42', '46', '48', '52'], '48'],
  ['6 va 15 sonlarining EKUK ini toping.', ['20', '25', '30', '45'], '30'],
  ['120 gradusli markaziy burchak aylananing necha ulushiga teng?', ['1/4', '1/3', '1/2', '2/3'], '1/3'],
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

const stageOneAstronomy = makeBank('Astronomiya', [
  ['Quyosh sistemasidagi eng katta sayyora qaysi?', ['Mars', 'Saturn', 'Yupiter', 'Neptun'], 'Yupiter'],
  ['Yerga eng yaqin tabiiy yo‘ldosh qaysi?', ['Mars', 'Oy', 'Quyosh', 'Venera'], 'Oy'],
  ['Qaysi sayyora “Qizil sayyora” deb ataladi?', ['Merkuriy', 'Mars', 'Yupiter', 'Uran'], 'Mars'],
  ['Quyosh asosan nimadan tashkil topgan?', ['Temir va mis', 'Vodorod va geliy', 'Kislorod va azot', 'Suv bug‘i'], 'Vodorod va geliy'],
  ['Saturn sayyorasi nimasi bilan mashhur?', ['Juda issiqligi bilan', 'Halqalari bilan', 'Ko‘p okeanlari bilan', 'Yashil rangi bilan'], 'Halqalari bilan'],
  ['Qaysi sayyora Quyoshga eng yaqin?', ['Venera', 'Yer', 'Merkuriy', 'Mars'], 'Merkuriy'],
  ['Bir yil nimani anglatadi?', ['Yerning o‘z o‘qi atrofida aylanishi', 'Oyning Yer atrofida aylanishi', 'Yerning Quyosh atrofida aylanishi', 'Quyoshning galaktika atrofida aylanishi'], 'Yerning Quyosh atrofida aylanishi'],
  ['Qaysi sayyora tong yulduzi sifatida ham tanilgan?', ['Venera', 'Yupiter', 'Saturn', 'Merkuriy'], 'Venera'],
  ['Oy tutilishi qachon yuz beradi?', ['Oy Quyosh bilan Yer orasiga kirganda', 'Yer Quyosh bilan Oy orasiga kirganda', 'Quyosh Oy bilan Mars orasiga kirganda', 'Venera Yerga yaqinlashganda'], 'Yer Quyosh bilan Oy orasiga kirganda'],
  ['Quyosh tutilishi qachon yuz beradi?', ['Oy Yer bilan Quyosh orasiga kirganda', 'Yer Oy bilan Quyosh orasiga kirganda', 'Mars Quyosh oldidan o‘tganda', 'Saturn yaqinlashganda'], 'Oy Yer bilan Quyosh orasiga kirganda'],
  ['Quyosh sistemasida nechta asosiy sayyora bor?', ['7', '8', '9', '10'], '8'],
  ['Qaysi sayyora o‘z o‘qi atrofida eng tez aylanadi?', ['Yupiter', 'Mars', 'Venera', 'Neptun'], 'Yupiter'],
  ['Somon Yo‘li nima?', ['Yulduz turkumi', 'Galaktika', 'Sayyora', 'Tumanlik turi'], 'Galaktika'],
  ['Quyosh ham aslida nima hisoblanadi?', ['Sayyora', 'Kometa', 'Yulduz', 'Asteroid'], 'Yulduz'],
  ['Qaysi sayyora eng katta halqalar tizimiga ega?', ['Yer', 'Mars', 'Saturn', 'Merkuriy'], 'Saturn'],
  ['Asteroidlar asosan qayerda ko‘p uchraydi?', ['Yer bilan Oy orasida', 'Mars va Yupiter orasida', 'Saturn va Uran orasida', 'Quyosh ichida'], 'Mars va Yupiter orasida'],
  ['Uran sayyorasi qaysi xususiyati bilan ajralib turadi?', ['Yonboshlab aylanishi bilan', 'Juda issiqligi bilan', 'Halqasizligi bilan', 'Qizil rangi bilan'], 'Yonboshlab aylanishi bilan'],
  ['Qaysi sayyora eng ko‘p yo‘ldoshlardan biriga ega?', ['Mars', 'Yupiter', 'Merkuriy', 'Venera'], 'Yupiter'],
  ['Qutb yulduzi ko‘proq nimani aniqlashda yordam beradi?', ['Vaqtni', 'Shimol yo‘nalishini', 'Havo haroratini', 'Oy fazasini'], 'Shimol yo‘nalishini'],
  ['Venera sayyorasida bir kunning juda uzun bo‘lishiga sabab nima?', ['U juda tez aylanadi', 'U juda sekin aylanadi', 'Uning oylar soni ko‘p', 'U juda kichik'], 'U juda sekin aylanadi'],
  ['Kometa Quyoshga yaqinlashganda nima hosil qiladi?', ['Halqa', 'Dum', 'Qalqon', 'Yo‘ldosh'], 'Dum'],
  ['Yerga eng yaqin yulduz qaysi?', ['Sirius', 'Proksima Kentavr', 'Quyosh', 'Vega'], 'Quyosh'],
  ['Neptun sayyorasi qaysi guruhga kiradi?', ['Tosh sayyora', 'Gaz gigantiga yaqin muz gigant', 'MittI sayyora', 'Yo‘ldosh'], 'Gaz gigantiga yaqin muz gigant'],
  ['Meteorit nima?', ['Faqat kosmosdagi tosh', 'Yerga yetib kelgan meteoroid bo‘lagi', 'Yulduzning parchasi', 'Sayyora halqasi'], 'Yerga yetib kelgan meteoroid bo‘lagi'],
  ['Oy fazalari nimaga bog‘liq?', ['Oy rangiga', 'Oy hajmiga', 'Oy, Yer va Quyoshning nisbiy joylashuviga', 'Yerning magnit maydoniga'], 'Oy, Yer va Quyoshning nisbiy joylashuviga'],
  ['Qaysi sayyorada bir yil Yer yilidan ancha uzoq davom etadi?', ['Merkuriy', 'Mars', 'Yupiter', 'Saturn'], 'Saturn'],
  ['“Supernova” nimani anglatadi?', ['Yangi sayyora tug‘ilishi', 'Yulduzning juda kuchli portlashi', 'Oy tutilishi', 'Kometa dumining yo‘qolishi'], 'Yulduzning juda kuchli portlashi'],
  ['Qaysi sayyora “ertalabki” va “kechki” yulduz sifatida ko‘rinishi mumkin?', ['Mars', 'Venera', 'Saturn', 'Neptun'], 'Venera'],
  ['Teleskopning asosiy vazifasi nima?', ['Ovoz kuchaytirish', 'Kosmik jismlarni kattalashtirib ko‘rsatish', 'Issiqlik o‘lchash', 'Vaqt belgilash'], 'Kosmik jismlarni kattalashtirib ko‘rsatish'],
  ['Qaysi osmon jismi o‘z nurini chiqarmaydi, balki yulduz nurini qaytaradi?', ['Quyosh', 'Sayyora', 'Pulsar', 'Galaktika markazi'], 'Sayyora'],
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

const stageTwoAstronomy = makeBank('Astronomiya', [
  ['Qaysi sayyora “muz gigant” sifatida taniladi?', ['Mars', 'Uran', 'Merkuriy', 'Venera'], 'Uran'],
  ['Qaysi sayyoraning atmosferasi asosan karbonat angidriddan iborat?', ['Mars', 'Yer', 'Yupiter', 'Saturn'], 'Mars'],
  ['Quyoshdagi eng ko‘p energiya qaysi jarayonda hosil bo‘ladi?', ['Yonish', 'Yadro sintezi', 'Suv bug‘lanishi', 'Magnit tortishish'], 'Yadro sintezi'],
  ['Qaysi teleskop kosmosda joylashgani bilan mashhur?', ['Galileo', 'Hubble', 'Kepler', 'Newton'], 'Hubble'],
  ['Yerga yaqin asteroidlar nega kuzatiladi?', ['Rangi chiroyli bo‘lgani uchun', 'To‘qnashuv xavfini baholash uchun', 'Ob-havo aytish uchun', 'Oy fazasini o‘lchash uchun'], 'To‘qnashuv xavfini baholash uchun'],
  ['Qaysi sayyora o‘z o‘qi atrofida teskari tomonga yaqin aylanishi bilan mashhur?', ['Venera', 'Mars', 'Yupiter', 'Neptun'], 'Venera'],
  ['Oyda atmosfera juda siyrak bo‘lgani uchun nima deyarli bo‘lmaydi?', ['Harorat farqi', 'Shamol', 'Tog‘lar', 'Chang'], 'Shamol'],
  ['Qaysi yulduz turkumidan Shimoliy yarimsharda yo‘nalish topishda foydalaniladi?', ['Orion', 'Katta Ayiq', 'Akrep', 'Janubiy Xoch'], 'Katta Ayiq'],
  ['Qora tuynukdan ham yorug‘lik qochib chiqolmasligining sababi nima?', ['U sovuq bo‘lgani uchun', 'Tortish kuchi juda katta bo‘lgani uchun', 'U kichik bo‘lgani uchun', 'Unda gaz yo‘qligi uchun'], 'Tortish kuchi juda katta bo‘lgani uchun'],
  ['Qaysi sayyora eng katta ko‘rinadigan qizg‘ish dog‘i bilan mashhur?', ['Mars', 'Yupiter', 'Saturn', 'Uran'], 'Yupiter'],
  ['Quyosh sistemasi markazida nima joylashgan?', ['Yer', 'Oy', 'Quyosh', 'Yupiter'], 'Quyosh'],
  ['Yulduzlar orasidagi gaz va chang buluti nima deb ataladi?', ['Kometa', 'Tumanlik', 'Asteroid kamar', 'Yo‘ldosh'], 'Tumanlik'],
  ['Qaysi sayyorada yil fasllari juda keskin bo‘lishi eksa qiyaligi bilan bog‘liq?', ['Uran', 'Merkuriy', 'Venera', 'Mars'], 'Uran'],
  ['Quasar nima bilan bog‘liq?', ['Faol galaktika markazi', 'Oy fazasi', 'Meteorit yomg‘iri', 'Sayyora halqasi'], 'Faol galaktika markazi'],
  ['Qaysi osmon jismi dumli yulduz deb ham ataladi?', ['Asteroid', 'Kometa', 'Meteor', 'Pulsar'], 'Kometa'],
  ['Galaktikamizning nomi nima?', ['Andromeda', 'Somon Yo‘li', 'Magellan', 'Triangulum'], 'Somon Yo‘li'],
  ['Qaysi sayyora zichligi eng kichik bo‘lgan katta sayyoralardan biri?', ['Saturn', 'Yer', 'Merkuriy', 'Mars'], 'Saturn'],
  ['Pulsar nima?', ['Halqali sayyora', 'Tez aylanayotgan neytron yulduz', 'Kichik kometa', 'Gaz buluti'], 'Tez aylanayotgan neytron yulduz'],
  ['Qaysi sayyorada kun yilidan uzunroq bo‘lishi mumkin?', ['Venera', 'Mars', 'Yer', 'Neptun'], 'Venera'],
  ['Meteor yomg‘iri nima bilan bog‘liq?', ['Quyosh shamoli', 'Kometa izi bo‘ylab Yerning harakati', 'Oy tortishishi', 'Qora tuynuklar'], 'Kometa izi bo‘ylab Yerning harakati'],
  ['Qaysi sayyora Yerga o‘lchami jihatidan eng yaqin?', ['Mars', 'Venera', 'Neptun', 'Saturn'], 'Venera'],
  ['Ekzoplaneta nima?', ['Quyosh sistemasidagi yo‘ldosh', 'Boshqa yulduz atrofidagi sayyora', 'Kometa turi', 'Asteroid bo‘lagi'], 'Boshqa yulduz atrofidagi sayyora'],
  ['Qaysi apparat Oyga odam olib borgan dastur bilan bog‘liq?', ['Apollo', 'Voyager', 'Pioneer', 'Cassini'], 'Apollo'],
  ['Quyoshdagi qora dog‘lar asosan nimaga bog‘liq?', ['Muz qatlamiga', 'Magnit faollikka', 'Suv bug‘iga', 'Kometalarga'], 'Magnit faollikka'],
  ['Qaysi sayyora eng ko‘p tanilgan halqalardan tashqari ko‘plab yo‘ldoshlarga ham ega?', ['Saturn', 'Merkuriy', 'Venera', 'Yer'], 'Saturn'],
  ['Oyda og‘irlik kuchi Yerga nisbatan qanday?', ['Bir xil', 'Ko‘proq', 'Kamroq', 'Umuman yo‘q'], 'Kamroq'],
  ['Qaysi yulduz portlagandan keyin neytron yulduz yoki qora tuynuk qoldirishi mumkin?', ['Kichik massa yulduz', 'Katta massa yulduz', 'Sayyora', 'Kometa'], 'Katta massa yulduz'],
  ['Astronomik birlik nimani bildiradi?', ['Yer bilan Oy orasidagi masofa', 'Yer bilan Quyosh orasidagi o‘rtacha masofa', 'Galaktika diametri', 'Bir yorug‘lik yili'], 'Yer bilan Quyosh orasidagi o‘rtacha masofa'],
  ['Qaysi sayyora Quyoshdan juda uzoq bo‘lgani uchun bir aylanishi juda uzoq davom etadi?', ['Mars', 'Yupiter', 'Neptun', 'Merkuriy'], 'Neptun'],
  ['Nima sababli yulduzlar ranglari turlicha ko‘rinadi?', ['Faqat masofaga ko‘ra', 'Haroratiga ko‘ra', 'Faqat hajmiga ko‘ra', 'Faqat oylar soniga ko‘ra'], 'Haroratiga ko‘ra'],
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

const stageThreeAstronomy = makeBank('Astronomiya', [
  ['Qaysi apparat Saturn tizimini batafsil o‘rgangan?', ['Voyager 1', 'Cassini', 'Apollo 11', 'Sputnik'], 'Cassini'],
  ['Qaysi sayyora Quyosh atrofida bir aylanishni eng tez tugatadi?', ['Merkuriy', 'Venera', 'Yer', 'Mars'], 'Merkuriy'],
  ['Qizil gigant nima?', ['Yangi sayyora turi', 'Hayotining keyingi bosqichidagi yulduz', 'Kometa yadrosi', 'Qora tuynuk turi'], 'Hayotining keyingi bosqichidagi yulduz'],
  ['Qaysi osmon jismlari asosan muz, chang va tosh aralashmasidan iborat bo‘ladi?', ['Pulsarlar', 'Kometalar', 'Galaktikalar', 'Kvazarlar'], 'Kometalar'],
  ['Quyosh shamoli nimadan iborat?', ['Muz zarrachalaridan', 'Zaryadlangan zarrachalardan', 'Faqat yorug‘likdan', 'Faqat changdan'], 'Zaryadlangan zarrachalardan'],
  ['Qaysi sayyoraning yo‘ldoshi Titan juda qalin atmosferaga ega?', ['Yupiter', 'Saturn', 'Mars', 'Uran'], 'Saturn'],
  ['Yorug‘lik yili nimani o‘lchaydi?', ['Vaqtni', 'Masofani', 'Haroratni', 'Og‘irlikni'], 'Masofani'],
  ['Neytron yulduz qanday yulduz qoldig‘i hisoblanadi?', ['Juda kichik gazli sayyora', 'Supernova qoldig‘i', 'Kometa qoldig‘i', 'Asteroid turi'], 'Supernova qoldig‘i'],
  ['Qaysi sayyora atmosferasidagi kuchli shamollar bilan mashhur?', ['Neptun', 'Merkuriy', 'Yer', 'Mars'], 'Neptun'],
  ['Oy yuzasidagi katta chuqurliklar asosan nimadan paydo bo‘lgan?', ['Suv eroziyasi', 'Meteor zarbalari', 'O‘simliklar', 'Yomg‘irlar'], 'Meteor zarbalari'],
  ['Qaysi missiya birinchi bo‘lib insonni Oyga olib bordi?', ['Apollo 11', 'Voyager 2', 'Mercury 7', 'Gemini 4'], 'Apollo 11'],
  ['Qaysi sayyorada Olympus Mons nomli ulkan vulqon bor?', ['Yer', 'Mars', 'Venera', 'Yupiter'], 'Mars'],
  ['Qora tuynuk hodisa ufqi nimani bildiradi?', ['Halqalar chegarasini', 'Qaytib chiqib bo‘lmaydigan chegarani', 'Faqat muz qatlamini', 'Quyosh shamoli hududini'], 'Qaytib chiqib bo‘lmaydigan chegarani'],
  ['Qaysi sayyora eng katta sonli mashhur yo‘ldoshlarga ega bo‘lib, Ganimed ham unga tegishli?', ['Saturn', 'Uran', 'Yupiter', 'Mars'], 'Yupiter'],
  ['Galaktikalar bir-biridan uzoqlashayotganini ko‘rsatadigan hodisa qaysi?', ['Qizil siljish', 'Oy tutilishi', 'Quyosh shamoli', 'Meteor oqimi'], 'Qizil siljish'],
  ['Qaysi yulduz turi harorat jihatdan odatda ko‘kroq ko‘rinadi?', ['Sovuq yulduz', 'Issiq yulduz', 'O‘lik yulduz', 'Kichik sayyora'], 'Issiq yulduz'],
  ['Marsdagi kun davomiyligi Yer kuniga nisbatan qanday?', ['Ancha qisqa', 'Deyarli o‘xshash', 'Juda uzun', 'Aniq ikki baravar'], 'Deyarli o‘xshash'],
  ['Qaysi hodisa galaktikadagi milliardlab yulduzlar tizimini anglatadi?', ['Tumanlik', 'Galaktika', 'Meteor', 'Asteroid'], 'Galaktika'],
  ['Quyoshdan chiqqan yorug‘lik Yerga taxminan qancha vaqtda yetib keladi?', ['8 daqiqa atrofida', '1 soatda', '1 kunda', '10 soniyada'], '8 daqiqa atrofida'],
  ['Qaysi sayyora yuzasida suyuq suv hozircha tasdiqlanmagan, ammo muz izlari ko‘p o‘rganiladi?', ['Mars', 'Merkuriy', 'Venera', 'Yupiter'], 'Mars'],
  ['Halley kometasi taxminan necha yilda bir ko‘rinadi?', ['12', '24', '76', '150'], '76'],
  ['Qaysi sayyora kuchli issiqxona effekti tufayli juda issiq?', ['Mars', 'Venera', 'Yer', 'Neptun'], 'Venera'],
  ['Astronomiyada spektr tahlili nima uchun muhim?', ['Faqat masofani kamaytirish uchun', 'Jism tarkibi va haroratini bilish uchun', 'Og‘irlikni o‘lchash uchun', 'Rangni chizish uchun'], 'Jism tarkibi va haroratini bilish uchun'],
  ['Qaysi sayyorada Buyuk Qizil Dog‘ joylashgan?', ['Mars', 'Yupiter', 'Saturn', 'Neptun'], 'Yupiter'],
  ['Yulduzlarning hayot sikli asosan nimaga bog‘liq?', ['Faqat rangiga', 'Massasiga', 'Faqat joylashuviga', 'Faqat yo‘ldoshlariga'], 'Massasiga'],
  ['Qaysi osmon jismi Yer atmosferasiga kirganda yorqin iz qoldiradi?', ['Galaktika', 'Meteor', 'Pulsar', 'Qora tuynuk'], 'Meteor'],
  ['Qaysi apparat Quyosh sistemasining tashqi sayyoralarini o‘rgangan mashhur zondlardan biri?', ['Voyager', 'Apollo', 'Soyuz', 'Skylab'], 'Voyager'],
  ['Quyosh tizimidan tashqaridagi hayotga mos hudud odatda nima deb ataladi?', ['Qora zona', 'Yashashga yaroqli zona', 'Magnit halqa', 'Chang yo‘li'], 'Yashashga yaroqli zona'],
  ['Qaysi sayyoraning markazida metall vodorod bo‘lishi mumkin deb qaraladi?', ['Yupiter', 'Mars', 'Yer', 'Merkuriy'], 'Yupiter'],
  ['Yulduzning ko‘rinma yorqinligi nimaga ham bog‘liq?', ['Faqat rangiga', 'Masofasiga', 'Faqat aylanishiga', 'Faqat yo‘ldoshiga'], 'Masofasiga'],
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
