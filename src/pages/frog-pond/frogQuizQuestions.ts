export type FrogQuizQuestion = {
  subject: string
  question: string
  options: [string, string, string, string]
  answer: string
}

export const frogQuizQuestions: FrogQuizQuestion[][] = [
  [
    {
      subject: 'Matematika',
      question: 'Agar 2x + 7 = 19 bo‘lsa, x ning qiymatini toping.',
      options: ['5', '6', '7', '8'],
      answer: '6',
    },
    {
      subject: 'Biologiya',
      question: 'Fotosintez jarayonida o‘simliklar asosan qaysi gazni yutadi?',
      options: ['Kislorod', 'Vodorod', 'Karbonat angidrid', 'Azot'],
      answer: 'Karbonat angidrid',
    },
    {
      subject: 'Tarix',
      question: 'Amir Temur davlati poytaxti asosan qaysi shahar bo‘lgan?',
      options: ['Buxoro', 'Samarqand', 'Xiva', 'Termiz'],
      answer: 'Samarqand',
    },
    {
      subject: 'Kimyo',
      question: 'Davriy jadvalda O belgisi bilan ifodalanadigan element qaysi?',
      options: ['Oltin', 'Osmiy', 'Kislorod', 'Oltingugurt'],
      answer: 'Kislorod',
    },
    {
      subject: 'Geografiya',
      question: 'Yer yuzasidagi eng katta cho‘l qaysi?',
      options: ['Sahara', 'Gobi', 'Arabiston cho‘li', 'Qoraqum'],
      answer: 'Sahara',
    },
  ],
  [
    {
      subject: 'Fizika',
      question: 'Jismning tezligi vaqt birligida o‘zgarishi nima deyiladi?',
      options: ['Bosim', 'Tezlanish', 'Kuch', 'Impuls'],
      answer: 'Tezlanish',
    },
    {
      subject: 'Ingliz tili',
      question: 'Quyidagi gaplardan qaysi biri Present Perfect zamonida yozilgan?',
      options: [
        'I go to school every day.',
        'I went to school yesterday.',
        'I have finished my homework.',
        'I was finishing my homework.',
      ],
      answer: 'I have finished my homework.',
    },
    {
      subject: 'Matematika',
      question: 'To‘g‘ri to‘rtburchakning uzunligi 12 sm, eni 5 sm. Uning yuzini toping.',
      options: ['17', '60', '34', '24'],
      answer: '60',
    },
    {
      subject: 'Biologiya',
      question: 'Qon tarkibida kislorodni tashuvchi modda qaysi?',
      options: ['Insulin', 'Gemoglobin', 'Adrenalin', 'Plazma'],
      answer: 'Gemoglobin',
    },
    {
      subject: 'Tarix',
      question: 'Mirzo Ulug‘bek asosan qaysi sohada mashhur bo‘lgan?',
      options: ['Tabobat', 'Astronomiya', 'Me’morchilik', 'Adabiyot'],
      answer: 'Astronomiya',
    },
  ],
  [
    {
      subject: 'Kimyo',
      question: 'Kislotalar tarkibida odatda qaysi ion bo‘ladi?',
      options: ['OH⁻', 'H⁺', 'Na⁺', 'Cl⁻'],
      answer: 'H⁺',
    },
    {
      subject: 'Geografiya',
      question: 'O‘zbekiston qaysi materikda joylashgan?',
      options: ['Yevropa', 'Osiyo', 'Afrika', 'Janubiy Amerika'],
      answer: 'Osiyo',
    },
    {
      subject: 'Fizika',
      question: 'Elektr tok kuchining o‘lchov birligi qaysi?',
      options: ['Volt', 'Om', 'Amper', 'Vatt'],
      answer: 'Amper',
    },
    {
      subject: 'Ingliz tili',
      question: 'Quyidagi variantlardan qaysi biri to‘g‘ri tuzilgan shartli gap?',
      options: [
        'If I will see him, I tell him.',
        'If I saw him, I would tell him.',
        'If I see him, I would tell him.',
        'If I had saw him, I will tell him.',
      ],
      answer: 'If I saw him, I would tell him.',
    },
    {
      subject: 'Matematika',
      question: 'Agar kvadratning tomoni 9 sm bo‘lsa, uning perimetrini toping.',
      options: ['18', '27', '36', '81'],
      answer: '36',
    },
  ],
  [
    {
      subject: 'Biologiya',
      question: 'Inson organizmida ovqat hazm bo‘lishi asosan qaysi a’zoda davom etadi?',
      options: ['Yurak', 'O‘pka', 'Oshqozon', 'Buyrak'],
      answer: 'Oshqozon',
    },
    {
      subject: 'Tarix',
      question: 'Jadidchilik harakati asosan nimaga qaratilgan edi?',
      options: [
        'Faqat harbiy yurishlarga',
        'Yangi usuldagi ta’lim va islohotlarga',
        'Faqat savdo rivojiga',
        'Faqat qishloq xo‘jaligiga',
      ],
      answer: 'Yangi usuldagi ta’lim va islohotlarga',
    },
    {
      subject: 'Kimyo',
      question: 'Suvning qaynash harorati normal atmosfera bosimida necha daraja Selsiyga teng?',
      options: ['90', '95', '100', '110'],
      answer: '100',
    },
    {
      subject: 'Geografiya',
      question: 'Dunyoning eng uzun daryosi sifatida ko‘pincha qaysi daryo ko‘rsatiladi?',
      options: ['Amazonka', 'Nil', 'Volga', 'Yanszi'],
      answer: 'Nil',
    },
    {
      subject: 'Ingliz tili',
      question: 'Quyidagi gaplarning qaysi birida modal fe’l to‘g‘ri ishlatilgan?',
      options: [
        'He can to swim very well.',
        'He can swim very well.',
        'He cans swim very well.',
        'He can swimming very well.',
      ],
      answer: 'He can swim very well.',
    },
  ],
  [
    {
      subject: 'Fizika',
      question: "Quyosh sistemasida 'Qizil sayyora' deb ataladigan sayyora qaysi?",
      options: ['Venera', 'Mars', 'Yupiter', 'Merkuriy'],
      answer: 'Mars',
    },
    {
      subject: 'Matematika',
      question: '3² + 4² ifodaning qiymatini toping.',
      options: ['12', '25', '49', '7'],
      answer: '25',
    },
    {
      subject: 'Biologiya',
      question: 'DNK ning asosiy vazifasi nima?',
      options: [
        'Ovqat hazm qilish',
        'Energiya ishlab chiqarish',
        'Irsiy axborotni saqlash',
        'Qon aylanishini boshqarish',
      ],
      answer: 'Irsiy axborotni saqlash',
    },
    {
      subject: 'Tarix',
      question: 'O‘zbekiston mustaqilligi qaysi yilda e’lon qilingan?',
      options: ['1989', '1990', '1991', '1992'],
      answer: '1991',
    },
    {
      subject: 'Geografiya',
      question: 'Kompas ignasi asosan qaysi yo‘nalishni ko‘rsatishga intiladi?',
      options: ['Sharq-g‘arb', 'Shimol-janub', 'Faqat sharq', 'Faqat janub'],
      answer: 'Shimol-janub',
    },
  ],
]

