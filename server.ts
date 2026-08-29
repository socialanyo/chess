import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { Chess } from 'chess.js';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// Google Gen AI client initialized safely
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

// In-Memory Multiplayer Game Rooms
interface ConnectedClient {
  ws: WebSocket;
  playerId: string;
  playerName: string;
  rating: number;
  avatar: string;
  roomId?: string;
  color?: 'w' | 'b';
  isSpectator?: boolean;
  lastHeartbeat: number;
}

interface ServerGameRoom {
  id: string;
  chess: Chess;
  whitePlayer: { id: string; name: string; rating: number; avatar: string; ws?: WebSocket; isConnected: boolean } | null;
  blackPlayer: { id: string; name: string; rating: number; avatar: string; ws?: WebSocket; isConnected: boolean } | null;
  spectators: Map<string, { name: string; ws: WebSocket }>;
  timeControl: {
    id: string;
    name: string;
    minutes: number;
    increment: number;
    category: string;
  };
  whiteTime: number; // ms
  blackTime: number; // ms
  lastMoveTimestamp: number;
  isClockRunning: boolean;
  isGameOver: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  winReason?: string;
  moves: Array<{
    san: string;
    from: string;
    to: string;
    piece: string;
    color: string;
    captured?: string;
    flags: string;
    fenAfter: string;
  }>;
  drawOfferedBy: 'w' | 'b' | null;
  rematchRequestedBy: 'w' | 'b' | null;
  createdAt: number;
}

const clients = new Map<WebSocket, ConnectedClient>();
const rooms = new Map<string, ServerGameRoom>();
// Quick play queues by time control
const quickPlayQueues = new Map<string, ConnectedClient[]>();

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function broadcastToRoom(room: ServerGameRoom, message: Record<string, unknown>, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  if (room.whitePlayer?.ws && room.whitePlayer.ws !== excludeWs && room.whitePlayer.ws.readyState === WebSocket.OPEN) {
    room.whitePlayer.ws.send(payload);
  }
  if (room.blackPlayer?.ws && room.blackPlayer.ws !== excludeWs && room.blackPlayer.ws.readyState === WebSocket.OPEN) {
    room.blackPlayer.ws.send(payload);
  }
  for (const [, spec] of room.spectators) {
    if (spec.ws !== excludeWs && spec.ws.readyState === WebSocket.OPEN) {
      spec.ws.send(payload);
    }
  }
}

function getRoomStatePayload(room: ServerGameRoom) {
  return {
    type: 'room_state',
    roomId: room.id,
    fen: room.chess.fen(),
    pgn: room.chess.pgn(),
    turn: room.chess.turn(),
    isGameOver: room.isGameOver,
    winner: room.winner,
    winReason: room.winReason,
    whitePlayer: room.whitePlayer
      ? {
          id: room.whitePlayer.id,
          name: room.whitePlayer.name,
          rating: room.whitePlayer.rating,
          avatar: room.whitePlayer.avatar,
          color: 'w',
          isConnected: room.whitePlayer.isConnected,
        }
      : null,
    blackPlayer: room.blackPlayer
      ? {
          id: room.blackPlayer.id,
          name: room.blackPlayer.name,
          rating: room.blackPlayer.rating,
          avatar: room.blackPlayer.avatar,
          color: 'b',
          isConnected: room.blackPlayer.isConnected,
        }
      : null,
    spectatorsCount: room.spectators.size,
    timeControl: room.timeControl,
    whiteTime: room.whiteTime,
    blackTime: room.blackTime,
    isClockRunning: room.isClockRunning,
    moves: room.moves,
    drawOfferedBy: room.drawOfferedBy,
    rematchRequestedBy: room.rematchRequestedBy,
  };
}

