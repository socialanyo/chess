import React, { useState } from 'react';
import { TimeControl } from '../types';
import { X, Users, Globe, Copy, Check, Play, Link2, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickPlay: (timeControl: TimeControl) => void;
  onCreateRoom: (timeControl: TimeControl, sidePreference: 'w' | 'b' | 'random') => void;
  onJoinRoom: (roomId: string) => void;
  isSearching: boolean;
  onCancelSearch: () => void;
  createdRoomCode?: string | null;
}

const TIME_CONTROLS: TimeControl[] = [
  { id: 'bullet_1_0', name: '1 min', category: 'bullet', minutes: 1, increment: 0 },
  { id: 'blitz_3_0', name: '3 min', category: 'blitz', minutes: 3, increment: 0 },
  { id: 'blitz_5_0', name: '5 min', category: 'blitz', minutes: 5, increment: 0 },
  { id: 'rapid_10_0', name: '10 min', category: 'rapid', minutes: 10, increment: 0 },
  { id: 'rapid_15_10', name: '15 | 10', category: 'rapid', minutes: 15, increment: 10 },
  { id: 'classical_30_0', name: '30 min', category: 'classical', minutes: 30, increment: 0 },
  { id: 'unlimited', name: 'Unlimited', category: 'unlimited', minutes: 0, increment: 0 },
];

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onQuickPlay,
  onCreateRoom,
  onJoinRoom,
  isSearching,
  onCancelSearch,
  createdRoomCode,
}) => {
  const [tab, setTab] = useState<'quick' | 'create' | 'join'>('quick');
  const [selectedTime, setSelectedTime] = useState<TimeControl>(TIME_CONTROLS[3]); // 10 min
  const [sidePref, setSidePref] = useState<'w' | 'b' | 'random'>('random');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyInviteLink = () => {
    if (!createdRoomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${createdRoomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
            <Globe className="text-[#1E3A2F]" size={20} />
            <h2 className="font-editorial-heading font-black text-lg sm:text-xl text-[#1C1917]">
              Multiplayer Matchmaking
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#E7E5E4] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Searching Status Overlay */}
        {isSearching ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#1E3A2F] border-t-transparent animate-spin flex items-center justify-center">
              <Users size={24} className="text-[#1E3A2F]" />
            </div>
            <div>
              <h3 className="font-editorial-heading font-bold text-lg text-[#1C1917]">Seeking Opponent...</h3>
              <p className="font-editorial-subheading italic text-xs text-[#78716C] mt-1">
                Matching you with players in the {selectedTime.name} pool via WebSockets.
              </p>
            </div>
            <button
              onClick={onCancelSearch}
              className="px-6 py-2.5 bg-[#F5F5F4] hover:bg-rose-50 hover:text-rose-700 text-[#44403C] font-bold text-sm rounded-xl border border-[#E7E5E4] transition-all cursor-pointer"
            >
              Cancel Search
            </button>
          </div>
        ) : createdRoomCode ? (
          /* Created Room Share Screen */
          <div className="p-6 space-y-5">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A2F] font-sans">
                Private Room Reserved
              </span>
              <h3 className="font-mono text-3xl font-black text-[#1C1917] mt-1 tracking-widest">
                {createdRoomCode}
              </h3>
              <p className="font-editorial-subheading italic text-xs text-[#78716C] mt-1">
                Share this 6-character room code or link with your fellow player to begin.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] flex items-center justify-between gap-3 shadow-inner">
              <span className="text-xs font-mono text-[#44403C] truncate">
                {window.location.origin}?room={createdRoomCode}
              </span>
              <button
                onClick={handleCopyInviteLink}
                className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#78716C] animate-pulse font-serif italic">
              <RefreshCw size={12} className="animate-spin text-[#1E3A2F]" />
              <span>Awaiting the arrival of your opponent...</span>
            </div>
          </div>
        ) : (
          /* Tab Navigation */
          <div>
            <div className="grid grid-cols-3 border-b border-[#E7E5E4] bg-[#FAF9F6]">
              <button
                onClick={() => setTab('quick')}
                className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  tab === 'quick'
                    ? 'border-[#1E3A2F] text-[#1C1917] bg-[#FFFFFF]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Quick Pairing
              </button>
              <button
                onClick={() => setTab('create')}
                className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  tab === 'create'
                    ? 'border-[#1E3A2F] text-[#1C1917] bg-[#FFFFFF]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Create Room
              </button>
              <button
                onClick={() => setTab('join')}
                className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  tab === 'join'
                    ? 'border-[#1E3A2F] text-[#1C1917] bg-[#FFFFFF]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Join Room
              </button>
            </div>

            <div className="p-6">
              {/* Tab 1: Quick Play */}
              {tab === 'quick' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#57534E] uppercase tracking-wider block mb-2 font-sans">
                      Select Time Control
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TIME_CONTROLS.slice(0, 4).map((tc) => {
                        const isSelected = selectedTime.id === tc.id;
                        return (
                          <button
                            key={tc.id}
                            onClick={() => setSelectedTime(tc)}
                            className={`p-3 rounded-xl border font-bold text-sm transition-all flex flex-col items-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#1E3A2F]/10 border-[#1E3A2F] text-[#1E3A2F] shadow-xs'
                                : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]'
                            }`}
                          >
                            <span>{tc.name}</span>
                            <span className="text-[10px] text-[#78716C] font-normal uppercase mt-0.5 font-mono">
                              {tc.category}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickPlay(selectedTime)}
                    className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-base rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-4 border border-[#1C1917]"
                  >
                    <Play size={16} />
                    <span>Seek Opponent ({selectedTime.name})</span>
                  </button>
                </div>
              )}

              {/* Tab 2: Create Custom Room */}
              {tab === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#57534E] uppercase tracking-wider block mb-2 font-sans">
                      Time Control
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TIME_CONTROLS.map((tc) => {
                        const isSelected = selectedTime.id === tc.id;
                        return (
                          <button
                            key={tc.id}
                            onClick={() => setSelectedTime(tc)}
                            className={`p-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-all flex flex-col items-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#1E3A2F]/10 border-[#1E3A2F] text-[#1E3A2F] shadow-xs'
                                : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]'
                            }`}
                          >
                            <span>{tc.name}</span>
                            <span className="text-[9px] text-[#78716C] font-normal uppercase font-mono">
                              {tc.category}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#57534E] uppercase tracking-wider block mb-2 font-sans">
                      Side Preference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSidePref('w')}
                        className={`p-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          sidePref === 'w'
                            ? 'bg-[#1E3A2F]/10 border-[#1E3A2F] text-[#1E3A2F]'
                            : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]'
                        }`}
                      >
                        <span className="text-lg">♔</span>
                        <span>White</span>
                      </button>
                      <button
                        onClick={() => setSidePref('random')}
                        className={`p-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          sidePref === 'random'
                            ? 'bg-[#1E3A2F]/10 border-[#1E3A2F] text-[#1E3A2F]'
                            : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]'
                        }`}
                      >
                        <span className="text-lg">☯</span>
                        <span>Random</span>
                      </button>
                      <button
                        onClick={() => setSidePref('b')}
                        className={`p-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          sidePref === 'b'
                            ? 'bg-[#1E3A2F]/10 border-[#1E3A2F] text-[#1E3A2F]'
                            : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]'
                        }`}
                      >
                        <span className="text-lg">♚</span>
                        <span>Black</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onCreateRoom(selectedTime, sidePref)}
                    className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-base rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2 border border-[#1C1917]"
                  >
                    <Link2 size={16} />
                    <span>Create Friend Room</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Join Room by Code */}
              {tab === 'join' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#57534E] uppercase tracking-wider block mb-2 font-sans">
                      Enter 6-Character Room Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. 7K9J2M"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-center text-2xl font-mono font-bold tracking-widest text-[#1C1917] uppercase focus:outline-none focus:border-[#1E3A2F] placeholder-[#A8A29E] shadow-inner"
                    />
                  </div>

                  <button
                    onClick={() => onJoinRoom(joinCodeInput.trim())}
                    disabled={joinCodeInput.trim().length < 4}
                    className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] disabled:opacity-40 text-[#FAF9F6] font-editorial-heading font-bold text-base rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-[#1C1917]"
                  >
                    <Users size={16} />
                    <span>Enter Salon Match</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
