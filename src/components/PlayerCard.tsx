import React from 'react';
import { PlayerInfo, PieceType, PieceColor } from '../types';
import { ChessPieceSvg } from './ChessPieces';
import { formatTime } from '../utils/chessLogic';
import { Wifi, WifiOff } from 'lucide-react';

interface PlayerCardProps {
  player: PlayerInfo | null;
  color: PieceColor;
  timeRemaining: number;
  isTurn: boolean;
  capturedPieces: PieceType[];
  scoreDiff?: number; // material lead (+3 etc.)
  isConnected?: boolean;
  isClockRunning?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  color,
  timeRemaining,
  isTurn,
  capturedPieces,
  scoreDiff = 0,
  isConnected = true,
  isClockRunning = true,
}) => {
  const isLowTime = isClockRunning && timeRemaining > 0 && timeRemaining <= 20000;

  // Group captured pieces for compact presentation
  const pieceCounts: Record<PieceType, number> = {
    p: 0,
    n: 0,
    b: 0,
    r: 0,
    q: 0,
    k: 0,
  };
  capturedPieces.forEach((p) => {
    pieceCounts[p] = (pieceCounts[p] || 0) + 1;
  });

  const oppositeColor: PieceColor = color === 'w' ? 'b' : 'w';

  return (
    <div
      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
        isTurn
          ? 'bg-[#FFFFFF] border-l-4 border-l-[#1E3A2F] border border-[#D6D3D1] shadow-sm'
          : 'bg-[#FAF9F6] border border-[#E7E5E4]'
      }`}
    >
      {/* Player info & captured pieces */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FFFFFF] flex items-center justify-center text-xl sm:text-2xl border border-[#E7E5E4] shadow-xs overflow-hidden">
            {player?.avatar || (color === 'w' ? '♔' : '♚')}
          </div>
          {player && !player.isBot && (
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#FAF9F6] ${
                isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            {player?.title && (
              <span className="px-1.5 py-0.2 bg-[#991B1B] text-white text-[9px] font-extrabold rounded-xs tracking-wider uppercase font-sans">
                {player.title}
              </span>
            )}
            <span className="font-editorial-heading font-bold text-sm sm:text-base text-[#1C1917] truncate max-w-[120px] sm:max-w-[170px]">
              {player?.name || (color === 'w' ? 'White' : 'Black')}
            </span>
            {player?.rating !== undefined && (
              <span className="text-xs text-[#78716C] font-mono font-medium">({player.rating})</span>
            )}
          </div>

          {/* Captured Pieces Rack */}
          <div className="flex items-center gap-1 mt-0.5 h-4">
            <div className="flex items-center -space-x-1.5">
              {(['p', 'n', 'b', 'r', 'q'] as PieceType[]).map((type) => {
                const count = pieceCounts[type];
                if (!count) return null;
                return (
                  <div key={type} className="flex items-center">
                    <div className="w-3.5 h-3.5">
                      <ChessPieceSvg type={type} color={oppositeColor} />
                    </div>
                    {count > 1 && (
                      <span className="text-[10px] text-[#78716C] font-semibold ml-0.5 font-mono">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {scoreDiff > 0 && (
              <span className="text-[11px] font-bold font-mono text-[#1E3A2F] ml-1">+{scoreDiff}</span>
            )}
          </div>
        </div>
      </div>

      {/* Clock timer */}
      <div
        className={`px-3 py-1.5 rounded-lg font-mono font-bold text-base sm:text-lg tracking-wider flex items-center justify-center transition-all ${
          isLowTime
            ? 'bg-rose-100 text-rose-700 border border-rose-400 animate-pulse'
            : isTurn
            ? 'bg-[#1C1917] text-[#FAF9F6] shadow-xs border border-[#1C1917]'
            : 'bg-[#E7E5E4] text-[#57534E] border border-transparent'
        }`}
      >
        {formatTime(timeRemaining)}
      </div>
    </div>
  );
};
