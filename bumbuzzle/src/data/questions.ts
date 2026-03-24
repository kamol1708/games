import type { Difficulty, GrammarQuestion, UnscrambleQuestion, VocabQuestion } from '../types/game'

const scramble = (word: string) => {
  const chars = word.toUpperCase().split('')
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = (i * 7 + 3) % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  const result = chars.join('')
  return result === word.toUpperCase() ? result.slice(1) + result[0] : result
}

const beginnerWords = [
  'apple', 'school', 'friend', 'window', 'yellow', 'garden', 'teacher', 'animal', 'pencil', 'market',
  'number', 'family', 'doctor', 'planet', 'rabbit', 'orange', 'summer', 'winter', 'banana', 'camera',
]

const intermediateWords = [
  'language', 'elephant', 'umbrella', 'adventure', 'knowledge', 'mountain', 'favorite', 'beautiful', 'computer', 'practice',
  'question', 'sentence', 'hospital', 'engineer', 'electric', 'chemistry', 'parallel', 'exercise', 'vacation', 'triangle',
]

export const UNSCRAMBLE_BANK: UnscrambleQuestion[] = [
  ...beginnerWords.map((word, idx) => ({
    type: 'word_puzzle' as const,
    id: `uw-b-${idx + 1}`,
    word: word.toUpperCase(),
    scrambled: scramble(word),
    difficulty: 'beginner' as Difficulty,
  })),
  ...intermediateWords.map((word, idx) => ({
    type: 'word_puzzle' as const,
    id: `uw-i-${idx + 1}`,
    word: word.toUpperCase(),
    scrambled: scramble(word),
    difficulty: 'intermediate' as Difficulty,
  })),
]

