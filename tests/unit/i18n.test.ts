import { describe, expect, it } from 'vitest';
import { resolveLocale, translate } from '../../src/i18n';
import { en } from '../../src/i18n/en';
import { ru } from '../../src/i18n/ru';

describe('i18n', () => {
  it('в обоих словарях одинаковые ключи и плейсхолдеры', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(ru).sort());
    const ph = (v: unknown) => [...JSON.stringify(v).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    for (const k of Object.keys(ru) as (keyof typeof ru)[]) {
      const r = ru[k] as unknown;
      const e = en[k] as unknown;
      const uniq = (s: string) => [...new Set(s.split(','))].join(',');
      expect(uniq(ph(e)), k).toBe(uniq(ph(r)));
    }
  });

  it('склонение по числу в русском', () => {
    expect(translate('ru', 'game.won', { n: 1 })).toContain('1 ход');
    expect(translate('ru', 'game.won', { n: 3 })).toContain('3 хода');
    expect(translate('ru', 'game.won', { n: 5 })).toContain('5 ходов');
    expect(translate('ru', 'game.won', { n: 21 })).toContain('21 ход');
    expect(translate('ru', 'game.won', { n: 12 })).toContain('12 ходов');
  });

  it('английские формы и подстановка', () => {
    expect(translate('en', 'game.won', { n: 1 })).toContain('1 turn');
    expect(translate('en', 'game.won', { n: 4 })).toContain('4 turns');
    expect(translate('en', 'duel.setSecret', { name: 'Player 1' })).toBe('Player 1, pick a code');
  });

  it('выбор языка', () => {
    expect(resolveLocale('auto', 'ru-RU')).toBe('ru');
    expect(resolveLocale('auto', 'de-DE')).toBe('en');
    expect(resolveLocale('en', 'ru-RU')).toBe('en');
  });
});
