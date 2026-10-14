import type { Code, GameConfig } from './config';

/**
 * Пространство всех допустимых кодов для конфигурации.
 * Код кодируется целым числом (система счисления по основанию `colors`),
 * поэтому числовой порядок совпадает с лексикографическим.
 */
export class CodeSpace {
  readonly length: number;
  readonly colors: number;
  /** Количество всех строк длины `length` над алфавитом из `colors` символов. */
  readonly total: number;
  /** Цифры всех кодов подряд: код с индексом i лежит в [i*length, (i+1)*length). */
  readonly digits: Uint8Array;
  /** Индексы допустимых кодов (с учётом правила о повторах) по возрастанию. */
  readonly valid: Int32Array;

  constructor(config: GameConfig) {
    this.length = config.length;
    this.colors = config.colors;
    this.total = config.colors ** config.length;
    this.digits = new Uint8Array(this.total * this.length);

    const ok: number[] = [];
    const cur = new Array<number>(this.length).fill(0);
    for (let idx = 0; idx < this.total; idx++) {
      for (let i = 0; i < this.length; i++) this.digits[idx * this.length + i] = cur[i];
      if (config.repeats || new Set(cur).size === this.length) ok.push(idx);
      // инкремент «счётчика» с последней позиции
      for (let p = this.length - 1; p >= 0; p--) {
        if (++cur[p] < this.colors) break;
        cur[p] = 0;
      }
    }
    this.valid = Int32Array.from(ok);
  }

  decode(idx: number): Code {
    const out: number[] = [];
    for (let i = 0; i < this.length; i++) out.push(this.digits[idx * this.length + i]);
    return out;
  }

  encode(code: Code): number {
    let n = 0;
    for (let i = 0; i < this.length; i++) n = n * this.colors + code[i];
    return n;
  }
}

const cache = new Map<string, CodeSpace>();

/** Кэшированное пространство кодов (построение 5×8 занимает десятки миллисекунд). */
export function getCodeSpace(config: GameConfig): CodeSpace {
  const key = `${config.length}:${config.colors}:${config.repeats ? 1 : 0}`;
  let space = cache.get(key);
  if (!space) {
    space = new CodeSpace(config);
    cache.set(key, space);
  }
  return space;
}
