import { signal } from '@preact/signals';
import type { Lang } from '../data/settings';

import { ru, type Dict, type Key, type Plural } from './ru';
import { en } from './en';

export type Locale = 'ru' | 'en';

/** Определяет язык по настройке и языку браузера. */
export function resolveLocale(pref: Lang, navLang: string = globalThis.navigator?.language ?? 'en'): Locale {
  if (pref === 'ru' || pref === 'en') return pref;
  return navLang.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export const locale = signal<Locale>('ru');

const dicts: Record<Locale, Dict> = { ru, en };

export type Params = Record<string, string | number>;

function interpolate(s: string, params?: Params): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m));
}

/** Перевод. Если значение — объект форм, выбирается форма по числу `params.n`. */
export function t(key: Key, params?: Params): string {
  const loc = locale.value;
  const v = dicts[loc][key];
  if (typeof v === 'string') return interpolate(v, params);
  const n = Number(params?.n ?? 0);
  const form = new Intl.PluralRules(loc).select(n);
  const str = (v as Plural)[form as keyof Plural] ?? v.other;
  return interpolate(str, params);
}

/** Для тестов: перевод на конкретном языке. */
export function translate(loc: Locale, key: Key, params?: Params): string {
  const prev = locale.value;
  locale.value = loc;
  try {
    return t(key, params);
  } finally {
    locale.value = prev;
  }
}

export { type Key, type Dict };
