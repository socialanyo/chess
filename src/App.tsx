import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import {
  GameMode,
  PieceColor,
  PieceType,
  PlayerInfo,
  CoachProfile,
  TimeControl,
  ChessMoveRecord,
  ChatMessage,
  BoardTheme,
} from './types';
import { COACHES } from './data/coaches';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { ChessBoard } from './components/ChessBoard';
import { PlayerCard } from './components/PlayerCard';
import { MoveHistory } from './components/MoveHistory';
import { CoachBubble } from './components/CoachBubble';
import { GameChat } from './components/GameChat';
import { MultiplayerModal } from './components/MultiplayerModal';
import { CoachSelectModal } from './components/CoachSelectModal';
import { ExperienceModal } from './components/ExperienceModal';
import { PuzzlesView } from './components/PuzzlesView';
import { AnalysisView } from './components/AnalysisView';
import { getCapturedPieces } from './utils/chessLogic';
import { getBotMove, getRandomQuote } from './utils/chessBot';
import { sounds } from './utils/sound';
import confetti from 'canvas-confetti';
import { Swords, Bot, Sparkles, RotateCcw, ArrowLeft, RefreshCw, Trophy, Share2 } from 'lucide-react';

export default function App() {
  // Navigation & Game Modes
  const [currentMode, setCurrentMode] = useState<GameMode>('online');
  const [inActiveMatch, setInActiveMatch] = useState(false);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('green');

  // User Profile
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('chess_username') || 'ChessMaster');
  const [userRating, setUserRating] = useState<number>(() => parseInt(localStorage.getItem('chess_rating') || '1200', 10));
  const [userAvatar, setUserAvatar] = useState<string>(() => localStorage.getItem('chess_avatar') || '♟️');
  const [dayStreak, setDayStreak] = useState<number>(1);
  const [playerId] = useState<string>(() => {
    let id = localStorage.getItem('chess_player_id');
    if (!id) {
      id = `p_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('chess_player_id', id);
    }
    return id;
  });

  // Selected Coach & Bot state
  const [selectedCoach, setSelectedCoach] = useState<CoachProfile>(COACHES[0]); // Mittens
  const [coachSpeech, setCoachSpeech] = useState<string>(COACHES[0].quotes.greeting[0]);
  const [isLoadingCoachAdvice, setIsLoadingCoachAdvice] = useState(false);

  // Modals state
  const [isMultiplayerModalOpen, setIsMultiplayerModalOpen] = useState(false);
  const [isCoachSelectOpen, setIsCoachSelectOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);

  // Chess Game State
  const [game, setGame] = useState<Chess>(new Chess());
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [boardOrientation, setBoardOrientation] = useState<PieceColor>('w');
  const [moves, setMoves] = useState<ChessMoveRecord[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Time & Clock state
  const [timeControl, setTimeControl] = useState<TimeControl>({
    id: 'rapid_10_0',
    name: '10 min',
    minutes: 10,
    increment: 0,
    category: 'rapid',
  });
  const [whiteTime, setWhiteTime] = useState<number>(10 * 60 * 1000);
  const [blackTime, setBlackTime] = useState<number>(10 * 60 * 1000);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);

  // Opponent info
  const [whitePlayer, setWhitePlayer] = useState<PlayerInfo | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<PlayerInfo | null>(null);

  // Match outcome state
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string | undefined>(undefined);
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);

  // Multiplayer WebSocket State
  const [roomId, setRoomId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [spectatorCount, setSpectatorCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'init_player',
          playerId,
          name: userName,
          rating: userRating,
          avatar: userAvatar,
        })
      );

      // Check if URL has ?room=
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        ws.send(JSON.stringify({ type: 'join_room', roomId: roomParam.toUpperCase() }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'room_created': {
            setCreatedRoomCode(msg.roomId);
            setRoomId(msg.roomId);
            setPlayerColor(msg.playerColor);
            setBoardOrientation(msg.playerColor);
            break;
          }

          case 'quick_play_waiting': {
            setIsSearchingMatch(true);
            break;
          }

          case 'quick_play_cancelled': {
            setIsSearchingMatch(false);
            break;
          }

          case 'room_joined':
          case 'game_started': {
            setIsSearchingMatch(false);
            setIsMultiplayerModalOpen(false);
            setCreatedRoomCode(null);
            setInActiveMatch(true);
            setCurrentMode('online');

            const state = msg.roomState;
            setRoomId(state.roomId);
            const newChess = new Chess(state.fen);
            setGame(newChess);
            setWhitePlayer(state.whitePlayer);
            setBlackPlayer(state.blackPlayer);
            setWhiteTime(state.whiteTime);
            setBlackTime(state.blackTime);
            setIsClockRunning(state.isClockRunning);
            setIsGameOver(state.isGameOver);
            setWinner(state.winner);
            setGameResult(state.winReason);
            setMoves(state.moves || []);
            setCurrentMoveIndex((state.moves || []).length - 1);

            if (msg.playerColor) {
              setPlayerColor(msg.playerColor);
              setBoardOrientation(msg.playerColor);
            }

            sounds.playGameStart();
            break;
          }

          case 'move_made': {
            const state = msg.roomState;
            const newChess = new Chess(state.fen);
            setGame(newChess);
            setWhiteTime(state.whiteTime);
            setBlackTime(state.blackTime);
            setIsClockRunning(state.isClockRunning);
            setIsGameOver(state.isGameOver);
            setWinner(state.winner);
            setGameResult(state.winReason);
            setMoves(state.moves || []);
            setCurrentMoveIndex((state.moves || []).length - 1);

            if (msg.move) {
              setLastMove({ from: msg.move.from, to: msg.move.to });
              if (msg.move.captured) sounds.playCapture();
              else if (newChess.inCheck()) sounds.playCheck();
              else if (msg.move.flags?.includes('k') || msg.move.flags?.includes('q')) sounds.playCastle();
              else sounds.playMove();
            }

            if (state.isGameOver) {
              if (state.winner === playerColor) {
                sounds.playVictory();
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              } else if (state.winner === 'draw') {
                sounds.playMove();
              } else {
                sounds.playDefeat();
              }
            }
            break;
          }

          case 'game_over': {
            setIsGameOver(true);
            setIsClockRunning(false);
            setWinner(msg.winner);
            setGameResult(msg.reason);
            if (msg.winner === playerColor) {
              sounds.playVictory();
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } else if (msg.winner === 'draw') {
              sounds.playMove();
            } else {
              sounds.playDefeat();
            }
            break;
          }

          case 'chat_message': {
            setChatMessages((prev) => [...prev, msg.message]);
            break;
          }

          case 'spectator_count': {
            setSpectatorCount(msg.count);
            break;
          }

          case 'rematch_started': {
            const state = msg.roomState;
            setGame(new Chess(state.fen));
            setWhitePlayer(state.whitePlayer);
            setBlackPlayer(state.blackPlayer);
            setWhiteTime(state.whiteTime);
            setBlackTime(state.blackTime);
            setIsClockRunning(state.isClockRunning);
            setIsGameOver(false);
            setWinner(null);
            setGameResult(undefined);
            setMoves([]);
            setCurrentMoveIndex(-1);
            setLastMove(null);

            // Swap colors
            setPlayerColor((c) => (c === 'w' ? 'b' : 'w'));
            setBoardOrientation((c) => (c === 'w' ? 'b' : 'w'));
            sounds.playGameStart();
            break;
          }

          case 'error': {
            alert(msg.message || 'Multiplayer notification');
            break;
          }
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [playerId, userName, userRating, userAvatar, playerColor]);

  // Local Clock timer tick for Bot / Offline games
  useEffect(() => {
    if (!inActiveMatch || currentMode === 'online' || !isClockRunning || isGameOver || timeControl.minutes === 0) {
      return;
    }

    const interval = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
        setWhiteTime((t) => {
          if (t <= 200) {
            setIsGameOver(true);
            setIsClockRunning(false);
            setWinner('b');
            setGameResult('White ran out of time. Black wins on time!');
            sounds.playDefeat();
            return 0;
          }
          return t - 200;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 200) {
            setIsGameOver(true);
            setIsClockRunning(false);
            setWinner('w');
            setGameResult('Black ran out of time. White wins on time!');
            sounds.playVictory();
            confetti({ particleCount: 70, spread: 60 });
            return 0;
          }
          return t - 200;
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [inActiveMatch, currentMode, isClockRunning, isGameOver, game, timeControl]);

  // Bot move trigger
  useEffect(() => {
    if (!inActiveMatch || currentMode !== 'bot' || isGameOver) return;

    const currentTurn = game.turn();
    const botColor: PieceColor = playerColor === 'w' ? 'b' : 'w';

    if (currentTurn === botColor) {
      const thinkTime = Math.floor(400 + Math.random() * 600);
      const timer = setTimeout(() => {
        const botMove = getBotMove(game, selectedCoach);
        if (botMove) {
          executeMove(botMove.from, botMove.to, botMove.promotion as PieceType, true);
        }
      }, thinkTime);

      return () => clearTimeout(timer);
    }
  }, [inActiveMatch, currentMode, game, isGameOver, playerColor, selectedCoach]);

  // Handle player or bot move execution
  const executeMove = useCallback(
    (from: string, to: string, promotion?: PieceType, isBotMove: boolean = false) => {
      if (currentMode === 'online' && !isBotMove) {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'make_move',
              from,
              to,
              promotion: promotion || 'q',
            })
          );
        }
        return;
      }

      // Local / Bot mode execution
      try {
        const newGame = new Chess(game.fen());
        const moveRes = newGame.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (!moveRes) return;

        // Sounds
        if (moveRes.captured) sounds.playCapture();
        else if (newGame.inCheck()) sounds.playCheck();
        else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) sounds.playCastle();
        else sounds.playMove();

        setGame(newGame);
        setLastMove({ from, to });
        setIsClockRunning(timeControl.minutes > 0);

        const newRecord: ChessMoveRecord = {
          san: moveRes.san,
          from: moveRes.from,
          to: moveRes.to,
          piece: moveRes.piece as PieceType,
          color: moveRes.color as PieceColor,
          captured: moveRes.captured as PieceType | undefined,
          flags: moveRes.flags,
          fenAfter: newGame.fen(),
        };

        setMoves((prev) => [...prev, newRecord]);
        setCurrentMoveIndex((prev) => prev + 1);

        // Coach quote reaction
        if (currentMode === 'bot') {
          if (!isBotMove) {
            // Player just moved
            if (moveRes.captured === 'q' || moveRes.captured === 'r') {
              setCoachSpeech(getRandomQuote(selectedCoach.quotes.goodMove));
            } else if (newGame.inCheck()) {
              setCoachSpeech(getRandomQuote(selectedCoach.quotes.goodMove));
            }
          } else {
            // Bot just moved
            if (moveRes.captured) {
              setCoachSpeech(getRandomQuote(selectedCoach.quotes.blunder));
            }
          }
        }

        // Check game over
        if (newGame.isCheckmate()) {
          const w = newGame.turn() === 'w' ? 'b' : 'w';
          setIsGameOver(true);
          setIsClockRunning(false);
          setWinner(w);
          setGameResult(`Checkmate! ${w === 'w' ? 'White' : 'Black'} wins!`);
          if (w === playerColor) {
            sounds.playVictory();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            if (currentMode === 'bot') setCoachSpeech(getRandomQuote(selectedCoach.quotes.defeat));
          } else {
            sounds.playDefeat();
            if (currentMode === 'bot') setCoachSpeech(getRandomQuote(selectedCoach.quotes.victory));
          }
        } else if (newGame.isDraw()) {
          setIsGameOver(true);
          setIsClockRunning(false);
          setWinner('draw');
          if (newGame.isStalemate()) setGameResult('Draw by Stalemate!');
          else if (newGame.isThreefoldRepetition()) setGameResult('Draw by Threefold Repetition!');
          else if (newGame.isInsufficientMaterial()) setGameResult('Draw by Insufficient Material!');
          else setGameResult('Draw by 50-move rule!');
        }
      } catch (err) {
        console.error('Local move error:', err);
        sounds.playIllegal();
      }
    },
    [currentMode, game, timeControl, playerColor, selectedCoach]
  );

  // Start Bot Match
  const startBotGame = (coach: CoachProfile = selectedCoach, sidePref: 'w' | 'b' | 'random' = 'w') => {
    setSelectedCoach(coach);
    const newGame = new Chess();
    setGame(newGame);
    setMoves([]);
    setCurrentMoveIndex(-1);
    setLastMove(null);
    setIsGameOver(false);
    setWinner(null);
    setGameResult(undefined);

    const userColor: PieceColor =
      sidePref === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : sidePref;
    const botColor: PieceColor = userColor === 'w' ? 'b' : 'w';

    setPlayerColor(userColor);
    setBoardOrientation(userColor);
    setCoachSpeech(coach.quotes.greeting[0]);

    if (userColor === 'w') {
      setWhitePlayer({
        id: playerId,
        name: userName,
        rating: userRating,
        avatar: userAvatar,
        color: 'w',
      });
      setBlackPlayer({
        id: coach.id,
        name: coach.name,
        rating: coach.rating,
        avatar: coach.avatar,
        title: coach.rating >= 2500 ? 'GM' : coach.rating >= 1800 ? 'FM' : 'BOT',
        color: 'b',
        isBot: true,
      });
    } else {
      setWhitePlayer({
        id: coach.id,
        name: coach.name,
        rating: coach.rating,
        avatar: coach.avatar,
        title: coach.rating >= 2500 ? 'GM' : coach.rating >= 1800 ? 'FM' : 'BOT',
        color: 'w',
        isBot: true,
      });
      setBlackPlayer({
        id: playerId,
        name: userName,
        rating: userRating,
        avatar: userAvatar,
        color: 'b',
      });
    }

    const ms = 10 * 60 * 1000;
    setWhiteTime(ms);
    setBlackTime(ms);
    setIsClockRunning(true);
    setInActiveMatch(true);
    setCurrentMode('bot');
    sounds.playGameStart();

    // If bot plays White, bot makes the first move
    if (botColor === 'w') {
      setTimeout(() => {
        const botMove = getBotMove(newGame, coach);
        if (botMove) {
          executeMove(botMove.from, botMove.to, botMove.promotion);
        }
      }, 700);
    }
  };

  // Start Online Match Dialog
  const handleStartOnlineFromHome = (customTimeControl?: TimeControl) => {
    if (customTimeControl) {
      setTimeControl(customTimeControl);
      handleQuickPlay(customTimeControl);
    } else {
      setIsMultiplayerModalOpen(true);
    }
  };

  const handleQuickPlay = (tc: TimeControl) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'quick_play',
          timeControlId: tc.id,
          timeControl: tc,
        })
      );
      setIsSearchingMatch(true);
    } else {
      alert('Connecting to chess server... please try in a moment.');
    }
  };

  const handleCancelSearch = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'cancel_quick_play' }));
    }
    setIsSearchingMatch(false);
  };

  const handleCreateRoom = (tc: TimeControl, sidePref: 'w' | 'b' | 'random') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'create_room',
          timeControl: tc,
          sidePreference: sidePref,
        })
      );
    }
  };

  const handleJoinRoom = (code: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'join_room',
          roomId: code.toUpperCase().trim(),
        })
      );
    }
  };

  const handleSendChat = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_chat',
          text,
        })
      );
    }
  };

  const handleResign = () => {
    if (currentMode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'resign' }));
    } else {
      setIsGameOver(true);
      setIsClockRunning(false);
      const w = playerColor === 'w' ? 'b' : 'w';
      setWinner(w);
      setGameResult(`You resigned. ${selectedCoach.name} wins!`);
      sounds.playDefeat();
      if (currentMode === 'bot') setCoachSpeech(getRandomQuote(selectedCoach.quotes.victory));
    }
  };

  const handleOfferDraw = () => {
    if (currentMode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'offer_draw' }));
    } else {
      // Bot evaluates position for draw
      if (Math.abs(whiteTime - blackTime) < 50000 && moves.length > 20) {
        setIsGameOver(true);
        setIsClockRunning(false);
        setWinner('draw');
        setGameResult('Draw accepted by coach.');
        setCoachSpeech('Fair enough. It is a draw.');
      } else {
        setCoachSpeech('I decline the draw offer. The battle continues!');
      }
    }
  };

  const handleAskCoach = async () => {
    setIsLoadingCoachAdvice(true);
    try {
      const response = await fetch('/api/coach-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: game.fen(),
          lastMove: moves.length > 0 ? moves[moves.length - 1].san : 'Opening',
          coachId: selectedCoach.id,
          coachName: selectedCoach.name,
          coachPersonality: selectedCoach.personality,
        }),
      });
      const data = await response.json();
      if (data.commentary) {
        setCoachSpeech(data.commentary);
      }
    } catch {
      setCoachSpeech('Control key center squares (e4, d4, e5, d5) and keep your pieces defended!');
    } finally {
      setIsLoadingCoachAdvice(false);
    }
  };

  const handleSaveProfile = (level: string, name: string, avatar: string) => {
    setUserName(name);
    setUserAvatar(avatar);
    localStorage.setItem('chess_username', name);
    localStorage.setItem('chess_avatar', avatar);
    let rating = 1200;
    if (level === 'beginner') rating = 600;
    if (level === 'intermediate') rating = 1200;
    if (level === 'advanced') rating = 1800;
    setUserRating(rating);
    localStorage.setItem('chess_rating', String(rating));
  };

  // Captured pieces and material difference calculations
  const { capturedByWhite, capturedByBlack, scoreDiff } = getCapturedPieces(game);

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Navigation */}
      <Navigation
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          if (mode === 'puzzle' || mode === 'analysis') {
            setInActiveMatch(false);
          }
        }}
        dayStreak={dayStreak}
        userName={userName}
        userRating={userRating}
        userAvatar={userAvatar}
        theme={boardTheme}
        onChangeTheme={setBoardTheme}
        onOpenExperienceModal={() => setIsExperienceModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        {/* VIEW 1: Home Dashboard */}
        {!inActiveMatch && currentMode === 'online' && (
          <HomeDashboard
            onStartOnline={handleStartOnlineFromHome}
            onStartBot={() => startBotGame(selectedCoach)}
            onOpenCoachSelect={() => setIsCoachSelectOpen(true)}
            onStartPuzzle={() => setCurrentMode('puzzle')}
            onStartAnalysis={() => setCurrentMode('analysis')}
            selectedCoach={selectedCoach}
          />
        )}

        {/* VIEW 2: Puzzle Mode */}
        {currentMode === 'puzzle' && (
          <div className="w-full pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 pt-3 flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentMode('online');
                  setInActiveMatch(false);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#57534E] hover:text-[#1C1917] transition-colors bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#E7E5E4] shadow-xs cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Return to Salon</span>
              </button>
            </div>
            <PuzzlesView
              theme={boardTheme}
              onSolvePuzzle={() => setDayStreak((prev) => prev + 1)}
              dayStreak={dayStreak}
            />
          </div>
        )}

        {/* VIEW 3: Analysis / Sandbox Mode */}
        {currentMode === 'analysis' && (
          <div className="w-full pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 pt-3 flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentMode('online');
                  setInActiveMatch(false);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#57534E] hover:text-[#1C1917] transition-colors bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#E7E5E4] shadow-xs cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Return to Salon</span>
              </button>
            </div>
            <AnalysisView theme={boardTheme} />
          </div>
        )}

        {/* VIEW 4: Active Chess Match (Multiplayer Online or vs Bot) */}
        {inActiveMatch && (currentMode === 'online' || currentMode === 'bot') && (
          <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-3 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6 pb-20 md:pb-8">
            {/* Left / Center Column: Chessboard & Player Cards */}
            <div className="w-full max-w-[580px] flex flex-col gap-2">
              {/* Top Player Card (Opponent: Black if orientation is 'w', White if 'b') */}
              <PlayerCard
                player={boardOrientation === 'w' ? blackPlayer : whitePlayer}
                color={boardOrientation === 'w' ? 'b' : 'w'}
                timeRemaining={boardOrientation === 'w' ? blackTime : whiteTime}
                isTurn={game.turn() === (boardOrientation === 'w' ? 'b' : 'w')}
                capturedPieces={boardOrientation === 'w' ? capturedByBlack : capturedByWhite}
                scoreDiff={boardOrientation === 'w' ? -scoreDiff : scoreDiff}
                isClockRunning={isClockRunning}
              />

              {/* Interactive Chess Board */}
              <ChessBoard
                game={game}
                orientation={boardOrientation}
                interactive={!isGameOver && (currentMode === 'bot' ? game.turn() === playerColor : game.turn() === playerColor)}
                onMove={(from, to, promotion) => executeMove(from, to, promotion)}
                lastMove={lastMove}
                theme={boardTheme}
              />

              {/* Bottom Player Card (User) */}
              <PlayerCard
                player={boardOrientation === 'w' ? whitePlayer : blackPlayer}
                color={boardOrientation === 'w' ? 'w' : 'b'}
                timeRemaining={boardOrientation === 'w' ? whiteTime : blackTime}
                isTurn={game.turn() === (boardOrientation === 'w' ? 'w' : 'b')}
                capturedPieces={boardOrientation === 'w' ? capturedByWhite : capturedByBlack}
                scoreDiff={boardOrientation === 'w' ? scoreDiff : -scoreDiff}
                isClockRunning={isClockRunning}
              />
            </div>

            {/* Right Sidebar: Coach bubble / In-Game Chat / Move History */}
            <div className="w-full max-w-[420px] flex flex-col gap-3">
              {/* Back to lobby or Room status banner */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#FFFFFF] rounded-xl border border-[#E7E5E4] text-xs shadow-xs">
                <button
                  onClick={() => {
                    setInActiveMatch(false);
                    setCurrentMode('online');
                  }}
                  className="flex items-center gap-1.5 text-[#57534E] hover:text-[#1C1917] transition-colors font-bold cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Conclude Match & Exit</span>
                </button>

                {roomId && (
                  <div className="flex items-center gap-1.5 font-mono text-[#1C1917] font-bold">
                    <span className="text-[#78716C]">Salon:</span>
                    <span className="text-[#1E3A2F] tracking-wider px-2 py-0.5 rounded-md bg-[#1E3A2F]/10">
                      {roomId}
                    </span>
                  </div>
                )}
              </div>

              {/* Coach Reaction (Bot Mode) */}
              {currentMode === 'bot' && (
                <CoachBubble
                  coach={selectedCoach}
                  currentSpeech={coachSpeech}
                  onAskCoach={handleAskCoach}
                  isLoadingAdvice={isLoadingCoachAdvice}
                />
              )}

              {/* In-Game Live Chat (Online Multiplayer Mode) */}
              {currentMode === 'online' && (
                <GameChat
                  messages={chatMessages}
                  onSendMessage={handleSendChat}
                  playerColor={playerColor}
                />
              )}

              {/* Move History Table & Replay Controls */}
              <MoveHistory
                moves={moves}
                currentMoveIndex={currentMoveIndex}
                onSelectMove={(idx) => setCurrentMoveIndex(idx)}
                onFlipBoard={() => setBoardOrientation((o) => (o === 'w' ? 'b' : 'w'))}
                onResign={!isGameOver ? handleResign : undefined}
                onOfferDraw={!isGameOver ? handleOfferDraw : undefined}
                onNewGame={
                  isGameOver
                    ? () => {
                        if (currentMode === 'bot') startBotGame(selectedCoach);
                        else setIsMultiplayerModalOpen(true);
                      }
                    : undefined
                }
                fen={game.fen()}
                pgn={game.pgn()}
                isGameOver={isGameOver}
                gameResult={gameResult}
                isMultiplayer={currentMode === 'online'}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <MultiplayerModal
        isOpen={isMultiplayerModalOpen}
        onClose={() => {
          setIsMultiplayerModalOpen(false);
          setIsSearchingMatch(false);
          setCreatedRoomCode(null);
        }}
        onQuickPlay={handleQuickPlay}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isSearching={isSearchingMatch}
        onCancelSearch={handleCancelSearch}
        createdRoomCode={createdRoomCode}
      />

      <CoachSelectModal
        isOpen={isCoachSelectOpen}
        onClose={() => setIsCoachSelectOpen(false)}
        selectedCoach={selectedCoach}
        onSelectCoach={(c) => {
          setSelectedCoach(c);
        }}
        onStartMatch={(c, sidePref) => {
          setSelectedCoach(c);
          startBotGame(c, sidePref);
        }}
      />

      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        currentLevel="intermediate"
        userName={userName}
        userAvatar={userAvatar}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
