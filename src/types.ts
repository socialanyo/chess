export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessMoveRecord {
  san: string;
  from: string;
  to: string;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  flags: string;
  fenAfter: string;
  evaluation?: number;
}

export type GameMode = 'online' | 'bot' | 'pass_and_play' | 'puzzle' | 'analysis';
export type UserExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TimeControl {
  id: string;
  name: string;
  category: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom' | 'unlimited';
  minutes: number;
  increment: number;
  icon?: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  title?: string;
  country?: string;
  color: PieceColor;
  isBot?: boolean;
}

export interface CoachProfile {
  id: string;
  name: string;
  title: string;
  rating: number;
  avatar: string;
  description: string;
  personality: 'cat_master' | 'patient_teacher' | 'aggressive_tactician' | 'grandmaster' | 'friendly_beginner' | 'speed_demon';
  blunderRate: number;
  depth: number;
  quotes: {
    greeting: string[];
    goodMove: string[];
    blunder: string[];
    victory: string[];
    defeat: string[];
  };
}

export interface Puzzle {
  id: string;
  title: string;
  rating: number;
  theme: string;
  fen: string;
  solution: string[]; // sequence of UCI or SAN moves: e.g. ["Qxf7#"] or ["e2e4", "e7e5"]
  description: string;
  hint: string;
}

export interface GameRoomState {
  roomId: string;
  fen: string;
  pgn: string;
  turn: PieceColor;
  isGameOver: boolean;
  winner: PieceColor | 'draw' | null;
  winReason?: string;
  whitePlayer: PlayerInfo | null;
  blackPlayer: PlayerInfo | null;
  spectatorsCount: number;
  timeControl: TimeControl;
  whiteTime: number; // milliseconds
  blackTime: number; // milliseconds
  lastMoveTimestamp: number;
  isClockRunning: boolean;
  moves: ChessMoveRecord[];
  drawOfferedBy: PieceColor | null;
  rematchRequestedBy: PieceColor | null;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderColor?: PieceColor;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export type BoardTheme = 'green' | 'wood' | 'blue' | 'slate' | 'crimson';
export type PieceTheme = 'neo' | 'classic' | 'modern';
