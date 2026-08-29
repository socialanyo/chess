import React, { useState, useRef, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PieceType, PieceColor, BoardTheme } from '../types';
import { ChessPieceSvg } from './ChessPieces';
import { motion, AnimatePresence } from 'motion/react';

interface ChessBoardProps {
  game: Chess;
  orientation?: PieceColor;
  interactive?: boolean;
  onMove?: (from: string, to: string, promotion?: PieceType) => void;
  lastMove?: { from: string; to: string } | null;
  theme?: BoardTheme;
  showCoordinates?: boolean;
  hintSquares?: string[];
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  orientation = 'w',
  interactive = true,
  onMove,
  lastMove,
  theme = 'green',
  showCoordinates = true,
  hintSquares = [],
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Dragging state
  const [dragSquare, setDragSquare] = useState<Square | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const isFlipped = orientation === 'b';

  // Calculate ranks and files order based on orientation
  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Board colors based on theme
  const getThemeColors = () => {
    switch (theme) {
      case 'wood':
        return { light: '#f4ede2', dark: '#a97a50', lastLight: '#dfce8b', lastDark: '#8f6f39' };
      case 'blue':
        return { light: '#edf2f7', dark: '#68829e', lastLight: '#d2df89', lastDark: '#7f965d' };
      case 'slate':
        return { light: '#f1f5f9', dark: '#64748b', lastLight: '#cbd5e1', lastDark: '#475569' };
      case 'crimson':
        return { light: '#fdf2f4', dark: '#8f3c4c', lastLight: '#fde047', lastDark: '#b45309' };
      case 'green':
      default:
        return { light: '#f2efe9', dark: '#4f725a', lastLight: '#e4dc8e', lastDark: '#8a9b47' };
    }
  };
  const themeColors = getThemeColors();

