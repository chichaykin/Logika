import { useEffect, useReducer } from 'preact/hooks';
import type { Code, GameConfig } from '../core/config';

export type Draft = (number | null)[];

interface State {
  draft: Draft;
  selected: number | null;
}

type Action =
  | { type: 'place'; color: number }
  | { type: 'select'; index: number }
  | { type: 'deselect' }
  | { type: 'backspace' }
  | { type: 'reset' }
  | { type: 'set'; code: Code };

const emptyDraft = (length: number): Draft => new Array<number | null>(length).fill(null);

/** Можно ли поставить цвет в позицию `target` (без повторов цвет уникален). */
export function canPlace(draft: Draft, color: number, target: number, repeats: boolean): boolean {
  return repeats || !draft.some((c, i) => c === color && i !== target);
}

export function draftReducer(config: GameConfig, s: State, a: Action): State {
  switch (a.type) {
    case 'place': {
      const target = s.selected ?? s.draft.indexOf(null);
      if (target < 0 || !canPlace(s.draft, a.color, target, config.repeats)) return s;
      const draft = [...s.draft];
      draft[target] = a.color;
      const next = draft.indexOf(null);
      return { draft, selected: s.selected !== null ? (next < 0 ? null : next) : null };
    }
    case 'select':
      return { ...s, selected: s.selected === a.index ? null : a.index };
    case 'deselect':
      return { ...s, selected: null };
    case 'backspace': {
      let target = s.selected !== null && s.draft[s.selected] !== null ? s.selected : -1;
      if (target < 0) for (let i = s.draft.length - 1; i >= 0; i--) if (s.draft[i] !== null) { target = i; break; }
      if (target < 0) return s;
      const draft = [...s.draft];
      draft[target] = null;
      return { draft, selected: s.selected !== null ? target : null };
    }
    case 'reset':
      return { draft: emptyDraft(config.length), selected: null };
    case 'set':
      return { draft: [...a.code], selected: null };
  }
}

export interface DraftController {
  draft: Draft;
  selected: number | null;
  /** Заполненный код или null, если остались пустые позиции. */
  code: Code | null;
  place(color: number): void;
  select(index: number): void;
  deselect(): void;
  backspace(): void;
  reset(): void;
  set(code: Code): void;
}

/** Состояние ввода одного кода: ряд лунок + выбранная позиция. */
export function useDraft(config: GameConfig): DraftController {
  const [state, dispatch] = useReducer(
    (s: State, a: Action) => draftReducer(config, s, a),
    undefined,
    (): State => ({ draft: emptyDraft(config.length), selected: null }),
  );

  useEffect(() => {
    if (state.draft.length !== config.length) {
      dispatch({ type: 'reset' });
    }
  }, [config.length]);

  const complete = state.draft.every((c) => c !== null);
  return {
    draft: state.draft,
    selected: state.selected,
    code: complete ? (state.draft as number[]) : null,
    place: (color) => dispatch({ type: 'place', color }),
    select: (index) => dispatch({ type: 'select', index }),
    deselect: () => dispatch({ type: 'deselect' }),
    backspace: () => dispatch({ type: 'backspace' }),
    reset: () => dispatch({ type: 'reset' }),
    set: (code) => dispatch({ type: 'set', code }),
  };
}
