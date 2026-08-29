import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Puzzle, BoardTheme, PieceColor } from '../types';
import { PUZZLES } from '../data/puzzles';
import { ChessBoard } from './ChessBoard';
import { sounds } from '../utils/sound';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Flame,
} from 'lucide-react';

interface PuzzlesViewProps {
  theme: BoardTheme;
  onSolvePuzzle?: (puzzleId: string) => void;
  dayStreak?: number;
  onBackToHome?: () => void;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({
  theme,
  onSolvePuzzle,
  dayStreak = 1,
}) => {
  const [activePuzzleIndex, setActivePuzzleIndex] = useState(0);
  const currentPuzzle: Puzzle = PUZZLES[activePuzzleIndex] || PUZZLES[0];

  const [game, setGame] = useState<Chess>(new Chess(currentPuzzle.fen));
  const [moveStep, setMoveStep] = useState(0);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [feedback, setFeedback] = useState<string>('');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [hintSquares, setHintSquares] = useState<string[]>([]);

  // Initialize board whenever puzzle changes
  useEffect(() => {
    const newGame = new Chess(currentPuzzle.fen);
    setGame(newGame);
    setMoveStep(0);
    setStatus('playing');
    setFeedback(`White to move. ${currentPuzzle.title}`);
    setLastMove(null);
    setHintSquares([]);
  }, [activePuzzleIndex, currentPuzzle]);

  const handleMove = (from: string, to: string, promotion?: any) => {
    if (status === 'solved') return;

    const expectedMove = currentPuzzle.solution[moveStep];

    try {
      const move = game.move({
        from: from as Square,
        to: to as Square,
        promotion: promotion || 'q',
      });

      if (!move) {
        sounds.playIllegal();
        return;
      }

      setLastMove({ from, to });
      sounds.playMove();

      // Check if move matches solution (UCI 'd1d8' or SAN 'Qxf7#' or 'd8=Q')
      const uciPlayed = `${from}${to}`.toLowerCase();
      const uciExpected = expectedMove?.toLowerCase() || '';
      const sanClean = move.san.replace(/[+#]/g, '');
      const expClean = expectedMove?.replace(/[+#]/g, '') || '';

      const isMatch =
        uciPlayed === uciExpected.replace(/[^a-h1-8]/g, '') ||
        sanClean === expClean ||
        move.san === expectedMove;

      if (isMatch) {
        const nextStep = moveStep + 1;

        if (nextStep >= currentPuzzle.solution.length) {
          // Puzzle Solved!
          setStatus('solved');
          setFeedback('Outstanding calculation! Puzzle solved perfectly.');
          sounds.playVictory();
          if (onSolvePuzzle) onSolvePuzzle(currentPuzzle.id);
        } else {
          // Expected opponent reply
          setMoveStep(nextStep);
          setFeedback('Good move! Defending reply coming up...');

          setTimeout(() => {
            const oppMove = currentPuzzle.solution[nextStep];
            try {
              let oppResult = null;
              if (oppMove.length >= 4 && !/[NBRQK]/.test(oppMove[0])) {
                const oFrom = oppMove.slice(0, 2) as Square;
                const oTo = oppMove.slice(2, 4) as Square;
                oppResult = game.move({ from: oFrom, to: oTo, promotion: 'q' });
              } else {
                oppResult = game.move(oppMove);
              }

              if (oppResult) {
                setLastMove({ from: oppResult.from, to: oppResult.to });
                sounds.playMove();
                setGame(new Chess(game.fen()));
                setMoveStep(nextStep + 1);
                setFeedback('Your turn! Find the next decisive blow.');
              }
            } catch (err) {
              console.error('Opponent move error:', err);
            }
          }, 600);
        }
      } else {
        // Incorrect Move
        setStatus('failed');
        setFeedback('That is not the best move in this position. Try again!');
        sounds.playIllegal();
      }

      setGame(new Chess(game.fen()));
    } catch (e) {
      sounds.playIllegal();
    }
  };

  const handleReset = () => {
    const newGame = new Chess(currentPuzzle.fen);
    setGame(newGame);
    setMoveStep(0);
    setStatus('playing');
    setFeedback(`White to move. ${currentPuzzle.title}`);
    setLastMove(null);
    setHintSquares([]);
  };

  const handleShowHint = () => {
    const nextMove = currentPuzzle.solution[moveStep];
    if (nextMove && nextMove.length >= 2) {
      const hintSq = nextMove.slice(0, 2);
      setHintSquares([hintSq]);
      setFeedback(`Hint: ${currentPuzzle.hint || `Look closely at square ${hintSq.toUpperCase()}...`}`);
    } else {
      setFeedback(`Hint: ${currentPuzzle.hint}`);
    }
  };

  const handleNextPuzzle = () => {
    setActivePuzzleIndex((prev) => (prev + 1) % PUZZLES.length);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-8 py-6 pb-20 md:pb-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 border-b border-[#E7E5E4] pb-4 mb-6">
        <div>
          <h1 className="font-editorial-heading text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
            The Tactical Academy
          </h1>
          <p className="font-editorial-subheading italic text-xs sm:text-sm text-[#78716C]">
            Sharpen your calculation with curated historical checkmates, skewers, and pins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg text-xs font-semibold text-[#B45309] shadow-xs">
            <Flame size={15} className="text-[#D97706] fill-[#D97706]" />
            <span className="font-mono text-[#44403C] font-bold">{dayStreak}d Streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chess Board Area */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <ChessBoard
            game={game}
            orientation="w"
            interactive={status !== 'solved'}
            onMove={handleMove}
            lastMove={lastMove}
            theme={theme}
            hintSquares={hintSquares}
          />
        </div>

        {/* Puzzle Details & Controls Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Info Card */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#B45309]/10 text-[#B45309] text-xs font-bold font-sans uppercase tracking-wider">
                  {currentPuzzle.theme || 'Tactics'}
                </span>
                <span className="text-xs font-mono font-bold text-[#78716C]">
                  Rating {currentPuzzle.rating}
                </span>
              </div>
              <span className="text-xs font-mono text-[#78716C]">
                Study {activePuzzleIndex + 1} of {PUZZLES.length}
              </span>
            </div>

            <div>
              <h2 className="font-editorial-heading text-xl sm:text-2xl font-black text-[#1C1917]">
                {currentPuzzle.title}
              </h2>
              <p className="font-editorial-subheading italic text-xs sm:text-sm text-[#57534E] mt-1">
                {currentPuzzle.description}
              </p>
            </div>

            {/* Status & Feedback Alert Banner */}
            <div
              className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                status === 'solved'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : status === 'failed'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#1C1917]'
              }`}
            >
              {status === 'solved' && <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />}
              {status === 'failed' && <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={18} />}
              {status === 'playing' && <Sparkles className="text-[#1E3A2F] flex-shrink-0 mt-0.5" size={18} />}

              <div className="text-xs sm:text-sm">
                <span className="font-editorial-heading font-bold block">
                  {status === 'solved'
                    ? 'Magnificent!'
                    : status === 'failed'
                    ? 'Inaccurate Line'
                    : 'Tactical Objective'}
                </span>
                <span className="font-editorial-subheading italic mt-0.5 block">{feedback}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              <button
                onClick={handleReset}
                className="py-2.5 px-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] text-[#44403C] font-semibold text-xs rounded-xl border border-[#E7E5E4] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw size={13} />
                <span>Reset Board</span>
              </button>

              <button
                onClick={handleShowHint}
                disabled={status === 'solved'}
                className="py-2.5 px-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] text-[#44403C] font-semibold text-xs rounded-xl border border-[#E7E5E4] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
              >
                <HelpCircle size={13} className="text-[#B45309]" />
                <span>Request Hint</span>
              </button>

              <button
                onClick={handleNextPuzzle}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#1C1917]"
              >
                <span>Next Study</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Puzzle Collection Selector Carousel */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <span className="font-editorial-heading font-bold text-xs text-[#57534E] uppercase tracking-wider block mb-2.5 font-sans">
              Curated Tactical Studies
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PUZZLES.map((p, idx) => {
                const isActive = idx === activePuzzleIndex;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePuzzleIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1E3A2F]/10 border-[#1E3A2F] shadow-xs'
                        : 'bg-[#FAF9F6] border-[#E7E5E4] hover:bg-[#F5F5F4]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#78716C] font-mono">
                      <span>#{idx + 1}</span>
                      <span className="font-bold">{p.rating}</span>
                    </div>
                    <span className="font-editorial-heading font-bold text-xs text-[#1C1917] truncate block mt-0.5">
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
