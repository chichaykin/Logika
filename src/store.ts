import { effect, signal } from '@preact/signals';
import { presetKey, type GameConfig } from './core/config';
import { loadSettings, saveSettings, type Settings } from './data/settings';
import {
  loadStats,
  recordComputer,
  recordSolo,
  resetStats,
  saveStats,
  type ComputerResult,
  type SoloResult,
  type StatsData,
} from './data/stats';
import { locale, resolveLocale } from './i18n';

export const settings = signal<Settings>(loadSettings());
export const stats = signal<StatsData>(loadStats());

/** Язык интерфейса следует за настройкой (и за языком браузера в режиме «Авто»). */
effect(() => {
  const loc = resolveLocale(settings.value.lang);
  locale.value = loc;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = loc;
    document.title = loc === 'ru' ? 'Логика' : 'Logika';
  }
});

/** Тема оформления следует за настройкой. */
effect(() => {
  const th = settings.value.theme ?? 'luxe';
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = th;
  }
});

export function updateSettings(patch: Partial<Settings>): void {
  settings.value = { ...settings.value, ...patch };
  saveSettings(settings.value);
}

export function toggleSound(): void {
  updateSettings({ sound: !settings.value.sound });
}

export function commitSolo(r: SoloResult): void {
  stats.value = recordSolo(stats.value, r);
  saveStats(stats.value);
}

export function commitComputer(r: ComputerResult): void {
  stats.value = recordComputer(stats.value, r);
  saveStats(stats.value);
}

export function clearStats(): void {
  stats.value = resetStats();
}

export function presetOf(config: GameConfig): string {
  return presetKey(config);
}

/** Лёгкая вибрация (Android); на iOS API недоступен — просто ничего не происходит. */
export function haptic(ms = 12): void {
  if (settings.value.vibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      // ignore
    }
  }
}