export const frogQuizStageTwoQuestions: FrogQuizQuestion[][] = [
  [
    {
      subject: 'Matematika',
      question: 'Agar 3x - 5 = 2x + 11 bo‘lsa, x ni toping.',
      options: ['14', '15', '16', '17'],
      answer: '16',
    },
    {
      subject: 'Geografiya',
      question: 'Ekvatorga eng yaqin joylashgan materik qaysi?',
      options: ['Yevropa', 'Afrika', 'Avstraliya', 'Antarktida'],
      answer: 'Afrika',
    },
    {
      subject: 'Matematika',
      question: 'To‘g‘ri burchakli uchburchakda katetlar 6 va 8 ga teng. Gipotenuzani toping.',
      options: ['10', '12', '14', '48'],
      answer: '10',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi davlat hududi ikki qit’ada joylashgan deb qaraladi?',
      options: ['Misr', 'Turkiya', 'Hindiston', 'Meksika'],
      answer: 'Turkiya',
    },
    {
      subject: 'Matematika',
      question: '25% ning kasr ko‘rinishi qaysi?',
      options: ['1/2', '1/3', '1/4', '1/5'],
      answer: '1/4',
    },
  ],
  [
    {
      subject: 'Geografiya',
      question: 'Dunyoning eng chuqur ko‘li qaysi?',
      options: ['Viktoriya', 'Baykal', 'Kaspiy', 'Tanganika'],
      answer: 'Baykal',
    },
    {
      subject: 'Matematika',
      question: 'Agar aylana radiusi 7 bo‘lsa, diametri nechaga teng?',
      options: ['7', '10.5', '14', '21'],
      answer: '14',
    },
    {
      subject: 'Matematika',
      question: '2(3x + 4) = 26 tenglamada x ni toping.',
      options: ['2', '3', '4', '5'],
      answer: '3',
    },
    {
      subject: 'Geografiya',
      question: 'Atlantika okeani qaysi ikki materik orasida joylashgan?',
      options: ['Osiyo va Afrika', 'Yevropa/Afrika va Amerika', 'Avstraliya va Osiyo', 'Afrika va Avstraliya'],
      answer: 'Yevropa/Afrika va Amerika',
    },
    {
      subject: 'Matematika',
      question: '3/4 ning 20 ga ko‘paytmasi nechaga teng?',
      options: ['12', '15', '16', '18'],
      answer: '15',
    },
  ],
  [
    {
      subject: 'Matematika',
      question: 'Agar x² = 81 bo‘lsa, x ning musbat qiymati qaysi?',
      options: ['7', '8', '9', '10'],
      answer: '9',
    },
    {
      subject: 'Geografiya',
      question: 'Nil daryosi asosan qaysi dengizga quyiladi?',
      options: ['Qora dengiz', 'O‘rta yer dengizi', 'Arab dengizi', 'Qizil dengiz'],
      answer: 'O‘rta yer dengizi',
    },
    {
      subject: 'Matematika',
      question: '120 ning 15% i nechaga teng?',
      options: ['16', '18', '20', '24'],
      answer: '18',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi tog‘ tizmasi Yevropa bilan Osiyo chegaralaridan biri hisoblanadi?',
      options: ['And', 'Alp', 'Ural', 'Kordilyera'],
      answer: 'Ural',
    },
    {
      subject: 'Matematika',
      question: 'Perimetri 36 sm bo‘lgan kvadratning tomoni necha sm?',
      options: ['6', '8', '9', '12'],
      answer: '9',
    },
  ],
  [
    {
      subject: 'Geografiya',
      question: 'Janubiy Amerikadagi eng uzun tog‘ tizmasi qaysi?',
      options: ['Alp', 'And', 'Atlas', 'Himolay'],
      answer: 'And',
    },
    {
      subject: 'Matematika',
      question: '5x + 12 = 47 bo‘lsa, x ni toping.',
      options: ['5', '6', '7', '8'],
      answer: '7',
    },
    {
      subject: 'Matematika',
      question: '0.75 sonining foiz ko‘rinishi qaysi?',
      options: ['7.5%', '75%', '57%', '750%'],
      answer: '75%',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi materikda davlatlar soni eng ko‘p?',
      options: ['Osiyo', 'Afrika', 'Yevropa', 'Janubiy Amerika'],
      answer: 'Afrika',
    },
    {
      subject: 'Matematika',
      question: 'Agar kubning qirrasi 3 bo‘lsa, uning hajmi nechaga teng?',
      options: ['9', '18', '27', '36'],
      answer: '27',
    },
  ],
  [
    {
      subject: 'Geografiya',
      question: 'Dunyoning eng katta oroli qaysi?',
      options: ['Madagaskar', 'Borneo', 'Grenlandiya', 'Yangi Gvineya'],
      answer: 'Grenlandiya',
    },
    {
      subject: 'Matematika',
      question: 'Agar 4x - 9 = 27 bo‘lsa, x ni toping.',
      options: ['8', '9', '10', '11'],
      answer: '9',
    },
    {
      subject: 'Matematika',
      question: '1.2 + 0.35 yig‘indisi nechaga teng?',
      options: ['1.45', '1.55', '1.65', '1.75'],
      answer: '1.55',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi okean maydoni jihatidan eng kichik?',
      options: ['Atlantika', 'Shimoliy Muz', 'Hind', 'Tinch'],
      answer: 'Shimoliy Muz',
    },
    {
      subject: 'Matematika',
      question: 'Agar sonning 1/5 qismi 9 ga teng bo‘lsa, o‘sha son nechaga teng?',
      options: ['35', '40', '45', '50'],
      answer: '45',
    },
  ],
  [
    {
      subject: 'Matematika',
      question: 'x/4 + 6 = 15 tenglamada x ni toping.',
      options: ['24', '30', '36', '42'],
      answer: '36',
    },
    {
      subject: 'Geografiya',
      question: 'Kaspiy dengizi aslida nimaga kiradi?',
      options: ['Okean qo‘ltig‘i', 'Yopiq ko‘l', 'Daryo deltasi', 'Sun’iy suv ombori'],
      answer: 'Yopiq ko‘l',
    },
    {
      subject: 'Matematika',
      question: '7 ning kvadrati bilan 5 ning kvadrati ayirmasi nechaga teng?',
      options: ['20', '24', '25', '30'],
      answer: '24',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi davlat aholisi soni bo‘yicha dunyoda birinchi o‘rinda turadi?',
      options: ['AQSh', 'Hindiston', 'Xitoy', 'Indoneziya'],
      answer: 'Hindiston',
    },
    {
      subject: 'Matematika',
      question: '12 va 18 sonlarining EKUB ini toping.',
      options: ['3', '6', '9', '12'],
      answer: '6',
    },
  ],
  [
    {
      subject: 'Geografiya',
      question: 'Qaysi cho‘l Janubiy Amerikada joylashgan?',
      options: ['Gobi', 'Atakama', 'Kalahari', 'Sahara'],
      answer: 'Atakama',
    },
    {
      subject: 'Matematika',
      question: 'Agar funksiyada y = 2x + 3 va x = 5 bo‘lsa, y nechaga teng?',
      options: ['11', '12', '13', '14'],
      answer: '13',
    },
    {
      subject: 'Matematika',
      question: '90 ning 2/3 qismi nechaga teng?',
      options: ['45', '50', '60', '70'],
      answer: '60',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi mamlakat ikkita poytaxtga ega emas?',
      options: ['Janubiy Afrika Respublikasi', 'Boliviya', 'Niderlandiya', 'Fransiya'],
      answer: 'Fransiya',
    },
    {
      subject: 'Matematika',
      question: '6, 9 va 15 sonlarining EKUK ini toping.',
      options: ['30', '45', '60', '90'],
      answer: '90',
    },
  ],
]

