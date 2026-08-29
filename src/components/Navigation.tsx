import React from 'react';
import { Swords, Bot, Puzzle as PuzzleIcon, Sparkles, Flame, User, Volume2, VolumeX, Moon, Sun, Settings } from 'lucide-react';
import { GameMode, BoardTheme } from '../types';
import { sounds } from '../utils/sound';

interface NavigationProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  dayStreak: number;
  userName: string;
  userRating: number;
  userAvatar: string;
  theme: BoardTheme;
  onChangeTheme: (theme: BoardTheme) => void;
  onOpenExperienceModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentMode,
  onSelectMode,
  dayStreak,
  userName,
  userRating,
  userAvatar,
  theme,
  onChangeTheme,
  onOpenExperienceModal,
}) => {
  const [soundOn, setSoundOn] = React.useState(sounds.isEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    sounds.setSoundEnabled(next);
    setSoundOn(next);
    if (next) sounds.playMove();
  };

  const navItems: Array<{ id: GameMode; label: string; icon: React.ReactNode }> = [
    { id: 'online', label: 'Play Online', icon: <Swords size={16} /> },
    { id: 'bot', label: 'Play Coach & Bots', icon: <Bot size={16} /> },
    { id: 'puzzle', label: 'Puzzles', icon: <PuzzleIcon size={16} /> },
    { id: 'analysis', label: 'Analysis & Sandbox', icon: <Sparkles size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E7E5E4] px-3 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectMode('online')}
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-[#FAF9F6] flex items-center justify-center text-lg font-serif shadow-xs group-hover:scale-105 transition-transform border border-[#1C1917]">
            ♟
          </div>
          <div className="flex items-baseline font-editorial-heading font-black tracking-tight text-xl sm:text-2xl text-[#1C1917]">
            <span>The</span>
            <span className="ml-1 italic font-normal text-[#1E3A2F]">Chess</span>
            <span className="text-xs ml-1.5 font-sans font-semibold text-[#78716C] uppercase tracking-widest">Club</span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-xl border border-[#E7E5E4]">
          {navItems.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#1C1917] shadow-xs border border-[#E7E5E4] font-bold'
                    : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7E5E4]/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Day streak badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg text-xs font-semibold text-[#B45309] shadow-xs"
            title="Daily Active Streak"
          >
            <Flame size={15} className="text-[#D97706] fill-[#D97706]" />
            <span className="font-mono text-[#44403C] font-bold">{dayStreak}d Streak</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 bg-[#FFFFFF] hover:bg-[#F5F5F4] text-[#57534E] hover:text-[#1C1917] border border-[#E7E5E4] rounded-lg transition-colors shadow-xs"
            title={soundOn ? 'Mute' : 'Unmute'}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => onChangeTheme(e.target.value as BoardTheme)}
            className="hidden sm:block bg-[#FFFFFF] text-xs font-semibold text-[#44403C] px-2.5 py-1.5 rounded-lg border border-[#E7E5E4] shadow-xs focus:outline-none cursor-pointer"
            title="Board Theme"
          >
            <option value="green">Classic Library Green</option>
            <option value="wood">Walnut & Boxwood</option>
            <option value="blue">Oxford Blue</option>
            <option value="slate">Minimalist Slate</option>
            <option value="crimson">Crimson Monograph</option>
          </select>

          {/* User Profile pill */}
          <button
            onClick={onOpenExperienceModal}
            className="flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] hover:bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl transition-all shadow-xs cursor-pointer"
            title="Account & Skill Level"
          >
            <span className="text-base">{userAvatar}</span>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#1C1917] truncate max-w-[90px]">{userName}</span>
              <span className="text-[10px] text-[#78716C] font-mono">({userRating})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#E7E5E4] z-50 px-2 py-1.5 grid grid-cols-4 gap-1 shadow-lg">
        {navItems.map((item) => {
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                isActive ? 'text-[#1C1917] bg-[#FFFFFF] shadow-xs border border-[#E7E5E4]' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <div className="mb-0.5">{item.icon}</div>
              <span className="truncate max-w-[70px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
