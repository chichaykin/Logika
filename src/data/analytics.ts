import type { Settings } from './settings';
import type { StatsData } from './stats';
import { loadJson, saveJson, type StorageLike } from './storage';

const TELEMETRY_KEY = 'logika:telemetry:v1';
const SESSION_FLAG_KEY = 'logika:session:active';

export type PlayerCohort = '0_games' | '1_game' | '2_to_5_games' | '6_plus_games';
export type PlayedMultiple = 'none' | 'no' | 'yes';

export interface TelemetryData {
  duelPlayed: number;
  lifetimeGamesPlayed: number;
  sessionsCount: number;
  firstGameMilestoneSent: boolean;
  repeatGameMilestoneSent: boolean;
}

export function defaultTelemetryData(): TelemetryData {
  return {
    duelPlayed: 0,
    lifetimeGamesPlayed: 0,
    sessionsCount: 0,
    firstGameMilestoneSent: false,
    repeatGameMilestoneSent: false,
  };
}

export function loadTelemetryData(storage?: StorageLike): TelemetryData {
  const def = defaultTelemetryData();
  const loaded = loadJson<unknown>(TELEMETRY_KEY, null, storage);
  if (typeof loaded !== 'object' || loaded === null) return def;
  const raw = loaded as Partial<TelemetryData>;
  return {
    duelPlayed: typeof raw.duelPlayed === 'number' && Number.isFinite(raw.duelPlayed) && raw.duelPlayed >= 0 ? raw.duelPlayed : def.duelPlayed,
    lifetimeGamesPlayed:
      typeof raw.lifetimeGamesPlayed === 'number' && Number.isFinite(raw.lifetimeGamesPlayed) && raw.lifetimeGamesPlayed >= 0
        ? raw.lifetimeGamesPlayed
        : def.lifetimeGamesPlayed,
    sessionsCount:
      typeof raw.sessionsCount === 'number' && Number.isFinite(raw.sessionsCount) && raw.sessionsCount >= 0
        ? raw.sessionsCount
        : def.sessionsCount,
    firstGameMilestoneSent: Boolean(raw.firstGameMilestoneSent),
    repeatGameMilestoneSent: Boolean(raw.repeatGameMilestoneSent),
  };
}

export function saveTelemetryData(data: TelemetryData, storage?: StorageLike): void {
  saveJson(TELEMETRY_KEY, data, storage);
}

/** Чистая функция: определяет когорту игрока по общему числу завершённых партий. */
export function getPlayerCohort(totalGames: number): PlayerCohort {
  if (totalGames <= 0) return '0_games';
  if (totalGames === 1) return '1_game';
  if (totalGames <= 5) return '2_to_5_games';
  return '6_plus_games';
}

/** Чистая функция: флаг "сыграл > 1 раза" для быстрых фильтров и сегментов в GA4. */
export function getPlayedMultipleFlag(totalGames: number): PlayedMultiple {
  if (totalGames <= 0) return 'none';
  if (totalGames === 1) return 'no';
  return 'yes';
}

/**
 * Чистая функция: подсчитывает суммарное число завершённых партий (Solo + Computer + Duel),
 * учитывая монотонный счётчик lifetimeGamesPlayed (чтобы сброс локальной статистики не искажал когорту).
 */
export function countTotalCompletedGames(stats: StatsData, duelCompleted = 0, lifetimeGamesPlayed = 0): number {
  let count = Math.max(0, duelCompleted);
  for (const s of Object.values(stats.solo)) {
    count += s.played || 0;
  }
  for (const c of Object.values(stats.computer)) {
    count += c.played || 0;
  }
  return Math.max(count, lifetimeGamesPlayed);
}

/** Чистая функция: проверяет наличие флага "Do Not Track" в браузере. */
export function isDoNotTrackEnabled(
  nav?: { doNotTrack?: string | null },
  win?: unknown,
): boolean {
  const n = nav?.doNotTrack;
  const w = (win as { doNotTrack?: string | null } | undefined)?.doNotTrack;
  return n === '1' || n === 'yes' || w === '1';
}

const DEFAULT_MEASUREMENT_ID = 'G-MBLCSBNQ3P';

