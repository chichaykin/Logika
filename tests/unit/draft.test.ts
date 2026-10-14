import { describe, expect, it } from 'vitest';
import type { GameConfig } from '../../src/core/config';
import { canPlace, draftReducer } from '../../src/ui/useDraft';

describe('draftReducer', () => {
  const classicCfg: GameConfig = { length: 4, colors: 6, repeats: true, maxAttempts: 10 };
  const uniqueCfg: GameConfig = { length: 4, colors: 6, repeats: false, maxAttempts: 10 };
  type DraftState = { draft: (number | null)[]; selected: number | null };

  it('places color and keeps selected null if placed from bottom palette/keyboard', () => {
    let state: DraftState = { draft: [null, null, null, null], selected: null };

    state = draftReducer(classicCfg, state, { type: 'place', color: 0 });
    expect(state.draft).toEqual([0, null, null, null]);
    expect(state.selected).toBeNull();

    state = draftReducer(classicCfg, state, { type: 'place', color: 2 });
    expect(state.draft).toEqual([0, 2, null, null]);
    expect(state.selected).toBeNull();
  });

  it('places color into selected slot and advances to next empty slot', () => {
    let state: DraftState = { draft: [null, null, null, null], selected: 1 };

    state = draftReducer(classicCfg, state, { type: 'place', color: 3 });
    expect(state.draft).toEqual([null, 3, null, null]);
    expect(state.selected).toBe(0); // next empty slot is 0

    state = draftReducer(classicCfg, state, { type: 'place', color: 1 });
    expect(state.draft).toEqual([1, 3, null, null]);
    expect(state.selected).toBe(2); // next empty slot is 2
  });

  it('closes selection (selected: null) when all slots are filled', () => {
    let state: DraftState = { draft: [0, 1, 2, null], selected: 3 };

    state = draftReducer(classicCfg, state, { type: 'place', color: 3 });
    expect(state.draft).toEqual([0, 1, 2, 3]);
    expect(state.selected).toBeNull();
  });

  it('respects repeats = false with canPlace', () => {
    const draft = [0, 1, null, null];
    expect(canPlace(draft, 0, 2, false)).toBe(false);
    expect(canPlace(draft, 1, 2, false)).toBe(false);
    expect(canPlace(draft, 2, 2, false)).toBe(true);

    // Allowing replacing slot 0 with color 0
    expect(canPlace(draft, 0, 0, false)).toBe(true);

    // If repeats = true, any color is allowed
    expect(canPlace(draft, 0, 2, true)).toBe(true);
  });

  it('blocks placing duplicate color when repeats = false', () => {
    const state: DraftState = { draft: [0, 1, null, null], selected: 2 };
    const next = draftReducer(uniqueCfg, state, { type: 'place', color: 0 });
    expect(next).toBe(state); // unchanged
  });

  it('select toggles slot on and off', () => {
    let state: DraftState = { draft: [null, null, null, null], selected: null };

    state = draftReducer(classicCfg, state, { type: 'select', index: 2 });
    expect(state.selected).toBe(2);

    state = draftReducer(classicCfg, state, { type: 'select', index: 2 });
    expect(state.selected).toBeNull();
  });

  it('deselect explicitly sets selected to null', () => {
    const state: DraftState = { draft: [null, null, null, null], selected: 2 };
    const next = draftReducer(classicCfg, state, { type: 'deselect' });
    expect(next.selected).toBeNull();
  });

  it('backspace removes selected slot or last filled slot', () => {
    // When no slot is selected, removes last filled
    let state: DraftState = { draft: [0, 1, 2, null], selected: null };
    state = draftReducer(classicCfg, state, { type: 'backspace' });
    expect(state.draft).toEqual([0, 1, null, null]);
    expect(state.selected).toBeNull();

    // When slot is selected, removes that slot and keeps selection
    let stateWithSel: DraftState = { draft: [0, 1, null, null], selected: 1 };
    stateWithSel = draftReducer(classicCfg, stateWithSel, { type: 'backspace' });
    expect(stateWithSel.draft).toEqual([0, null, null, null]);
    expect(stateWithSel.selected).toBe(1);
  });

  it('reset and set actions work properly', () => {
    let state: DraftState = { draft: [0, 1, 2, 3], selected: 1 };
    state = draftReducer(classicCfg, state, { type: 'reset' });
    expect(state.draft).toEqual([null, null, null, null]);
    expect(state.selected).toBeNull();

    state = draftReducer(classicCfg, state, { type: 'set', code: [3, 2, 1, 0] });
    expect(state.draft).toEqual([3, 2, 1, 0]);
    expect(state.selected).toBeNull();
  });
});
