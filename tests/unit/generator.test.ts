import { describe, expect, it } from 'vitest';
import { PRESETS } from '../../src/core/config';
import { generateSecret, isValidCode, seededRng } from '../../src/core/generator';
import { getCodeSpace } from '../../src/core/codeSpace';

describe('generateSecret', () => {
  it('детерминирован при одном seed', () => {
    expect(generateSecret(PRESETS.classic, seededRng(1))).toEqual(generateSecret(PRESETS.classic, seededRng(1)));
  });
  it('даёт допустимые коды с повторами', () => {
    const rng = seededRng(7);
    for (let i = 0; i < 500; i++) expect(isValidCode(generateSecret(PRESETS.hard, rng), PRESETS.hard)).toBe(true);
  });
  it('без повторов все цвета различны', () => {
    const cfg = { ...PRESETS.classic, repeats: false };
    const rng = seededRng(3);
    for (let i = 0; i < 500; i++) expect(isValidCode(generateSecret(cfg, rng), cfg)).toBe(true);
  });
});

describe('CodeSpace', () => {
  it('размеры', () => {
    expect(getCodeSpace(PRESETS.classic).valid.length).toBe(1296);
    expect(getCodeSpace(PRESETS.hard).valid.length).toBe(32768);
    expect(getCodeSpace({ ...PRESETS.classic, repeats: false }).valid.length).toBe(6 * 5 * 4 * 3);
  });
  it('encode/decode и лексикографический порядок', () => {
    const sp = getCodeSpace(PRESETS.classic);
    expect(sp.decode(0)).toEqual([0, 0, 0, 0]);
    expect(sp.decode(sp.encode([2, 5, 1, 3]))).toEqual([2, 5, 1, 3]);
    expect(sp.encode([0, 0, 1, 1])).toBe(1 * 6 + 1);
  });
});
