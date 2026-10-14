import type { Attempt, Code, GameConfig } from '../core/config';
import { isValidCode } from '../core/generator';
import { isWin, score } from '../core/feedback';

export type Player = 0 | 1;

/**
 * setSecret — загадывающий вводит код (угадывающий не смотрит);
 * handoff   — «передай телефон» угадывающему;
 * guess     — угадывающий делает ходы;
 * roundOver — раунд закончен, показан результат;
 * matchOver — оба игрока отыграли роль угадывающего: итог матча.
 */
export type DuelPhase = 'setSecret' | 'handoff' | 'guess' | 'roundOver' | 'matchOver';

export interface DuelState {
  config: GameConfig;
  phase: DuelPhase;
  /** Кто сейчас угадывает; второй — загадывает. */
  guesser: Player;
  secret: Code | null;
  attempts: Attempt[];
  /** Число ходов, за которое каждый угадал; maxAttempts + 1 — если не угадал. null — ещё не играл. */
  results: [number | null, number | null];
  /** Победы в матчах за всё время (накопительно между реваншами). */
  wins: [number, number];
  draws: number;
}

export function newDuel(config: GameConfig, firstGuesser: Player = 1): DuelState {
  return {
    config,
    phase: 'setSecret',
    guesser: firstGuesser,
    secret: null,
    attempts: [],
    results: [null, null],
    wins: [0, 0],
    draws: 0,
  };
}

export function duelSetter(state: DuelState): Player {
  return state.guesser === 0 ? 1 : 0;
}

export function duelSetSecret(state: DuelState, secret: Code): DuelState {
  if (state.phase !== 'setSecret') throw new Error('Сейчас код не вводится');
  if (!isValidCode(secret, state.config)) throw new Error('Недопустимый код');
  return { ...state, secret: [...secret], phase: 'handoff' };
}

export function duelStartGuessing(state: DuelState): DuelState {
  if (state.phase !== 'handoff') throw new Error('Сейчас нельзя начинать угадывание');
  return { ...state, phase: 'guess', attempts: [] };
}

export function duelGuess(state: DuelState, guess: Code): DuelState {
  if (state.phase !== 'guess' || !state.secret) throw new Error('Сейчас ходы не принимаются');
  if (!isValidCode(guess, state.config)) throw new Error('Недопустимый код');

  const feedback = score(guess, state.secret, state.config.colors);
  const attempts = [...state.attempts, { guess: [...guess], feedback }];
  const won = isWin(feedback, state.config.length);
  const lost = !won && attempts.length >= state.config.maxAttempts;
  if (!won && !lost) return { ...state, attempts };

  const results: [number | null, number | null] = [...state.results];
  results[state.guesser] = won ? attempts.length : state.config.maxAttempts + 1;
  return { ...state, attempts, results, phase: 'roundOver' };
}

/** Угадал ли угадывающий в завершённом раунде. */
export function duelRoundWon(state: DuelState): boolean {
  const last = state.attempts[state.attempts.length - 1];
  return !!last && isWin(last.feedback, state.config.length);
}

/** Победитель матча: 0, 1 или null при ничьей (только когда оба сыграли). */
export function duelMatchWinner(results: [number | null, number | null]): Player | null {
  const [a, b] = results;
  if (a === null || b === null || a === b) return null;
  return a < b ? 0 : 1;
}

/** После результата раунда: либо меняемся ролями, либо подводим итог матча. */
export function duelNext(state: DuelState): DuelState {
  if (state.phase !== 'roundOver') throw new Error('Раунд ещё не завершён');
  const [a, b] = state.results;
  if (a !== null && b !== null) {
    const winner = duelMatchWinner(state.results);
    const wins: [number, number] = [...state.wins];
    let draws = state.draws;
    if (winner === null) draws++;
    else wins[winner]++;
    return { ...state, phase: 'matchOver', wins, draws };
  }
  return {
    ...state,
    phase: 'setSecret',
    guesser: duelSetter(state),
    secret: null,
    attempts: [],
  };
}

/** Новый матч с теми же игроками; первым угадывает тот, кто в прошлом матче угадывал вторым. */
export function duelRematch(state: DuelState): DuelState {
  if (state.phase !== 'matchOver') throw new Error('Матч ещё не завершён');
  return {
    ...state,
    phase: 'setSecret',
    secret: null,
    attempts: [],
    results: [null, null],
  };
}
