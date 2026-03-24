import type { Question } from '../types/game'

export const QUESTION_BANK: Question[] = [
  // Math Easy (8)
  { id: 'me1', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: '48 + 27 = ?', answer: '75' },
  { id: 'me2', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Qaysi son tub son?', options: ['21', '29', '35', '39'], answer: '29' },
  { id: 'me3', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: '9 × 7 = ?', answer: '63' },
  { id: 'me4', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: '36 ning 1/2 qismi nechaga teng?', options: ['12', '18', '24', '16'], answer: '18' },
  { id: 'me5', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: 'Tomoni 6 sm bo‘lgan kvadrat perimetri?', answer: '24' },
  { id: 'me6', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Rim raqami X nimani bildiradi?', options: ['5', '10', '50', '100'], answer: '10' },
  { id: 'me7', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: '1000 - 458 = ?', answer: '542' },
  { id: 'me8', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'To‘g‘ri burchak necha gradus?', options: ['45', '60', '90', '180'], answer: '90' },

  // Math Medium (8)
  { id: 'mm1', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: 'Yeching: 3x + 5 = 20. x = ?', answer: '5' },
  { id: 'mm2', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: '0.125 ga teng kasr qaysi?', options: ['1/4', '1/8', '1/16', '3/8'], answer: '1/8' },
  { id: 'mm3', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: '12 × 9 to‘rtburchak yuzi = ?', answer: '108' },
  { id: 'mm4', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: '2^5 qiymati nechaga teng?', options: ['10', '16', '32', '64'], answer: '32' },
  { id: 'mm5', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['8-11'], prompt: 'Agar y = 4 va x = 3 bo‘lsa, 2x + y ni toping.', answer: '10' },
  { id: 'mm6', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Uchburchak burchaklari 40° va 70°. Uchinchi burchak?', options: ['60°', '70°', '80°', '90°'], answer: '70°' },
  { id: 'mm7', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['8-11'], prompt: '4, 8, 12, 16 sonlarining o‘rta arifmetigi?', answer: '10' },
  { id: 'mm8', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Qaysi kasr eng katta?', options: ['3/5', '2/3', '5/8', '7/12'], answer: '2/3' },

  // Math Hard (8)
  { id: 'mh1', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: 'Yeching: 2(x - 3) = 14. x = ?', answer: '10' },
  { id: 'mh2', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'x² - 9 = 0 tenglamaning ildizlari...', options: ['±3', 'faqat 3', 'faqat -3', '±9'], answer: '±3' },
  { id: 'mh3', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: '(1,2) va (5,10) nuqtalardan o‘tuvchi chiziqning og‘ish koeffitsiyenti?', answer: '2' },
  { id: 'mh4', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Soddalashtiring: (a^3 · a^2) =', options: ['a^5', 'a^6', '2a^5', 'a'], answer: 'a^5' },
  { id: 'mh5', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: '240 ning 15% i nechaga teng?', answer: '36' },
  { id: 'mh6', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'x² + 4x + 4 diskriminanti nechaga teng?', options: ['0', '4', '8', '16'], answer: '0' },
  { id: 'mh7', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: '5 ishchi ishni 12 kunda tugatsa, ishchi-kun soni?', answer: '60' },
  { id: 'mh8', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'sin(90°) = ?', options: ['0', '1', '-1', '1/2'], answer: '1' },

  // Science (8)
  { id: 'sc1', subject: 'Science', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Qaysi sayyora “Qizil sayyora” deb ataladi?', options: ['Venera', 'Mars', 'Yupiter', 'Merkuriy'], answer: 'Mars' },
  { id: 'sc2', subject: 'Science', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: 'Hasharotning nechta oyog‘i bo‘ladi?', answer: '6' },
  { id: 'sc3', subject: 'Science', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Dengiz sathida suv necha °C da qaynaydi?', options: ['90', '95', '100', '110'], answer: '100' },
  { id: 'sc4', subject: 'Science', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: 'Yer atmosferasida eng ko‘p uchraydigan gaz qaysi?', options: ['Kislorod', 'Azot', 'CO2', 'Vodorod'], answer: 'Azot' },
  { id: 'sc5', subject: 'Science', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Hujayraning “energiya stansiyasi” deb ataladigan organella?', options: ['Yadro', 'Ribosoma', 'Mitoxondriya', 'Golji apparati'], answer: 'Mitoxondriya' },
  { id: 'sc6', subject: 'Science', difficulty: 'medium', type: 'numeric', gradeModes: ['8-11'], prompt: 'Odam tanasi hujayrasida odatda nechta xromosoma bo‘ladi?', answer: '46' },
  { id: 'sc7', subject: 'Science', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Fe kimyoviy belgisi qaysi elementga tegishli?', options: ['Ftor', 'Temir', 'Fransiy', 'Fermiy'], answer: 'Temir' },
  { id: 'sc8', subject: 'Science', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'O‘simliklar oziqani qanday jarayon orqali hosil qiladi?', options: ['Fermentatsiya', 'Fotosintez', 'Nafas olish', 'Hazm qilish'], answer: 'Fotosintez' },

  // Logic (8)
  { id: 'lg1', subject: 'Logic', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Keyingi son qaysi: 2, 4, 8, 16, ...?', options: ['18', '20', '24', '32'], answer: '32' },
  { id: 'lg2', subject: 'Logic', difficulty: 'medium', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: 'Men toq sonman. Bitta harfni olib tashlasang juft bo‘laman. Men nechiman?', answer: '7' },
  { id: 'lg3', subject: 'Logic', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: 'Barcha kvadratlar to‘rtburchak. Baʼzi to‘rtburchaklar ko‘k. Qaysi gap doimo to‘g‘ri?', options: ['Barcha ko‘k narsalar kvadrat', 'Baʼzi kvadratlar ko‘k', 'Barcha kvadratlar to‘rtburchak', 'Hech bir to‘rtburchak ko‘k emas'], answer: 'Barcha kvadratlar to‘rtburchak' },
  { id: 'lg4', subject: 'Logic', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Qaysi son boshqalariga mos kelmaydi: 2, 3, 5, 9, 11?', options: ['2', '3', '5', '9'], answer: '9' },
  { id: 'lg5', subject: 'Logic', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Agar TODAY so‘zi 12345 deb kodlansa, TODAY so‘zining birinchi harfi kodi nechchi?', options: ['1', '2', '3', '4'], answer: '1' },
  { id: 'lg6', subject: 'Logic', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: 'Soat 3:00 ni ko‘rsatmoqda. Strelkalar orasidagi kichik burchak nechchi gradus?', answer: '90' },
  { id: 'lg7', subject: 'Logic', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Qonuniyatni toping: 1, 1, 2, 3, 5, 8, ...', options: ['11', '12', '13', '15'], answer: '13' },
  { id: 'lg8', subject: 'Logic', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Agar barcha Bloopslar Razzies bo‘lsa va barcha Razzieslar Lazzies bo‘lsa, unda barcha Bloopslar ...', options: ['Lazzies', 'Lazzies emas', 'Baʼzan Lazzies', 'Hech qaysisi'], answer: 'Lazzies' },

]
