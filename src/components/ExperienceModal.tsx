import React, { useState } from 'react';
import { UserExperienceLevel } from '../types';
import { X, Award, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: UserExperienceLevel;
  userName: string;
  userAvatar: string;
  onSaveProfile: (level: UserExperienceLevel, name: string, avatar: string) => void;
}

const EXPERIENCE_TIERS: Array<{
  id: UserExperienceLevel;
  name: string;
  ratingRange: string;
  description: string;
  avatar: string;
}> = [
  {
    id: 'beginner',
    name: 'Novice Student',
    ratingRange: '400 - 800 Elo',
    description: 'Learning piece movement rules, tactical checkmates, and fundamental pawn structures.',
    avatar: '🌱',
  },
  {
    id: 'intermediate',
    name: 'Club Tactician',
    ratingRange: '800 - 1400 Elo',
    description: 'Comfortable with basic openings, skewers, forks, pins, and positional development.',
    avatar: '⚔️',
  },
  {
    id: 'advanced',
    name: 'Salon Master',
    ratingRange: '1400 - 2000+ Elo',
    description: 'Master of deep multi-ply calculations, endgame pawn transformations, and positional harmony.',
    avatar: '👑',
  },
];

const AVATARS = ['👑', '⚔️', '♟️', '🦁', '🦉', '🧙‍♂️', '⚡', '☕', '🎩', '🏛️'];

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  userName,
  userAvatar,
  onSaveProfile,
}) => {
  const [selectedTier, setSelectedTier] = useState<UserExperienceLevel>(currentLevel);
  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(userAvatar);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveProfile(selectedTier, name.trim() || 'Player', avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <Award className="text-[#1E3A2F]" size={20} />
            <h2 className="font-editorial-heading font-black text-lg sm:text-xl text-[#1C1917]">
              Member Dossier & Rank
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#E7E5E4] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name & Avatar Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#57534E] uppercase tracking-wider block font-sans">
              Member Inscription
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-center justify-center text-2xl shadow-xs">
                {avatar}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Your Name"
                className="flex-1 px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-sm font-semibold text-[#1C1917] focus:outline-none focus:border-[#1E3A2F] shadow-inner"
              />
            </div>

            {/* Avatar picker row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-[#1E3A2F]/10 border-[#1E3A2F] ring-1 ring-[#1E3A2F]'
                      : 'bg-[#FAF9F6] border-[#E7E5E4] hover:bg-[#F5F5F4]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Tiers */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#57534E] uppercase tracking-wider block font-sans">
              Proficiency Benchmark
            </label>
            <div className="space-y-2">
              {EXPERIENCE_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FAF9F6] border-[#1E3A2F] ring-1 ring-[#1E3A2F] shadow-xs'
                        : 'bg-[#FFFFFF] border-[#E7E5E4] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-editorial-heading font-bold text-sm text-[#1C1917]">
                            {tier.name}
                          </span>
                          <span className="text-xs text-[#1E3A2F] font-mono font-bold">
                            ({tier.ratingRange})
                          </span>
                        </div>
                        <p className="font-editorial-subheading italic text-xs text-[#78716C] mt-0.5 max-w-sm">
                          {tier.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1E3A2F] text-white flex items-center justify-center flex-shrink-0">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-base rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-3 border border-[#1C1917]"
          >
            <span>Save & Apply Dossier</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
