import { describe, expect, it } from 'vitest';
import { decodeFeedback, encodeFeedback, isPossibleFeedback, score } from '../../src/core/feedback';

const fb = (g: number[], s: number[]) => score(g, s, 8);

describe('score', () => {
  it('точное совпадение', () => {
    expect(fb([0, 1, 2, 3], [0, 1, 2, 3])).toEqual({ black: 4, white: 0 });
  });
  it('нет совпадений', () => {
    expect(fb([0, 0, 0, 0], [1, 1, 1, 1])).toEqual({ black: 0, white: 0 });
  });
  it('все цвета не на месте', () => {
    expect(fb([0, 0, 1, 1], [1, 1, 0, 0])).toEqual({ black: 0, white: 4 });
  });
  it('повторы: цвет из догадки считается не больше, чем есть в секрете', () => {
    expect(fb([0, 0, 0, 1], [0, 1, 2, 2])).toEqual({ black: 1, white: 1 });
    expect(fb([0, 0, 1, 1], [0, 1, 1, 2])).toEqual({ black: 2, white: 1 });
    expect(fb([0, 0, 1, 2], [0, 1, 0, 3])).toEqual({ black: 1, white: 2 });
  });
  it('пример из задания: 4,2,6,2 против 1,1,2,2', () => {
    expect(score([0, 0, 1, 1], [3, 1, 5, 1], 6)).toEqual({ black: 1, white: 1 });
  });
  it('пять позиций', () => {
    expect(fb([0, 1, 2, 3, 4], [4, 3, 2, 1, 0])).toEqual({ black: 1, white: 4 });
  });
});

describe('feedback encoding', () => {
  it('туда и обратно', () => {
    for (let b = 0; b <= 5; b++) for (let w = 0; w + b <= 5; w++) {
      expect(decodeFeedback(encodeFeedback({ black: b, white: w }))).toEqual({ black: b, white: w });
    }
  });
  it('невозможные подсказки', () => {
    expect(isPossibleFeedback({ black: 3, white: 1 }, 4)).toBe(false);
    expect(isPossibleFeedback({ black: 3, white: 0 }, 4)).toBe(true);
    expect(isPossibleFeedback({ black: 3, white: 2 }, 4)).toBe(false);
    expect(isPossibleFeedback({ black: 4, white: 1 }, 5)).toBe(false);
  });
});
