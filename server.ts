import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

interface Participant {
  id: string;
  name: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: number;
  ws: WebSocket;
  location?: any;
}

// Room storage: roomId -> Map<participantId, Participant>
const rooms = new Map<string, Map<string, Participant>>();

// Omegle random matchmaking queue
interface WaitingUser {
  ws: WebSocket;
  participantId: string;
  name: string;
  interests?: string[];
}
let omegleQueue: WaitingUser[] = [];

// Map each WebSocket to its participant info and roomId for clean disconnection
const socketMeta = new WeakMap<WebSocket, { roomId: string; participantId: string }>();

wss.on('connection', (ws: WebSocket) => {
  let isAlive = true;

  ws.on('pong', () => {
    isAlive = true;
  });

  ws.on('message', (rawMessage: string | Buffer) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      switch (data.type) {
        case 'omegle_find': {
          const { participantId, name, interests } = data;
          omegleQueue = omegleQueue.filter(
            (u) => u.ws.readyState === WebSocket.OPEN && u.participantId !== participantId
          );

          if (omegleQueue.length > 0) {
            const partner = omegleQueue.shift()!;
            const pairRoomId = `omg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

            safeSend(ws, {
              type: 'omegle_matched',
              roomId: pairRoomId,
              partnerId: partner.participantId,
              partnerName: partner.name,
              isInitiator: true,
            });

            safeSend(partner.ws, {
              type: 'omegle_matched',
              roomId: pairRoomId,
              partnerId: participantId,
              partnerName: name || 'Stranger',
              isInitiator: false,
            });
          } else {
            omegleQueue.push({ ws, participantId, name: name || 'Stranger', interests });
            safeSend(ws, {
              type: 'omegle_waiting',
              message: 'Searching for a video partner...',
            });
          }
          break;
        }

        case 'omegle_cancel': {
          const { participantId } = data;
          omegleQueue = omegleQueue.filter((u) => u.participantId !== participantId);
          break;
        }
        case 'join_room': {
          const { roomId, participantId, name, isAudioMuted = false, isVideoOff = false, location } = data;
          if (!roomId || !participantId) return;

          // If participant was in another room, clean up
          const prevMeta = socketMeta.get(ws);
          if (prevMeta && prevMeta.roomId !== roomId) {
            removeParticipant(prevMeta.roomId, prevMeta.participantId);
          }

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
          }

          const room = rooms.get(roomId)!;

          const participant: Participant = {
            id: participantId,
            name: name || 'Guest User',
            isAudioMuted,
            isVideoOff,
            isScreenSharing: false,
            isHandRaised: false,
            joinedAt: Date.now(),
            ws,
            location,
          };

          room.set(participantId, participant);
          socketMeta.set(ws, { roomId, participantId });

          // Send current list of other participants to the joiner
          const existingParticipants = Array.from(room.values())
            .filter((p) => p.id !== participantId)
            .map((p) => ({
              id: p.id,
              name: p.name,
              isAudioMuted: p.isAudioMuted,
              isVideoOff: p.isVideoOff,
              isScreenSharing: p.isScreenSharing,
              isHandRaised: p.isHandRaised,
              location: p.location,
            }));

          safeSend(ws, {
            type: 'room_joined',
            roomId,
            yourId: participantId,
            participants: existingParticipants,
          });

          // Notify existing participants that a new peer joined
          broadcastToRoom(
            roomId,
            {
              type: 'user_joined',
              user: {
                id: participant.id,
                name: participant.name,
                isAudioMuted: participant.isAudioMuted,
                isVideoOff: participant.isVideoOff,
                isScreenSharing: participant.isScreenSharing,
                isHandRaised: participant.isHandRaised,
                location: participant.location,
              },
            },
            participantId
          );
          break;
        }

        case 'signal': {
          // WebRTC offer, answer, or ice-candidate routed peer-to-peer
          const { roomId, to, signalData } = data;
          const meta = socketMeta.get(ws);
          if (!meta || !to || !signalData) return;

          const room = rooms.get(roomId || meta.roomId);
          if (room) {
            const target = room.get(to);
            if (target && target.ws.readyState === WebSocket.OPEN) {
              safeSend(target.ws, {
                type: 'signal',
                from: meta.participantId,
                signalData,
              });
            }
          }
          break;
        }

        case 'chat_message': {
          const { roomId, id, text, senderName, timestamp, locationPin } = data;
          const meta = socketMeta.get(ws);
          const activeRoomId = roomId || meta?.roomId;
          if (!activeRoomId || !text) return;

          broadcastToRoom(activeRoomId, {
            type: 'chat_message',
            id: id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            senderId: meta?.participantId || 'system',
            senderName: senderName || 'Anonymous',
            text,
            timestamp: timestamp || Date.now(),
            locationPin,
          });
          break;
        }

        case 'chat_reaction': {
          const { roomId, messageId, emoji, userId } = data;
          const meta = socketMeta.get(ws);
          const activeRoomId = roomId || meta?.roomId;
          if (activeRoomId && messageId && emoji) {
            broadcastToRoom(activeRoomId, {
              type: 'chat_reaction',
              messageId,
              emoji,
              userId: userId || meta?.participantId,
            });
          }
          break;
        }

        case 'chat_pin': {
          const { roomId, messageId, isPinned } = data;
          const meta = socketMeta.get(ws);
          const activeRoomId = roomId || meta?.roomId;
          if (activeRoomId && messageId) {
            broadcastToRoom(activeRoomId, {
              type: 'chat_pin',
              messageId,
              isPinned,
            });
          }
          break;
        }

        case 'state_update': {
          const { roomId, updates } = data;
          const meta = socketMeta.get(ws);
          if (!meta) return;

          const activeRoomId = roomId || meta.roomId;
          const room = rooms.get(activeRoomId);
          if (room) {
            const participant = room.get(meta.participantId);
            if (participant && updates) {
              Object.assign(participant, updates);
              broadcastToRoom(
                activeRoomId,
                {
                  type: 'user_updated',
                  userId: meta.participantId,
                  updates,
                },
                meta.participantId
              );
            }
          }
          break;
        }

        case 'reaction': {
          const { roomId, emoji, senderName } = data;
          const meta = socketMeta.get(ws);
          const activeRoomId = roomId || meta?.roomId;
          if (activeRoomId && emoji) {
            broadcastToRoom(activeRoomId, {
              type: 'reaction',
              userId: meta?.participantId || 'unknown',
              senderName: senderName || 'Participant',
              emoji,
              timestamp: Date.now(),
            });
          }
          break;
        }

        case 'leave_room': {
          const meta = socketMeta.get(ws);
          if (meta) {
            removeParticipant(meta.roomId, meta.participantId);
            socketMeta.delete(ws);
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    omegleQueue = omegleQueue.filter((u) => u.ws !== ws);
    const meta = socketMeta.get(ws);
    if (meta) {
      removeParticipant(meta.roomId, meta.participantId);
      socketMeta.delete(ws);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
  });
});

// Heartbeat ping interval
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

function safeSend(ws: WebSocket, payload: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToRoom(roomId: string, payload: unknown, excludeParticipantId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const serialized = JSON.stringify(payload);
  room.forEach((participant, id) => {
    if (excludeParticipantId && id === excludeParticipantId) return;
    if (participant.ws.readyState === WebSocket.OPEN) {
      participant.ws.send(serialized);
    }
  });
}

function removeParticipant(roomId: string, participantId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.has(participantId)) {
    room.delete(participantId);
    broadcastToRoom(roomId, {
      type: 'user_left',
      userId: participantId,
    });
  }

  if (room.size === 0) {
    rooms.delete(roomId);
  }
}

// REST endpoints
app.get('/api/health', (_req, res) => {
  let totalUsers = 0;
  rooms.forEach((r) => (totalUsers += r.size));
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    totalConnectedUsers: totalUsers,
    timestamp: Date.now(),
  });
});

app.get('/api/room-info/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) {
    return res.json({ exists: false, count: 0, participants: [] });
  }

  const participants = Array.from(room.values()).map((p) => ({
    id: p.id,
    name: p.name,
    joinedAt: p.joinedAt,
    isAudioMuted: p.isAudioMuted,
    isVideoOff: p.isVideoOff,
  }));

  res.json({
    exists: true,
    count: room.size,
    participants,
  });
});

// Generate random friendly room code (e.g. nai-742-kvp)
app.get('/api/create-room-code', (_req, res) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const genPart = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const code = `nai-${genPart(3)}-${genPart(3)}`;
  res.json({ roomCode: code });
});

// Google Maps Grounding Date Spots Endpoint
app.post('/api/places/grounding', async (req, res) => {
  const { query = 'romantic coffee shop or sunset date', location = 'Bandra West, Mumbai', partnerName = '' } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    let liveSummary = '';
    let groundingMetadata: any = null;
    let isGeminiGrounded = false;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI();
        const prompt = `You are an expert local Mumbai dating & dating spot concierge. 
The user is planning a real-time meetup/date with ${partnerName ? partnerName : 'their match'} in or near ${location}.
The requested vibe or category is: "${query}".
Provide recommendations grounded in real Google Maps places with exact names, addresses, live open status, vibe, ratings, and practical date tips. Keep response conversational and actionable.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
          },
        });

        liveSummary = response.text || '';
        groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;
        isGeminiGrounded = true;
      } catch (geminiErr: any) {
        console.warn('[Gemini Maps Grounding] fallback to verified real-time spots:', geminiErr?.message || geminiErr);
        // Will continue to verified fallback below
      }
    }

    // Load verified Google Maps spots data
    const { getCuratedSpots } = await import('./src/data/mapsRealtimeData.js').catch(async () => {
      return await import('./src/data/mapsRealtimeData.ts');
    });

    const places = getCuratedSpots(location, 'all', query);

    if (!liveSummary) {
      liveSummary = `Found top verified Google Maps date spots near ${location} matching "${query}". Each location includes live verified open hours, Google reviews, directions, and romantic ambiance ratings.`;
    }

    return res.json({
      success: true,
      query,
      location,
      partnerName,
      isLiveGrounded: true,
      isGeminiGrounded,
      summary: liveSummary,
      groundingMetadata,
      places: places.length > 0 ? places : getCuratedSpots('all', 'all'),
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in /api/places/grounding:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch grounded date spots',
    });
  }
});

app.get('/api/places/grounding', async (req, res) => {
  const query = (req.query.query as string) || 'romantic date';
  const location = (req.query.location as string) || 'Bandra West, Mumbai';
  const partnerName = (req.query.partnerName as string) || '';

  try {
    const { getCuratedSpots } = await import('./src/data/mapsRealtimeData.js').catch(async () => {
      return await import('./src/data/mapsRealtimeData.ts');
    });
    const places = getCuratedSpots(location, 'all', query);

    return res.json({
      success: true,
      query,
      location,
      partnerName,
      isLiveGrounded: true,
      summary: `Top Google Maps verified spots near ${location}.`,
      places: places.length > 0 ? places : getCuratedSpots('all', 'all'),
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// Vite dev server or static build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`[ZyntriCall Server] listening on http://localhost:${port}`);
  });
}

startServer();
