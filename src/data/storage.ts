/** Минимальный интерфейс хранилища (совместим с localStorage). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Хранилище в памяти — для тестов и на случай, когда localStorage недоступен. */
export class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function detectStorage(): StorageLike {
  try {
    const s = globalThis.localStorage;
    const probe = '__logika_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return new MemoryStorage();
  }
}

let current: StorageLike | null = null;

export function getStorage(): StorageLike {
  return (current ??= detectStorage());
}

/** Подмена хранилища (тесты). */
export function setStorage(s: StorageLike | null): void {
  current = s;
}

export function loadJson<T>(key: string, fallback: T, storage: StorageLike = getStorage()): T {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown, storage: StorageLike = getStorage()): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // переполнение квоты / приватный режим — молча игнорируем
  }
}

export function removeKey(key: string, storage: StorageLike = getStorage()): void {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}
