import type { Attempt, Code, GameConfig } from '../core/config';
import { isValidCode, secureRng, generateSecret, type Rng } from '../core/generator';
import { isWin, score } from '../core/feedback';
import { loadJson, removeKey, saveJson } from '../data/storage';

export type SoloStatus = 'playing' | 'won' | 'lost';

/** Состояние соло-партии (простой JSON-объект: сохраняется в localStorage). */
export interface SoloState {
  config: GameConfig;
  secret: Code;
  attempts: Attempt[];
  status: SoloStatus;
  hintsUsed: number;
}

export function newSolo(config: GameConfig, rng: Rng = secureRng): SoloState {
  return {
    config,
    secret: generateSecret(config, rng),
    attempts: [],
    status: 'playing',
    hintsUsed: 0,
  };
}

/** Ход игрока. Возвращает новое состояние; бросает ошибку при недопустимом ходе. */
export function submitSoloGuess(state: SoloState, guess: Code): SoloState {
  if (state.status !== 'playing') throw new Error('Партия уже завершена');
  if (!isValidCode(guess, state.config)) throw new Error('Недопустимый код');

  const feedback = score(guess, state.secret, state.config.colors);
  const attempts = [...state.attempts, { guess: [...guess], feedback }];
  let status: SoloStatus = 'playing';
  if (isWin(feedback, state.config.length)) status = 'won';
  else if (attempts.length >= state.config.maxAttempts) status = 'lost';
  return { ...state, attempts, status };
}

export function registerSoloHint(state: SoloState): SoloState {
  return { ...state, hintsUsed: state.hintsUsed + 1 };
}

export function soloAttemptsLeft(state: SoloState): number {
  return state.config.maxAttempts - state.attempts.length;
}

const SOLO_KEY = 'logika:solo_active:v1';

export function saveActiveSolo(state: SoloState | null): void {
  if (state && state.status === 'playing') {
    saveJson(SOLO_KEY, state);
  } else {
    removeKey(SOLO_KEY);
  }
}

export function loadActiveSolo(): SoloState | null {
  const loaded = loadJson<SoloState | null>(SOLO_KEY, null);
  if (loaded && loaded.status === 'playing' && Array.isArray(loaded.attempts) && Array.isArray(loaded.secret)) {
    return loaded;
  }
  return null;
}

