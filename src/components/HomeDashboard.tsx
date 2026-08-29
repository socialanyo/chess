import React, { useState } from 'react';
import { GameMode, TimeControl, CoachProfile } from '../types';
import { Swords, Bot, Puzzle as PuzzleIcon, Sparkles, UserPlus, Trophy, Flame, Play, ChevronRight, Zap } from 'lucide-react';
import { getDailyPuzzle } from '../data/puzzles';
import { ChessPieceSvg } from './ChessPieces';

interface HomeDashboardProps {
  onStartOnline: (timeControl?: TimeControl) => void;
  onStartBot: () => void;
  onOpenCoachSelect: () => void;
  onStartPuzzle: () => void;
  onStartAnalysis: () => void;
  selectedCoach: CoachProfile;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartOnline,
  onStartBot,
  onOpenCoachSelect,
  onStartPuzzle,
  onStartAnalysis,
  selectedCoach,
}) => {
  const [selectedOnlineTime, setSelectedOnlineTime] = useState<number>(10);
  const dailyPuzzle = getDailyPuzzle();

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-8 py-6 space-y-7 pb-20 md:pb-8">
      {/* Editorial Header Quote / Sub-bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 border-b border-[#E7E5E4] pb-4">
        <div>
          <h1 className="font-editorial-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#1C1917] tracking-tight">
            The Grandmaster's Salon
          </h1>
          <p className="font-editorial-subheading italic text-sm sm:text-base text-[#78716C] mt-0.5">
            "Chess is the gymnasium of the mind." — Real-time multiplayer & analytical engine
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#57534E] bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E7E5E4] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Server: Online & Synced</span>
        </div>
      </div>

      {/* Hero Grid of 4 Main Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Play Online */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#D6D3D1] transition-all relative overflow-hidden group">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-editorial-heading font-black text-lg text-[#1C1917] flex items-center gap-2">
                <Swords size={18} className="text-[#1E3A2F]" />
                <span>Play Online</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1E3A2F]/10 text-[#1E3A2F] font-bold">
                Live WS
              </span>
            </div>

            {/* Time control pill options (10 min, 5 min, 3 min) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5F5F4] rounded-xl border border-[#E7E5E4]">
              {[10, 5, 3].map((min) => (
                <button
                  key={min}
                  onClick={() => setSelectedOnlineTime(min)}
                  className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    selectedOnlineTime === min
                      ? 'bg-[#FFFFFF] text-[#1C1917] font-bold shadow-xs border border-[#E7E5E4]'
                      : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>

            {/* Big Start Game Button */}
            <button
              onClick={() =>
                onStartOnline({
                  id: `rapid_${selectedOnlineTime}_0`,
                  name: `${selectedOnlineTime} min`,
                  minutes: selectedOnlineTime,
                  increment: 0,
                  category: selectedOnlineTime >= 10 ? 'rapid' : 'blitz',
                })
              }
              className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-base rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-[#1C1917]"
            >
              <Play size={16} />
              <span>Start Match</span>
            </button>
          </div>

          {/* Sub options: Play a Friend, Play Coach */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F5F5F4] mt-4">
            <button
              onClick={() => onStartOnline()}
              className="py-2 px-2.5 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#44403C] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#E7E5E4]"
            >
              <UserPlus size={13} className="text-[#1E3A2F]" />
              <span>Invite Friend</span>
            </button>
            <button
              onClick={onOpenCoachSelect}
              className="py-2 px-2.5 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#44403C] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#E7E5E4]"
            >
              <Bot size={13} className="text-[#B45309]" />
              <span>Pick Coach</span>
            </button>
          </div>
        </div>

        {/* Card 2: Solve Puzzles */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#D6D3D1] transition-all relative overflow-hidden group">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-editorial-heading font-black text-lg text-[#1C1917] flex items-center gap-2">
                <PuzzleIcon size={18} className="text-[#B45309]" />
                <span>Solve Puzzles</span>
              </span>
              <span className="text-[10px] uppercase font-mono text-[#78716C] font-semibold">Tactics</span>
            </div>

            {/* Mini visual chess preview */}
            <div className="h-28 bg-[#F5F5F4] rounded-xl border border-[#E7E5E4] p-1.5 grid grid-cols-4 grid-rows-4 gap-0.5 shadow-inner">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xs flex items-center justify-center ${
                    (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  {i === 3 && <div className="w-5 h-5 drop-shadow-xs"><ChessPieceSvg type="k" color="b" /></div>}
                  {i === 12 && <div className="w-5 h-5 drop-shadow-xs"><ChessPieceSvg type="r" color="w" /></div>}
                  {i === 15 && <div className="w-5 h-5 drop-shadow-xs"><ChessPieceSvg type="k" color="w" /></div>}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStartPuzzle}
            className="w-full py-3 bg-[#F5F5F4] hover:bg-[#1E3A2F] hover:text-[#FAF9F6] text-[#1C1917] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3 border border-[#E7E5E4] group-hover:border-[#1E3A2F]"
          >
            <span>Train Tactics</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Card 3: Learn & Analysis */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#D6D3D1] transition-all relative overflow-hidden group">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-editorial-heading font-black text-lg text-[#1C1917] flex items-center gap-2">
                <Sparkles size={18} className="text-[#0284C7]" />
                <span>The Sandbox</span>
              </span>
              <span className="text-[10px] uppercase font-mono text-[#78716C] font-semibold">Analysis</span>
            </div>

            {/* Mini visual center king */}
            <div className="h-28 bg-[#F5F5F4] rounded-xl border border-[#E7E5E4] flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] flex items-center justify-center p-2.5 shadow-sm">
                <ChessPieceSvg type="k" color="w" />
              </div>
            </div>
          </div>

          <button
            onClick={onStartAnalysis}
            className="w-full py-3 bg-[#F5F5F4] hover:bg-[#1E3A2F] hover:text-[#FAF9F6] text-[#1C1917] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3 border border-[#E7E5E4] group-hover:border-[#1E3A2F]"
          >
            <span>Open Sandbox</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Card 4: Play Bots / Coach */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#D6D3D1] transition-all relative overflow-hidden group">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-editorial-heading font-black text-lg text-[#1C1917] flex items-center gap-2">
                <Bot size={18} className="text-[#1E3A2F]" />
                <span>Play Bots</span>
              </span>
              <span className="text-[10px] uppercase font-mono text-[#78716C] font-semibold">AI Coach</span>
            </div>

            {/* Coach Spotlight Preview */}
            <div className="h-28 bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] p-3 flex items-center gap-3 shadow-inner">
              <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border-2 border-[#1E3A2F] flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                {selectedCoach.avatar}
              </div>
              <div className="min-w-0">
                <span className="font-editorial-heading font-bold text-sm text-[#1C1917] block truncate">
                  {selectedCoach.name}
                </span>
                <span className="text-xs text-[#1E3A2F] font-bold block font-mono">
                  {selectedCoach.rating === 1 ? '1 / ∞ Elo' : `${selectedCoach.rating} Elo`}
                </span>
                <span className="text-[11px] text-[#78716C] truncate block">
                  {selectedCoach.title}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={onStartBot}
              className="py-2.5 bg-[#1E3A2F] hover:bg-[#2D4A3E] text-[#FAF9F6] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Play size={13} />
              <span>Challenge</span>
            </button>
            <button
              onClick={onOpenCoachSelect}
              className="py-2.5 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#44403C] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-[#E7E5E4]"
            >
              <span>Change</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Puzzle Banner Section */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-[#D6D3D1] flex items-center justify-center p-3 flex-shrink-0 shadow-inner">
            <ChessPieceSvg type="q" color="w" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B45309]/10 text-[#B45309] text-xs font-bold uppercase tracking-wider font-sans">
                Daily Study
              </span>
              <span className="text-xs text-[#78716C] font-mono font-semibold">
                Rated {dailyPuzzle.rating}
              </span>
            </div>
            <h3 className="font-editorial-heading text-xl sm:text-2xl font-black text-[#1C1917] mt-1">
              {dailyPuzzle.title}
            </h3>
            <p className="font-editorial-subheading italic text-xs sm:text-sm text-[#57534E] max-w-xl mt-0.5">
              {dailyPuzzle.description}
            </p>
          </div>
        </div>

        <button
          onClick={onStartPuzzle}
          className="w-full md:w-auto px-7 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 border border-[#1C1917]"
        >
          <Zap size={16} className="text-[#FBBF24]" />
          <span>Solve Today's Monograph</span>
        </button>
      </div>
    </div>
  );
};
