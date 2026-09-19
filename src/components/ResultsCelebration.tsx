import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Share2,
  Printer,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  Clock,
  Heart,
  Sparkles,
  ArrowRight,
  ListFilter,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { StudentProfile, VocabularyLevel, QuestionAnswer, LeaderboardEntry } from '../types';
import { VOCABULARY_LEVEL_INFO } from '../data/vocabularyData';
import { getVocabularyRankTitle, loadLeaderboard, saveLeaderboardEntry } from '../utils/leaderboard';
import { soundManager } from '../utils/soundEffects';
import { speechManager } from '../utils/speech';

interface ResultsCelebrationProps {
  student: StudentProfile;
  level: VocabularyLevel;
  answers: QuestionAnswer[];
  finalScore: number;
  livesRemaining: number;
  totalTimeSeconds: number;
  onPlayAgain: () => void;
  onChangeLevel: () => void;
}

export const ResultsCelebration: React.FC<ResultsCelebrationProps> = ({
  student,
  level,
  answers,
  finalScore,
  livesRemaining,
  totalTimeSeconds,
  onPlayAgain,
  onChangeLevel,
}) => {
  const [activeTab, setActiveTab] = useState<'certificate' | 'leaderboard' | 'review'>('certificate');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<string>('all');
  const [currentEntryId, setCurrentEntryId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const totalQuestions = answers.length > 0 ? answers.length : 20;
  const percentage = Math.round((finalScore / totalQuestions) * 100);
  const rankInfo = getVocabularyRankTitle(finalScore, totalQuestions);
  const levelInfo = VOCABULARY_LEVEL_INFO[level];

  // Save to leaderboard and fire celebratory fanfare & confetti
  useEffect(() => {
    // Sound fanfare
    soundManager.playFanfare();

    // Multiphase Confetti burst
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Save score to leaderboard
    const dateFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const saved = saveLeaderboardEntry({
      studentName: student.name,
      avatar: student.avatar,
      grade: student.grade,
      score: finalScore,
      totalQuestions,
      percentage,
      level,
      date: dateFormatted,
      livesRemaining,
      timeTakenSeconds: totalTimeSeconds,
      rankTitle: rankInfo.englishTitle,
    });

    setCurrentEntryId(saved.id);
    setLeaderboard(loadLeaderboard());
  }, [student, finalScore, totalQuestions, percentage, level, livesRemaining, totalTimeSeconds, rankInfo.englishTitle]);

  const handlePrintCertificate = () => {
    soundManager.playClick();
    window.print();
  };

  const handleShare = () => {
    soundManager.playClick();
    const shareText = `🎓 ${student.name} scored ${finalScore}/${totalQuestions} (${percentage}%) in "Listen & Choose" English Vocabulary Quiz!\nLevel: ${levelInfo.title} (${rankInfo.cefr} - ${rankInfo.englishTitle})\nTry the listening vocabulary challenge today!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filteredLeaderboard = leaderboard.filter((item) => {
    if (leaderboardFilter === 'all') return true;
    return item.level === leaderboardFilter;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Celebration Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-bold mb-3 shadow-lg shadow-amber-500/10">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>અભિનંદન! Quiz Completed & Celebrated</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
          Splendid Achievement, <span className="text-amber-400">{student.name}</span>!
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          You listened to 20 randomized audio questions in <strong>{levelInfo.title}</strong> and demonstrated excellent listening comprehension.
        </p>
      </motion.div>

      {/* Summary Scoreboard Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {/* Final Score */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Final Score</div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">
              {finalScore} <span className="text-slate-500 text-lg font-bold">/ {totalQuestions}</span>
            </div>
            <div className="text-xs font-semibold text-amber-300/80 mt-1">{percentage}% Accuracy</div>
          </div>

          {/* Vocabulary Level / CEFR */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Vocabulary Level</div>
            <div className="text-xl sm:text-2xl font-black text-white">{rankInfo.cefr.split(' - ')[0]}</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1 line-clamp-1">{rankInfo.englishTitle}</div>
          </div>

          {/* Lives Preserved */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Lives Left</div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-black mt-1">
              {[1, 2, 3].map((h) => (
                <Heart
                  key={h}
                  className={`w-5 h-5 ${
                    h <= livesRemaining ? 'fill-rose-500 text-rose-500' : 'fill-slate-800 text-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-slate-400 mt-1.5">{livesRemaining} / 3 Preserved</div>
          </div>

          {/* Time Taken */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Time Elapsed</div>
            <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-1.5 mt-0.5">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>{Math.floor(totalTimeSeconds / 60)}m {totalTimeSeconds % 60}s</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Duration</div>
          </div>
        </div>

        {/* Gujarati Vocabulary Rank Assessment Badge */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{student.avatar}</span>
            <div>
              <div className="text-sm font-bold text-white">
                મૂલ્યાંકન: <span className="text-amber-400">{rankInfo.gujaratiTitle}</span> ({rankInfo.englishTitle})
              </div>
              <div className="text-xs text-slate-400">
                {percentage >= 90
                  ? 'અદભુત પ્રદર્શન! તમારો શબ્દભંડોળ અને સાંભળવાની શક્તિ ઉચ્ચ કક્ષાની છે.'
                  : percentage >= 70
                  ? 'સરસ પરિણામ! નિયમિત અભ્યાસથી તમે માસ્ટર સ્તરે પહોંચી શકો છો.'
                  : 'સારો પ્રયાસ! રોજ નવા શબ્દો સાંભળીને ફરી પ્રયાસ કરો.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ફરી રમો (Play Again)</span>
            </button>
            <button
              type="button"
              onClick={onChangeLevel}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>બીજું સ્તર (New Level)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Certificate / Leaderboard / Review) */}
      <div className="flex items-center justify-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('certificate');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'certificate'
              ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate (પ્રમાણપત્ર)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('leaderboard');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard (વિજેતા ક્રમ)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('review');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'review'
              ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Review 20 Questions ({answers.length})</span>
        </button>
      </div>

      {/* TAB 1: CERTIFICATE OF ACHIEVEMENT */}
      {activeTab === 'certificate' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="text-xs text-slate-400">
              Verifiable completion certificate for your academic portfolio & sharing.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors shadow-md cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Result!' : 'Share Result'}</span>
              </button>
            </div>
          </div>

          {/* Printable Certificate Frame */}
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="w-full bg-[#fcfaf2] text-slate-900 rounded-3xl p-6 sm:p-10 border-8 border-double border-amber-600/70 shadow-2xl relative overflow-hidden select-none"
            style={{ minHeight: '480px' }}
          >
            {/* Background Ornate Watermark Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

            {/* Corner Ornamental Accents */}
            <div className="absolute top-3 left-3 text-amber-700/60 text-2xl font-serif">❦</div>
            <div className="absolute top-3 right-3 text-amber-700/60 text-2xl font-serif">❦</div>
            <div className="absolute bottom-3 left-3 text-amber-700/60 text-2xl font-serif">❦</div>
            <div className="absolute bottom-3 right-3 text-amber-700/60 text-2xl font-serif">❦</div>

            <div className="relative z-10 text-center space-y-4">
              {/* Certificate Seal & Top Bar */}
              <div className="flex items-center justify-center gap-2 text-amber-800 font-extrabold uppercase tracking-widest text-xs">
                <span>★ LISTEN &amp; CHOOSE VOCABULARY ACADEMY ★</span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-serif tracking-tight uppercase">
                  Certificate of Achievement
                </h2>
                <p className="text-amber-800/90 font-semibold text-xs sm:text-sm mt-1">
                  અંગ્રેજી શબ્દભંડોળ અને શ્રવણ પ્રવીણતા પ્રમાણપત્ર
                </p>
              </div>

              {/* Recipient */}
              <div className="py-2">
                <p className="text-xs uppercase tracking-wider text-amber-900 font-bold">This certifies that</p>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 border-b-2 border-amber-600/40 inline-block px-8 py-1 mt-1 font-serif">
                  {student.name}
                </div>
                <p className="text-xs text-amber-900/80 font-medium mt-1">
                  {student.grade} • Candidate ID: LC-{currentEntryId.slice(3, 10).toUpperCase()}
                </p>
              </div>

              {/* Award Description */}
              <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                has successfully completed the 20-question randomized audio listening challenge in{' '}
                <strong className="text-amber-950 font-bold">{levelInfo.title} ({levelInfo.gujaratiTitle})</strong>,
                achieving a score of <strong className="text-amber-950 font-bold">{finalScore} / {totalQuestions} ({percentage}%)</strong> and
                attaining the distinction of:
              </p>

              {/* Rank Distinction Pill */}
              <div className="inline-block px-5 py-2 rounded-full bg-amber-100 border-2 border-amber-600 text-amber-950 font-extrabold text-base tracking-wide shadow-sm">
                🎖️ {rankInfo.cefr} : {rankInfo.englishTitle} ({rankInfo.gujaratiTitle})
              </div>

              {/* Bottom Signatures & Seal */}
              <div className="pt-6 grid grid-cols-3 items-end text-center border-t border-amber-900/20 mt-4">
                {/* Issue Date */}
                <div>
                  <div className="text-xs text-amber-900/70 font-semibold">Date of Completion</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Gold Seal Emblem */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-amber-200 flex items-center justify-center text-white shadow-md">
                    <Trophy className="w-8 h-8 text-amber-950 drop-shadow-sm" />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-900 mt-1 uppercase tracking-widest">
                    Verified Seal
                  </span>
                </div>

                {/* Academic Authority Signature */}
                <div>
                  <div className="font-serif italic text-amber-900 font-bold text-lg border-b border-amber-900/40 inline-block px-3">
                    Vocabulary Council
                  </div>
                  <div className="text-xs text-amber-900/70 font-semibold mt-1">Course Examiner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEADERBOARD / HALL OF FAME */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">વિજેતા સૂચિ (Vocabulary Hall of Fame)</h2>
                <p className="text-xs text-slate-400">Global and local student performance rankings</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <ListFilter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(['all', 'beginner', 'intermediate', 'advanced', 'master'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setLeaderboardFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    leaderboardFilter === cat
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table List */}
          <div className="space-y-2.5">
            {filteredLeaderboard.slice(0, 15).map((entry, idx) => {
              const isCurrentStudent = entry.id === currentEntryId;
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

              return (
                <div
                  key={entry.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    isCurrentStudent
                      ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black w-8 text-center text-slate-300">{medal}</span>
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {entry.studentName}
                        </span>
                        {isCurrentStudent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="capitalize text-amber-300 font-semibold">{entry.level}</span>
                        <span>•</span>
                        <span>{entry.grade}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-base sm:text-lg font-black text-amber-400">
                        {entry.score} <span className="text-slate-500 text-xs font-semibold">/ {entry.totalQuestions}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-400">{entry.percentage}% Accuracy</div>
                    </div>

                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-slate-400 font-mono">
                        {Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s
                      </div>
                      <div className="text-[10px] text-rose-400 font-semibold">
                        {'❤️'.repeat(entry.livesRemaining)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW ALL 20 QUESTIONS */}
      {activeTab === 'review' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">પ્રશ્નોત્તરી સમીક્ષા (Review 20 Questions)</h2>
              <p className="text-xs text-slate-400">Replay audio pronunciation and study definitions</p>
            </div>
            <div className="text-xs font-bold text-amber-400">
              {answers.filter((a) => a.isCorrect).length} Correct / {answers.length} Total
            </div>
          </div>

          <div className="space-y-3">
            {answers.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isCorrect
                    ? 'bg-emerald-950/20 border-emerald-900/60'
                    : 'bg-rose-950/20 border-rose-900/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-extrabold text-white text-base">
                        Q{idx + 1}. {item.word.correctWord}
                      </span>
                      <span className="text-amber-300 font-mono text-xs">{item.word.phonetic}</span>
                      <span className="text-slate-300 font-semibold text-xs">• {item.word.gujarati}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.word.englishDefinition}
                    </p>
                    <div className="text-[11px] text-amber-200/80 italic mt-0.5">
                      &quot;{item.word.exampleSentence}&quot;
                    </div>

                    {!item.isCorrect && (
                      <div className="text-xs text-rose-300 mt-1 font-semibold">
                        Your choice: {item.selectedWord ? `&quot;${item.selectedWord}&quot;` : 'Time Expired'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      speechManager.speak(item.word.correctWord, { rate: 0.88 });
                      soundManager.playClick();
                    }}
                    title="Play Audio"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
