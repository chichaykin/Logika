import { describe, expect, it } from 'vitest';
import { PRESETS, type GameConfig } from '../../src/core/config';
import { score } from '../../src/core/feedback';
import { seededRng } from '../../src/core/generator';
import { KnuthSolver } from '../../src/solver/knuth';
import { newSolo, submitSoloGuess, registerSoloHint } from '../../src/game/soloGame';
import {
  applyFeedback, autoFeedback, markContradiction, newComputerGame, setComputerGuess, undoLastFeedback,
  type ComputerState,
} from '../../src/game/computerGame';
import {
  duelGuess, duelMatchWinner, duelNext, duelRematch, duelSetSecret, duelSetter, duelStartGuessing, newDuel,
  type DuelState,
} from '../../src/game/duelGame';

const cfg = PRESETS.classic;

describe('solo', () => {
  it('победа', () => {
    let s = newSolo(cfg, seededRng(5));
    s = submitSoloGuess(s, [...s.secret]);
    expect(s.status).toBe('won');
    expect(s.attempts).toHaveLength(1);
    expect(s.attempts[0].feedback.black).toBe(4);
  });

  it('поражение после лимита попыток', () => {
    let s = newSolo({ ...cfg, maxAttempts: 4 }, seededRng(5));
    const wrong = [0, 1, 2, 3].every((v, i) => v === s.secret[i]) ? [5, 5, 5, 5] : [0, 1, 2, 3];
    for (let i = 0; i < 4; i++) s = submitSoloGuess(s, wrong);
    expect(s.status).toBe('lost');
    expect(() => submitSoloGuess(s, wrong)).toThrow();
  });

  it('отвергает недопустимый код и не мутирует состояние', () => {
    const s = newSolo(cfg, seededRng(1));
    expect(() => submitSoloGuess(s, [0, 1, 2])).toThrow();
    expect(() => submitSoloGuess(s, [0, 1, 2, 9])).toThrow();
    expect(s.attempts).toHaveLength(0);
  });

  it('без повторов отвергает код с повторами', () => {
    const c: GameConfig = { ...cfg, repeats: false };
    const s = newSolo(c, seededRng(1));
    expect(() => submitSoloGuess(s, [1, 1, 2, 3])).toThrow();
  });

  it('счётчик подсказок', () => {
    expect(registerSoloHint(newSolo(cfg, seededRng(1))).hintsUsed).toBe(1);
  });

  it('подсказка Кнута не ломает партию и приводит к победе', () => {
    const solver = new KnuthSolver(cfg);
    let s = newSolo(cfg, seededRng(11));
    while (s.status === 'playing') {
      const hint = solver.hint(s.attempts);
      s = submitSoloGuess(registerSoloHint(s), hint.guess);
    }
    expect(s.status).toBe('won');
    expect(s.attempts.length).toBeLessThanOrEqual(5);
  });
});

describe('computer: режим auto', () => {
  it('компьютер разгадывает скрытый код автоматически', () => {
    const solver = new KnuthSolver(cfg);
    let s = newComputerGame(cfg, 'auto', [3, 1, 5, 1]);
    while (s.status === 'playing') {
      s = setComputerGuess(s, solver.nextGuess(s.history));
      s = applyFeedback(s, autoFeedback(s));
    }
    expect(s.status).toBe('solved');
    expect(s.history.length).toBeLessThanOrEqual(5);
  });

  it('требует допустимый секрет', () => {
    expect(() => newComputerGame(cfg, 'auto', null)).toThrow();
    expect(() => newComputerGame(cfg, 'auto', [0, 0, 9, 0])).toThrow();
  });
});

