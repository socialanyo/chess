import { Chess, Square } from 'chess.js';
import { CoachProfile } from '../types';

// Piece base values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional Piece-Square Tables (White perspective)
const PST_PAWN: number[] = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const PST_KNIGHT: number[] = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const PST_BISHOP: number[] = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const PST_ROOK: number[] = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const PST_QUEEN: number[] = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const PST_KING_MID: number[] = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(sq: Square, isWhite: boolean): number {
  const file = sq.charCodeAt(0) - 97; // 0..7
  const rank = parseInt(sq[1], 10) - 1; // 0..7
  const row = isWhite ? 7 - rank : rank;
  const col = isWhite ? file : 7 - file;
  return row * 8 + col;
}

export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -30000 : 30000;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  let totalEvaluation = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const fileChar = String.fromCharCode(97 + c);
      const rankChar = String(8 - r);
      const square = `${fileChar}${rankChar}` as Square;
      const idx = getSquareIndex(square, isWhite);

      let pieceVal = PIECE_VALUES[piece.type] || 0;
      let posVal = 0;

      switch (piece.type) {
        case 'p':
          posVal = PST_PAWN[idx];
          break;
        case 'n':
          posVal = PST_KNIGHT[idx];
          break;
        case 'b':
          posVal = PST_BISHOP[idx];
          break;
        case 'r':
          posVal = PST_ROOK[idx];
          break;
        case 'q':
          posVal = PST_QUEEN[idx];
          break;
        case 'k':
          posVal = PST_KING_MID[idx];
          break;
      }

      const totalVal = pieceVal + posVal;
      totalEvaluation += isWhite ? totalVal : -totalVal;
    }
  }

  return totalEvaluation;
}

// Alpha-Beta Minimax Engine
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove?: { from: string; to: string; promotion?: string } } {
  if (depth === 0 || game.isGameOver()) {
    return { score: evaluateBoard(game) };
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluateBoard(game) };
  }

  // Move ordering: sort captures and checks first
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    if (b.captured) scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    if (a.san.includes('+')) scoreA += 50;
    if (b.san.includes('+')) scoreB += 50;
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });

  let bestMove = { from: moves[0].from, to: moves[0].to, promotion: moves[0].promotion };

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalResult = minimax(game, depth - 1, alpha, beta, false);
      game.undo();

      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = { from: move.from, to: move.to, promotion: move.promotion };
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break; // Beta cutoff
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalResult = minimax(game, depth - 1, alpha, beta, true);
      game.undo();

      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = { from: move.from, to: move.to, promotion: move.promotion };
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return { score: minEval, bestMove };
  }
}

export function getBotMove(
  game: Chess,
  coach: CoachProfile
): { from: string; to: string; promotion?: string } | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Blunder chance check based on coach skill level
  const shouldBlunder = Math.random() < coach.blunderRate;
  if (shouldBlunder && moves.length > 1) {
    // Pick a random legal move, or lower-scoring move
    const randomIndex = Math.floor(Math.random() * moves.length);
    const m = moves[randomIndex];
    return { from: m.from, to: m.to, promotion: m.promotion };
  }

  const isWhite = game.turn() === 'w';
  const targetDepth = Math.max(1, Math.min(coach.depth, 4));

  const result = minimax(game, targetDepth, -Infinity, Infinity, isWhite);
  if (result.bestMove) {
    return result.bestMove;
  }

  const fallback = moves[0];
  return { from: fallback.from, to: fallback.to, promotion: fallback.promotion };
}

export function getMinimaxEvaluation(
  game: Chess,
  depth: number = 3
): { score: number; bestMoveSan?: string } {
  const isWhite = game.turn() === 'w';
  const evalResult = minimax(game, depth, -Infinity, Infinity, isWhite);
  let bestMoveSan: string | undefined = undefined;

  if (evalResult.bestMove) {
    try {
      const tempGame = new Chess(game.fen());
      const played = tempGame.move({
        from: evalResult.bestMove.from as Square,
        to: evalResult.bestMove.to as Square,
        promotion: evalResult.bestMove.promotion || 'q',
      });
      if (played) {
        bestMoveSan = played.san;
      }
    } catch {
      // fallback
    }
  }

  // Convert centipawns to pawn unit (e.g. 150 -> +1.5)
  return {
    score: evalResult.score / 100,
    bestMoveSan,
  };
}

export function getRandomQuote(quotes: string[]): string {
  if (!quotes || quotes.length === 0) return 'Let us play chess.';
  return quotes[Math.floor(Math.random() * quotes.length)];
}
