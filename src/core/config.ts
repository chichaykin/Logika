/** Параметры партии. Цвета кодируются числами 0..colors-1. */
export interface GameConfig {
  /** Количество позиций в коде. */
  length: number;
  /** Количество доступных цветов. */
  colors: number;
  /** Разрешены ли повторы цветов в коде. */
  repeats: boolean;
  /** Максимальное число попыток. */
  maxAttempts: number;
}

export type PresetId = 'classic' | 'hard' | 'custom';

export const PRESETS: Record<Exclude<PresetId, 'custom'>, GameConfig> = {
  classic: { length: 4, colors: 6, repeats: true, maxAttempts: 10 },
  hard: { length: 5, colors: 8, repeats: true, maxAttempts: 12 },
};

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 5;
export const MIN_COLORS = 6;
export const MAX_COLORS = 8;

/** Код: массив индексов цветов. */
export type Code = readonly number[];

export interface Feedback {
  black: number;
  white: number;
}

/** Ход и полученная на него подсказка. */
export interface Attempt {
  guess: Code;
  feedback: Feedback;
}

/** Приводит произвольную конфигурацию к допустимой. */
export function normalizeConfig(c: GameConfig): GameConfig {
  const int = (v: number, fallback: number) => (Number.isFinite(v) ? Math.round(v) : fallback);
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, int(c.length, PRESETS.classic.length)));
  const colors = Math.min(MAX_COLORS, Math.max(MIN_COLORS, int(c.colors, PRESETS.classic.colors)));
  // Без повторов нужно хотя бы столько цветов, сколько позиций.
  const repeats = c.repeats || colors < length;
  const maxAttempts = Math.min(20, Math.max(4, int(c.maxAttempts, PRESETS.classic.maxAttempts)));
  return { length, colors, repeats, maxAttempts };
}

export function presetKey(c: GameConfig): string {
  for (const [id, p] of Object.entries(PRESETS)) {
    if (
      p.length === c.length &&
      p.colors === c.colors &&
      p.repeats === c.repeats &&
      p.maxAttempts === c.maxAttempts
    ) {
      return id;
    }
  }
  return `custom-${c.length}x${c.colors}${c.repeats ? 'r' : 'u'}-${c.maxAttempts}`;
}

export function sameConfig(a: GameConfig, b: GameConfig): boolean {
  return (
    a.length === b.length &&
    a.colors === b.colors &&
    a.repeats === b.repeats &&
    a.maxAttempts === b.maxAttempts
  );
}