// Global clock tick interval for multiplayer matches
setInterval(() => {
  const now = Date.now();
  for (const [, room] of rooms) {
    if (room.isClockRunning && !room.isGameOver && room.timeControl.minutes > 0) {
      const elapsed = now - room.lastMoveTimestamp;
      room.lastMoveTimestamp = now;

      const activeColor = room.chess.turn();
      if (activeColor === 'w') {
        room.whiteTime = Math.max(0, room.whiteTime - elapsed);
        if (room.whiteTime <= 0) {
          room.isGameOver = true;
          room.isClockRunning = false;
          room.winner = 'b';
          room.winReason = 'White ran out of time. Black wins on time!';
          broadcastToRoom(room, {
            type: 'game_over',
            winner: 'b',
            reason: room.winReason,
            roomState: getRoomStatePayload(room),
          });
        }
      } else {
        room.blackTime = Math.max(0, room.blackTime - elapsed);
        if (room.blackTime <= 0) {
          room.isGameOver = true;
          room.isClockRunning = false;
          room.winner = 'w';
          room.winReason = 'Black ran out of time. White wins on time!';
          broadcastToRoom(room, {
            type: 'game_over',
            winner: 'w',
            reason: room.winReason,
            roomState: getRoomStatePayload(room),
          });
        }
      }
    }
  }
}, 200);

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlinePlayers: clients.size, activeRooms: rooms.size });
});

app.get('/api/stats', (req, res) => {
  res.json({
    onlinePlayers: clients.size,
    activeRooms: rooms.size,
  });
});

