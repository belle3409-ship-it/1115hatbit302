let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playMuseumChime(type: 'discover' | 'success' | 'step' | 'stamp' = 'discover') {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes =
    type === 'success'
      ? [523.25, 659.25, 783.99, 1046.5]
      : type === 'stamp'
      ? [440, 587.33, 880]
      : type === 'discover'
      ? [587.33, 880]
      : [320];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type === 'step' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    const startTime = now + idx * 0.08;
    const duration = type === 'step' ? 0.05 : 0.28;

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(type === 'step' ? 0.03 : 0.09, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  });
}

export function speakKorean(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  },
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    callbacks?.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.94;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const koVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ko'));
  if (koVoice) {
    utterance.voice = koVoice;
  }

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = () => callbacks?.onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
