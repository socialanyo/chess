import { Chess, PieceSymbol, Color } from 'chess.js';
import { PieceType, PieceColor } from '../types';

export interface CapturedPieces {
  w: PieceType[]; // pieces captured by White (i.e. black pieces)
  b: PieceType[]; // pieces captured by Black (i.e. white pieces)
}

const PIECE_VALS: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function getCapturedPieces(game: Chess): { capturedByWhite: PieceType[]; capturedByBlack: PieceType[]; scoreDiff: number } {
  // Standard starting pieces count
  const initialCounts = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  };

  const currentCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 } as Record<PieceType, number>,
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 } as Record<PieceType, number>,
  };

  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        currentCounts[piece.color as PieceColor][piece.type as PieceType]++;
      }
    }
  }

  // Black pieces captured by White:
  const capturedByWhite: PieceType[] = [];
  (Object.keys(initialCounts.b) as PieceType[]).forEach((type) => {
    const missing = initialCounts.b[type] - currentCounts.b[type];
    for (let i = 0; i < missing; i++) {
      capturedByWhite.push(type);
    }
  });

  // White pieces captured by Black:
  const capturedByBlack: PieceType[] = [];
  (Object.keys(initialCounts.w) as PieceType[]).forEach((type) => {
    const missing = initialCounts.w[type] - currentCounts.w[type];
    for (let i = 0; i < missing; i++) {
      capturedByBlack.push(type);
    }
  });

  // Calculate material difference
  let whiteMaterial = 0;
  let blackMaterial = 0;

  capturedByWhite.forEach((t) => {
    whiteMaterial += PIECE_VALS[t] || 0;
  });
  capturedByBlack.forEach((t) => {
    blackMaterial += PIECE_VALS[t] || 0;
  });

  const scoreDiff = whiteMaterial - blackMaterial;

  return {
    capturedByWhite,
    capturedByBlack,
    scoreDiff,
  };
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 1 && totalSeconds <= 20) {
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}`;
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
