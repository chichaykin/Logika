import type { Attempt, Code, GameConfig } from '../core/config';
import { encodeFeedback, scoreFlat } from '../core/feedback';
import { CodeSpace, getCodeSpace } from '../core/codeSpace';

/** Один сделанный ход и полученная на него подсказка. */
export type HistoryEntry = Attempt;

export interface SolverOptions {
  /**
   * Бюджет на один выбор хода: максимум сравнений |пул| × |кандидаты|.
   * Для 4×6 полный перебор (≈3,3·10⁵) всегда укладывается в бюджет.
   */
  budget?: number;
  /** Минимальный размер пула ходов при урезании по бюджету. */
  minPool?: number;
}

const DEFAULT_BUDGET = 4_000_000;
const DEFAULT_MIN_POOL = 64;

/**
 * Алгоритм Кнута (1977): на каждом шаге выбирается ход, который минимизирует
 * размер наибольшей группы кандидатов среди всех возможных ответов.
 *
 * Тай-брейки (как у Кнута): ход из множества кандидатов S предпочтительнее,
 * дальше — лексикографически первый.
 *
 * Для больших пространств (например, 5×8) полный перебор не помещается в бюджет,
 * поэтому пул ходов урезается: часть кандидатов + равномерная выборка из всего U.
 */
export class KnuthSolver {
  readonly space: CodeSpace;
  private readonly budget: number;
  private readonly minPool: number;
  private readonly bufG: Uint8Array;
  private readonly bufS: Uint8Array;
  private readonly memo = new Map<string, number>();

  constructor(
    readonly config: GameConfig,
    opts: SolverOptions = {},
  ) {
    this.space = getCodeSpace(config);
    this.budget = opts.budget ?? DEFAULT_BUDGET;
    this.minPool = opts.minPool ?? DEFAULT_MIN_POOL;
    this.bufG = new Uint8Array(config.colors);
    this.bufS = new Uint8Array(config.colors);
  }

  /** Стартовый ход по шаблону Кнута: 1122 (для 5 позиций — 11223; без повторов — 1234…). */
  firstGuess(): Code {
    const { length, repeats } = this.config;
    if (!repeats) return Array.from({ length }, (_, i) => i);
    if (length === 4) return [0, 0, 1, 1];
    return [0, 0, 1, 1, 2];
  }

  /** Индексы кандидатов, согласованных со всей историей (по возрастанию). */
  candidates(history: readonly HistoryEntry[]): Int32Array {
    let cur: Int32Array = this.space.valid;
    for (const h of history) {
      cur = this.filter(cur, h);
      if (cur.length === 0) break;
    }
    return cur;
  }

  /** Сколько вариантов ещё возможно. */
  remaining(history: readonly HistoryEntry[]): number {
    return this.candidates(history).length;
  }

  /**
   * Если подсказки противоречивы — индекс записи истории, после которой
   * не осталось ни одного кандидата; иначе null.
   */
  findContradiction(history: readonly HistoryEntry[]): number | null {
    let cur: Int32Array = this.space.valid;
    for (let i = 0; i < history.length; i++) {
      cur = this.filter(cur, history[i]);
      if (cur.length === 0) return i;
    }
    return null;
  }

  /** Лучший следующий ход. Бросает ошибку, если подсказки противоречивы. */
  nextGuess(history: readonly HistoryEntry[]): Code {
    if (history.length === 0) return this.firstGuess();
    return this.pick(history, this.requireCandidates(history));
  }

  /** Подсказка игроку: лучший ход и сколько вариантов осталось. */
  hint(history: readonly HistoryEntry[]): { guess: Code; remaining: number } {
    if (history.length === 0) return { guess: this.firstGuess(), remaining: this.space.valid.length };
    const cand = this.requireCandidates(history);
    return { guess: this.pick(history, cand), remaining: cand.length };
  }

  // ---- внутреннее ----

  private requireCandidates(history: readonly HistoryEntry[]): Int32Array {
    const cand = this.candidates(history);
    if (cand.length === 0) throw new Error('Нет кандидатов: подсказки противоречат друг другу');
    return cand;
  }

  /** Выбор хода среди кандидатов с кэшированием по истории. */
  private pick(history: readonly HistoryEntry[], cand: Int32Array): Code {
    const key = history.map((h) => `${h.guess.join('')}:${encodeFeedback(h.feedback)}`).join('|');
    let idx = this.memo.get(key);
    if (idx === undefined) {
      idx = this.chooseIndex(cand);
      this.memo.set(key, idx);
    }
    return this.space.decode(idx);
  }

  private filter(cand: Int32Array, h: HistoryEntry): Int32Array {
    const { digits, length } = this.space;
    const want = encodeFeedback(h.feedback);
    const guess = Uint8Array.from(h.guess);
    const out: number[] = [];
    for (let i = 0; i < cand.length; i++) {
      const fb = scoreFlat(guess, 0, digits, cand[i] * length, length, this.bufG, this.bufS);
      if (fb === want) out.push(cand[i]);
    }
    return Int32Array.from(out);
  }

  private chooseIndex(cand: Int32Array): number {
    if (cand.length <= 2) return cand[0];

    const { digits, length, total, valid } = this.space;
    const inS = new Uint8Array(total);
    for (let i = 0; i < cand.length; i++) inS[cand[i]] = 1;

    const pool = this.buildPool(cand, valid);
    const buckets = new Int32Array(256);

    let best = -1;
    let bestWorst = Infinity;
    let bestInS = false;

    for (let p = 0; p < pool.length; p++) {
      const g = pool[p];
      buckets.fill(0);
      let worst = 0;
      for (let i = 0; i < cand.length; i++) {
        const fb = scoreFlat(digits, g * length, digits, cand[i] * length, length, this.bufG, this.bufS);
        const c = ++buckets[fb];
        if (c > worst) {
          worst = c;
          if (worst > bestWorst) break; // заведомо хуже текущего лучшего
        }
      }
      if (worst > bestWorst) continue;
      const gIn = inS[g] === 1;
      if (worst < bestWorst || (!bestInS && gIn)) {
        best = g;
        bestWorst = worst;
        bestInS = gIn;
      }
    }
    return best;
  }

  /** Пул ходов, упорядоченный по возрастанию индекса (лексикографически). */
  private buildPool(cand: Int32Array, all: Int32Array): Int32Array {
    const full = Math.max(1, Math.floor(this.budget / cand.length));
    if (full >= all.length) return all;

    const size = Math.max(this.minPool, full);
    const fromS = Math.min(cand.length, Math.ceil(size / 2));
    const fromU = Math.max(0, size - fromS);
    const picked = new Set<number>();

    const strideS = cand.length / fromS;
    for (let i = 0; i < fromS; i++) picked.add(cand[Math.floor(i * strideS)]);
    if (fromU > 0) {
      const strideU = all.length / fromU;
      for (let i = 0; i < fromU; i++) picked.add(all[Math.floor(i * strideU)]);
    }
    return Int32Array.from(picked).sort();
  }
}
