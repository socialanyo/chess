import React, { useState } from 'react';
import { ChessMoveRecord, PieceColor } from '../types';
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  RotateCcw,
  Flag,
  Handshake,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface MoveHistoryProps {
  moves: ChessMoveRecord[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  onFlipBoard: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
  onNewGame?: () => void;
  fen: string;
  pgn: string;
  isGameOver: boolean;
  gameResult?: string;
  isMultiplayer?: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  onFlipBoard,
  onResign,
  onOfferDraw,
  onNewGame,
  fen,
  pgn,
  isGameOver,
  gameResult,
  isMultiplayer = false,
}) => {
  const [copiedFen, setCopiedFen] = useState(false);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    sounds.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) sounds.playMove();
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(fen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(pgn);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  // Group moves into pairs (White move, Black move)
  const movePairs: Array<{ number: number; white?: ChessMoveRecord; black?: ChessMoveRecord }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F6] border-b border-[#E7E5E4]">
        <span className="font-editorial-heading font-bold text-sm text-[#1C1917] tracking-wide flex items-center gap-2">
          <span>Notation Journal</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E7E5E4] text-[#57534E] font-mono font-bold">
            {moves.length}
          </span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border border-[#E7E5E4] transition-colors ${
              soundEnabled ? 'text-[#1C1917] hover:bg-[#F5F5F4]' : 'text-[#A8A29E] hover:bg-[#F5F5F4]'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            onClick={onFlipBoard}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg border border-[#E7E5E4] transition-colors"
            title="Flip Board Orientation"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Move notation table */}
      <div className="flex-1 overflow-y-auto max-h-[160px] sm:max-h-[220px] p-2 font-mono text-sm space-y-0.5">
        {movePairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#A8A29E] text-xs py-8 italic font-editorial-subheading">
            Game notation will be transcribed here as moves are played...
          </div>
        ) : (
          movePairs.map((pair, rowIdx) => {
            const whiteIdx = (pair.number - 1) * 2;
            const blackIdx = whiteIdx + 1;
            const isWhiteSelected = currentMoveIndex === whiteIdx;
            const isBlackSelected = currentMoveIndex === blackIdx;

            return (
              <div
                key={pair.number}
                className={`grid grid-cols-12 px-2.5 py-1 rounded-lg text-xs sm:text-sm items-center transition-colors ${
                  rowIdx % 2 === 0 ? 'bg-[#FAF9F6]/80' : 'bg-transparent'
                }`}
              >
                <span className="col-span-2 text-[#78716C] font-bold">{pair.number}.</span>
                <button
                  onClick={() => onSelectMove(whiteIdx)}
                  className={`col-span-5 text-left px-2 py-0.5 rounded-md font-semibold transition-all ${
                    isWhiteSelected
                      ? 'bg-[#1E3A2F] text-white shadow-xs'
                      : 'text-[#1C1917] hover:bg-[#E7E5E4]'
                  }`}
                >
                  {pair.white?.san}
                </button>
                {pair.black ? (
                  <button
                    onClick={() => onSelectMove(blackIdx)}
                    className={`col-span-5 text-left px-2 py-0.5 rounded-md font-semibold transition-all ${
                      isBlackSelected
                        ? 'bg-[#1E3A2F] text-white shadow-xs'
                        : 'text-[#1C1917] hover:bg-[#E7E5E4]'
                    }`}
                  >
                    {pair.black.san}
                  </button>
                ) : (
                  <span className="col-span-5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Game Over Banner if ended */}
      {isGameOver && (
        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#E7E5E4] text-center flex flex-col items-center gap-1">
          <span className="font-editorial-heading font-black text-sm text-[#1E3A2F]">Match Concluded</span>
          <span className="font-editorial-subheading italic text-xs text-[#57534E]">{gameResult || 'Game finished.'}</span>
          {onNewGame && (
            <button
              onClick={onNewGame}
              className="mt-2 w-full py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all active:scale-98"
            >
              Play Again / New Match
            </button>
          )}
        </div>
      )}

      {/* Replay navigation bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#FAF9F6] border-t border-[#E7E5E4]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectMove(-1)}
            disabled={moves.length === 0}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7E5E4] disabled:opacity-30 rounded-lg transition-colors"
            title="Start of game"
          >
            <ChevronFirst size={16} />
          </button>
          <button
            onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={moves.length === 0 || currentMoveIndex < 0}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7E5E4] disabled:opacity-30 rounded-lg transition-colors"
            title="Previous move"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onSelectMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
            disabled={moves.length === 0 || currentMoveIndex >= moves.length - 1}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7E5E4] disabled:opacity-30 rounded-lg transition-colors"
            title="Next move"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelectMove(moves.length - 1)}
            disabled={moves.length === 0 || currentMoveIndex === moves.length - 1}
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7E5E4] disabled:opacity-30 rounded-lg transition-colors"
            title="Latest move"
          >
            <ChevronLast size={16} />
          </button>
        </div>

        {/* Action buttons (Resign, Draw offer) */}
        {!isGameOver && (
          <div className="flex items-center gap-1.5">
            {onOfferDraw && (
              <button
                onClick={onOfferDraw}
                className="px-2.5 py-1 text-xs font-semibold text-[#44403C] bg-[#FFFFFF] hover:bg-[#E7E5E4] rounded-lg border border-[#E7E5E4] transition-colors flex items-center gap-1"
                title="Offer Draw"
              >
                <Handshake size={13} />
                <span className="hidden sm:inline">Draw</span>
              </button>
            )}
            {onResign && (
              <>
                {showResignConfirm ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setShowResignConfirm(false);
                        onResign();
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowResignConfirm(false)}
                      className="px-2 py-1 text-xs font-semibold text-[#57534E] bg-[#FFFFFF] hover:bg-[#E7E5E4] rounded-lg border border-[#E7E5E4] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResignConfirm(true)}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                    title="Resign Game"
                  >
                    <Flag size={13} />
                    <span className="hidden sm:inline">Resign</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Copy FEN / PGN row */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF9F6] border-t border-[#E7E5E4] text-[11px] font-mono">
        <button
          onClick={handleCopyFen}
          className="text-[#78716C] hover:text-[#1C1917] transition-colors flex items-center gap-1 cursor-pointer"
          title="Copy FEN to clipboard"
        >
          {copiedFen ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          <span>{copiedFen ? 'FEN Copied!' : 'Copy FEN'}</span>
        </button>
        <button
          onClick={handleCopyPgn}
          className="text-[#78716C] hover:text-[#1C1917] transition-colors flex items-center gap-1 cursor-pointer"
          title="Copy PGN to clipboard"
        >
          {copiedPgn ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          <span>{copiedPgn ? 'PGN Copied!' : 'Copy PGN'}</span>
        </button>
      </div>
    </div>
  );
};
