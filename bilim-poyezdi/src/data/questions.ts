import type { Question } from '../types/game'

export const QUESTION_BANK: Question[] = [
  // Math Easy (8)
  { id: 'me1', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: '48 + 27 = ?', answer: '75' },
  { id: 'me2', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Which is a prime number?', options: ['21', '29', '35', '39'], answer: '29' },
  { id: 'me3', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: '9 × 7 = ?', answer: '63' },
  { id: 'me4', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: '1/2 of 36 is...', options: ['12', '18', '24', '16'], answer: '18' },
  { id: 'me5', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: 'Perimeter of a square with side 6 cm?', answer: '24' },
  { id: 'me6', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Roman numeral X means...', options: ['5', '10', '50', '100'], answer: '10' },
  { id: 'me7', subject: 'Math', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7'], prompt: '1000 - 458 = ?', answer: '542' },
  { id: 'me8', subject: 'Math', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'How many degrees are in a right angle?', options: ['45', '60', '90', '180'], answer: '90' },

  // Math Medium (8)
  { id: 'mm1', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: 'Solve: 3x + 5 = 20. x = ?', answer: '5' },
  { id: 'mm2', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: 'Which is equivalent to 0.125?', options: ['1/4', '1/8', '1/16', '3/8'], answer: '1/8' },
  { id: 'mm3', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: 'Area of rectangle 12 × 9 = ?', answer: '108' },
  { id: 'mm4', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: 'The value of 2^5 is...', options: ['10', '16', '32', '64'], answer: '32' },
  { id: 'mm5', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['8-11'], prompt: 'If y = 4 and x = 3, find 2x + y.', answer: '10' },
  { id: 'mm6', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'A triangle has angles 40° and 70°. Third angle?', options: ['60°', '70°', '80°', '90°'], answer: '70°' },
  { id: 'mm7', subject: 'Math', difficulty: 'medium', type: 'numeric', gradeModes: ['8-11'], prompt: 'Mean of 4, 8, 12, 16 = ?', answer: '10' },
  { id: 'mm8', subject: 'Math', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Which fraction is largest?', options: ['3/5', '2/3', '5/8', '7/12'], answer: '2/3' },

  // Math Hard (8)
  { id: 'mh1', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: 'Solve: 2(x - 3) = 14. x = ?', answer: '10' },
  { id: 'mh2', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Roots of x² - 9 = 0 are...', options: ['±3', '3 only', '-3 only', '±9'], answer: '±3' },
  { id: 'mh3', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: 'Slope of line through (1,2) and (5,10)?', answer: '2' },
  { id: 'mh4', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Simplify: (a^3 · a^2) =', options: ['a^5', 'a^6', '2a^5', 'a'], answer: 'a^5' },
  { id: 'mh5', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: '15% of 240 = ?', answer: '36' },
  { id: 'mh6', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'The discriminant of x² + 4x + 4 is...', options: ['0', '4', '8', '16'], answer: '0' },
  { id: 'mh7', subject: 'Math', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: 'If 5 workers finish a job in 12 days, worker-days = ?', answer: '60' },
  { id: 'mh8', subject: 'Math', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'sin(90°) = ?', options: ['0', '1', '-1', '1/2'], answer: '1' },

  // Science (8)
  { id: 'sc1', subject: 'Science', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 'Mars' },
  { id: 'sc2', subject: 'Science', difficulty: 'easy', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: 'How many legs does an insect have?', answer: '6' },
  { id: 'sc3', subject: 'Science', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Water boils at what temperature (°C) at sea level?', options: ['90', '95', '100', '110'], answer: '100' },
  { id: 'sc4', subject: 'Science', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: 'The gas most abundant in Earth atmosphere is...', options: ['Oxygen', 'Nitrogen', 'CO2', 'Hydrogen'], answer: 'Nitrogen' },
  { id: 'sc5', subject: 'Science', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Which organelle is known as the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], answer: 'Mitochondria' },
  { id: 'sc6', subject: 'Science', difficulty: 'medium', type: 'numeric', gradeModes: ['8-11'], prompt: 'How many chromosomes are in a typical human body cell?', answer: '46' },
  { id: 'sc7', subject: 'Science', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'The chemical symbol Fe stands for...', options: ['Fluorine', 'Iron', 'Francium', 'Fermium'], answer: 'Iron' },
  { id: 'sc8', subject: 'Science', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'Plants make food by...', options: ['Fermentation', 'Photosynthesis', 'Respiration', 'Digestion'], answer: 'Photosynthesis' },

  // Logic (8)
  { id: 'lg1', subject: 'Logic', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'What comes next: 2, 4, 8, 16, ...?', options: ['18', '20', '24', '32'], answer: '32' },
  { id: 'lg2', subject: 'Logic', difficulty: 'medium', type: 'numeric', gradeModes: ['5-7', '8-11'], prompt: 'I am an odd number. Remove one letter and I become even. How many am I?', answer: '7' },
  { id: 'lg3', subject: 'Logic', difficulty: 'medium', type: 'mcq', gradeModes: ['8-11'], prompt: 'All squares are rectangles. Some rectangles are blue. Which is always true?', options: ['All blue things are squares', 'Some squares are blue', 'All squares are rectangles', 'No rectangles are blue'], answer: 'All squares are rectangles' },
  { id: 'lg4', subject: 'Logic', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'Which number does not belong: 2, 3, 5, 9, 11?', options: ['2', '3', '5', '9'], answer: '9' },
  { id: 'lg5', subject: 'Logic', difficulty: 'easy', type: 'mcq', gradeModes: ['5-7'], prompt: 'If TODAY is coded as 12345, what is the first letter code of TODAY?', options: ['1', '2', '3', '4'], answer: '1' },
  { id: 'lg6', subject: 'Logic', difficulty: 'hard', type: 'numeric', gradeModes: ['8-11'], prompt: 'A clock shows 3:00. What is the smaller angle between hands?', answer: '90' },
  { id: 'lg7', subject: 'Logic', difficulty: 'medium', type: 'mcq', gradeModes: ['5-7', '8-11'], prompt: 'Find the pattern: 1, 1, 2, 3, 5, 8, ...', options: ['11', '12', '13', '15'], answer: '13' },
  { id: 'lg8', subject: 'Logic', difficulty: 'hard', type: 'mcq', gradeModes: ['8-11'], prompt: 'If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are...', options: ['Lazzies', 'Not Lazzies', 'Sometimes Lazzies', 'None'], answer: 'Lazzies' },

]
