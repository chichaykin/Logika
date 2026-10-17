import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildGameUrl,
  BUILTIN_GAMES,
  CATALOG_CACHE_KEY,
  getGamesCatalog,
  mergeGamesCatalog,
  parseLangFromSearch,
  refreshGamesCatalog,
  type GameEntry,
} from '../../src/data/gamesCatalog';

describe('gamesCatalog', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('contains gomoku and logika in BUILTIN_GAMES', () => {
    const ids = BUILTIN_GAMES.map((g) => g.id);
    expect(ids).toContain('gomoku');
    expect(ids).toContain('logika');
  });

  it('merges remote games with builtin games', () => {
    const extra: GameEntry = {
      id: 'sudoku',
      url: 'https://chichaykin.github.io/Sudoku/',
      repo: 'https://github.com/chichaykin/Sudoku',
      icon: '🔢',
      accent: '#38bdf8',
      title: { en: 'Sudoku', ru: 'Судоку' },
      shortTitle: { en: 'Sudoku', ru: 'Судоку' },
      description: { en: 'Classic number puzzle', ru: 'Классическая головоломка с числами' },
      tags: { en: ['Puzzle'], ru: ['Головоломка'] },
    };

    const merged = mergeGamesCatalog(BUILTIN_GAMES, [extra]);
    expect(merged.map((g) => g.id)).toEqual(['gomoku', 'logika', 'sudoku']);
  });

  it('builds game URL with lang parameter and parses ?lang=', () => {
    expect(buildGameUrl('https://chichaykin.github.io/Gomoku/', 'ru')).toBe(
      'https://chichaykin.github.io/Gomoku/?lang=ru',
    );
    expect(parseLangFromSearch('?lang=en')).toBe('en');
    expect(parseLangFromSearch('?lang=RU')).toBe('ru');
    expect(parseLangFromSearch('?lang=fr')).toBeNull();
  });

  it('refreshes from remote and falls back offline', async () => {
    const failFetch = vi.fn().mockRejectedValue(new Error('offline'));
    const fallback = await refreshGamesCatalog(failFetch as unknown as typeof fetch);
    expect(fallback.length).toBeGreaterThanOrEqual(2);

    const okFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: 2,
        updatedAt: '2026-10-18',
        games: [
          ...BUILTIN_GAMES,
          {
            id: 'reversi',
            url: 'https://chichaykin.github.io/Reversi/',
            repo: 'https://github.com/chichaykin/Reversi',
            icon: '⚪',
            accent: '#22c55e',
            title: { en: 'Reversi', ru: 'Реверси' },
            shortTitle: { en: 'Reversi', ru: 'Реверси' },
            description: { en: 'Othello strategy game', ru: 'Стратегическая игра Отелло' },
            tags: { en: ['Board'], ru: ['Настольная'] },
          },
        ],
      }),
    });

    const updated = await refreshGamesCatalog(okFetch as unknown as typeof fetch);
    expect(updated.map((g) => g.id)).toContain('reversi');
    if (typeof localStorage !== 'undefined') {
      expect(localStorage.getItem(CATALOG_CACHE_KEY)).toBeTruthy();
      expect(getGamesCatalog().map((g) => g.id)).toContain('reversi');
    }
  });
});
