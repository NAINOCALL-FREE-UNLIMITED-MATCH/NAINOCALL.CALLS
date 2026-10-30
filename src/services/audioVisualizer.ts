/**
 * Audio meter monitor using Web Audio API
 */
export function createAudioLevelDetector(
  stream: MediaStream,
  onLevelUpdate: (level: number, isSpeaking: boolean) => void
): () => void {
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    return () => {};
  }

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return () => {};

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationId: number;
    let isRunning = true;

    const checkVolume = () => {
      if (!isRunning) return;

      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Normalizing 0-255 to 0-100
      const level = Math.min(100, Math.round((average / 128) * 100));
      const isSpeaking = level > 12;

      onLevelUpdate(level, isSpeaking);

      animationId = requestAnimationFrame(checkVolume);
    };

    animationId = requestAnimationFrame(checkVolume);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
      source.disconnect();
      analyser.disconnect();
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  } catch (err) {
    console.warn('Audio level detector init failed:', err);
    return () => {};
  }
}
