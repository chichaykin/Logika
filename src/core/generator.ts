import type { Code, GameConfig } from './config';

/** Генератор случайных чисел [0, 1). */
export type Rng = () => number;

/** Криптостойкий источник случайности по умолчанию. */
export const secureRng: Rng = () => {
  const buf = new Uint32Array(1);
  (globalThis.crypto ?? crypto).getRandomValues(buf);
  return buf[0] / 0x100000000;
};

/** Детерминированный генератор (mulberry32) — для тестов. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Случайный секретный код с учётом правила о повторах. */
export function generateSecret(config: GameConfig, rng: Rng = secureRng): Code {
  const { length, colors, repeats } = config;
  if (repeats) {
    return Array.from({ length }, () => Math.floor(rng() * colors));
  }
  // Без повторов: частичная перетасовка Фишера–Йетса.
  const pool = Array.from({ length: colors }, (_, i) => i);
  for (let i = 0; i < length; i++) {
    const j = i + Math.floor(rng() * (colors - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, length);
}

/** Допустим ли код при данных правилах. */
export function isValidCode(code: Code, config: GameConfig): boolean {
  if (code.length !== config.length) return false;
  if (code.some((c) => !Number.isInteger(c) || c < 0 || c >= config.colors)) return false;
  if (!config.repeats && new Set(code).size !== code.length) return false;
  return true;
}