export const frogQuizStageThreeQuestions: FrogQuizQuestion[][] = [
  [
    {
      subject: 'Matematika',
      question: 'Agar 2x + 3y = 18 va x = 3 bo‘lsa, y ni toping.',
      options: ['2', '3', '4', '5'],
      answer: '4',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi parallel Yer sharini Shimoliy va Janubiy yarimsharlarga ajratadi?',
      options: ['Bosh meridian', 'Saraton tropigi', 'Ekvator', 'Qutb doirasi'],
      answer: 'Ekvator',
    },
    {
      subject: 'Matematika',
      question: '12% ning o‘nli kasr ko‘rinishi qaysi?',
      options: ['0.012', '0.12', '1.2', '12.0'],
      answer: '0.12',
    },
    {
      subject: 'Geografiya',
      question: 'Volga daryosi qaysi dengizga quyiladi?',
      options: ['Qora dengiz', 'Kaspiy dengizi', 'Baltika dengizi', 'O‘rta yer dengizi'],
      answer: 'Kaspiy dengizi',
    },
    {
      subject: 'Matematika',
      question: 'Agar a = 5 va b = 2 bo‘lsa, 3a - 2b ifodaning qiymati nechaga teng?',
      options: ['7', '9', '11', '13'],
      answer: '11',
    },
  ],
  [
    {
      subject: 'Geografiya',
      question: 'Dunyoning eng baland sharsharasi qaysi?',
      options: ['Niagara', 'Viktoriya', 'Anxel', 'Iguasu'],
      answer: 'Anxel',
    },
    {
      subject: 'Matematika',
      question: 'Agar sonning 35% i 70 ga teng bo‘lsa, sonning o‘zi nechaga teng?',
      options: ['180', '190', '200', '210'],
      answer: '200',
    },
    {
      subject: 'Matematika',
      question: 'x² - 16 = 0 tenglamaning musbat yechimi qaysi?',
      options: ['2', '4', '6', '8'],
      answer: '4',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi iqlim mintaqasida yil davomida yog‘in juda kam bo‘ladi?',
      options: ['Musson', 'Cho‘l', 'Ekvatorial', 'Mo‘tadil dengiz'],
      answer: 'Cho‘l',
    },
    {
      subject: 'Matematika',
      question: '3, 6 va 9 sonlarining EKUK ini toping.',
      options: ['9', '12', '18', '27'],
      answer: '18',
    },
  ],
  [
    {
      subject: 'Matematika',
      question: 'Agar funksiyada y = 4x - 7 va x = 6 bo‘lsa, y nechaga teng?',
      options: ['15', '17', '19', '24'],
      answer: '17',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi okean Amerika bilan Yevropa/Afrika orasida joylashgan?',
      options: ['Hind', 'Shimoliy Muz', 'Atlantika', 'Tinch'],
      answer: 'Atlantika',
    },
    {
      subject: 'Matematika',
      question: '36 sonining kvadrat ildizi nechaga teng?',
      options: ['5', '6', '7', '8'],
      answer: '6',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi mamlakatning poytaxti Kanberra?',
      options: ['Kanada', 'Avstraliya', 'Yangi Zelandiya', 'Avstriya'],
      answer: 'Avstraliya',
    },
    {
      subject: 'Matematika',
      question: 'Agar trapetsiyaning asoslari 8 va 12, balandligi 5 bo‘lsa, yuzi nechaga teng?',
      options: ['40', '45', '50', '55'],
      answer: '50',
    },
  ],
  [
    {
      subject: 'Geografiya',
      question: 'Qaysi materik butunlay Janubiy yarimsharda joylashgan?',
      options: ['Osiyo', 'Yevropa', 'Avstraliya', 'Shimoliy Amerika'],
      answer: 'Avstraliya',
    },
    {
      subject: 'Matematika',
      question: '0.125 sonining kasr ko‘rinishi qaysi?',
      options: ['1/4', '1/5', '1/8', '1/10'],
      answer: '1/8',
    },
    {
      subject: 'Matematika',
      question: 'Agar 5x = 3x + 18 bo‘lsa, x ni toping.',
      options: ['7', '8', '9', '10'],
      answer: '9',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi daryo Braziliya hududidan oqib o‘tadi?',
      options: ['Nil', 'Amazonka', 'Dunay', 'Gang'],
      answer: 'Amazonka',
    },
    {
      subject: 'Matematika',
      question: 'Agar aylana diametri 18 bo‘lsa, radiusi nechaga teng?',
      options: ['6', '8', '9', '12'],
      answer: '9',
    },
  ],
  [
    {
      subject: 'Matematika',
      question: '15 va 20 sonlarining EKUK ini toping.',
      options: ['40', '50', '60', '80'],
      answer: '60',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi dengiz okean bilan tabiiy bog‘lanmagan yopiq suv havzasi hisoblanadi?',
      options: ['Kaspiy', 'Arab', 'Karib', 'Bering'],
      answer: 'Kaspiy',
    },
    {
      subject: 'Matematika',
      question: 'Agar uchburchak burchaklari 45°, 45° va 90° bo‘lsa, u qanday uchburchak?',
      options: ['Turli tomonli', 'Teng yonli to‘g‘ri burchakli', 'O‘tkir burchakli', 'O‘tmas burchakli'],
      answer: 'Teng yonli to‘g‘ri burchakli',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi shahar Buyuk Britaniyaning poytaxti?',
      options: ['Manchester', 'London', 'Dublin', 'Edinburg'],
      answer: 'London',
    },
    {
      subject: 'Matematika',
      question: 'Agar sonning 40% i 32 bo‘lsa, son nechaga teng?',
      options: ['60', '70', '80', '90'],
      answer: '80',
    },
  ],
  [
    {
      subject: 'Geografiya',
      question: 'Qaysi qit’ada eng ko‘p muzliklar mavjud?',
      options: ['Yevropa', 'Osiyo', 'Antarktida', 'Afrika'],
      answer: 'Antarktida',
    },
    {
      subject: 'Matematika',
      question: 'Agar parallelogrammning asosi 14 va balandligi 6 bo‘lsa, yuzi nechaga teng?',
      options: ['72', '78', '84', '90'],
      answer: '84',
    },
    {
      subject: 'Matematika',
      question: '7/10 ning foiz ko‘rinishi qaysi?',
      options: ['7%', '17%', '70%', '700%'],
      answer: '70%',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi davlat bayrog‘ida zarang bargi tasvirlangan?',
      options: ['Kanada', 'Meksika', 'Shvetsiya', 'Norvegiya'],
      answer: 'Kanada',
    },
    {
      subject: 'Matematika',
      question: 'Agar a:b = 3:5 va a = 18 bo‘lsa, b nechaga teng?',
      options: ['24', '28', '30', '32'],
      answer: '30',
    },
  ],
  [
    {
      subject: 'Matematika',
      question: '2³ + 3³ ifodaning qiymatini toping.',
      options: ['17', '25', '35', '45'],
      answer: '35',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi mamlakat Janubiy Amerikada joylashmagan?',
      options: ['Peru', 'Chili', 'Portugal', 'Argentina'],
      answer: 'Portugal',
    },
    {
      subject: 'Matematika',
      question: 'Agar 9x - 12 = 42 bo‘lsa, x ni toping.',
      options: ['4', '5', '6', '7'],
      answer: '6',
    },
    {
      subject: 'Geografiya',
      question: 'Qaysi okean Yer yuzasidagi eng katta okean hisoblanadi?',
      options: ['Atlantika', 'Hind', 'Tinch', 'Shimoliy Muz'],
      answer: 'Tinch',
    },
    {
      subject: 'Matematika',
      question: 'Agar romb diagonallari 10 va 12 bo‘lsa, yuzi nechaga teng?',
      options: ['44', '50', '60', '120'],
      answer: '60',
    },
  ],
]