// AI Coach Analysis endpoint (Gemini Powered)
app.post('/api/coach-analysis', async (req, res) => {
  try {
    const { fen, lastMove, coachId, coachName, coachPersonality } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        commentary: 'Solid move! Keep active piece development and king safety.',
        evaluation: 0,
      });
    }

    const prompt = `You are ${coachName || 'a Chess Coach'} (${coachPersonality || 'instructive and friendly'}).
Given this Chess FEN position: "${fen}"
The last move played was: "${lastMove || 'Game Start'}".
Provide a brief, witty 1-2 sentence reaction/coaching tip tailored to your personality. Avoid chess jargon overload. Keep it under 25 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      commentary: response.text?.trim() || 'Focus on controlling the center!',
    });
  } catch (error) {
    console.error('Coach analysis error:', error);
    res.json({
      commentary: 'Nice move! Keep your pieces harmonized.',
    });
  }
});

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    const client: ConnectedClient = {
      ws,
      playerId: `p_${Math.random().toString(36).substring(2, 9)}`,
      playerName: 'Player',
      rating: 1200,
      avatar: '♟️',
      lastHeartbeat: Date.now(),
    };
    clients.set(ws, client);

    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'init_player': {
            if (msg.playerId) client.playerId = msg.playerId;
            if (msg.name) client.playerName = msg.name;
            if (msg.rating) client.rating = msg.rating;
            if (msg.avatar) client.avatar = msg.avatar;
            ws.send(JSON.stringify({ type: 'player_inited', playerId: client.playerId }));
            break;
          }

          case 'create_room': {
            const roomId = generateRoomId();
            const timeCtrl = msg.timeControl || {
              id: 'rapid_10_0',
              name: '10 min',
              minutes: 10,
              increment: 0,
              category: 'rapid',
            };
            const sidePref = msg.sidePreference || 'random'; // 'w', 'b', 'random'
            const isWhite = sidePref === 'random' ? Math.random() < 0.5 : sidePref === 'w';

            const room: ServerGameRoom = {
              id: roomId,
              chess: new Chess(),
              whitePlayer: isWhite
                ? {
                    id: client.playerId,
                    name: client.playerName,
                    rating: client.rating,
                    avatar: client.avatar,
                    ws,
                    isConnected: true,
                  }
                : null,
              blackPlayer: !isWhite
                ? {
                    id: client.playerId,
                    name: client.playerName,
                    rating: client.rating,
                    avatar: client.avatar,
                    ws,
                    isConnected: true,
                  }
                : null,
              spectators: new Map(),
              timeControl: timeCtrl,
              whiteTime: timeCtrl.minutes * 60 * 1000,
              blackTime: timeCtrl.minutes * 60 * 1000,
              lastMoveTimestamp: Date.now(),
              isClockRunning: false,
              isGameOver: false,
              winner: null,
              moves: [],
              drawOfferedBy: null,
              rematchRequestedBy: null,
              createdAt: Date.now(),
            };

            rooms.set(roomId, room);
            client.roomId = roomId;
            client.color = isWhite ? 'w' : 'b';

            ws.send(
              JSON.stringify({
                type: 'room_created',
                roomId,
                playerColor: client.color,
                roomState: getRoomStatePayload(room),
              })
            );
            break;
          }

          case 'join_room': {
            const roomId = (msg.roomId || '').toUpperCase().trim();
            const room = rooms.get(roomId);

            if (!room) {
              ws.send(JSON.stringify({ type: 'error', message: 'Room not found. Please verify the 6-character code.' }));
              return;
            }

            // Check if reconnecting player
            if (room.whitePlayer && room.whitePlayer.id === client.playerId) {
              room.whitePlayer.ws = ws;
              room.whitePlayer.isConnected = true;
              client.roomId = roomId;
              client.color = 'w';
              ws.send(JSON.stringify({ type: 'room_joined', roomId, playerColor: 'w', roomState: getRoomStatePayload(room) }));
              broadcastToRoom(room, { type: 'player_reconnected', color: 'w', roomState: getRoomStatePayload(room) }, ws);
              return;
            }

            if (room.blackPlayer && room.blackPlayer.id === client.playerId) {
              room.blackPlayer.ws = ws;
              room.blackPlayer.isConnected = true;
              client.roomId = roomId;
              client.color = 'b';
              ws.send(JSON.stringify({ type: 'room_joined', roomId, playerColor: 'b', roomState: getRoomStatePayload(room) }));
              broadcastToRoom(room, { type: 'player_reconnected', color: 'b', roomState: getRoomStatePayload(room) }, ws);
              return;
            }

            // Join as available seat
            if (!room.whitePlayer) {
              room.whitePlayer = {
                id: client.playerId,
                name: client.playerName,
                rating: client.rating,
                avatar: client.avatar,
                ws,
                isConnected: true,
              };
              client.roomId = roomId;
              client.color = 'w';
              ws.send(JSON.stringify({ type: 'room_joined', roomId, playerColor: 'w', roomState: getRoomStatePayload(room) }));
            } else if (!room.blackPlayer) {
              room.blackPlayer = {
                id: client.playerId,
                name: client.playerName,
                rating: client.rating,
                avatar: client.avatar,
                ws,
                isConnected: true,
              };
              client.roomId = roomId;
              client.color = 'b';

              // Game starts!
              room.isClockRunning = room.timeControl.minutes > 0;
              room.lastMoveTimestamp = Date.now();

              ws.send(JSON.stringify({ type: 'room_joined', roomId, playerColor: 'b', roomState: getRoomStatePayload(room) }));
              broadcastToRoom(room, {
                type: 'game_started',
                roomState: getRoomStatePayload(room),
              });
            } else {
              // Join as Spectator
              room.spectators.set(client.playerId, { name: client.playerName, ws });
              client.roomId = roomId;
              client.isSpectator = true;
              ws.send(JSON.stringify({ type: 'spectator_joined', roomId, roomState: getRoomStatePayload(room) }));
              broadcastToRoom(room, { type: 'spectator_count', count: room.spectators.size });
            }
            break;
          }

          case 'quick_play': {
            const timeControlId = msg.timeControlId || 'rapid_10_0';
            let queue = quickPlayQueues.get(timeControlId);
            if (!queue) {
              queue = [];
              quickPlayQueues.set(timeControlId, queue);
            }

            // Remove client from queue if already there
            const existingIdx = queue.findIndex((c) => c.playerId === client.playerId);
            if (existingIdx !== -1) queue.splice(existingIdx, 1);

            if (queue.length > 0) {
              const opponent = queue.shift()!;
              if (opponent.ws.readyState === WebSocket.OPEN) {
                const roomId = generateRoomId();
                const isWhite = Math.random() < 0.5;

                const timeCtrl = msg.timeControl || {
                  id: timeControlId,
                  name: timeControlId.includes('10') ? '10 min' : '5 min',
                  minutes: timeControlId.includes('10') ? 10 : timeControlId.includes('3') ? 3 : 5,
                  increment: 0,
                  category: 'rapid',
                };

                const room: ServerGameRoom = {
                  id: roomId,
                  chess: new Chess(),
                  whitePlayer: isWhite
                    ? { id: client.playerId, name: client.playerName, rating: client.rating, avatar: client.avatar, ws, isConnected: true }
                    : { id: opponent.playerId, name: opponent.playerName, rating: opponent.rating, avatar: opponent.avatar, ws: opponent.ws, isConnected: true },
                  blackPlayer: !isWhite
                    ? { id: client.playerId, name: client.playerName, rating: client.rating, avatar: client.avatar, ws, isConnected: true }
                    : { id: opponent.playerId, name: opponent.playerName, rating: opponent.rating, avatar: opponent.avatar, ws: opponent.ws, isConnected: true },
                  spectators: new Map(),
                  timeControl: timeCtrl,
                  whiteTime: timeCtrl.minutes * 60 * 1000,
                  blackTime: timeCtrl.minutes * 60 * 1000,
                  lastMoveTimestamp: Date.now(),
                  isClockRunning: timeCtrl.minutes > 0,
                  isGameOver: false,
                  winner: null,
                  moves: [],
                  drawOfferedBy: null,
                  rematchRequestedBy: null,
                  createdAt: Date.now(),
                };

                rooms.set(roomId, room);
                client.roomId = roomId;
                client.color = isWhite ? 'w' : 'b';
                opponent.roomId = roomId;
                opponent.color = isWhite ? 'b' : 'w';

                ws.send(JSON.stringify({ type: 'room_joined', roomId, playerColor: client.color, roomState: getRoomStatePayload(room) }));
                opponent.ws.send(JSON.stringify({ type: 'room_joined', roomId, playerColor: opponent.color, roomState: getRoomStatePayload(room) }));
                broadcastToRoom(room, { type: 'game_started', roomState: getRoomStatePayload(room) });
                return;
              }
            }

            queue.push(client);
            ws.send(JSON.stringify({ type: 'quick_play_waiting', position: queue.length }));
            break;
          }

          case 'cancel_quick_play': {
            for (const [, queue] of quickPlayQueues) {
              const idx = queue.findIndex((c) => c.playerId === client.playerId);
              if (idx !== -1) queue.splice(idx, 1);
            }
            ws.send(JSON.stringify({ type: 'quick_play_cancelled' }));
            break;
          }

          case 'make_move': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room || room.isGameOver) return;

            const turn = room.chess.turn();
            if (turn !== client.color) {
              ws.send(JSON.stringify({ type: 'error', message: 'It is not your turn.' }));
              return;
            }

            try {
              const moveResult = room.chess.move({
                from: msg.from,
                to: msg.to,
                promotion: msg.promotion || 'q',
              });

              if (!moveResult) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move.' }));
                return;
              }

              // Update clocks
              const now = Date.now();
              if (room.isClockRunning && room.timeControl.minutes > 0) {
                const elapsed = now - room.lastMoveTimestamp;
                if (turn === 'w') {
                  room.whiteTime = Math.max(0, room.whiteTime - elapsed) + room.timeControl.increment * 1000;
                } else {
                  room.blackTime = Math.max(0, room.blackTime - elapsed) + room.timeControl.increment * 1000;
                }
              }
              room.lastMoveTimestamp = now;

              // Record move
              room.moves.push({
                san: moveResult.san,
                from: moveResult.from,
                to: moveResult.to,
                piece: moveResult.piece,
                color: moveResult.color,
                captured: moveResult.captured,
                flags: moveResult.flags,
                fenAfter: room.chess.fen(),
              });

              // Check game over conditions
              if (room.chess.isCheckmate()) {
                room.isGameOver = true;
                room.isClockRunning = false;
                room.winner = turn;
                room.winReason = `Checkmate! ${turn === 'w' ? 'White' : 'Black'} wins!`;
              } else if (room.chess.isDraw()) {
                room.isGameOver = true;
                room.isClockRunning = false;
                room.winner = 'draw';
                if (room.chess.isStalemate()) room.winReason = 'Draw by Stalemate!';
                else if (room.chess.isThreefoldRepetition()) room.winReason = 'Draw by Threefold Repetition!';
                else if (room.chess.isInsufficientMaterial()) room.winReason = 'Draw by Insufficient Material!';
                else room.winReason = 'Draw by 50-move rule!';
              }

              broadcastToRoom(room, {
                type: 'move_made',
                move: moveResult,
                roomState: getRoomStatePayload(room),
              });
            } catch (err) {
              console.error('Move error:', err);
              ws.send(JSON.stringify({ type: 'error', message: 'Illegal move rejected.' }));
            }
            break;
          }

          case 'offer_draw': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room || room.isGameOver || !client.color) return;

            room.drawOfferedBy = client.color;
            broadcastToRoom(room, {
              type: 'draw_offered',
              by: client.color,
              roomState: getRoomStatePayload(room),
            });
            break;
          }

          case 'accept_draw': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room || room.isGameOver || !room.drawOfferedBy) return;

            if (room.drawOfferedBy !== client.color) {
              room.isGameOver = true;
              room.isClockRunning = false;
              room.winner = 'draw';
              room.winReason = 'Game drawn by mutual agreement.';
              broadcastToRoom(room, {
                type: 'game_over',
                winner: 'draw',
                reason: room.winReason,
                roomState: getRoomStatePayload(room),
              });
            }
            break;
          }

          case 'decline_draw': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room) return;

            room.drawOfferedBy = null;
            broadcastToRoom(room, {
              type: 'draw_declined',
              by: client.color,
              roomState: getRoomStatePayload(room),
            });
            break;
          }

          case 'resign': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room || room.isGameOver || !client.color) return;

            const winner = client.color === 'w' ? 'b' : 'w';
            room.isGameOver = true;
            room.isClockRunning = false;
            room.winner = winner;
            room.winReason = `${client.color === 'w' ? 'White' : 'Black'} resigned. ${winner === 'w' ? 'White' : 'Black'} wins!`;

            broadcastToRoom(room, {
              type: 'game_over',
              winner,
              reason: room.winReason,
              roomState: getRoomStatePayload(room),
            });
            break;
          }

          case 'request_rematch': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room || !room.isGameOver || !client.color) return;

            if (!room.rematchRequestedBy) {
              room.rematchRequestedBy = client.color;
              broadcastToRoom(room, {
                type: 'rematch_requested',
                by: client.color,
                roomState: getRoomStatePayload(room),
              });
            } else if (room.rematchRequestedBy !== client.color) {
              // Both agreed to rematch -> swap colors!
              const oldWhite = room.whitePlayer;
              const oldBlack = room.blackPlayer;

              room.whitePlayer = oldBlack;
              room.blackPlayer = oldWhite;
              room.chess = new Chess();
              room.isGameOver = false;
              room.winner = null;
              room.winReason = undefined;
              room.moves = [];
              room.drawOfferedBy = null;
              room.rematchRequestedBy = null;
              room.whiteTime = room.timeControl.minutes * 60 * 1000;
              room.blackTime = room.timeControl.minutes * 60 * 1000;
              room.isClockRunning = room.timeControl.minutes > 0;
              room.lastMoveTimestamp = Date.now();

              // Update client color references
              if (oldBlack?.ws) {
                const c = clients.get(oldBlack.ws);
                if (c) c.color = 'w';
              }
              if (oldWhite?.ws) {
                const c = clients.get(oldWhite.ws);
                if (c) c.color = 'b';
              }

              broadcastToRoom(room, {
                type: 'rematch_started',
                roomState: getRoomStatePayload(room),
              });
            }
            break;
          }

          case 'send_chat': {
            if (!client.roomId) return;
            const room = rooms.get(client.roomId);
            if (!room || !msg.text) return;

            const chatMsg = {
              id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              senderName: client.playerName,
              senderColor: client.color,
              text: String(msg.text).substring(0, 200),
              timestamp: Date.now(),
            };

            broadcastToRoom(room, {
              type: 'chat_message',
              message: chatMsg,
            });
            break;
          }

          case 'ping': {
            client.lastHeartbeat = Date.now();
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          }
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);

      // Remove from queues
      for (const [, queue] of quickPlayQueues) {
        const idx = queue.findIndex((c) => c.playerId === client.playerId);
        if (idx !== -1) queue.splice(idx, 1);
      }

      if (client.roomId) {
        const room = rooms.get(client.roomId);
        if (room) {
          if (room.whitePlayer && room.whitePlayer.id === client.playerId) {
            room.whitePlayer.isConnected = false;
            broadcastToRoom(room, { type: 'player_disconnected', color: 'w', roomState: getRoomStatePayload(room) });
          } else if (room.blackPlayer && room.blackPlayer.id === client.playerId) {
            room.blackPlayer.isConnected = false;
            broadcastToRoom(room, { type: 'player_disconnected', color: 'b', roomState: getRoomStatePayload(room) });
          } else if (client.isSpectator) {
            room.spectators.delete(client.playerId);
            broadcastToRoom(room, { type: 'spectator_count', count: room.spectators.size });
          }
        }
      }
    });
  });

  // Vite development middleware or production static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Chess Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
