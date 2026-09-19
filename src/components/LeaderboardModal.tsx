import React, { useState, useEffect } from 'react';
import { Trophy, X, ListFilter } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { loadLeaderboard } from '../utils/leaderboard';
import { soundManager } from '../utils/soundEffects';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      setEntries(loadLeaderboard());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = entries.filter((item) => {
    if (filter === 'all') return true;
    return item.level === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">વિજેતા સૂચિ (Leaderboard &amp; Hall of Fame)</h2>
              <p className="text-xs text-slate-400">Top listening vocabulary performers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Filter by Level:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'beginner', 'intermediate', 'advanced', 'master'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filter === cat
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List Body */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No entries found for this level yet. Be the first to play!
            </div>
          ) : (
            filtered.map((entry, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black w-7 text-center text-slate-400">{medal}</span>
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <div className="font-bold text-white text-sm sm:text-base">{entry.studentName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="capitalize text-amber-300 font-semibold">{entry.level}</span>
                        <span>•</span>
                        <span>{entry.grade}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-amber-400">
                      {entry.score} <span className="text-slate-500 text-xs">/ {entry.totalQuestions}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-400">{entry.percentage}% Accuracy</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