describe('computer: режим manual', () => {
  const solver = new KnuthSolver(cfg);
  const secret = [2, 4, 4, 0];

  it('честные ключи ведут к победе', () => {
    let s = newComputerGame(cfg, 'manual', null);
    while (s.status === 'playing') {
      s = setComputerGuess(s, solver.nextGuess(s.history));
      s = applyFeedback(s, score(s.pendingGuess!, secret, 6));
    }
    expect(s.status).toBe('solved');
  });

  it('невозможные ключи отвергаются', () => {
    let s = newComputerGame(cfg, 'manual', null);
    s = setComputerGuess(s, [0, 0, 1, 1]);
    expect(() => applyFeedback(s, { black: 3, white: 1 })).toThrow();
    expect(() => applyFeedback(s, { black: 4, white: 1 })).toThrow();
  });

  it('ошибка игрока в ключах приводит к противоречию, которое можно откатить', () => {
    let s: ComputerState = newComputerGame(cfg, 'manual', null);
    s = setComputerGuess(s, [0, 0, 1, 1]);
    s = applyFeedback(s, { black: 0, white: 0 }); // цветов 0 и 1 в коде нет
    s = setComputerGuess(s, [0, 1, 2, 3]);
    s = applyFeedback(s, { black: 4, white: 0 }); // но тут «всё угадано» — так не бывает
    expect(solver.findContradiction(s.history)).toBe(1);

    // противоречие фиксируется, а последний ввод можно отменить и исправить
    const c = markContradiction(s, 1);
    expect(c.status).toBe('contradiction');
    const back = undoLastFeedback(c);
    expect(back.status).toBe('playing');
    expect(back.contradictionAt).toBeNull();
    expect(back.history).toHaveLength(1);
    expect(back.pendingGuess).toEqual([0, 1, 2, 3]);
    expect(solver.findContradiction(back.history)).toBeNull();
  });

  it('провал по лимиту попыток', () => {
    const c: GameConfig = { ...cfg, maxAttempts: 4 };
    let s = newComputerGame(c, 'manual', null);
    for (let i = 0; i < 4; i++) {
      s = setComputerGuess(s, [0, 1, 2, 3]);
      s = applyFeedback(s, { black: 0, white: 1 });
    }
    expect(s.status).toBe('failed');
  });
});

describe('duel', () => {
  function playRound(s: DuelState, secret: number[], guesses: number[][]): DuelState {
    s = duelSetSecret(s, secret);
    s = duelStartGuessing(s);
    for (const g of guesses) s = duelGuess(s, g);
    return s;
  }

  it('полный матч: победитель — тот, кто угадал быстрее', () => {
    let s = newDuel(cfg, 1);
    expect(duelSetter(s)).toBe(0);
    // Игрок 1 угадывает код игрока 0 за 2 хода
    s = playRound(s, [1, 2, 3, 4], [[0, 0, 0, 0], [1, 2, 3, 4]]);
    expect(s.phase).toBe('roundOver');
    expect(s.results).toEqual([null, 2]);
    s = duelNext(s);
    expect(s.phase).toBe('setSecret');
    expect(s.guesser).toBe(0);
    // Игрок 0 угадывает код игрока 1 за 3 хода
    s = playRound(s, [5, 5, 0, 0], [[0, 0, 0, 0], [1, 1, 1, 1], [5, 5, 0, 0]]);
    expect(s.results).toEqual([3, 2]);
    s = duelNext(s);
    expect(s.phase).toBe('matchOver');
    expect(s.wins).toEqual([0, 1]);
    expect(duelMatchWinner(s.results)).toBe(1);

    const again = duelRematch(s);
    expect(again.phase).toBe('setSecret');
    expect(again.results).toEqual([null, null]);
    expect(again.wins).toEqual([0, 1]);
  });

  it('неугаданный код = maxAttempts + 1 и ничья при равенстве', () => {
    const c: GameConfig = { ...cfg, maxAttempts: 4 };
    let s = newDuel(c, 0);
    s = playRound(s, [1, 2, 3, 4], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    expect(s.results).toEqual([5, null]);
    s = duelNext(s);
    s = playRound(s, [1, 2, 3, 4], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    s = duelNext(s);
    expect(s.phase).toBe('matchOver');
    expect(s.draws).toBe(1);
    expect(duelMatchWinner(s.results)).toBeNull();
  });

  it('ходы вне фазы отвергаются', () => {
    const s = newDuel(cfg);
    expect(() => duelGuess(s, [0, 1, 2, 3])).toThrow();
    expect(() => duelStartGuessing(s)).toThrow();
    expect(() => duelSetSecret(s, [0, 1])).toThrow();
  });
});
