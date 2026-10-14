import type { Feedback } from '../../core/config';
import { isPossibleFeedback } from '../../core/feedback';
import { KeyPeg, type KeyKind } from './Peg';

export interface FeedbackInputProps {
  length: number;
  value: Feedback;
  onChange: (f: Feedback) => void;
  disabled?: boolean;
}

/**
 * Ручной ввод подсказок (ч/б ключей) для хода компьютера.
 * Отображает лунки для ключей: клик по лунке циклически меняет состояние:
 * пусто -> чёрный -> белый -> пусто.
 */
export function FeedbackInput({ length, value, onChange, disabled }: FeedbackInputProps) {
  const cols = length === 4 ? 2 : 3;

  // Разворачиваем { black, white } в упорядоченный список меток
  const kinds: KeyKind[] = [];
  for (let i = 0; i < length; i++) {
    if (i < value.black) {
      kinds.push('black');
    } else if (i < value.black + value.white) {
      kinds.push('white');
    } else {
      kinds.push('none');
    }
  }

  const cycleAt = (index: number) => {
    if (disabled) return;
    const current = kinds[index];
    let next: KeyKind;
    if (current === 'none') next = 'black';
    else if (current === 'black') next = 'white';
    else next = 'none';

    kinds[index] = next;

    let black = 0;
    let white = 0;
    for (const k of kinds) {
      if (k === 'black') black++;
      if (k === 'white') white++;
    }

    onChange({ black, white });
  };

  const valid = isPossibleFeedback(value, length);

  return (
    <div class={`feedback-input ${valid ? '' : 'invalid'}`} style={{ '--cols': cols }}>
      {kinds.map((k, i) => (
        <button
          key={i}
          type="button"
          class={`fb-peg-btn kp-${k}`}
          disabled={disabled}
          onClick={() => cycleAt(i)}
          aria-label={`Ключ ${i + 1}: ${k === 'black' ? 'чёрный' : k === 'white' ? 'белый' : 'пусто'}`}
        >
          <KeyPeg kind={k} />
        </button>
      ))}
    </div>
  );
}
