import { LeaderboardEntry, VocabularyLevel } from '../types';

const LEADERBOARD_STORAGE_KEY = 'listen_choose_leaderboard_v1';

const INITIAL_SEEDED_ENTRIES: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    studentName: 'Aarav Patel',
    avatar: '🦊',
    grade: 'Grade 8',
    score: 20,
    totalQuestions: 20,
    percentage: 100,
    level: 'master',
    date: '18 Sep 2026',
    timestamp: Date.now() - 86400000 * 2,
    livesRemaining: 3,
    timeTakenSeconds: 95,
    rankTitle: 'Master Virtuoso',
  },
  {
    id: 'seed-2',
    studentName: 'Diya Shah',
    avatar: '🦉',
    grade: 'Grade 9',
    score: 19,
    totalQuestions: 20,
    percentage: 95,
    level: 'advanced',
    date: '17 Sep 2026',
    timestamp: Date.now() - 86400000 * 3,
    livesRemaining: 2,
    timeTakenSeconds: 110,
    rankTitle: 'Proficient Scholar',
  },
  {
    id: 'seed-3',
    studentName: 'Yashwardhan Mehta',
    avatar: '🦁',
    grade: 'Grade 7',
    score: 19,
    totalQuestions: 20,
    percentage: 95,
    level: 'master',
    date: '18 Sep 2026',
    timestamp: Date.now() - 86400000 * 1,
    livesRemaining: 3,
    timeTakenSeconds: 125,
    rankTitle: 'Proficient Scholar',
  },
  {
    id: 'seed-4',
    studentName: 'Priya Joshi',
    avatar: '🐬',
    grade: 'Grade 6',
    score: 18,
    totalQuestions: 20,
    percentage: 90,
    level: 'intermediate',
    date: '16 Sep 2026',
    timestamp: Date.now() - 86400000 * 4,
    livesRemaining: 2,
    timeTakenSeconds: 135,
    rankTitle: 'Accomplished Learner',
  },
  {
    id: 'seed-5',
    studentName: 'Kavya Desai',
    avatar: '🦄',
    grade: 'Grade 8',
    score: 18,
    totalQuestions: 20,
    percentage: 90,
    level: 'beginner',
    date: '19 Sep 2026',
    timestamp: Date.now() - 86400000 * 0.5,
    livesRemaining: 3,
    timeTakenSeconds: 88,
    rankTitle: 'Accomplished Learner',
  },
  {
    id: 'seed-6',
    studentName: 'Rohan Trivedi',
    avatar: '🐯',
    grade: 'Grade 10',
    score: 17,
    totalQuestions: 20,
    percentage: 85,
    level: 'advanced',
    date: '15 Sep 2026',
    timestamp: Date.now() - 86400000 * 5,
    livesRemaining: 1,
    timeTakenSeconds: 155,
    rankTitle: 'Accomplished Learner',
  },
];

export function getVocabularyRankTitle(score: number, total: number = 20): {
  cefr: string;
  englishTitle: string;
  gujaratiTitle: string;
  gradeBadge: string;
  color: string;
} {
  const pct = Math.round((score / total) * 100);
  if (pct >= 95) {
    return {
      cefr: 'C2 - Mastery',
      englishTitle: 'Vocabulary Virtuoso',
      gujaratiTitle: 'પ્રવીણ શબ્દ સમ્રાટ',
      gradeBadge: 'A+',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    };
  }
  if (pct >= 85) {
    return {
      cefr: 'C1 - Advanced',
      englishTitle: 'Proficient Scholar',
      gujaratiTitle: 'વિદ્વાન અભ્યાસુ',
      gradeBadge: 'A',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    };
  }
  if (pct >= 70) {
    return {
      cefr: 'B2 - Intermediate Plus',
      englishTitle: 'Accomplished Explorer',
      gujaratiTitle: 'કુશળ અધ્યેતા',
      gradeBadge: 'B+',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    };
  }
  if (pct >= 50) {
    return {
      cefr: 'B1 - Intermediate',
      englishTitle: 'Developing Achiever',
      gujaratiTitle: 'પ્રગતિશીલ વિદ્યાર્થી',
      gradeBadge: 'B',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    };
  }
  return {
    cefr: 'A2 - Elementary',
    englishTitle: 'Curious Beginner',
    gujaratiTitle: 'નવા ઉત્સાહી સાધક',
    gradeBadge: 'C',
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };
}

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return INITIAL_SEEDED_ENTRIES;
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_SEEDED_ENTRIES));
      return INITIAL_SEEDED_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEEDED_ENTRIES;
  } catch (e) {
    console.error('Failed to load leaderboard from localStorage', e);
    return INITIAL_SEEDED_ENTRIES;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): LeaderboardEntry {
  const current = loadLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'lb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
  };

  const updated = [...current, newEntry].sort((a, b) => {
    // Sort by score desc, then livesRemaining desc, then timeTakenSeconds asc
    if (b.score !== a.score) return b.score - a.score;
    if (b.livesRemaining !== a.livesRemaining) return b.livesRemaining - a.livesRemaining;
    return a.timeTakenSeconds - b.timeTakenSeconds;
  });

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save leaderboard to localStorage', e);
  }

  return newEntry;
}