  // Find king square in check
  const inCheck = game.inCheck();
  let checkSquare: Square | null = null;
  if (inCheck) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          const fileChar = String.fromCharCode(97 + c);
          const rankNum = 8 - r;
          checkSquare = `${fileChar}${rankNum}` as Square;
          break;
        }
      }
    }
  }

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;

    // If waiting for promotion selection, cancel or ignore
    if (pendingPromotion) {
      setPendingPromotion(null);
      return;
    }

    // If clicking on an already selected square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Check if clicked square is a valid destination for selected piece
    if (selectedSquare) {
      const move = legalMoves.find((m) => m.to === square);
      if (move) {
        // Check if pawn promotion
        const piece = game.get(selectedSquare);
        const isPromotion =
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && square.endsWith('8')) || (piece.color === 'b' && square.endsWith('1')));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        // Standard move
        if (onMove) {
          onMove(selectedSquare, square);
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    // Select piece on this square if it's current turn player's piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotionSelect = (promotionPiece: PieceType) => {
    if (pendingPromotion && onMove) {
      onMove(pendingPromotion.from, pendingPromotion.to, promotionPiece);
    }
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // Touch and Drag-and-drop handlers
  const getSquareFromCoords = (clientX: number, clientY: number): Square | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return null;
    }
    const xRatio = (clientX - rect.left) / rect.width;
    const yRatio = (clientY - rect.top) / rect.height;

    const fileIdx = Math.floor(xRatio * 8);
    const rankIdx = Math.floor(yRatio * 8);

    if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) return null;

    const file = files[fileIdx];
    const rank = ranks[rankIdx];
    return `${file}${rank}` as Square;
  };

  const handlePointerDown = (e: React.PointerEvent, square: Square) => {
    if (!interactive) return;
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) return;

    setDragSquare(square);
    setDragPos({ x: e.clientX, y: e.clientY });
    setSelectedSquare(square);
    const moves = game.moves({ square, verbose: true });
    setLegalMoves(moves);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (dragSquare) {
        setDragPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragSquare) {
        const targetSquare = getSquareFromCoords(e.clientX, e.clientY);
        if (targetSquare && targetSquare !== dragSquare) {
          const move = legalMoves.find((m) => m.to === targetSquare);
          if (move) {
            const piece = game.get(dragSquare);
            const isPromotion =
              piece &&
              piece.type === 'p' &&
              ((piece.color === 'w' && targetSquare.endsWith('8')) || (piece.color === 'b' && targetSquare.endsWith('1')));

            if (isPromotion) {
              setPendingPromotion({ from: dragSquare, to: targetSquare });
            } else if (onMove) {
              onMove(dragSquare, targetSquare);
              setSelectedSquare(null);
              setLegalMoves([]);
            }
          }
        }
        setDragSquare(null);
        setDragPos(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragSquare, legalMoves, game, onMove, files, ranks]);

  return (
    <div className="relative flex items-center justify-center select-none w-full max-w-[580px] aspect-square mx-auto p-2 sm:p-3 bg-[#1C1917] rounded-2xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] border-2 border-[#292524]">
      <div
        ref={boardRef}
        id="chess-board-grid"
        className="relative w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden touch-none shadow-inner"
      >
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = `${file}${rank}` as Square;
            const isLight = (fileIdx + rankIdx) % 2 === 0;
            const piece = game.get(square);

            const isSelected = selectedSquare === square;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isCheck = checkSquare === square;
            const isHint = hintSquares.includes(square);
            const legalMove = legalMoves.find((m) => m.to === square);
            const isBeingDragged = dragSquare === square;

            // Background color logic
            let bg = isLight ? themeColors.light : themeColors.dark;
            if (isLastMove) {
              bg = isLight ? themeColors.lastLight : themeColors.lastDark;
            }

            return (
              <div
                key={square}
                id={`square-${square}`}
                onClick={() => handleSquareClick(square)}
                onPointerDown={(e) => handlePointerDown(e, square)}
                className="relative flex items-center justify-center transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: bg }}
              >
                {/* Coordinates */}
                {showCoordinates && (
                  <>
                    {/* Rank label on left column */}
                    {fileIdx === 0 && (
                      <span
                        className="absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-serif font-bold pointer-events-none opacity-80"
                        style={{ color: isLight ? themeColors.dark : themeColors.light }}
                      >
                        {rank}
                      </span>
                    )}
                    {/* File label on bottom row */}
                    {rankIdx === 7 && (
                      <span
                        className="absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-serif font-bold pointer-events-none opacity-80"
                        style={{ color: isLight ? themeColors.dark : themeColors.light }}
                      >
                        {file}
                      </span>
                    )}
                  </>
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#FCD34D]/45 ring-2 ring-[#D97706] pointer-events-none z-10" />
                )}

                {/* Check warning red glow */}
                {isCheck && (
                  <div className="absolute inset-0 bg-red-600/50 rounded-full blur-xs animate-pulse pointer-events-none z-10" />
                )}

                {/* Hint highlight */}
                {isHint && (
                  <div className="absolute inset-0 bg-sky-500/40 ring-2 ring-sky-400 pointer-events-none z-10" />
                )}

                {/* Legal Move Indicators */}
                {legalMove && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {piece ? (
                      // Capture ring indicator
                      <div className="w-full h-full border-4 border-black/35 rounded-full" />
                    ) : (
                      // Dot indicator for empty square
                      <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 bg-black/25 rounded-full shadow-inner" />
                    )}
                  </div>
                )}

                {/* Chess Piece on the board */}
                {piece && !isBeingDragged && (
                  <div className="w-[86%] h-[86%] flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-transform duration-100 active:scale-95">
                    <ChessPieceSvg type={piece.type as PieceType} color={piece.color as PieceColor} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Dragging Piece Floating Overlay */}
        {dragSquare && dragPos && (
          <div
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 drop-shadow-2xl scale-110"
            style={{ left: dragPos.x, top: dragPos.y }}
          >
            {(() => {
              const piece = game.get(dragSquare);
              return piece ? <ChessPieceSvg type={piece.type as PieceType} color={piece.color as PieceColor} /> : null;
            })()}
          </div>
        )}

        {/* Pawn Promotion Modal Overlay */}
        <AnimatePresence>
          {pendingPromotion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            >
              <div className="bg-[#FAF9F6] border-2 border-[#1C1917] rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-3.5">
                <span className="font-editorial-heading text-sm font-bold text-[#1C1917] uppercase tracking-wider">
                  Promote Pawn
                </span>
                <div className="flex gap-2.5">
                  {(['q', 'n', 'r', 'b'] as PieceType[]).map((pType) => (
                    <button
                      key={pType}
                      id={`promote-to-${pType}`}
                      onClick={() => handlePromotionSelect(pType)}
                      className="w-14 h-14 sm:w-16 sm:h-16 p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#1E3A2F] hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center border border-[#E7E5E4]"
                    >
                      <ChessPieceSvg type={pType} color={game.turn() as PieceColor} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
