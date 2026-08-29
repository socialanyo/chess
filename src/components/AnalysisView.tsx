import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { BoardTheme, PieceColor } from '../types';
import { ChessBoard } from './ChessBoard';
import { evaluateBoard, getMinimaxEvaluation } from '../utils/chessBot';
import { sounds } from '../utils/sound';
import {
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Play,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface AnalysisViewProps {
  theme: BoardTheme;
}

const PRESET_OPENINGS = [
  { name: 'Standard Start', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
  { name: 'Ruy Lopez', fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3' },
  { name: 'Sicilian Defense', fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2' },
  { name: "Queen's Gambit", fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2' },
  { name: "King's Indian", fen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3' },
  { name: 'Lucena Position (Endgame)', fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1' },
];

export const AnalysisView: React.FC<AnalysisViewProps> = ({ theme }) => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [fenInput, setFenInput] = useState<string>(game.fen());
  const [orientation, setOrientation] = useState<PieceColor>('w');
  const [evalScore, setEvalScore] = useState<number>(0);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [copiedFen, setCopiedFen] = useState(false);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [history, setHistory] = useState<string[]>([game.fen()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const calculateEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      try {
        const evalResult = getMinimaxEvaluation(game, 3);
        setEvalScore(evalResult.score);
        setBestMove(evalResult.bestMoveSan || null);
      } catch (err) {
        console.error('Eval error:', err);
      } finally {
        setIsEvaluating(false);
      }
    }, 50);
  };

  useEffect(() => {
    calculateEvaluation();
    setFenInput(game.fen());
  }, [game]);

  const handleMove = (from: string, to: string, promotion?: any) => {
    try {
      const move = game.move({
        from: from as Square,
        to: to as Square,
        promotion: promotion || 'q',
      });
      if (move) {
        sounds.playMove();
        const newFen = game.fen();
        const newHist = history.slice(0, historyIndex + 1);
        newHist.push(newFen);
        setHistory(newHist);
        setHistoryIndex(newHist.length - 1);
        setGame(new Chess(newFen));
      }
    } catch (e) {
      sounds.playIllegal();
    }
  };

  const handleApplyFen = (fenToApply: string) => {
    try {
      const testGame = new Chess(fenToApply);
      setGame(testGame);
      setHistory([fenToApply]);
      setHistoryIndex(0);
    } catch (e) {
      alert('Invalid FEN string format');
    }
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(game.fen());
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(game.pgn() || game.fen());
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleReset = () => {
    const newG = new Chess();
    setGame(newG);
    setHistory([newG.fen()]);
    setHistoryIndex(0);
  };

  const evalNormalized = Math.max(-10, Math.min(10, evalScore));
  const whiteAdvantagePercent = ((evalNormalized + 10) / 20) * 100;

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-8 py-6 pb-20 md:pb-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 border-b border-[#E7E5E4] pb-4 mb-6">
        <div>
          <h1 className="font-editorial-heading text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
            The Analytical Monograph & Sandbox
          </h1>
          <p className="font-editorial-subheading italic text-xs sm:text-sm text-[#78716C]">
            Explore deep branch variations, position evaluations, and custom FEN setups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Board & Eval Bar Container */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="flex items-center gap-3 w-full max-w-[580px] justify-center">
            {/* Evaluation Gauge Bar */}
            <div className="w-4 h-[400px] sm:h-[460px] bg-[#292524] rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-[#44403C] shadow-md flex-shrink-0">
              <div
                className="w-full bg-[#FFFFFF] rounded-full transition-all duration-300 shadow-inner"
                style={{ height: `${whiteAdvantagePercent}%` }}
              />
            </div>

            {/* Chess Board */}
            <div className="flex-1">
              <ChessBoard
                game={game}
                orientation={orientation}
                interactive={true}
                onMove={handleMove}
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Evaluation Details & Sandbox Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Eval Score Card */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#0284C7]" size={18} />
                <span className="font-editorial-heading font-black text-lg text-[#1C1917]">
                  Stock Analysis
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#78716C]">
                Turn: {game.turn() === 'w' ? 'White' : 'Black'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] shadow-inner">
                <span className="text-[10px] uppercase font-bold text-[#78716C] block font-sans">
                  Evaluation
                </span>
                <span className="font-mono text-2xl font-black text-[#1C1917]">
                  {evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)}
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] shadow-inner">
                <span className="text-[10px] uppercase font-bold text-[#78716C] block font-sans">
                  Recommended Move
                </span>
                <span className="font-mono text-2xl font-black text-[#1E3A2F]">
                  {bestMove || '—'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={handleReset}
                className="py-2.5 px-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] text-[#44403C] font-semibold text-xs rounded-xl border border-[#E7E5E4] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>

              <button
                onClick={() => setOrientation(orientation === 'w' ? 'b' : 'w')}
                className="py-2.5 px-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] text-[#44403C] font-semibold text-xs rounded-xl border border-[#E7E5E4] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Flip Board</span>
              </button>

              <button
                onClick={calculateEvaluation}
                className="py-2.5 px-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-editorial-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#1C1917]"
              >
                <RefreshCw size={13} className={isEvaluating ? 'animate-spin' : ''} />
                <span>Re-evaluate</span>
              </button>
            </div>
          </div>

          {/* FEN Loader & Presets */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <span className="font-editorial-heading font-bold text-sm text-[#1C1917] block">
              Load Position / FEN Notation
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="Paste FEN string here..."
                className="flex-1 px-3 py-2 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#1E3A2F] shadow-inner"
              />
              <button
                onClick={() => handleApplyFen(fenInput)}
                className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#2D4A3E] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Load
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider block font-sans">
                Classical Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_OPENINGS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setFenInput(preset.fen);
                      handleApplyFen(preset.fen);
                    }}
                    className="p-2.5 bg-[#FAF9F6] hover:bg-[#F5F5F4] text-left text-xs rounded-xl border border-[#E7E5E4] transition-all cursor-pointer shadow-xs"
                  >
                    <span className="font-editorial-heading font-bold text-[#1C1917] block truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Exports */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E7E5E4] text-xs font-mono">
              <button
                onClick={handleCopyFen}
                className="text-[#78716C] hover:text-[#1C1917] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedFen ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedFen ? 'FEN Copied!' : 'Copy Current FEN'}</span>
              </button>
              <button
                onClick={handleCopyPgn}
                className="text-[#78716C] hover:text-[#1C1917] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPgn ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedPgn ? 'PGN Copied!' : 'Copy PGN'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
