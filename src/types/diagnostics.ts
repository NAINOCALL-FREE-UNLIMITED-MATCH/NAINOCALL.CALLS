export interface DiagnosticsHistoryPoint {
  time: string;
  rtt: number;
  bitrateIn: number;
  bitrateOut: number;
  packetLoss: number;
}

export interface WebRTCStatsData {
  timestamp: number;
  connectionState: 'connected' | 'connecting' | 'disconnected' | 'new';
  iceConnectionState: 'connected' | 'completed' | 'checking' | 'new' | 'disconnected';
  iceCandidateType: string; // 'host' | 'srflx' | 'relay' | 'peer-reflexive'
  transportType: string; // 'UDP' | 'TCP'
  rtt: number; // in ms
  jitter: number; // in ms
  packetLossPercent: number; // %
  packetsLost: number;
  packetsReceived: number;
  packetsSent: number;
  bytesSent: number;
  bytesReceived: number;
  bitrateOut: number; // in kbps
  bitrateIn: number; // in kbps
  sendResolution: { width: number; height: number };
  sendFps: number;
  recvResolution: { width: number; height: number };
  recvFps: number;
  audioCodec: string;
  videoCodec: string;
  qualityScore: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  history: DiagnosticsHistoryPoint[];
  peerCount: number;
  isSimulated: boolean;
}
