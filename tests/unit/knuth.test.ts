import { describe, expect, it } from 'vitest';
import { PRESETS, type GameConfig } from '../../src/core/config';
import { generateSecret, seededRng } from '../../src/core/generator';
import { getCodeSpace } from '../../src/core/codeSpace';
import { score } from '../../src/core/feedback';
import { KnuthSolver, type HistoryEntry } from '../../src/solver/knuth';

function solve(solver: KnuthSolver, config: GameConfig, secret: readonly number[], limit = 20): number {
  const history: HistoryEntry[] = [];
  for (let turn = 1; turn <= limit; turn++) {
    const guess = solver.nextGuess(history);
    const feedback = score(guess, secret, config.colors);
    history.push({ guess, feedback });
    if (feedback.black === config.length) return turn;
  }
  return Infinity;
}

describe('KnuthSolver 4×6', () => {
  const config = PRESETS.classic;
  const solver = new KnuthSolver(config);

  it('первый ход 1122', () => {
    expect(solver.nextGuess([])).toEqual([0, 0, 1, 1]);
  });

  it('любой из 1296 кодов угадывается не более чем за 5 ходов, среднее ≈ 4,48', () => {
    const space = getCodeSpace(config);
    let sum = 0;
    let max = 0;
    for (const idx of space.valid) {
      const turns = solve(solver, config, space.decode(idx));
      sum += turns;
      max = Math.max(max, turns);
    }
    expect(max).toBeLessThanOrEqual(5);
    expect(sum / space.valid.length).toBeLessThan(4.5);
  }, 120_000);

  it('после первого хода остаётся не более 256 кандидатов', () => {
    const space = getCodeSpace(config);
    let worst = 0;
    for (const idx of space.valid) {
      const fb = score([0, 0, 1, 1], space.decode(idx), 6);
      const n = solver.remaining([{ guess: [0, 0, 1, 1], feedback: fb }]);
      worst = Math.max(worst, n);
    }
    expect(worst).toBe(256);
  });

  it('remaining и hint согласованы', () => {
    const secret = [3, 1, 5, 1];
    const h: HistoryEntry[] = [{ guess: [0, 0, 1, 1], feedback: score([0, 0, 1, 1], secret, 6) }];
    const hint = solver.hint(h);
    expect(hint.remaining).toBe(solver.remaining(h));
    expect(hint.remaining).toBeGreaterThan(1);
  });
});

describe('KnuthSolver: противоречия', () => {
  const config = PRESETS.classic;
  const solver = new KnuthSolver(config);

  it('находит запись, после которой кандидатов не осталось', () => {
    const history: HistoryEntry[] = [
      { guess: [0, 0, 1, 1], feedback: { black: 0, white: 0 } }, // нет цветов 0 и 1
      { guess: [0, 1, 2, 3], feedback: { black: 4, white: 0 } }, // противоречит предыдущему
    ];
    expect(solver.findContradiction(history)).toBe(1);
    expect(() => solver.nextGuess(history)).toThrow();
  });

  it('согласованная история — без противоречий', () => {
    const secret = [2, 4, 4, 0];
    const guess = [0, 0, 1, 1];
    const history = [{ guess, feedback: score(guess, secret, 6) }];
    expect(solver.findContradiction(history)).toBeNull();
  });
});

describe('KnuthSolver: без повторов', () => {
  const config: GameConfig = { ...PRESETS.classic, repeats: false };
  const solver = new KnuthSolver(config);
  it('угадывает любой код за разумное число ходов', () => {
    const space = getCodeSpace(config);
    let max = 0;
    for (const idx of space.valid) max = Math.max(max, solve(solver, config, space.decode(idx)));
    expect(max).toBeLessThanOrEqual(7);
  }, 60_000);
});

describe('KnuthSolver 5×8 (урезанный пул)', () => {
  const config = PRESETS.hard;
  const solver = new KnuthSolver(config);
  it('находит код за лимит попыток на выборке секретов', () => {
    const rng = seededRng(2024);
    let max = 0;
    for (let i = 0; i < 15; i++) {
      const turns = solve(solver, config, generateSecret(config, rng), config.maxAttempts);
      max = Math.max(max, turns);
    }
    expect(max).toBeLessThanOrEqual(config.maxAttempts);
  }, 180_000);
});
