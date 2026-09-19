import React, { useState } from 'react';
import { Volume2, Trophy, ArrowRight, Sparkles, BookOpen, Clock, Heart, Award } from 'lucide-react';
import { StudentProfile, VocabularyLevel } from '../types';
import { VOCABULARY_LEVEL_INFO } from '../data/vocabularyData';
import { soundManager } from '../utils/soundEffects';

interface StudentSetupProps {
  onStartQuiz: (profile: StudentProfile, level: VocabularyLevel, timerSeconds: number) => void;
  onOpenLeaderboard: () => void;
}

const AVATARS = ['🦊', '🦉', '🦁', '🐬', '🦄', '🐯', '🦅', '🐼', '🐘', '🌟'];
const GRADES = ['Grade 3-5', 'Grade 6-8', 'Grade 9-10', 'Grade 11-12', 'College / Competitive', 'Self Learner'];

export const StudentSetup: React.FC<StudentSetupProps> = ({ onStartQuiz, onOpenLeaderboard }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [grade, setGrade] = useState('Grade 6-8');
  const [level, setLevel] = useState<VocabularyLevel>('intermediate');
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('કૃપા કરીને વિદ્યાર્થીનું નામ દાખલ કરો (Please enter your name)');
      soundManager.playWrong();
      return;
    }
    soundManager.playClick();
    onStartQuiz(
      {
        name: name.trim(),
        avatar,
        grade,
      },
      level,
      timerSeconds
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-3">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>Audio સાંભળીને સાચો Vocabulary Word પસંદ કરવો</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Listen & Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">Vocabulary Arena</span>
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Test your English listening comprehension and vocabulary with 20 randomized audio questions, 3 lives, active timer, instant feedback, and earn your certified diploma & leaderboard rank!
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-6">
        {/* Step 1: Student Name & Avatar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-500/30">
                1
              </span>
              <h2 className="text-lg font-bold text-white">વિદ્યાર્થીની વિગત (Student Details)</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenLeaderboard();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard (વિજેતા સૂચિ)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Name */}
            <div>
              <label htmlFor="student-name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Student Full Name *
              </label>
              <input
                id="student-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="उदा. Aarav Patel / Ananya Shah"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-base transition-all"
                maxLength={40}
              />
              {errorMessage && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium animate-bounce">{errorMessage}</p>
              )}
            </div>

            {/* Grade / Class */}
            <div>
              <label htmlFor="grade-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Class / Grade Level
              </label>
              <select
                id="grade-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-base transition-all"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Avatar Selector */}
          <div className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2.5">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    setAvatar(av);
                    soundManager.playClick();
                  }}
                  className={`w-11 h-11 text-xl flex items-center justify-center rounded-xl border transition-all ${
                    avatar === av
                      ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Level Selection */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-500/30">
              2
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">સ્તર પસંદગી (Level Selection)</h2>
              <p className="text-xs text-slate-400">Select vocabulary difficulty suited to your learning goal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(['beginner', 'intermediate', 'advanced', 'master'] as VocabularyLevel[]).map((lvlKey) => {
              const info = VOCABULARY_LEVEL_INFO[lvlKey];
              const isSelected = level === lvlKey;
              return (
                <button
                  type="button"
                  key={lvlKey}
                  onClick={() => {
                    setLevel(lvlKey);
                    soundManager.playClick();
                  }}
                  className={`text-left p-4 rounded-xl border transition-all relative ${
                    isSelected
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <div className="font-bold text-white text-base leading-tight">{info.title}</div>
                        <div className="text-xs font-semibold text-amber-300">{info.gujaratiTitle}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">{info.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {info.recommendedFor}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Rules & Timer Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-500/30">
              3
            </span>
            <h2 className="text-lg font-bold text-white">ક્વિઝ નિયમો અને ટાઈમર (Game Rules & Timer)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Questions</div>
                <div className="text-sm font-bold text-white">20 Randomized Words</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Survival</div>
                <div className="text-sm font-bold text-white">3 Lives (❤️ ❤️ ❤️)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Final Reward</div>
                <div className="text-sm font-bold text-white">Certificate & Rank</div>
              </div>
            </div>
          </div>

          {/* Timer selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">પ્રશ્ન દીઠ સમય (Time Per Question):</span>
            </div>
            <div className="flex items-center gap-2">
              {[15, 20, 30].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    setTimerSeconds(sec);
                    soundManager.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timerSeconds === sec
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sec} સેકન્ડ {sec === 20 ? '(Standard)' : sec === 15 ? '(Fast)' : '(Relaxed)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            id="start-quiz-button"
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-lg sm:text-xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 fill-slate-950" />
            <span>શરૂ કરો (Start 20 Questions Challenge)</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};
