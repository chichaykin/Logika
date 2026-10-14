import type { Attempt, Code, GameConfig } from '../core/config';
import { handleRequest, type HintResult, type SolverRequest, type SolverResponse } from './handler';

type Distributive<T> = T extends unknown ? Omit<T, 'id'> : never;

interface Pending {
  req: SolverRequest;
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
}

/**
 * Promise-API к солверу. Расчёты идут в Web Worker, чтобы интерфейс не подвисал;
 * если воркеры недоступны (или упали) — считаем в основном потоке.
 */
export class SolverClient {
  private worker: Worker | null = null;
  private seq = 0;
  private pending = new Map<number, Pending>();
  private broken = false;

  private ensureWorker(): Worker | null {
    if (this.broken || typeof Worker === 'undefined') return null;
    if (this.worker) return this.worker;
    try {
      const w = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<SolverResponse>) => this.settle(e.data);
      w.onerror = () => this.fallbackAll();
      this.worker = w;
      return w;
    } catch {
      this.broken = true;
      return null;
    }
  }

  private settle(res: SolverResponse): void {
    const p = this.pending.get(res.id);
    if (!p) return;
    this.pending.delete(res.id);
    if (res.ok) p.resolve(res.result);
    else p.reject(new Error(res.error));
  }

  /** Воркер сломался: досчитываем висящие запросы в основном потоке. */
  private fallbackAll(): void {
    this.broken = true;
    this.worker?.terminate();
    this.worker = null;
    for (const p of [...this.pending.values()]) this.settle(handleRequest(p.req));
  }

  private call<T>(partial: Distributive<SolverRequest>): Promise<T> {
    const req = { ...partial, id: ++this.seq } as SolverRequest;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(req.id, { req, resolve: resolve as (v: unknown) => void, reject });
      const w = this.ensureWorker();
      if (w) w.postMessage(req);
      else setTimeout(() => this.settle(handleRequest(req)), 0); // тоже асинхронно
    });
  }

  nextGuess(config: GameConfig, history: Attempt[]): Promise<Code> {
    return this.call<Code>({ op: 'next', config, history });
  }

  hint(config: GameConfig, history: Attempt[]): Promise<HintResult> {
    return this.call<HintResult>({ op: 'hint', config, history });
  }

  findContradiction(config: GameConfig, history: Attempt[]): Promise<number | null> {
    return this.call<number | null>({ op: 'contradiction', config, history });
  }

  remaining(config: GameConfig, history: Attempt[]): Promise<number> {
    return this.call<number>({ op: 'remaining', config, history });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    for (const p of this.pending.values()) p.reject(new Error('Солвер остановлен'));
    this.pending.clear();
  }
}

export const solver = new SolverClient();
