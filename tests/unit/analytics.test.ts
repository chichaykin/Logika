import { describe, expect, it } from 'vitest';
import {
  canTrack,
  countTotalCompletedGames,
  defaultTelemetryData,
  getPlayerCohort,
  getPlayedMultipleFlag,
  isDoNotTrackEnabled,
  loadTelemetryData,
  saveTelemetryData,
  trackGameEnd,
  trackGameStart,
  trackHintUsed,
  trackPwaInstalled,
  trackPwaInstallPrompt,
  trackScreenView,
  trackSettingsChange,
} from '../../src/data/analytics';
import { defaultSettings } from '../../src/data/settings';
import { emptyStats, recordComputer, recordSolo } from '../../src/data/stats';
import { MemoryStorage } from '../../src/data/storage';

describe('analytics: pure functions', () => {
  it('getPlayerCohort: корректно сегментирует игроков по числу сыгранных партий', () => {
    expect(getPlayerCohort(0)).toBe('0_games');
    expect(getPlayerCohort(-5)).toBe('0_games');
    expect(getPlayerCohort(1)).toBe('1_game');
    expect(getPlayerCohort(2)).toBe('2_to_5_games');
    expect(getPlayerCohort(3)).toBe('2_to_5_games');
    expect(getPlayerCohort(5)).toBe('2_to_5_games');
    expect(getPlayerCohort(6)).toBe('6_plus_games');
    expect(getPlayerCohort(50)).toBe('6_plus_games');
  });

  it('getPlayedMultipleFlag: возвращает флаг для быстрой фильтрации "1 игра vs >1 игры"', () => {
    expect(getPlayedMultipleFlag(0)).toBe('none');
    expect(getPlayedMultipleFlag(-1)).toBe('none');
    expect(getPlayedMultipleFlag(1)).toBe('no');
    expect(getPlayedMultipleFlag(2)).toBe('yes');
    expect(getPlayedMultipleFlag(10)).toBe('yes');
  });

  it('countTotalCompletedGames: суммирует соло, компьютер, дуэли и сохраняет монотонный lifetimeGamesPlayed', () => {
    let stats = emptyStats();
    expect(countTotalCompletedGames(stats, 0)).toBe(0);

    stats = recordSolo(stats, { preset: 'classic', won: true, attempts: 4, hints: 0 });
    stats = recordSolo(stats, { preset: 'hard', won: false, attempts: 10, hints: 1 });
    stats = recordComputer(stats, { preset: 'classic', solved: true, moves: 5 });

    expect(countTotalCompletedGames(stats, 0)).toBe(3);
    expect(countTotalCompletedGames(stats, 2)).toBe(5);
    // Даже после сброса локальной статистики монотонный счётчик lifetimeGamesPlayed не уменьшается
    expect(countTotalCompletedGames(emptyStats(), 0, 12)).toBe(12);
  });

  it('isDoNotTrackEnabled: уважает Do Not Track браузера', () => {
    expect(isDoNotTrackEnabled()).toBe(false);
    expect(isDoNotTrackEnabled({ doNotTrack: '1' })).toBe(true);
    expect(isDoNotTrackEnabled({ doNotTrack: 'yes' })).toBe(true);
    expect(isDoNotTrackEnabled(undefined, { doNotTrack: '1' })).toBe(true);
    expect(isDoNotTrackEnabled({ doNotTrack: '0' }, { doNotTrack: '0' })).toBe(false);
    expect(isDoNotTrackEnabled({ doNotTrack: 'unspecified' })).toBe(false);
  });
});

describe('analytics: telemetry persistence', () => {
  it('загрузка по умолчанию, сохранение и обработка битых данных', () => {
    const st = new MemoryStorage();
    expect(loadTelemetryData(st)).toEqual(defaultTelemetryData());

    const sample = {
      duelPlayed: 4,
      lifetimeGamesPlayed: 9,
      sessionsCount: 3,
      firstGameMilestoneSent: true,
      repeatGameMilestoneSent: false,
    };
    saveTelemetryData(sample, st);
    expect(loadTelemetryData(st)).toEqual(sample);

    st.setItem('logika:telemetry:v1', '{corrupt-json');
    expect(loadTelemetryData(st)).toEqual(defaultTelemetryData());

    st.setItem('logika:telemetry:v1', JSON.stringify({ duelPlayed: 'invalid', lifetimeGamesPlayed: -5, sessionsCount: -2 }));
    expect(loadTelemetryData(st)).toEqual(defaultTelemetryData());
  });
});

describe('analytics: safe execution and consent guards', () => {
  it('canTrack возвращает false если аналитика отключена в настройках', () => {
    const s = { ...defaultSettings(), analytics: false };
    expect(canTrack(s)).toBe(false);
  });

  it('функции трекинга безопасны при вызове в Node окружении (no-op без падений)', () => {
    const s = defaultSettings();
    const stats = emptyStats();

    expect(() => {
      trackScreenView('solo', s);
      trackGameStart({ mode: 'solo', preset: 'classic' }, s);
      trackGameEnd(
        { mode: 'solo', preset: 'classic', result: 'win', attempts: 4, hints_used: 0 },
        stats,
        s,
      );
      trackHintUsed({ preset: 'classic', attempt_number: 2, remaining_candidates: 10 }, s);
      trackPwaInstallPrompt('accepted', s);
      trackPwaInstalled(s);
      trackSettingsChange('theme', 'slate', s);
    }).not.toThrow();
  });
});
