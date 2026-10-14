import type { Attempt, Code, GameConfig } from '../core/config';
import { KnuthSolver } from './knuth';

export type SolverRequest =
  | { id: number; op: 'next'; config: GameConfig; history: Attempt[] }
  | { id: number; op: 'hint'; config: GameConfig; history: Attempt[] }
  | { id: number; op: 'contradiction'; config: GameConfig; history: Attempt[] }
  | { id: number; op: 'remaining'; config: GameConfig; history: Attempt[] };

export type SolverResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string };

export interface HintResult {
  guess: Code;
  remaining: number;
}

const solvers = new Map<string, KnuthSolver>();

/** Один солвер на конфигурацию (внутри — кэш ходов и пространство кодов). */
export function solverFor(config: GameConfig): KnuthSolver {
  const key = `${config.length}:${config.colors}:${config.repeats ? 1 : 0}`;
  let s = solvers.get(key);
  if (!s) {
    s = new KnuthSolver(config);
    solvers.set(key, s);
  }
  return s;
}

/** Выполняет запрос. Общий код для воркера и запасного синхронного режима. */
export function handleRequest(req: SolverRequest): SolverResponse {
  try {
    const solver = solverFor(req.config);
    switch (req.op) {
      case 'next':
        return { id: req.id, ok: true, result: solver.nextGuess(req.history) };
      case 'hint':
        return { id: req.id, ok: true, result: solver.hint(req.history) };
      case 'contradiction':
        return { id: req.id, ok: true, result: solver.findContradiction(req.history) };
      case 'remaining':
        return { id: req.id, ok: true, result: solver.remaining(req.history) };
    }
  } catch (e) {
    return { id: req.id, ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
