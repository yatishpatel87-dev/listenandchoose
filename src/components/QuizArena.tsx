import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Heart,
  Clock,
  Flame,
  HelpCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile, VocabularyLevel, VocabularyWord, QuestionAnswer } from '../types';
import { VOCABULARY_LEVEL_INFO } from '../data/vocabularyData';
import { soundManager } from '../utils/soundEffects';
import { speechManager } from '../utils/speech';

interface QuizArenaProps {
  student: StudentProfile;
  level: VocabularyLevel;
  questions: VocabularyWord[];
  timerDurationSeconds: number;
  onFinishQuiz: (answers: QuestionAnswer[], finalScore: number, livesLeft: number, timeTakenSeconds: number) => void;
  onQuitToMenu: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  student,
  level,
  questions,
  timerDurationSeconds,
  onFinishQuiz,
  onQuitToMenu,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timerDurationSeconds);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(0.92);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const currentLevelInfo = VOCABULARY_LEVEL_INFO[level];

  // Track overall session time
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, []);

  // Pronounce the current word
  const playWordAudio = useCallback(
    (speedOverride?: number) => {
      if (!currentQuestion) return;
      const speed = speedOverride ?? audioSpeed;
      soundManager.playClick();
      setIsAudioPlaying(true);
      speechManager.speak(currentQuestion.word, {
        rate: speed,
        onStart: () => setIsAudioPlaying(true),
        onEnd: () => setIsAudioPlaying(false),
        onError: () => setIsAudioPlaying(false),
      });
      setReplayCount((prev) => prev + 1);
    },
    [currentQuestion, audioSpeed]
  );

  // Auto-play audio when question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setTimeRemaining(timerDurationSeconds);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    setReplayCount(0);
    setShakeCard(false);

    // Initial audio playback with a small delay so user is focused
    const audioTimer = setTimeout(() => {
      playWordAudio();
    }, 350);

    return () => {
      clearTimeout(audioTimer);
      speechManager.cancel();
    };
  }, [currentIndex, timerDurationSeconds, playWordAudio]);

  // Handle Answer Selection
  const handleSelectOption = useCallback(
    (option: string) => {
      if (isAnswered) return;

      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
      const isCorrect = option === currentQuestion.correctWord;
      setSelectedAnswer(option);
      setIsAnswered(true);

      const newAnswerRecord: QuestionAnswer = {
        questionNumber: currentIndex + 1,
        word: currentQuestion,
        selectedWord: option,
        isCorrect,
        timeSpentSeconds: timeSpent,
      };

      const updatedAnswers = [...answers, newAnswerRecord];
      setAnswers(updatedAnswers);

      if (isCorrect) {
        soundManager.playCorrect();
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        setScore((prev) => prev + 1);
      } else {
        soundManager.playWrong();
        soundManager.playHeartBreak();
        setShakeCard(true);
        setStreak(0);
        const remainingLives = lives - 1;
        setLives(remainingLives);

        if (remainingLives <= 0) {
          // Finished because lives ended
          setTimeout(() => {
            onFinishQuiz(updatedAnswers, score, 0, totalTimeElapsed + timeSpent);
          }, 1800);
          return;
        }
      }
    },
    [isAnswered, currentQuestion, currentIndex, answers, streak, maxStreak, lives, score, totalTimeElapsed, onFinishQuiz]
  );

  // Time Out Handler
  const handleTimeOut = useCallback(() => {
    if (isAnswered) return;
    soundManager.playWrong();
    soundManager.playHeartBreak();
    setIsAnswered(true);
    setSelectedAnswer(null); // No answer chosen
    setStreak(0);

    const newAnswerRecord: QuestionAnswer = {
      questionNumber: currentIndex + 1,
      word: currentQuestion,
      selectedWord: null,
      isCorrect: false,
      timeSpentSeconds: timerDurationSeconds,
    };

    const updatedAnswers = [...answers, newAnswerRecord];
    setAnswers(updatedAnswers);

    const remainingLives = lives - 1;
    setLives(remainingLives);

    if (remainingLives <= 0) {
      setTimeout(() => {
        onFinishQuiz(updatedAnswers, score, 0, totalTimeElapsed + timerDurationSeconds);
      }, 1800);
    }
  }, [isAnswered, currentIndex, currentQuestion, timerDurationSeconds, answers, lives, score, totalTimeElapsed, onFinishQuiz]);

  // Question Timer countdown
  useEffect(() => {
    if (isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5 && !isMuted) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, handleTimeOut, isMuted]);

  // Move to Next Question
  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all 20 questions!
      onFinishQuiz(answers, score, lives, totalTimeElapsed);
    }
  };

  // Keyboard shortcut listener (1, 2, 3, 4, Enter, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswered) {
        if (e.key === '1' && currentQuestion?.options[0]) handleSelectOption(currentQuestion.options[0]);
        if (e.key === '2' && currentQuestion?.options[1]) handleSelectOption(currentQuestion.options[1]);
        if (e.key === '3' && currentQuestion?.options[2]) handleSelectOption(currentQuestion.options[2]);
        if (e.key === '4' && currentQuestion?.options[3]) handleSelectOption(currentQuestion.options[3]);
        if (e.key === ' ' || e.key === 'r') {
          e.preventDefault();
          playWordAudio();
        }
      } else {
        if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQuestion, handleSelectOption, playWordAudio]);

  const progressPct = ((currentIndex + 1) / questions.length) * 100;
  const timerPct = (timeRemaining / timerDurationSeconds) * 100;
  const isUrgentTimer = timeRemaining < 5 && !isAnswered;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top HUD Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Student Profile & Level */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
              {student.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base leading-tight">{student.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  {student.grade}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                <span>{currentLevelInfo.icon}</span>
                <span>{currentLevelInfo.title}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{currentLevelInfo.gujaratiTitle}</span>
              </div>
            </div>
          </div>

          {/* Lives (❤️❤️❤️) & Streak & Sound */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* 3 Lives Heart Display */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Lives:</span>
              {[1, 2, 3].map((heartIndex) => {
                const isAlive = heartIndex <= lives;
                return (
                  <motion.div
                    key={heartIndex}
                    animate={
                      !isAlive
                        ? { scale: [1, 1.4, 0.8], opacity: [1, 0.4, 0.2] }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isAlive
                          ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                          : 'fill-slate-800 text-slate-700'
                      }`}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Streak Counter */}
            {streak >= 2 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-lg shadow-orange-500/10"
              >
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
                <span>{streak}x Streak!</span>
              </motion.div>
            )}

            {/* Score */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
              <div className="text-sm font-extrabold text-amber-400">
                {score} <span className="text-slate-500 text-xs">/ 20</span>
              </div>
            </div>

            {/* Mute Sound Button */}
            <button
              type="button"
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                soundManager.isMuted = nextMuted;
              }}
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Progress Bar & Question Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>
              Question <strong className="text-white font-bold">{currentIndex + 1}</strong> of 20
            </span>
            <span>
              {Math.round(progressPct)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Timer Bar (Countdown) */}
      <motion.div
        id="question-timer-display"
        animate={
          isUrgentTimer
            ? {
                scale: [1, 1.012, 1],
                boxShadow: [
                  '0 0 0 rgba(244, 63, 94, 0)',
                  '0 0 18px rgba(244, 63, 94, 0.22)',
                  '0 0 0 rgba(244, 63, 94, 0)',
                ],
              }
            : { scale: 1, boxShadow: 'none' }
        }
        transition={
          isUrgentTimer
            ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        className={`mb-5 p-3 rounded-2xl border transition-colors duration-300 ${
          isUrgentTimer
            ? 'bg-rose-950/30 border-rose-500/50'
            : 'bg-slate-900/40 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold mb-2 px-0.5">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isUrgentTimer ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={
                isUrgentTimer
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
            >
              <Clock
                className={`w-4 h-4 transition-colors duration-300 ${
                  isUrgentTimer ? 'text-rose-400' : 'text-amber-400'
                }`}
              />
            </motion.div>
            <span
              className={`transition-colors duration-300 ${
                isUrgentTimer ? 'text-rose-300 font-bold' : 'text-slate-400'
              }`}
            >
              Time Left:
            </span>
            {isUrgentTimer && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider font-extrabold animate-pulse">
                Hurry!
              </span>
            )}
          </div>

          <motion.div
            id="timer-badge"
            animate={isUrgentTimer ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={
              isUrgentTimer
                ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
            className={`font-mono text-sm px-2.5 py-0.5 rounded-lg border transition-all duration-300 ${
              isUrgentTimer
                ? 'bg-rose-500/25 border-rose-500/60 text-rose-200 font-black shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-slate-950/70 border-slate-800 text-slate-200 font-bold'
            }`}
          >
            {timeRemaining}s
          </motion.div>
        </div>

        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/90 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUrgentTimer
                ? 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse'
                : timeRemaining <= 10
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </motion.div>

      {/* Main Listening Center */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden mb-6">
        {/* Subtle Background radial ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 mb-4">
            <span>Category:</span>
            <span className="text-amber-300">{currentQuestion.category}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-6">
            શબ્દ ધ્યાનપૂર્વક સાંભળો (Listen to the Audio)
          </h2>

          {/* Big Interactive Audio Speaker Button */}
          <div className="flex flex-col items-center justify-center mb-6">
            <motion.button
              type="button"
              id="listen-audio-button"
              onClick={() => playWordAudio()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer relative ${
                isAudioPlaying
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-500 ring-8 ring-amber-400/30 text-slate-950 shadow-amber-500/50'
                  : 'bg-gradient-to-br from-slate-800 to-slate-900 hover:from-amber-500/20 hover:to-slate-800 border-2 border-amber-400/60 text-amber-300 hover:text-white shadow-slate-950/60'
              }`}
            >
              <Volume2
                className={`w-10 h-10 sm:w-12 sm:h-12 ${isAudioPlaying ? 'animate-bounce text-slate-950' : 'text-amber-400'}`}
              />
              <span className={`text-[11px] font-extrabold tracking-wider uppercase mt-1 ${isAudioPlaying ? 'text-slate-950' : 'text-amber-300'}`}>
                {isAudioPlaying ? 'Playing...' : 'Play Word'}
              </span>

              {/* Pulsing ring during speech */}
              {isAudioPlaying && (
                <span className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping opacity-75 pointer-events-none" />
              )}
            </motion.button>

            {/* Audio Waveform Equalizer Visualizer */}
            <div className="flex items-center gap-1.5 h-6 mt-4">
              {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9].map((delay, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-200 ${
                    isAudioPlaying ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                  style={{
                    height: isAudioPlaying ? `${10 + Math.sin(idx + Date.now() / 200) * 12 + 10}px` : '4px',
                    animation: isAudioPlaying ? `bounce ${0.4 + delay * 0.3}s infinite alternate` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Audio Controls (Slow / Repeat) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3">
            <button
              type="button"
              onClick={() => playWordAudio()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Listen Again {replayCount > 0 && `(${replayCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextSpeed = audioSpeed === 0.92 ? 0.72 : 0.92;
                setAudioSpeed(nextSpeed);
                playWordAudio(nextSpeed);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                audioSpeed < 0.8
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <span>{audioSpeed < 0.8 ? '⚡ Slow 0.7x (Active)' : '🐢 Slow Pronunciation'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowHint((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Clue' : 'ગુજરાતી અર્થ સંકેત (Clue)'}</span>
            </button>
          </div>

          {/* Clue / Hint Box */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm max-w-lg mx-auto"
              >
                <div className="font-bold mb-1">💡 ગુજરાતી અર્થ સંકેત (Gujarati Clue):</div>
                <div className="text-amber-100 font-medium">{currentQuestion.gujarati}</div>
                <div className="mt-1.5 text-[11px] text-amber-300/80 italic">
                  Context: &quot;{currentQuestion.exampleSentence.replace(new RegExp(currentQuestion.correctWord, 'gi'), '[ _____ ]')}&quot;
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4 Options Grid */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1 flex items-center justify-between">
          <span>સાચો શબ્દ પસંદ કરો (Select the Word You Heard):</span>
          <span className="hidden sm:inline text-slate-500 font-normal">Keyboard: Keys 1 - 4</span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${shakeCard ? 'animate-shake' : ''}`}>
          {currentQuestion.options.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.correctWord;

            let cardStyle =
              'bg-slate-900/90 border-slate-800 hover:border-amber-400/60 hover:bg-slate-800/80 text-white';
            let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

            if (isAnswered) {
              if (isCorrectOption) {
                cardStyle =
                  'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 text-emerald-100 shadow-lg shadow-emerald-500/20';
                badgeStyle = 'bg-emerald-500 text-slate-950 border-emerald-400 font-black';
              } else if (isSelected && !isCorrectOption) {
                cardStyle =
                  'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500 text-rose-100 shadow-lg shadow-rose-500/20';
                badgeStyle = 'bg-rose-500 text-white border-rose-400 font-black';
              } else {
                cardStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
              }
            }

            return (
              <motion.button
                key={option}
                type="button"
                id={`option-button-${idx}`}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                className={`p-4 sm:p-5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm sm:text-base ${badgeStyle}`}
                  >
                    {letter}
                  </span>
                  <span className="text-lg sm:text-xl font-bold tracking-tight">{option}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrectOption && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
                    )}
                    {isSelected && !isCorrectOption && (
                      <XCircle className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Answer Explanation & Meaning Feedback Panel */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`rounded-2xl p-5 border mb-6 shadow-xl ${
              selectedAnswer === currentQuestion.correctWord
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                {selectedAnswer === currentQuestion.correctWord ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
                    <Sparkles className="w-5 h-5 fill-emerald-400" />
                    <span>સાચો જવાબ! (Splendid & Correct!)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-400 font-extrabold text-base">
                    <ShieldAlert className="w-5 h-5" />
                    <span>
                      {selectedAnswer ? 'ખોટો જવાબ! (Incorrect Choice)' : 'સમય સમાપ્ત! (Time Ran Out!)'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                id="next-question-btn"
                onClick={handleNextQuestion}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-400/20 cursor-pointer transition-all transform hover:scale-105"
              >
                <span>
                  {currentIndex + 1 < questions.length ? 'આગળનો પ્રશ્ન (Next Question)' : 'પરિણામ જુઓ (See Results)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Word details card */}
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-black text-white">{currentQuestion.correctWord}</span>
                <span className="text-amber-300 font-mono">{currentQuestion.phonetic}</span>
                <span className="text-slate-300 font-semibold">• {currentQuestion.gujarati}</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-medium">
                {currentQuestion.englishDefinition}
              </p>
              <div className="text-amber-200/90 italic pt-1">
                &quot;{currentQuestion.exampleSentence}&quot;
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar: Quit / Emergency Exit */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('શું તમે ખરેખર બહાર નીકળવા માંગો છો? (Are you sure you want to quit the quiz?)')) {
              onQuitToMenu();
            }
          }}
          className="hover:text-rose-400 transition-colors"
        >
          ← Quit Quiz
        </button>
        <span>Audio Powered by Web Speech API</span>
      </div>
    </div>
  );
};
