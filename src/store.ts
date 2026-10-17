import { effect, signal } from '@preact/signals';
import { presetKey, type GameConfig } from './core/config';
import { loadSettings, saveSettings, type Settings } from './data/settings';
import {
  setAnalyticsEnabled,
  syncUserProperties,
  trackGameEnd,
  trackSettingsChange,
} from './data/analytics';
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
  const prev = settings.value;
  settings.value = { ...prev, ...patch };
  saveSettings(settings.value);

  if (patch.analytics !== undefined) {
    setAnalyticsEnabled(patch.analytics, settings.value, stats.value);
  }

  for (const [key, val] of Object.entries(patch)) {
    if (val === undefined) continue;
    const prevVal = prev[key as keyof Settings];
    const prevSerialized = typeof prevVal === 'object' ? JSON.stringify(prevVal) : String(prevVal);
    const nextSerialized = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (prevSerialized !== nextSerialized) {
      trackSettingsChange(key, nextSerialized, settings.value);
    }
  }

  syncUserProperties(settings.value, stats.value);
}

export function toggleSound(): void {
  updateSettings({ sound: !settings.value.sound });
}

export function commitSolo(r: SoloResult): void {
  stats.value = recordSolo(stats.value, r);
  saveStats(stats.value);
  trackGameEnd(
    {
      mode: 'solo',
      preset: r.preset,
      result: r.won ? 'win' : 'loss',
      attempts: r.attempts,
      hints_used: r.hints,
    },
    stats.value,
    settings.value,
  );
}

export function commitComputer(r: ComputerResult): void {
  stats.value = recordComputer(stats.value, r);
  saveStats(stats.value);
  trackGameEnd(
    {
      mode: 'computer',
      preset: r.preset,
      result: r.solved ? 'win' : 'loss',
      attempts: r.moves,
    },
    stats.value,
    settings.value,
  );
}

export function clearStats(): void {
  stats.value = resetStats();
  syncUserProperties(settings.value, stats.value);
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
