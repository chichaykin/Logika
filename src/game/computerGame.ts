import type { Attempt, Code, Feedback, GameConfig } from '../core/config';
import { isPossibleFeedback, isWin, score } from '../core/feedback';
import { isValidCode } from '../core/generator';

/**
 * manual — игрок держит код в голове и сам ставит ключи;
 * auto   — игрок скрыто вводит код, ключи считаются автоматически.
 */
export type FeedbackMode = 'manual' | 'auto';

/**
 * playing       — партия идёт (ждём ход компьютера или ключи игрока);
 * solved        — компьютер угадал;
 * failed        — компьютер не уложился в лимит попыток;
 * contradiction — подсказки противоречат друг другу (кандидатов не осталось).
 */
export type ComputerStatus = 'playing' | 'solved' | 'failed' | 'contradiction';

export interface ComputerState {
  config: GameConfig;
  mode: FeedbackMode;
  /** Секрет известен только в режиме auto. */
  secret: Code | null;
  history: Attempt[];
  /** Текущий ход компьютера, ожидающий ключей; null, пока ход считается. */
  pendingGuess: Code | null;
  status: ComputerStatus;
  /** Индекс хода, после которого подсказки стали противоречивыми. */
  contradictionAt: number | null;
}

export function newComputerGame(config: GameConfig, mode: FeedbackMode, secret: Code | null): ComputerState {
  if (mode === 'auto') {
    if (!secret || !isValidCode(secret, config)) throw new Error('Для режима auto нужен допустимый секретный код');
  }
  return {
    config,
    mode,
    secret: mode === 'auto' ? [...(secret as Code)] : null,
    history: [],
    pendingGuess: null,
    status: 'playing',
    contradictionAt: null,
  };
}

/** Записывает ход, предложенный солвером. */
export function setComputerGuess(state: ComputerState, guess: Code): ComputerState {
  if (state.status !== 'playing') throw new Error('Партия уже завершена');
  if (!isValidCode(guess, state.config)) throw new Error('Недопустимый код');
  return { ...state, pendingGuess: [...guess] };
}

/** Ключи, которые игра сама посчитала бы для текущего хода (режим auto). */
export function autoFeedback(state: ComputerState): Feedback {
  if (!state.secret || !state.pendingGuess) throw new Error('Нечего оценивать');
  return score(state.pendingGuess, state.secret, state.config.colors);
}

/**
 * Применяет ключи к текущему ходу компьютера.
 * Противоречия (кандидатов не осталось) проверяются отдельно через `markContradiction`.
 */
export function applyFeedback(state: ComputerState, feedback: Feedback): ComputerState {
  if (state.status !== 'playing' || !state.pendingGuess) throw new Error('Сейчас ключи не ожидаются');
  if (!isPossibleFeedback(feedback, state.config.length)) throw new Error('Невозможное сочетание ключей');

  const history = [...state.history, { guess: state.pendingGuess, feedback }];
  let status: ComputerStatus = 'playing';
  if (isWin(feedback, state.config.length)) status = 'solved';
  else if (history.length >= state.config.maxAttempts) status = 'failed';
  return { ...state, history, pendingGuess: null, status };
}

export function markContradiction(state: ComputerState, at: number): ComputerState {
  return { ...state, status: 'contradiction', contradictionAt: at, pendingGuess: null };
}

/** Отмена последнего ввода ключей (чтобы исправить ошибку после противоречия). */
export function undoLastFeedback(state: ComputerState): ComputerState {
  if (state.history.length === 0) return state;
  const history = state.history.slice(0, -1);
  const last = state.history[state.history.length - 1];
  return {
    ...state,
    history,
    pendingGuess: last.guess,
    status: 'playing',
    contradictionAt: null,
  };
}
