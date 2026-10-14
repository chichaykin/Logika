import { describe, expect, it } from 'vitest';
import {
  averageComputerMoves, averageSoloAttempts, emptyStats, loadStats, recordComputer, recordSolo, resetStats, saveStats,
} from '../../src/data/stats';
import { MemoryStorage } from '../../src/data/storage';
import { configForSettings, defaultSettings, loadSettings, saveSettings } from '../../src/data/settings';
import { presetKey, PRESETS, normalizeConfig } from '../../src/core/config';

describe('stats', () => {
  it('победы, серии и гистограмма', () => {
    let d = emptyStats();
    d = recordSolo(d, { preset: 'classic', won: true, attempts: 4, hints: 0 });
    d = recordSolo(d, { preset: 'classic', won: true, attempts: 5, hints: 1 });
    d = recordSolo(d, { preset: 'classic', won: false, attempts: 10, hints: 0 });
    d = recordSolo(d, { preset: 'classic', won: true, attempts: 4, hints: 0 });
    const s = d.solo.classic;
    expect(s.played).toBe(4);
    expect(s.wins).toBe(3);
    expect(s.streak).toBe(1);
    expect(s.bestStreak).toBe(2);
    expect(s.histogram[3]).toBe(2);
    expect(s.histogram[4]).toBe(1);
    expect(s.hintsUsed).toBe(1);
    expect(averageSoloAttempts(s)).toBeCloseTo(13 / 3);
  });

  it('статистика по пресетам раздельная, последние игры ограничены 20', () => {
    let d = emptyStats();
    for (let i = 0; i < 25; i++) d = recordSolo(d, { preset: i % 2 ? 'hard' : 'classic', won: true, attempts: 3, hints: 0 });
    expect(d.recent).toHaveLength(20);
    expect(d.solo.hard.played + d.solo.classic.played).toBe(25);
  });

  it('компьютер: среднее число ходов', () => {
    let d = emptyStats();
    d = recordComputer(d, { preset: 'classic', solved: true, moves: 4 });
    d = recordComputer(d, { preset: 'classic', solved: true, moves: 5 });
    d = recordComputer(d, { preset: 'classic', solved: false, moves: 10 });
    expect(averageComputerMoves(d.computer.classic)).toBe(4.5);
  });

  it('сохранение, загрузка, сброс и повреждённые данные', () => {
    const st = new MemoryStorage();
    const d = recordSolo(emptyStats(), { preset: 'classic', won: true, attempts: 3, hints: 0 });
    saveStats(d, st);
    expect(loadStats(st).solo.classic.wins).toBe(1);
    st.setItem('logika:stats:v1', '{oops');
    expect(loadStats(st)).toEqual(emptyStats());
    saveStats(d, st);
    expect(resetStats(st)).toEqual(emptyStats());
    expect(loadStats(st)).toEqual(emptyStats());
  });
});

describe('settings', () => {
  it('значения по умолчанию и сохранение', () => {
    const st = new MemoryStorage();
    expect(loadSettings(st)).toEqual(defaultSettings());
    const s = { ...defaultSettings(), lang: 'en' as const, preset: 'hard' as const, colorblind: true };
    saveSettings(s, st);
    expect(loadSettings(st)).toEqual(s);
    expect(configForSettings(s)).toEqual(PRESETS.hard);
  });

  it('мусор в хранилище заменяется значениями по умолчанию', () => {
    const st = new MemoryStorage();
    st.setItem('logika:settings:v1', JSON.stringify({ lang: 'xx', preset: 'wat', custom: { length: 99, colors: 1 } }));
    const s = loadSettings(st);
    expect(s.lang).toBe('auto');
    expect(s.preset).toBe('classic');
    expect(s.custom.length).toBe(5);
    expect(s.custom.colors).toBe(6);
  });
});

describe('config', () => {
  it('presetKey узнаёт пресеты', () => {
    expect(presetKey(PRESETS.classic)).toBe('classic');
    expect(presetKey(PRESETS.hard)).toBe('hard');
    expect(presetKey({ length: 4, colors: 7, repeats: false, maxAttempts: 8 })).toBe('custom-4x7u-8');
  });
  it('normalizeConfig зажимает значения', () => {
    expect(normalizeConfig({ length: 1, colors: 100, repeats: true, maxAttempts: 0 })).toEqual({
      length: 4, colors: 8, repeats: true, maxAttempts: 4,
    });
  });
});

describe('устойчивость к повреждённым данным', () => {
  it('статистика: частично битая структура не роняет загрузку', () => {
    const st = new MemoryStorage();
    st.setItem('logika:stats:v1', JSON.stringify({ v: 1, solo: { classic: { played: 'x', histogram: 5 } }, computer: 7, recent: [1, { mode: 'solo' }] }));
    const d = loadStats(st);
    expect(d.solo.classic.played).toBe(0);
    expect(d.solo.classic.histogram).toHaveLength(20);
    expect(d.computer).toEqual({});
    expect(d.recent).toEqual([]);
  });
  it('настройки: null и неверные типы', () => {
    const st = new MemoryStorage();
    st.setItem('logika:settings:v1', 'null');
    expect(loadSettings(st)).toEqual(defaultSettings());
    st.setItem('logika:settings:v1', JSON.stringify({ colorblind: 'yes', vibration: 1, custom: null }));
    const s = loadSettings(st);
    expect(s.colorblind).toBe(false);
    expect(s.vibration).toBe(true);
  });
  it('normalizeConfig: NaN заменяется значениями по умолчанию', () => {
    expect(normalizeConfig({ length: NaN, colors: NaN, repeats: true, maxAttempts: NaN })).toEqual(PRESETS.classic);
  });
});