export function getMeasurementId(): string | undefined {
  try {
    if (import.meta.env.MODE === 'test') return undefined;
    if (typeof navigator !== 'undefined' && navigator.webdriver) return undefined;
    const id = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
    return id || DEFAULT_MEASUREMENT_ID;
  } catch {
    return undefined;
  }
}

let isScriptLoaded = false;
let isTelemetryLoaded = false;
let currentTelemetry: TelemetryData = defaultTelemetryData();

function ensureTelemetryLoaded(): TelemetryData {
  if (!isTelemetryLoaded && typeof window !== 'undefined') {
    currentTelemetry = loadTelemetryData();
    isTelemetryLoaded = true;
  }
  return currentTelemetry;
}

export function getTelemetryState(): TelemetryData {
  return ensureTelemetryLoaded();
}

/** Проверяет, активен ли сбор аналитики прямо сейчас. */
export function canTrack(settings?: Settings): boolean {
  const id = getMeasurementId();
  if (!id) return false;
  if (settings && !settings.analytics) return false;
  if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
    if (isDoNotTrackEnabled(navigator, window)) return false;
  }
  return true;
}

/** Вспомогательный вызов gtag с безопасной проверкой доступности. */
function sendGtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

/** Загружает и инициализирует Google Analytics 4, если задан ID и получено согласие. */
export function initAnalytics(settings: Settings, stats: StatsData): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const telemetry = ensureTelemetryLoaded();

  // Регистрация новой сессии (независимо от наличия Measurement ID)
  try {
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(SESSION_FLAG_KEY)) {
      sessionStorage.setItem(SESSION_FLAG_KEY, '1');
      telemetry.sessionsCount += 1;
    }
  } catch {
    // sessionStorage недоступен (например, в приватном режиме)
  }

  // Синхронизируем монотонный счётчик всех сыгранных партий
  const syncedTotal = countTotalCompletedGames(stats, telemetry.duelPlayed, telemetry.lifetimeGamesPlayed);
  if (syncedTotal !== telemetry.lifetimeGamesPlayed) {
    telemetry.lifetimeGamesPlayed = syncedTotal;
  }
  saveTelemetryData(telemetry);

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  // Проверка согласия и DNT
  if (!settings.analytics || isDoNotTrackEnabled(navigator, window)) {
    window[`ga-disable-${measurementId}`] = true;
    return;
  }

  window[`ga-disable-${measurementId}`] = false;

  if (!isScriptLoaded) {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() {
        // ВАЖНО: gtag.js ожидает именно объект IArguments (arguments), а не массив (...args)
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
    }
    sendGtag('js', new Date());
    sendGtag('config', measurementId, {
      send_page_view: false,
      anonymize_ip: true,
    });

    // Динамическая вставка скрипта gtag.js (только если его ещё нет в DOM)
    const scriptSrc = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
    if (!existing) {
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptSrc;
      document.head.appendChild(script);
    }

    isScriptLoaded = true;
  }

  syncUserProperties(settings, stats);
}

/** Управляет включением/отключением сбора при изменении настроек в рантайме. */
export function setAnalyticsEnabled(enabled: boolean, settings?: Settings, stats?: StatsData): void {
  const measurementId = getMeasurementId();
  if (!measurementId || typeof window === 'undefined') return;

  if (!enabled || isDoNotTrackEnabled(navigator, window)) {
    window[`ga-disable-${measurementId}`] = true;
  } else {
    window[`ga-disable-${measurementId}`] = false;
    if (!isScriptLoaded && settings && stats) {
      initAnalytics(settings, stats);
    }
  }
}

/** Синхронизирует свойства пользователя (когорта, сыграно партий, язык, тема, PWA-режим). */
export function syncUserProperties(settings: Settings, stats: StatsData): void {
  if (!canTrack(settings)) return;

  const telemetry = ensureTelemetryLoaded();
  const total = countTotalCompletedGames(stats, telemetry.duelPlayed, telemetry.lifetimeGamesPlayed);
  const cohort = getPlayerCohort(total);
  const playedMultiple = getPlayedMultipleFlag(total);

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true);

  sendGtag('set', 'user_properties', {
    player_cohort: cohort,
    played_multiple: playedMultiple,
    total_games_played: total,
    sessions_count: telemetry.sessionsCount,
    preferred_theme: settings.theme,
    preferred_lang: settings.lang,
    display_mode: isStandalone ? 'standalone' : 'browser',
  });
}

