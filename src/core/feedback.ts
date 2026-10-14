import type { Code, Feedback } from './config';

/**
 * Подсказка по ходу: чёрные — совпали цвет и позиция,
 * белые — цвет есть в секрете, но стоит не на своём месте.
 * Корректно работает и с повторами цветов.
 */
export function score(guess: Code, secret: Code, colors: number): Feedback {
  let black = 0;
  const g = new Uint8Array(colors);
  const s = new Uint8Array(colors);
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) {
      black++;
    } else {
      g[guess[i]]++;
      s[secret[i]]++;
    }
  }
  let white = 0;
  for (let c = 0; c < colors; c++) white += Math.min(g[c], s[c]);
  return { black, white };
}

/**
 * Быстрый вариант для плоских массивов (используется в солвере).
 * `g` и `s` — переиспользуемые буферы длиной ровно `colors`.
 * Возвращает подсказку, упакованную в байт: (black << 4) | white.
 */
export function scoreFlat(
  a: Uint8Array,
  ao: number,
  b: Uint8Array,
  bo: number,
  length: number,
  g: Uint8Array,
  s: Uint8Array,
): number {
  g.fill(0);
  s.fill(0);
  let black = 0;
  for (let i = 0; i < length; i++) {
    const x = a[ao + i];
    const y = b[bo + i];
    if (x === y) black++;
    else {
      g[x]++;
      s[y]++;
    }
  }
  let white = 0;
  for (let c = 0; c < g.length; c++) {
    const m = g[c] < s[c] ? g[c] : s[c];
    white += m;
  }
  return (black << 4) | white;
}

export function encodeFeedback(f: Feedback): number {
  return (f.black << 4) | f.white;
}

export function decodeFeedback(n: number): Feedback {
  return { black: n >> 4, white: n & 15 };
}

export function isWin(f: Feedback, length: number): boolean {
  return f.black === length;
}

export function sameFeedback(a: Feedback, b: Feedback): boolean {
  return a.black === b.black && a.white === b.white;
}

/** Допустима ли такая подсказка вообще (без учёта конкретных кодов). */
export function isPossibleFeedback(f: Feedback, length: number): boolean {
  if (f.black < 0 || f.white < 0 || f.black + f.white > length) return false;
  // 4 чёрных + 1 белый (и аналогично для любой длины) невозможно.
  if (f.black === length - 1 && f.white === 1) return false;
  return true;
}
