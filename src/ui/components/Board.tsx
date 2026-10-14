import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import type { Code, Feedback, GameConfig } from '../../core/config';
import { t, type Key } from '../../i18n';
import { haptic } from '../../store';
import { canPlace } from '../useDraft';
import { Hole, KeyPeg, Peg, type KeyKind } from './Peg';

export const colorName = (i: number): string => t(`color.${i}` as Key);

/** Ряд лунок. Если передан `onSlot`, лунки — кнопки (ряд ввода). */
export function SlotRow(props: {
  values: readonly (number | null)[];
  colorblind: boolean;
  selected?: number | null;
  onSlot?: (i: number) => void;
}) {
  const { values, colorblind, selected, onSlot } = props;
  return (
    <div class="slots">
      {values.map((v, i) => {
        const inner = v === null ? <Hole /> : <Peg color={v} symbol={colorblind} />;
        const label = `${t('game.slot', { i: i + 1 })}: ${v === null ? t('game.empty') : colorName(v)}`;
        return onSlot ? (
          <button
            key={i}
            type="button"
            class={`slot${v !== null ? ' filled' : ''}`}
            aria-label={label}
            aria-pressed={selected === i}
            aria-expanded={selected === i}
            aria-haspopup="dialog"
            onClick={() => onSlot(i)}
          >
            {inner}
          </button>
        ) : (
          <span key={i} class={`slot${v !== null ? ' filled' : ''}`} role="img" aria-label={label}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}

/** Блок ключей: сначала чёрные, затем белые, затем пустые лунки. */
export function KeyBlock({ length, feedback }: { length: number; feedback?: Feedback }) {
  const cols = length === 4 ? 2 : 3;
  const kinds: KeyKind[] = [];
  const b = feedback?.black ?? 0;
  const w = feedback?.white ?? 0;
  for (let i = 0; i < length; i++) kinds.push(i < b ? 'black' : i < b + w ? 'white' : 'none');
  return (
    <div class="keys" style={{ '--cols': cols }}>
      {kinds.map((k, i) => (
        <KeyPeg key={i} kind={k} />
      ))}
    </div>
  );
}

export interface RowView {
  guess: readonly (number | null)[];
  feedback?: Feedback;
  /** Заменяет блок ключей (например, ручной ввод ключей). */
  keys?: ComponentChildren;
  active?: boolean;
  error?: boolean;
  selected?: number | null;
  onSlot?: (i: number) => void;
}

export interface BoardProps {
  config: GameConfig;
  rows: RowView[];
  /** Секретный код; показывается, только когда `revealed`. */
  secret?: Code | null;
  revealed: boolean;
  colorblind: boolean;
  /** Выбор цвета прямо над/под активным рядом (in-place popover) */
  onPlaceColor?: (color: number) => void;
  /** Снятие выбора лунки (закрытие in-place popover при клике снаружи) */
  onDeselect?: () => void;
}

function rowAria(r: RowView, n: number, length: number): string {
  if (!r.feedback) return t('game.row', { n });
  const { black, white } = r.feedback;
  void length;
  const keys = black + white === 0 ? t('game.keysNone') : t('game.keys', { black, white });
  return `${t('game.row', { n })}. ${keys}`;
}

/** Жёлтое пластиковое поле «Логики»: шторка с секретом сверху и ряды попыток. */
export function Board({ config, rows, secret, revealed, colorblind, onPlaceColor, onDeselect }: BoardProps) {
  const activeRef = useRef<HTMLLIElement>(null);
  const activeIndex = rows.findIndex((r) => r.active);
  const activeRow = rows[activeIndex];
  const hasActivePopover = Boolean(
    activeRow && activeRow.selected !== null && activeRow.selected !== undefined && onPlaceColor
  );

  useEffect(() => {
    const el = activeRef.current;
    if (el && typeof el.scrollIntoView === 'function') {
      const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
    }
  }, [activeIndex, rows.length]);

  useEffect(() => {
    if (!hasActivePopover || !onDeselect) return;
    const onOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.slot-popover') || target.closest('.slot') || target.closest('[data-palette="1"]')) {
        return;
      }
      onDeselect();
    };
    window.addEventListener('pointerdown', onOutside);
    return () => window.removeEventListener('pointerdown', onOutside);
  }, [hasActivePopover, onDeselect]);

  const secretValues: (number | null)[] = revealed && secret ? [...secret] : new Array(config.length).fill(null);
  return (
    <div class="board" data-length={config.length}>
      <div class="secret" aria-label={revealed ? t('game.secret') : t('game.secretHidden')}>
        <SlotRow values={secretValues} colorblind={colorblind} />
        <div class={`lid${revealed ? ' open' : ''}`} aria-hidden="true">
          <span>?</span>
        </div>
      </div>
      <ol class="rows">
        {rows.map((r, i) => {
          const showPopover = Boolean(
            r.active && r.selected !== null && r.selected !== undefined && onPlaceColor
          );
          return (
            <li
              key={i}
              ref={r.active ? activeRef : undefined}
              class={`row${r.active ? ' active' : ''}${r.error ? ' error' : ''}${r.feedback || r.active ? '' : ' future'}`}
              aria-label={rowAria(r, i + 1, config.length)}
              aria-current={r.active ? 'step' : undefined}
            >
              <span class="row-n" aria-hidden="true">
                {i + 1}
              </span>
              <SlotRow values={r.guess} colorblind={colorblind} selected={r.selected} onSlot={r.onSlot} />
              {r.keys ?? <KeyBlock length={config.length} feedback={r.feedback} />}

              {showPopover && (
                <div
                  class="slot-popover popover-down"
                  role="toolbar"
                  aria-label={t('game.palette')}
                >
                  <div class="popover-arrow" aria-hidden="true" />
                  <div class="popover-marbles">
                    {Array.from({ length: config.colors }, (_, c) => {
                      const blocked = !canPlace(r.guess as (number | null)[], c, r.selected!, config.repeats);
                      return (
                        <button
                          key={c}
                          type="button"
                          class="popover-btn"
                          disabled={blocked}
                          aria-label={`${colorName(c)} (${c + 1})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlaceColor!(c);
                            haptic(8);
                          }}
                        >
                          <Peg color={c} symbol={colorblind} />
                          <span class="popover-key-hint" aria-hidden="true">{c + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    class="popover-close-btn"
                    aria-label={t('common.cancel')}
                    title={t('common.cancel')}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeselect) onDeselect();
                      else r.onSlot?.(r.selected!);
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
