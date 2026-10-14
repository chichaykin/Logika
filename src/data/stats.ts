import { loadJson, saveJson, type StorageLike } from './storage';

const KEY = 'logika:stats:v1';
const RECENT_LIMIT = 20;
export const HISTOGRAM_SIZE = 20;

export interface SoloStats {
  played: number;
  wins: number;
  streak: number;
  bestStreak: number;
  /** histogram[i] — побед за (i + 1) ход(ов). */
  histogram: number[];
  hintsUsed: number;
}

export interface ComputerStats {
  played: number;
  solved: number;
  /** Сумма ходов компьютера в успешных партиях. */
  totalMoves: number;
}

export interface RecentGame {
  mode: 'solo' | 'computer';
  preset: string;
  won: boolean;
  attempts: number;
  hints: number;
  /** ISO-дата. */
  at: string;
}

export interface StatsData {
  v: 1;
  solo: Record<string, SoloStats>;
  computer: Record<string, ComputerStats>;
  recent: RecentGame[];
}

export function emptySoloStats(): SoloStats {
  return { played: 0, wins: 0, streak: 0, bestStreak: 0, histogram: new Array(HISTOGRAM_SIZE).fill(0), hintsUsed: 0 };
}

export function emptyStats(): StatsData {
  return { v: 1, solo: {}, computer: {}, recent: [] };
}

export interface SoloResult {
  preset: string;
  won: boolean;
  attempts: number;
  hints: number;
  at?: Date;
}

export interface ComputerResult {
  preset: string;
  solved: boolean;
  moves: number;
  at?: Date;
}

function pushRecent(data: StatsData, game: RecentGame): RecentGame[] {
  return [game, ...data.recent].slice(0, RECENT_LIMIT);
}

/** Чистая функция: возвращает обновлённую статистику. */
export function recordSolo(data: StatsData, r: SoloResult): StatsData {
  const prev = data.solo[r.preset] ?? emptySoloStats();
  const histogram = [...prev.histogram];
  if (r.won) {
    const i = Math.min(Math.max(r.attempts, 1), HISTOGRAM_SIZE) - 1;
    histogram[i] = (histogram[i] ?? 0) + 1;
  }
  const streak = r.won ? prev.streak + 1 : 0;
  const next: SoloStats = {
    played: prev.played + 1,
    wins: prev.wins + (r.won ? 1 : 0),
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    histogram,
    hintsUsed: prev.hintsUsed + r.hints,
  };
  return {
    ...data,
    solo: { ...data.solo, [r.preset]: next },
    recent: pushRecent(data, {
      mode: 'solo',
      preset: r.preset,
      won: r.won,
      attempts: r.attempts,
      hints: r.hints,
      at: (r.at ?? new Date()).toISOString(),
    }),
  };
}

export function recordComputer(data: StatsData, r: ComputerResult): StatsData {
  const prev = data.computer[r.preset] ?? { played: 0, solved: 0, totalMoves: 0 };
  const next: ComputerStats = {
    played: prev.played + 1,
    solved: prev.solved + (r.solved ? 1 : 0),
    totalMoves: prev.totalMoves + (r.solved ? r.moves : 0),
  };
  return {
    ...data,
    computer: { ...data.computer, [r.preset]: next },
    recent: pushRecent(data, {
      mode: 'computer',
      preset: r.preset,
      won: r.solved,
      attempts: r.moves,
      hints: 0,
      at: (r.at ?? new Date()).toISOString(),
    }),
  };
}

/** Среднее число ходов компьютера в успешных партиях (0, если нет данных). */
export function averageComputerMoves(s: ComputerStats | undefined): number {
  return s && s.solved > 0 ? s.totalMoves / s.solved : 0;
}

/** Среднее число ходов игрока в победных партиях. */
export function averageSoloAttempts(s: SoloStats | undefined): number {
  if (!s || s.wins === 0) return 0;
  const total = s.histogram.reduce((acc, n, i) => acc + n * (i + 1), 0);
  return total / s.wins;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);

/** Приводит данные из хранилища к безопасной форме: мусор отбрасывается, а не роняет приложение. */
export function sanitizeStats(raw: unknown): StatsData {
  if (!isObj(raw) || raw.v !== 1) return emptyStats();
  const out = emptyStats();
  if (isObj(raw.solo)) {
    for (const [k, v] of Object.entries(raw.solo)) {
      if (!isObj(v)) continue;
      const hist = Array.isArray(v.histogram) ? v.histogram : [];
      out.solo[k] = {
        played: num(v.played),
        wins: num(v.wins),
        streak: num(v.streak),
        bestStreak: num(v.bestStreak),
        histogram: Array.from({ length: HISTOGRAM_SIZE }, (_, i) => num(hist[i])),
        hintsUsed: num(v.hintsUsed),
      };
    }
  }
  if (isObj(raw.computer)) {
    for (const [k, v] of Object.entries(raw.computer)) {
      if (!isObj(v)) continue;
      out.computer[k] = { played: num(v.played), solved: num(v.solved), totalMoves: num(v.totalMoves) };
    }
  }
  if (Array.isArray(raw.recent)) {
    out.recent = raw.recent
      .filter(
        (g): g is RecentGame =>
          isObj(g) &&
          (g.mode === 'solo' || g.mode === 'computer') &&
          typeof g.preset === 'string' &&
          typeof g.won === 'boolean' &&
          typeof g.at === 'string',
      )
      .map((g) => ({ ...g, attempts: num(g.attempts), hints: num(g.hints) }))
      .slice(0, RECENT_LIMIT);
  }
  return out;
}

export function loadStats(storage?: StorageLike): StatsData {
  return sanitizeStats(loadJson<unknown>(KEY, null, storage));
}

export function saveStats(data: StatsData, storage?: StorageLike): void {
  saveJson(KEY, data, storage);
}

export function resetStats(storage?: StorageLike): StatsData {
  const fresh = emptyStats();
  saveStats(fresh, storage);
  return fresh;
}