/** Отслеживает просмотр экрана/страницы в SPA. */
export function trackScreenView(screenName: string, settings?: Settings): void {
  if (!canTrack(settings)) return;
  sendGtag('event', 'page_view', {
    page_title: screenName,
    page_path: `/${screenName === 'home' ? '' : screenName}`,
    screen_name: screenName,
  });
}

/** Отслеживает начало партии. */
export function trackGameStart(
  params: { mode: 'solo' | 'computer' | 'duel'; preset: string; feedback_mode?: string },
  settings?: Settings,
): void {
  if (!canTrack(settings)) return;
  sendGtag('event', 'game_start', {
    game_mode: params.mode,
    preset: params.preset,
    feedback_mode: params.feedback_mode ?? 'none',
  });
}

/** Отслеживает завершение партии и ключевые когортные вехи (1-я партия, >1 партий). */
export function trackGameEnd(
  params: {
    mode: 'solo' | 'computer' | 'duel';
    preset: string;
    result: 'win' | 'loss' | 'draw';
    attempts: number;
    hints_used?: number;
  },
  stats: StatsData,
  settings?: Settings,
): void {
  const telemetry = ensureTelemetryLoaded();

  if (params.mode === 'duel') {
    telemetry.duelPlayed += 1;
  }

  const computedTotal = countTotalCompletedGames(
    stats,
    telemetry.duelPlayed,
    telemetry.lifetimeGamesPlayed + 1,
  );
  telemetry.lifetimeGamesPlayed = computedTotal;
  saveTelemetryData(telemetry);

  const cohort = getPlayerCohort(computedTotal);
  const playedMultiple = getPlayedMultipleFlag(computedTotal);

  if (!canTrack(settings)) return;

  // 1. Стандартное событие окончания игры
  sendGtag('event', 'game_complete', {
    game_mode: params.mode,
    preset: params.preset,
    game_result: params.result,
    attempts_count: params.attempts,
    hints_count: params.hints_used ?? 0,
    games_played_total: computedTotal,
    player_cohort: cohort,
    played_multiple: playedMultiple,
  });

  // 2. Веховое событие: первая завершённая партия (сыграл хотя бы 1 раз)
  if (computedTotal >= 1 && !telemetry.firstGameMilestoneSent) {
    telemetry.firstGameMilestoneSent = true;
    saveTelemetryData(telemetry);
    sendGtag('event', 'first_game_complete', {
      game_mode: params.mode,
      preset: params.preset,
      game_result: params.result,
    });
  }

  // 3. Веховое событие: повторная партия (сыграл БОЛЬШЕ 1 раза)
  if (computedTotal >= 2 && !telemetry.repeatGameMilestoneSent) {
    telemetry.repeatGameMilestoneSent = true;
    saveTelemetryData(telemetry);
    sendGtag('event', 'repeat_game_complete', {
      game_mode: params.mode,
      preset: params.preset,
      games_played_total: computedTotal,
    });
  }

  // Обновляем пользовательские свойства в GA4
  if (settings) {
    syncUserProperties(settings, stats);
  }
}

/** Отслеживает использование подсказки алгоритма Кнута. */
export function trackHintUsed(
  params: { preset: string; attempt_number: number; remaining_candidates: number },
  settings?: Settings,
): void {
  if (!canTrack(settings)) return;
  sendGtag('event', 'hint_used', {
    preset: params.preset,
    attempt_number: params.attempt_number,
    remaining_candidates: params.remaining_candidates,
  });
}

/** Отслеживает взаимодействие с баннером установки PWA. */
export function trackPwaInstallPrompt(outcome: 'accepted' | 'dismissed', settings?: Settings): void {
  if (!canTrack(settings)) return;
  sendGtag('event', 'pwa_install_prompt', {
    prompt_outcome: outcome,
  });
}

/** Отслеживает успешную установку PWA. */
export function trackPwaInstalled(settings?: Settings): void {
  if (!canTrack(settings)) return;
  sendGtag('event', 'pwa_installed');
}

/** Отслеживает изменение настроек пользователем. */
export function trackSettingsChange(setting: string, value: string | boolean | number, settings?: Settings): void {
  if (!canTrack(settings)) return;
  sendGtag('event', 'settings_change', {
    setting_name: setting,
    setting_value: String(value),
  });
}