export const GRAMMAR_BANK: GrammarQuestion[] = [
  { type: 'sentence_fix', id: 'g-b-1', broken: 'She go to school yesterday.', corrected: 'She went to school yesterday.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-2', broken: 'He do his homework every night.', corrected: 'He does his homework every night.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-3', broken: 'They was happy after the game.', corrected: 'They were happy after the game.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-4', broken: 'I am play football now.', corrected: 'I am playing football now.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-5', broken: 'We has a test on Monday.', corrected: 'We have a test on Monday.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-6', broken: 'My brother can sings well.', corrected: 'My brother can sing well.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-7', broken: 'There is many books on the table.', corrected: 'There are many books on the table.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-8', broken: 'She don\'t like milk.', corrected: 'She doesn\'t like milk.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-9', broken: 'We were in home last night.', corrected: 'We were at home last night.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-10', broken: 'He is taller then me.', corrected: 'He is taller than me.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-11', broken: 'The childrens are playing.', corrected: 'The children are playing.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-12', broken: 'I have went there before.', corrected: 'I have been there before.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-13', broken: 'She was cooking when I am arrived.', corrected: 'She was cooking when I arrived.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-14', broken: 'Do you can help me?', corrected: 'Can you help me?', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-b-15', broken: 'He like to read comics.', corrected: 'He likes to read comics.', difficulty: 'beginner' },
  { type: 'sentence_fix', id: 'g-i-1', broken: 'If I will see him, I will tell him.', corrected: 'If I see him, I will tell him.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-2', broken: 'She has less books than her sister.', corrected: 'She has fewer books than her sister.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-3', broken: 'Neither Ali or Hasan was late.', corrected: 'Neither Ali nor Hasan was late.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-4', broken: 'By the time we arrived, the movie already started.', corrected: 'By the time we arrived, the movie had already started.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-5', broken: 'He suggested to go by bus.', corrected: 'He suggested going by bus.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-6', broken: 'The information are useful.', corrected: 'The information is useful.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-7', broken: 'I look forward to meet you.', corrected: 'I look forward to meeting you.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-8', broken: 'She said me that she was tired.', corrected: 'She told me that she was tired.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-9', broken: 'This is the most unique design.', corrected: 'This design is unique.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-10', broken: 'Hardly I had sat down when the bell rang.', corrected: 'Hardly had I sat down when the bell rang.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-11', broken: 'He is married with a doctor.', corrected: 'He is married to a doctor.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-12', broken: 'One of my friends are absent today.', corrected: 'One of my friends is absent today.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-13', broken: 'The teacher made us to rewrite the essay.', corrected: 'The teacher made us rewrite the essay.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-14', broken: 'He has been living here since five years.', corrected: 'He has been living here for five years.', difficulty: 'intermediate' },
  { type: 'sentence_fix', id: 'g-i-15', broken: 'No sooner she arrived than it started raining.', corrected: 'No sooner had she arrived than it started raining.', difficulty: 'intermediate' },
]

export const VOCAB_BANK: VocabQuestion[] = [
  { type: 'vocab_match', id: 'v-b-1', prompt: 'Choose the synonym of "happy"', options: ['sad', 'joyful', 'angry', 'tired'], answer: 'joyful', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-2', prompt: 'What does "tiny" mean?', options: ['very small', 'very loud', 'very fast', 'very old'], answer: 'very small', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-3', prompt: 'Choose the synonym of "quick"', options: ['slow', 'fast', 'late', 'weak'], answer: 'fast', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-4', prompt: 'What does "brave" mean?', options: ['afraid', 'careless', 'courageous', 'hungry'], answer: 'courageous', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-5', prompt: 'Choose the meaning of "borrow"', options: ['give forever', 'take and return later', 'break', 'hide'], answer: 'take and return later', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-6', prompt: 'Choose the synonym of "begin"', options: ['end', 'start', 'wait', 'close'], answer: 'start', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-7', prompt: 'What does "quiet" mean?', options: ['noisy', 'calm and silent', 'expensive', 'crowded'], answer: 'calm and silent', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-8', prompt: 'Choose the opposite of "full"', options: ['heavy', 'empty', 'round', 'short'], answer: 'empty', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-9', prompt: 'What does "answer" mean as a noun?', options: ['a question', 'a reply', 'a story', 'a mistake'], answer: 'a reply', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-10', prompt: 'Choose the synonym of "smart"', options: ['clever', 'dirty', 'silent', 'curly'], answer: 'clever', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-11', prompt: 'What does "journey" mean?', options: ['a trip', 'a meal', 'a game', 'a homework'], answer: 'a trip', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-12', prompt: 'Choose the meaning of "return"', options: ['come back', 'throw away', 'fall down', 'wake up'], answer: 'come back', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-13', prompt: 'Choose the synonym of "famous"', options: ['well-known', 'broken', 'cheap', 'local'], answer: 'well-known', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-14', prompt: 'What does "protect" mean?', options: ['to keep safe', 'to throw', 'to sell', 'to wash'], answer: 'to keep safe', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-b-15', prompt: 'Choose the opposite of "difficult"', options: ['hard', 'easy', 'small', 'new'], answer: 'easy', difficulty: 'beginner' },
  { type: 'vocab_match', id: 'v-i-1', prompt: 'Choose the synonym of "accurate"', options: ['exact', 'loud', 'complex', 'fragile'], answer: 'exact', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-2', prompt: 'What does "maintain" mean?', options: ['ignore', 'keep in good condition', 'destroy', 'discover'], answer: 'keep in good condition', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-3', prompt: 'Choose the synonym of "ancient"', options: ['modern', 'very old', 'quick', 'famous'], answer: 'very old', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-4', prompt: 'What does "reliable" mean?', options: ['can be trusted', 'expensive', 'unclear', 'temporary'], answer: 'can be trusted', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-5', prompt: 'Choose the meaning of "efficient"', options: ['works well without waste', 'very noisy', 'extremely difficult', 'outdated'], answer: 'works well without waste', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-6', prompt: 'Choose the synonym of "observe"', options: ['notice', 'forget', 'create', 'repair'], answer: 'notice', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-7', prompt: 'What does "predict" mean?', options: ['to guess future events', 'to hide data', 'to compare size', 'to follow rules'], answer: 'to guess future events', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-8', prompt: 'Choose the opposite of "expand"', options: ['increase', 'shrink', 'balance', 'measure'], answer: 'shrink', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-9', prompt: 'What does "evidence" mean?', options: ['proof', 'opinion', 'rumor', 'schedule'], answer: 'proof', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-10', prompt: 'Choose the synonym of "attempt"', options: ['effort', 'rest', 'habit', 'joke'], answer: 'effort', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-11', prompt: 'What does "conclude" mean?', options: ['begin', 'finish with a decision', 'repeat loudly', 'move slowly'], answer: 'finish with a decision', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-12', prompt: 'Choose the meaning of "resist"', options: ['to fight against', 'to accept quickly', 'to draw', 'to translate'], answer: 'to fight against', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-13', prompt: 'Choose the synonym of "benefit"', options: ['advantage', 'danger', 'repair', 'noise'], answer: 'advantage', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-14', prompt: 'What does "sufficient" mean?', options: ['not enough', 'enough', 'uncertain', 'impossible'], answer: 'enough', difficulty: 'intermediate' },
  { type: 'vocab_match', id: 'v-i-15', prompt: 'Choose the opposite of "permanent"', options: ['lasting', 'temporary', 'hidden', 'visible'], answer: 'temporary', difficulty: 'intermediate' },
]

export const SPELLING_SOURCE = [...UNSCRAMBLE_BANK].map((q) => ({
  id: `sp-${q.id}`,
  answer: q.word,
  difficulty: q.difficulty,
}))
