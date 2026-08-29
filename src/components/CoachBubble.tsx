import React, { useState } from 'react';
import { CoachProfile } from '../types';
import { Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CoachBubbleProps {
  coach: CoachProfile;
  currentSpeech: string;
  onAskCoach?: () => void;
  isLoadingAdvice?: boolean;
}

export const CoachBubble: React.FC<CoachBubbleProps> = ({
  coach,
  currentSpeech,
  onAskCoach,
  isLoadingAdvice = false,
}) => {
  return (
    <div className="flex items-start gap-3.5 p-4 bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
      {/* Coach Avatar Box */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FAF9F6] border-2 border-[#1E3A2F] flex items-center justify-center text-2xl sm:text-3xl shadow-sm relative">
          <span>{coach.avatar}</span>
          <span className="absolute -bottom-1 text-[9px] font-bold bg-[#1E3A2F] text-white px-1.5 py-0.2 rounded-md font-mono">
            {coach.rating}
          </span>
        </div>
        <span className="font-editorial-heading font-bold text-xs text-[#1C1917] mt-1.5 truncate max-w-[65px] text-center">
          {coach.name}
        </span>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 relative">
        <div className="relative bg-[#FAF9F6] text-[#1C1917] p-3.5 rounded-2xl rounded-tl-xs border border-[#E7E5E4] shadow-xs text-xs sm:text-sm leading-relaxed">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentSpeech}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2 }}
              className="font-editorial-subheading italic text-[#292524] font-medium"
            >
              "{currentSpeech || 'Make your move! I am observing your strategy.'}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Ask Coach / Hint button */}
        {onAskCoach && (
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={onAskCoach}
              disabled={isLoadingAdvice}
              className="px-3 py-1 rounded-lg bg-[#F5F5F4] hover:bg-[#1E3A2F] hover:text-white text-[#44403C] text-xs font-semibold border border-[#E7E5E4] transition-all flex items-center gap-1.5 active:scale-95 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoadingAdvice ? (
                <RefreshCw size={12} className="animate-spin text-[#1E3A2F]" />
              ) : (
                <Sparkles size={12} className="text-[#B45309]" />
              )}
              <span>{isLoadingAdvice ? 'Consulting Master...' : 'Ask Master Tip'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
