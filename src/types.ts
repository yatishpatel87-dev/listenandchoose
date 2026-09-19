export type VocabularyLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  gujarati: string;
  englishDefinition: string;
  exampleSentence: string;
  options: string[];
  correctWord: string;
  level: VocabularyLevel;
  category: string;
}

export interface StudentProfile {
  name: string;
  avatar: string;
  grade: string;
}

export interface QuestionAnswer {
  questionNumber: number;
  word: VocabularyWord;
  selectedWord: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  avatar: string;
  grade: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  level: VocabularyLevel;
  date: string;
  timestamp: number;
  livesRemaining: number;
  timeTakenSeconds: number;
  rankTitle: string;
}

export type QuizStatus = 'setup' | 'playing' | 'answered' | 'gameover' | 'completed';
