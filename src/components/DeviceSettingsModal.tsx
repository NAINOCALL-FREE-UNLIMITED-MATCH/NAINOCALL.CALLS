import React, { useState, useEffect } from 'react';
import { X, Mic, Video, Volume2, Shield, Settings2, MapPin, Navigation, Globe, RotateCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';

interface DeviceSettingsModalProps {
  onClose: () => void;
  onSwitchDevice?: (type: 'audioinput' | 'videoinput', deviceId: string) => void;
  currentAudioLevel?: number;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  onClose,
  onSwitchDevice,
  currentAudioLevel = 0,
}) => {
  const {
    location,
    permissionState,
    isLoading: isLocLoading,
    error: locError,
    requestLocation,
    toggleSharing,
  } = useUserLocation();

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [testTonePlaying, setTestTonePlaying] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);

  useEffect(() => {
    async function loadDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audios = devices.filter((d) => d.kind === 'audioinput');
        const videos = devices.filter((d) => d.kind === 'videoinput');
        setAudioDevices(audios);
        setVideoDevices(videos);
        if (audios.length > 0 && !selectedAudio) setSelectedAudio(audios[0].deviceId);
        if (videos.length > 0 && !selectedVideo) setSelectedVideo(videos[0].deviceId);
      } catch (err) {
        console.warn('Could not enumerate devices:', err);
      }
    }
    loadDevices();
  }, [selectedAudio, selectedVideo]);

  const handleAudioChange = (deviceId: string) => {
    setSelectedAudio(deviceId);
    if (onSwitchDevice) onSwitchDevice('audioinput', deviceId);
  };

  const handleVideoChange = (deviceId: string) => {
    setSelectedVideo(deviceId);
    if (onSwitchDevice) onSwitchDevice('videoinput', deviceId);
  };

  const playTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setTestTonePlaying(true);
      osc.stop(ctx.currentTime + 0.6);

      setTimeout(() => {
        setTestTonePlaying(false);
        ctx.close();
      }, 700);
    } catch (err) {
      console.warn('Audio test failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">Audio & Video Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Microphone */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Mic className="w-4 h-4 text-indigo-400" />
              <span>Microphone Input</span>
            </label>
            <select
              value={selectedAudio}
              onChange={(e) => handleAudioChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {audioDevices.length === 0 ? (
                <option value="">Default System Microphone</option>
              ) : (
                audioDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))
              )}
            </select>

            {/* Live Mic Meter */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Input Level</span>
                <span className="font-mono tabular-nums">{currentAudioLevel}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${Math.min(100, currentAudioLevel * 1.5)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Camera */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Video className="w-4 h-4 text-indigo-400" />
              <span>Camera Video</span>
            </label>
            <select
              value={selectedVideo}
              onChange={(e) => handleVideoChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {videoDevices.length === 0 ? (
                <option value="">Default Web Camera</option>
              ) : (
                videoDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Speaker Test */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Speaker Sound Test</p>
                <p className="text-[11px] text-slate-400">Play a test chime to verify output audio</p>
              </div>
            </div>
            <button
              onClick={playTestSound}
              disabled={testTonePlaying}
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {testTonePlaying ? 'Playing...' : 'Test Speaker'}
            </button>
          </div>

          {/* Audio Processing Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Audio Signal Processing</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-medium text-slate-200">Acoustic Echo Cancellation (AEC)</p>
                <p className="text-[11px] text-slate-400">Eliminates loopback feedback from speakers</p>
              </div>
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={(e) => setEchoCancellation(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-medium text-slate-200">Background Noise Suppression</p>
                <p className="text-[11px] text-slate-400">Filters keyboard clatter, AC hum, and fan noise</p>
              </div>
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Location Permission & Geo-Privacy */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Location Permission & Geo-Privacy</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  permissionState === 'granted'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : permissionState === 'denied'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {permissionState === 'granted'
                  ? 'Permission: Granted'
                  : permissionState === 'denied'
                  ? 'Permission: Denied'
                  : 'Permission: Not Prompted'}
              </span>
            </div>

            {/* Location card */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {location?.city ? `${location.city}, ${location.country}` : 'Current Location'}
                      {location?.flagEmoji && <span className="ml-1.5">{location.flagEmoji}</span>}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {location?.latitude && location?.longitude
                        ? `GPS: ${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}° (±${Math.round(location.accuracy || 25)}m)`
                        : 'No GPS coordinates acquired yet'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => requestLocation()}
                  disabled={isLocLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  {isLocLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{permissionState === 'granted' ? 'Refresh' : 'Request Access'}</span>
                    </>
                  )}
                </button>
              </div>

              {locError && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{locError}</span>
                </div>
              )}

              {/* Privacy Toggle: Share location with call peers */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                <div>
                  <p className="text-xs font-medium text-slate-200">Display City Badge On Video</p>
                  <p className="text-[11px] text-slate-400">Shows your city & country flag to meeting participants</p>
                </div>
                <input
                  type="checkbox"
                  checked={location?.sharingEnabled ?? true}
                  onChange={(e) => toggleSharing(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-800 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
