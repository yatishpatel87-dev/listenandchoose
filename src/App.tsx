import { useState } from 'react';
import { Volume2, Trophy, Headphones } from 'lucide-react';
import { StudentProfile, VocabularyLevel, VocabularyWord, QuestionAnswer, QuizStatus } from './types';
import { generateQuizQuestions } from './data/vocabularyData';
import { StudentSetup } from './components/StudentSetup';
import { QuizArena } from './components/QuizArena';
import { ResultsCelebration } from './components/ResultsCelebration';
import { LeaderboardModal } from './components/LeaderboardModal';

export default function App() {
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('setup');
  const [student, setStudent] = useState<StudentProfile>({
    name: '',
    avatar: '🦊',
    grade: 'Grade 6-8',
  });
  const [level, setLevel] = useState<VocabularyLevel>('intermediate');
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [questions, setQuestions] = useState<VocabularyWord[]>([]);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [livesRemaining, setLivesRemaining] = useState<number>(3);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Start 20 Questions Quiz
  const handleStartQuiz = (profile: StudentProfile, selectedLevel: VocabularyLevel, timerSec: number) => {
    setStudent(profile);
    setLevel(selectedLevel);
    setTimerSeconds(timerSec);

    // Generate 20 randomized questions from database
    const randomQuestions = generateQuizQuestions(selectedLevel, 20);
    setQuestions(randomQuestions);
    setAnswers([]);
    setFinalScore(0);
    setLivesRemaining(3);
    setTotalTimeSeconds(0);
    setQuizStatus('playing');
  };

  // Completed or Game Over from QuizArena
  const handleFinishQuiz = (
    recordedAnswers: QuestionAnswer[],
    score: number,
    livesLeft: number,
    timeTaken: number
  ) => {
    setAnswers(recordedAnswers);
    setFinalScore(score);
    setLivesRemaining(livesLeft);
    setTotalTimeSeconds(timeTaken);
    setQuizStatus('completed');
  };

  // Play Again with same student & level (generates 20 fresh randomized questions)
  const handlePlayAgain = () => {
    const randomQuestions = generateQuizQuestions(level, 20);
    setQuestions(randomQuestions);
    setAnswers([]);
    setFinalScore(0);
    setLivesRemaining(3);
    setTotalTimeSeconds(0);
    setQuizStatus('playing');
  };

  // Change Level / Back to Setup
  const handleChangeLevel = () => {
    setQuizStatus('setup');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Universal Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={handleChangeLevel}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
                Listen &amp; Choose
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-amber-400/80">
                • સાંભળીને સાચો શબ્દ પસંદ કરો
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLeaderboardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer shadow-sm"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {quizStatus === 'playing' && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('ક્વિઝ બંધ કરીને હોમ સ્ક્રીન પર જવું છે? (Exit to main menu?)')) {
                    handleChangeLevel();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-xs font-semibold text-slate-300 hover:text-rose-300 border border-slate-800 transition-all"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {quizStatus === 'setup' && (
          <StudentSetup
            onStartQuiz={handleStartQuiz}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {quizStatus === 'playing' && (
          <QuizArena
            student={student}
            level={level}
            questions={questions}
            timerDurationSeconds={timerSeconds}
            onFinishQuiz={handleFinishQuiz}
            onQuitToMenu={handleChangeLevel}
          />
        )}

        {quizStatus === 'completed' && (
          <ResultsCelebration
            student={student}
            level={level}
            answers={answers}
            finalScore={finalScore}
            livesRemaining={livesRemaining}
            totalTimeSeconds={totalTimeSeconds}
            onPlayAgain={handlePlayAgain}
            onChangeLevel={handleChangeLevel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Listening &amp; Vocabulary Practice Platform</span>
          </div>
          <div>Audio સાંભળીને સાચો vocabulary word પસંદ કરવો • Gujarati &amp; English</div>
        </div>
      </footer>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
