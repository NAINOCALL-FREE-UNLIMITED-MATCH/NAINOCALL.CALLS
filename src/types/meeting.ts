export interface UserLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  flagEmoji?: string;
  formattedAddress?: string;
  timestamp?: number;
  permissionState: 'granted' | 'prompt' | 'denied' | 'unsupported';
  sharingEnabled: boolean;
}

export interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  audioLevel?: number; // 0 to 100 for speaking volume
  stream?: MediaStream;
  avatarUrl?: string;
  isHost?: boolean;
  location?: UserLocation;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isLocal?: boolean;
  reactions?: Record<string, number>;
  isPinned?: boolean;
  locationPin?: UserLocation;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderId?: string;
  senderName: string;
  xPercent: number;
}

export type VirtualBackgroundType = 'none' | 'blur' | 'loft' | 'office' | 'bookshelf' | 'warm_studio' | 'cinematic_bw';

export interface VirtualBackground {
  id: VirtualBackgroundType;
  label: string;
  previewUrl?: string;
  filterStyle?: string;
}

export interface DeviceSettings {
  audioInputId: string;
  videoInputId: string;
  audioOutputId: string;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface MeetingSession {
  roomId: string;
  localName: string;
  createdTime: number;
  isHost: boolean;
}
