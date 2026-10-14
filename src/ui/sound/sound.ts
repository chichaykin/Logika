import { settings } from '../../store';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // ignore
    });
  }
  return audioCtx;
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {
        // ignore
      });
    }
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

/**
 * Инициализирует аудиоконтекст по первому пользовательскому взаимодействию.
 */
export function initAudio(): void {
  getAudioContext();
}

/**
 * Звук падения тяжёлого шарика в лунку.
 * Сочетает плотный низкочастотный импульс массы (thud),
 * резкий поверхностный щелчок соприкосновения (click)
 * и акустический резонанс гнезда поля.
 */
export function playMarbleDrop(colorIndex = 0, slotIndex = 0): void {
  if (!settings.value.sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const baseFreq = 95 + (colorIndex % 6) * 4 + (slotIndex % 4) * 2.5;

    // 1. Тело шарика (низкий плотный удар, ощущение массы и тяжести)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(baseFreq * 1.8, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.05);

    bodyGain.gain.setValueAtTime(0.55, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.08);

    // 2. Поверхностный щелчок (твердость стекла/керамики о пластиковое гнездо)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(900 + (colorIndex * 60), now);
    clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.02);

    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.03);

    // 3. Резонанс пластиковой лунки
    const resOsc = ctx.createOscillator();
    const resGain = ctx.createGain();
    resOsc.type = 'sine';
    resOsc.frequency.setValueAtTime(340 + slotIndex * 15, now);
    resGain.gain.setValueAtTime(0.18, now);
    resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    resOsc.connect(resGain);
    resGain.connect(ctx.destination);
    resOsc.start(now);
    resOsc.stop(now + 0.055);
  } catch {
    // ignore
  }
}

/**
 * Звук извлечения / стирания шарика (мягкий глухой щелчок назад).
 */
export function playMarbleRemove(): void {
  if (!settings.value.sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.035);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // ignore
  }
}

/**
 * Звук откидывания шторки с секретным кодом (щелчок защёлки + свип подъёма).
 */
export function playLidOpen(): void {
  if (!settings.value.sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Щелчок защелки
    const latchOsc = ctx.createOscillator();
    const latchGain = ctx.createGain();
    latchOsc.type = 'triangle';
    latchOsc.frequency.setValueAtTime(750, now);
    latchOsc.frequency.exponentialRampToValueAtTime(240, now + 0.03);

    latchGain.gain.setValueAtTime(0.3, now);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    latchOsc.connect(latchGain);
    latchGain.connect(ctx.destination);
    latchOsc.start(now);
    latchOsc.stop(now + 0.04);

    // Свип движения шторки (шумовой фильтр)
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.2);
    filter.Q.value = 3.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.06);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.23);
  } catch {
    // ignore
  }
}

/**
 * Торжественный победный аккорд/арпеджио при разгадке шифра.
 */
export function playWin(): void {
  if (!settings.value.sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Мажорный триумфальный квартет: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const delays = [0, 0.09, 0.18, 0.27];

    notes.forEach((freq, idx) => {
      const start = now + delays[idx];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      const dur = idx === notes.length - 1 ? 0.65 : 0.45;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur);
    });
  } catch {
    // ignore
  }
}

/**
 * Элегичный нисходящий минорный мотив при окончании попыток.
 */
export function playLoss(): void {
  if (!settings.value.sound) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Нисходящая минорная фраза: G4, Eb4, C4
    const notes = [392.0, 311.13, 261.63];
    const delays = [0, 0.14, 0.3];

    notes.forEach((freq, idx) => {
      const start = now + delays[idx];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      const dur = idx === notes.length - 1 ? 0.55 : 0.35;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur);
    });
  } catch {
    // ignore
  }
}
