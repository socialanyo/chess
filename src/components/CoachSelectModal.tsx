import React, { useState } from 'react';
import { CoachProfile } from '../types';
import { COACHES } from '../data/coaches';
import { X, Bot, Check, Play, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface CoachSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCoach: CoachProfile;
  onSelectCoach: (coach: CoachProfile) => void;
  onStartMatch: (coach: CoachProfile, sidePreference: 'w' | 'b' | 'random') => void;
}

export const CoachSelectModal: React.FC<CoachSelectModalProps> = ({
  isOpen,
  onClose,
  selectedCoach,
  onSelectCoach,
  onStartMatch,
}) => {
  const [chosenCoach, setChosenCoach] = useState<CoachProfile>(selectedCoach);
  const [sidePref, setSidePref] = useState<'w' | 'b' | 'random'>('random');

  if (!isOpen) return null;

  const handleStart = () => {
    onSelectCoach(chosenCoach);
    onStartMatch(chosenCoach, sidePref);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <Bot className="text-[#1E3A2F]" size={20} />
            <div>
              <h2 className="font-editorial-heading font-black text-lg sm:text-xl text-[#1C1917]">
                The Grandmasters & Mentors
              </h2>
              <p className="font-editorial-subheading italic text-xs text-[#78716C]">
                Select an AI tutor matched to your discipline and Elo rating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#E7E5E4] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Coach List */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COACHES.map((coach) => {
            const isSelected = chosenCoach.id === coach.id;
            return (
              <div
                key={coach.id}
                onClick={() => setChosenCoach(coach)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#FAF9F6] border-[#1E3A2F] ring-1 ring-[#1E3A2F] shadow-sm'
                    : 'bg-[#FFFFFF] border-[#E7E5E4] hover:bg-[#FAF9F6] hover:border-[#D6D3D1]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#E7E5E4] flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                    {coach.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-editorial-heading font-bold text-sm text-[#1C1917] truncate">
                        {coach.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#1E3A2F]">
                        {coach.rating === 1 ? '1 / ∞ Elo' : `${coach.rating} Elo`}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#78716C] block font-sans uppercase tracking-wider">
                      {coach.title}
                    </span>
                    <p className="font-editorial-subheading italic text-xs text-[#57534E] mt-1 line-clamp-2">
                      "{coach.quotes.greeting[0]}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#E7E5E4]/60">
                  <span className="text-[#78716C] font-mono">
                    Depth {coach.depth} • Style: {coach.personality}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[#1E3A2F] font-bold">
                      <Check size={12} />
                      <span>Selected</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer & Actions */}
        <div className="p-4 sm:p-6 bg-[#FAF9F6] border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Side selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider font-sans">Side:</span>
            <div className="flex bg-[#FFFFFF] p-1 rounded-xl border border-[#E7E5E4]">
              <button
                onClick={() => setSidePref('w')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sidePref === 'w' ? 'bg-[#1E3A2F] text-white' : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                ♔ White
              </button>
              <button
                onClick={() => setSidePref('random')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sidePref === 'random' ? 'bg-[#1E3A2F] text-white' : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                ☯ Random
              </button>
              <button
                onClick={() => setSidePref('b')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sidePref === 'b' ? 'bg-[#1E3A2F] text-white' : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                ♚ Black
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-7 py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-[#1C1917]"
          >
            <Play size={15} />
            <span>Challenge {chosenCoach.name}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
