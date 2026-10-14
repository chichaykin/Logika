import { PRESETS, normalizeConfig, type GameConfig, type PresetId } from '../core/config';
import type { FeedbackMode } from '../game/computerGame';
import { loadJson, saveJson, type StorageLike } from './storage';

const KEY = 'logika:settings:v1';

export type Lang = 'auto' | 'ru' | 'en';
export type ThemeId = 'luxe' | 'slate' | 'travertine' | 'emerald' | 'retro';

export interface Settings {
  lang: Lang;
  theme: ThemeId;
  /** Показывать символы на штырьках (для дальтоников). */
  colorblind: boolean;
  vibration: boolean;
  preset: PresetId;
  custom: GameConfig;
  feedbackMode: FeedbackMode;
}

export function defaultSettings(): Settings {
  return {
    lang: 'auto',
    theme: 'luxe',
    colorblind: false,
    vibration: true,
    preset: 'classic',
    custom: { length: 4, colors: 6, repeats: false, maxAttempts: 10 },
    feedbackMode: 'manual',
  };
}

export function configForSettings(s: Settings): GameConfig {
  return s.preset === 'custom' ? normalizeConfig(s.custom) : PRESETS[s.preset];
}

export function loadSettings(storage?: StorageLike): Settings {
  const def = defaultSettings();
  const loaded = loadJson<unknown>(KEY, null, storage);
  const raw: Partial<Settings> = typeof loaded === 'object' && loaded !== null ? (loaded as Partial<Settings>) : {};
  const customRaw = typeof raw.custom === 'object' && raw.custom !== null ? raw.custom : {};
  const merged: Settings = { ...def, ...raw, custom: normalizeConfig({ ...def.custom, ...customRaw }) };
  if (!['classic', 'hard', 'custom'].includes(merged.preset)) merged.preset = def.preset;
  if (!['luxe', 'slate', 'travertine', 'emerald', 'retro'].includes(merged.theme)) merged.theme = def.theme;
  if (!['auto', 'ru', 'en'].includes(merged.lang)) merged.lang = def.lang;
  if (!['manual', 'auto'].includes(merged.feedbackMode)) merged.feedbackMode = def.feedbackMode;
  if (typeof merged.colorblind !== 'boolean') merged.colorblind = def.colorblind;
  if (typeof merged.vibration !== 'boolean') merged.vibration = def.vibration;
  return merged;
}

export function saveSettings(s: Settings, storage?: StorageLike): void {
  saveJson(KEY, s, storage);
}
