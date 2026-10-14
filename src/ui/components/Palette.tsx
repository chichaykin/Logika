import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import type { GameConfig } from '../../core/config';
import { t } from '../../i18n';
import { haptic } from '../../store';
import { canPlace, type DraftController } from '../useDraft';
import { colorName } from './Board';
import { Peg } from './Peg';

export interface PaletteProps {
  config: GameConfig;
  draft: DraftController;
  colorblind: boolean;
  /** Клавиатура (1–8, Backspace, Enter) активна только когда палитра включена. */
  enabled?: boolean;
  submitLabel: string;
  submitDisabled?: boolean;
  onSubmit: () => void;
  /** Дополнительные кнопки рядом с «Стереть» (например, «Подсказка»). */
  extra?: ComponentChildren;
}

/** Палитра цветов + «Стереть» + «Проверить». Работает и с клавиатуры. */
export function Palette(props: PaletteProps) {
  const { config, draft, colorblind, enabled = true, submitLabel, submitDisabled, onSubmit, extra } = props;

  // Хэндлеры в ref, чтобы слушатель клавиатуры не пересоздавался на каждый рендер.
  const live = useRef({ draft, onSubmit, submitDisabled, config });
  live.current = { draft, onSubmit, submitDisabled, config };

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const { draft: d, onSubmit: submit, submitDisabled: off, config: c } = live.current;
      if (/^[1-8]$/.test(e.key) && Number(e.key) <= c.colors) {
        d.place(Number(e.key) - 1);
        haptic(8);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        d.backspace();
      } else if (e.key === 'Enter' && !off && (tag !== 'BUTTON' || (e.target as HTMLElement).dataset.palette)) {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);

  const target = draft.selected ?? draft.draft.indexOf(null);
  return (
    <div class="palette">
      <div class="palette-colors" role="group" aria-label={t('game.palette')}>
        {Array.from({ length: config.colors }, (_, i) => {
          const blocked = target < 0 || !canPlace(draft.draft, i, target, config.repeats);
          return (
            <button
              key={i}
              type="button"
              class="pal-btn"
              data-palette="1"
              disabled={!enabled || blocked}
              aria-label={`${colorName(i)} (${i + 1})`}
              onClick={() => {
                draft.place(i);
                haptic(8);
              }}
            >
              <Peg color={i} symbol={colorblind} />
            </button>
          );
        })}
      </div>
      <div class="palette-actions">
        <button type="button" class="btn" disabled={!enabled} onClick={draft.backspace}>
          ⌫ {t('game.clear')}
        </button>
        {extra}
        <button
          type="button"
          class="btn btn-primary"
          data-palette="1"
          disabled={!enabled || submitDisabled}
          onClick={onSubmit}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
