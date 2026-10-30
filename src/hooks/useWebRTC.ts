import { useState, useEffect, useRef, useCallback } from 'react';
import { Participant, ChatMessage, FloatingReaction, UserLocation } from '../types/meeting';
import { createAudioLevelDetector } from '../services/audioVisualizer';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

interface UseWebRTCProps {
  roomId: string;
  userName: string;
  initialAudioMuted?: boolean;
  initialVideoOff?: boolean;
  userLocation?: UserLocation | null;
  onLeft?: () => void;
}

export function useWebRTC({
  roomId,
  userName,
  initialAudioMuted = false,
  initialVideoOff = false,
  userLocation = null,
  onLeft,
}: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(initialAudioMuted);
  const [isVideoOff, setIsVideoOff] = useState(initialVideoOff);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [echoBotActive, setEchoBotActive] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localParticipantIdRef = useRef<string>(`peer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const userNameRef = useRef(userName);
  userNameRef.current = userName;

  // Track pending ICE candidates before remote description is set
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // Safe WebSocket send
  const sendWs = useCallback((payload: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  // Initialize Media Devices (Camera + Mic)
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Apply initial audio/video states
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !initialAudioMuted;
      });
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !initialVideoOff;
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('Could not acquire real camera/mic (fallback or permissions denied):', err);
      // Create empty/dummy canvas stream fallback so user can still enter room
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const dummyStream = canvas.captureStream(10);
      localStreamRef.current = dummyStream;
      setLocalStream(dummyStream);
      setIsVideoOff(true);
      return dummyStream;
    }
  }, [initialAudioMuted, initialVideoOff]);

  // Audio level detection for local user
  useEffect(() => {
    if (!localStream) return;
    const cleanup = createAudioLevelDetector(localStream, (level, speaking) => {
      setLocalAudioLevel(level);
      setIsLocalSpeaking(speaking && !isAudioMuted);
    });
    return cleanup;
  }, [localStream, isAudioMuted]);

  // Send signaling message helper
  const sendSignal = useCallback(
    (targetPeerId: string, signalData: unknown) => {
      sendWs({
        type: 'signal',
        roomId,
        to: targetPeerId,
        signalData,
      });
    },
    [roomId, sendWs]
  );

  // Create Peer Connection for a remote peer
  const createPeerConnection = useCallback(
    (remotePeerId: string) => {
      if (peerConnectionsRef.current.has(remotePeerId)) {
        return peerConnectionsRef.current.get(remotePeerId)!;
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);

      // Add local stream tracks to PC
      const activeStream = screenStreamRef.current || localStreamRef.current;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => {
          pc.addTrack(track, activeStream);
        });
      }

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(remotePeerId, {
            type: 'ice_candidate',
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Handle incoming remote media tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          setParticipants((prev) =>
            prev.map((p) => (p.id === remotePeerId ? { ...p, stream: remoteStream } : p))
          );
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          // Keep participant until user_left or reconnects
        }
      };

      peerConnectionsRef.current.set(remotePeerId, pc);
      return pc;
    },
    [sendSignal]
  );

  // Connect WebSocket & Join Room
  useEffect(() => {
    let ws: WebSocket;
    let isMounted = true;

    async function setupRoom() {
      await initLocalStream();

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setConnectionStatus('connected');
        // Join Room
        ws.send(
          JSON.stringify({
            type: 'join_room',
            roomId,
            participantId: localParticipantIdRef.current,
            name: userNameRef.current,
            isAudioMuted: initialAudioMuted,
            isVideoOff: initialVideoOff,
            location: userLocation,
          })
        );
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnectionStatus('disconnected');
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'room_joined': {
              // Existing participants in the room
              const initialList: Participant[] = data.participants.map((p: Partial<Participant>) => ({
                id: p.id || '',
                name: p.name || 'Participant',
                isLocal: false,
                isAudioMuted: !!p.isAudioMuted,
                isVideoOff: !!p.isVideoOff,
                isScreenSharing: !!p.isScreenSharing,
                isHandRaised: !!p.isHandRaised,
                location: p.location,
              }));
              setParticipants(initialList);
              break;
            }

            case 'user_joined': {
              const newUser: Participant = {
                id: data.user.id,
                name: data.user.name,
                isLocal: false,
                isAudioMuted: !!data.user.isAudioMuted,
                isVideoOff: !!data.user.isVideoOff,
                isScreenSharing: !!data.user.isScreenSharing,
                isHandRaised: !!data.user.isHandRaised,
                location: data.user.location,
              };

              setParticipants((prev) => {
                if (prev.some((p) => p.id === newUser.id)) return prev;
                return [...prev, newUser];
              });

              // As the existing peer, initiate WebRTC offer to the newcomer
              const pc = createPeerConnection(newUser.id);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendSignal(newUser.id, {
                type: 'offer',
                sdp: pc.localDescription,
              });
              break;
            }

            case 'signal': {
              const { from, signalData } = data;
              if (!from || !signalData) return;

              let pc = peerConnectionsRef.current.get(from);
              if (!pc) {
                pc = createPeerConnection(from);
              }

              if (signalData.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));

                // Process any queued ICE candidates
                const queued = pendingCandidatesRef.current.get(from) || [];
                for (const c of queued) {
                  await pc.addIceCandidate(new RTCIceCandidate(c));
                }
                pendingCandidatesRef.current.delete(from);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignal(from, {
                  type: 'answer',
                  sdp: pc.localDescription,
                });
              } else if (signalData.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));

                const queued = pendingCandidatesRef.current.get(from) || [];
                for (const c of queued) {
                  await pc.addIceCandidate(new RTCIceCandidate(c));
                }
                pendingCandidatesRef.current.delete(from);
              } else if (signalData.type === 'ice_candidate' && signalData.candidate) {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                  await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                } else {
                  const queued = pendingCandidatesRef.current.get(from) || [];
                  queued.push(signalData.candidate);
                  pendingCandidatesRef.current.set(from, queued);
                }
              }
              break;
            }

            case 'user_left': {
              const { userId } = data;
              setParticipants((prev) => prev.filter((p) => p.id !== userId));
              const pc = peerConnectionsRef.current.get(userId);
              if (pc) {
                pc.close();
                peerConnectionsRef.current.delete(userId);
              }
              break;
            }

            case 'user_updated': {
              const { userId, updates } = data;
              setParticipants((prev) =>
                prev.map((p) => (p.id === userId ? { ...p, ...updates } : p))
              );
              break;
            }

            case 'chat_message': {
              const newMsg: ChatMessage = {
                id: data.id,
                senderId: data.senderId,
                senderName: data.senderName,
                text: data.text,
                timestamp: data.timestamp,
                isLocal: data.senderId === localParticipantIdRef.current,
                reactions: {},
                isPinned: false,
                locationPin: data.locationPin,
              };
              setChatMessages((prev) => [...prev, newMsg]);
              break;
            }

            case 'chat_reaction': {
              const { messageId, emoji } = data;
              setChatMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== messageId) return m;
                  const currentReactions = { ...(m.reactions || {}) };
                  currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
                  return { ...m, reactions: currentReactions };
                })
              );
              break;
            }

            case 'chat_pin': {
              const { messageId, isPinned } = data;
              setChatMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, isPinned } : m))
              );
              break;
            }

            case 'reaction': {
              const newReaction: FloatingReaction = {
                id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                emoji: data.emoji,
                senderId: data.userId,
                senderName: data.senderName,
                xPercent: 20 + Math.random() * 60,
              };
              setReactions((prev) => [...prev, newReaction]);

              // Auto remove after 3.2s
              setTimeout(() => {
                setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
              }, 3200);
              break;
            }
          }
        } catch (err) {
          console.error('Error handling ws message:', err);
        }
      };
    }

    setupRoom();

    return () => {
      isMounted = false;
      if (ws) {
        ws.send(JSON.stringify({ type: 'leave_room' }));
        ws.close();
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, initLocalStream, createPeerConnection, sendSignal, initialAudioMuted, initialVideoOff]);

  // Toggle Microphone (Audio)
  const toggleAudio = useCallback(() => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }

    sendWs({
      type: 'state_update',
      roomId,
      updates: { isAudioMuted: nextMuted },
    });
  }, [isAudioMuted, roomId, sendWs]);

  // Toggle Camera (Video)
  const toggleVideo = useCallback(() => {
    const nextVideoOff = !isVideoOff;
    setIsVideoOff(nextVideoOff);

    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !nextVideoOff;
      });
    }

    sendWs({
      type: 'state_update',
      roomId,
      updates: { isVideoOff: nextVideoOff },
    });
  }, [isVideoOff, roomId, sendWs]);

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share, restore camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);

      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(cameraTrack).catch(console.error);
          }
        });
      }

      sendWs({
        type: 'state_update',
        roomId,
        updates: { isScreenSharing: false },
      });
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = displayStream;
        setScreenStream(displayStream);
        setIsScreenSharing(true);

        const screenTrack = displayStream.getVideoTracks()[0];

        // Handle native "Stop Sharing" button in browser
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          screenStreamRef.current = null;
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) {
            peerConnectionsRef.current.forEach((pc) => {
              const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
              if (sender) sender.replaceTrack(camTrack).catch(console.error);
            });
          }
          sendWs({
            type: 'state_update',
            roomId,
            updates: { isScreenSharing: false },
          });
        };

        // Replace track in peer connections
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack).catch(console.error);
          }
        });

        sendWs({
          type: 'state_update',
          roomId,
          updates: { isScreenSharing: true },
        });
      } catch (err) {
        console.warn('Screen share cancelled or not allowed:', err);
      }
    }
  }, [isScreenSharing, roomId, sendWs]);

  // Toggle Hand Raise
  const toggleHandRaise = useCallback(() => {
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);
    sendWs({
      type: 'state_update',
      roomId,
      updates: { isHandRaised: nextHand },
    });
  }, [isHandRaised, roomId, sendWs]);

  // Send Chat Message
  const sendChatMessage = useCallback(
    (text: string, locationPin?: UserLocation) => {
      if (!text.trim() && !locationPin) return;
      const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const timestamp = Date.now();

      sendWs({
        type: 'chat_message',
        roomId,
        id,
        text: text.trim() || (locationPin ? `Shared location pin: ${locationPin.formattedAddress || locationPin.city || 'Coordinates'}` : ''),
        senderName: userNameRef.current,
        timestamp,
        locationPin,
      });
    },
    [roomId, sendWs]
  );

  // Broadcast location updates dynamically
  const updateLocation = useCallback(
    (newLocation: UserLocation | null) => {
      sendWs({
        type: 'state_update',
        roomId,
        updates: { location: newLocation },
      });
    },
    [roomId, sendWs]
  );

  // Send Reaction
  const sendReaction = useCallback(
    (emoji: string) => {
      sendWs({
        type: 'reaction',
        roomId,
        emoji,
        senderName: userNameRef.current,
      });

      // Optimistically show reaction on local user's feed
      const localReaction: FloatingReaction = {
        id: `rx_local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        emoji,
        senderId: localParticipantIdRef.current,
        senderName: userNameRef.current,
        xPercent: 20 + Math.random() * 60,
      };
      setReactions((prev) => [...prev, localReaction]);

      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== localReaction.id));
      }, 3200);

      // Mutual echo response from studio partner
      if (echoBotActive) {
        setTimeout(() => {
          const partnerReaction: FloatingReaction = {
            id: `rx_bot_${Date.now()}`,
            emoji,
            senderId: 'echo_bot_colleague',
            senderName: 'Sarah Chen',
            xPercent: 25 + Math.random() * 50,
          };
          setReactions((prev) => [...prev, partnerReaction]);
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== partnerReaction.id));
          }, 3200);
        }, 500);
      }
    },
    [roomId, sendWs, echoBotActive]
  );

  // Toggle Echo Bot (Colleague Simulation Peer for 1-click solo testing)
  const toggleEchoBot = useCallback(() => {
    if (echoBotActive) {
      setParticipants((prev) => prev.filter((p) => p.id !== 'echo_bot_colleague'));
      setEchoBotActive(false);
    } else {
      const botParticipant: Participant = {
        id: 'echo_bot_colleague',
        name: 'Sarah Chen (Studio Echo Partner)',
        isLocal: false,
        isAudioMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        isHandRaised: false,
        avatarUrl: '/src/assets/images/avatar_colleague_preview_1793126799873.jpg',
      };
      setParticipants((prev) => [...prev, botParticipant]);
      setEchoBotActive(true);

      // Bot greets in chat
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot_msg_${Date.now()}`,
            senderId: 'echo_bot_colleague',
            senderName: 'Sarah Chen',
            text: 'Hello! WebRTC video and low-latency audio stream are connected and working at 1080p 60fps.',
            timestamp: Date.now(),
          },
        ]);
      }, 800);
    }
  }, [echoBotActive]);

  // Start / Stop HD Call Recording (Local MediaRecorder)
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    } else {
      const activeStream = screenStreamRef.current || localStreamRef.current;
      if (!activeStream) return;

      try {
        recordedChunksRef.current = [];
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        const recorder = new MediaRecorder(
          activeStream,
          MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined
        );

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `NAINO_CALL_${roomId}_${new Date().toISOString().slice(0, 19)}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingDuration(0);

        recordingTimerRef.current = window.setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Failed to start MediaRecorder:', err);
      }
    }
  }, [isRecording, roomId]);

  // Switch camera or mic device dynamically
  const switchDevice = useCallback(async (type: 'audioinput' | 'videoinput', deviceId: string) => {
    try {
      if (type === 'videoinput') {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
        });
        const newTrack = newStream.getVideoTracks()[0];
        const oldTrack = localStreamRef.current?.getVideoTracks()[0];
        if (oldTrack) {
          oldTrack.stop();
          localStreamRef.current?.removeTrack(oldTrack);
        }
        localStreamRef.current?.addTrack(newTrack);

        // Replace track across all peers
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(newTrack);
        });
      } else {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        const newTrack = newStream.getAudioTracks()[0];
        const oldTrack = localStreamRef.current?.getAudioTracks()[0];
        if (oldTrack) {
          oldTrack.stop();
          localStreamRef.current?.removeTrack(oldTrack);
        }
        localStreamRef.current?.addTrack(newTrack);

        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'audio');
          if (sender) sender.replaceTrack(newTrack);
        });
      }
    } catch (err) {
      console.error(`Failed to switch ${type}:`, err);
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'leave_room' }));
      wsRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (isRecording) {
      toggleRecording();
    }
    if (onLeft) {
      onLeft();
    }
  }, [isRecording, toggleRecording, onLeft]);

  // Send Chat Reaction to a specific message
  const sendChatReaction = useCallback(
    (messageId: string, emoji: string) => {
      sendWs({
        type: 'chat_reaction',
        roomId,
        messageId,
        emoji,
        userId: localParticipantIdRef.current,
      });

      // Optimistic local update
      setChatMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const currentReactions = { ...(m.reactions || {}) };
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          return { ...m, reactions: currentReactions };
        })
      );
    },
    [roomId, sendWs]
  );

  // Pin / Unpin a chat message
  const togglePinChatMessage = useCallback(
    (messageId: string) => {
      setChatMessages((prev) => {
        const msg = prev.find((m) => m.id === messageId);
        const nextPinned = !msg?.isPinned;
        sendWs({
          type: 'chat_pin',
          roomId,
          messageId,
          isPinned: nextPinned,
        });
        return prev.map((m) => (m.id === messageId ? { ...m, isPinned: nextPinned } : m));
      });
    },
    [roomId, sendWs]
  );

  return {
    localStream,
    screenStream: screenStreamRef.current,
    participants,
    chatMessages,
    reactions,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isHandRaised,
    connectionStatus,
    localAudioLevel,
    isLocalSpeaking,
    localParticipantId: localParticipantIdRef.current,
    isRecording,
    recordingDuration,
    echoBotActive,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    toggleRecording,
    toggleEchoBot,
    sendChatMessage,
    sendChatReaction,
    togglePinChatMessage,
    sendReaction,
    updateLocation,
    switchDevice,
    leaveRoom,
    peerConnectionsRef,
    wsRef,
  };
}
