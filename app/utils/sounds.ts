"use client";

// Sound utility for trade notifications
// =====================================
// 
// TO USE YOUR OWN SOUND FILES:
// 1. Add your audio files to: public/sounds/
//    - open.mp3 (or .wav, .ogg)
//    - profit.mp3
//    - loss.mp3
//    - liquidation.mp3
// 2. Set USE_CUSTOM_SOUNDS = true below
//
// =====================================

const USE_CUSTOM_SOUNDS = true; // Set to true to use audio files from public/sounds/
const SOUND_VOLUME = 0.5; // Volume for custom sounds (0.0 to 1.0)

// Custom sound file paths (relative to public folder)
const SOUND_PATHS = {
  open: "/sounds/open.mp3",
  profit: "/sounds/profit.mp3",
  loss: "/sounds/loss.mp3",
  liquidation: "/sounds/liquidation.mp3",
};

// Cache for audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

function playAudioFile(path: string) {
  if (typeof window === "undefined") return;

  try {
    // Reuse cached audio element or create new one
    if (!audioCache[path]) {
      audioCache[path] = new Audio(path);
    }
    const audio = audioCache[path];
    audio.volume = SOUND_VOLUME;
    audio.currentTime = 0; // Reset to start
    audio.play().catch(() => {
      // Silently fail if autoplay is blocked
    });
  } catch {
    // Silently fail if audio fails
  }
}

// =====================================
// Web Audio API tone generation (fallback)
// =====================================

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioContext;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
}

function playTone({
  frequency,
  duration,
  type = "sine",
  volume = 0.3,
}: ToneOptions) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// =====================================
// Exported sound functions
// =====================================

// Position opened sound
export function playOpenSound() {
  if (USE_CUSTOM_SOUNDS) {
    playAudioFile(SOUND_PATHS.open);
    return;
  }
  // Fallback: Two quick ascending tones
  playTone({ frequency: 440, duration: 0.1, type: "sine", volume: 0.25 });
  setTimeout(() => {
    playTone({ frequency: 554, duration: 0.15, type: "sine", volume: 0.25 });
  }, 80);
}

// Position closed with profit
export function playProfitSound() {
  if (USE_CUSTOM_SOUNDS) {
    playAudioFile(SOUND_PATHS.profit);
    return;
  }
  // Fallback: Ascending arpeggio (C-E-G major chord)
  playTone({ frequency: 523, duration: 0.12, type: "sine", volume: 0.2 });
  setTimeout(() => {
    playTone({ frequency: 659, duration: 0.12, type: "sine", volume: 0.2 });
  }, 80);
  setTimeout(() => {
    playTone({ frequency: 784, duration: 0.2, type: "sine", volume: 0.25 });
  }, 160);
}

// Position closed with loss
export function playLossSound() {
  if (USE_CUSTOM_SOUNDS) {
    playAudioFile(SOUND_PATHS.loss);
    return;
  }
  // Fallback: Descending two-tone (minor feel)
  playTone({ frequency: 392, duration: 0.15, type: "triangle", volume: 0.25 });
  setTimeout(() => {
    playTone({ frequency: 311, duration: 0.2, type: "triangle", volume: 0.2 });
  }, 120);
}

// Liquidation sound
export function playLiquidationSound() {
  if (USE_CUSTOM_SOUNDS) {
    playAudioFile(SOUND_PATHS.liquidation);
    return;
  }
  // Fallback: Low rumble with descending tones
  playTone({ frequency: 200, duration: 0.3, type: "sawtooth", volume: 0.15 });
  setTimeout(() => {
    playTone({ frequency: 150, duration: 0.25, type: "sawtooth", volume: 0.12 });
  }, 150);
  setTimeout(() => {
    playTone({ frequency: 100, duration: 0.3, type: "sawtooth", volume: 0.1 });
  }, 300);
}

