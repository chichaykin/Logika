/** Цвета штырьков (индекс = номер цвета в коде). */
export const PEG_COLORS = ['#e03a2f', '#2f6fde', '#2fa84f', '#f28a1f', '#f4f1e8', '#2a2a2e', '#25b6c9', '#8a4fc2'] as const;

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex: string, target: number, amount: number): string {
  const [r, g, b] = channels(hex).map((v) => Math.round(v + (target - v) * amount));
  return `rgb(${r},${g},${b})`;
}

/** Светлый текст на тёмных штырьках, тёмный — на светлых. */
function textColor(hex: string): string {
  const [r, g, b] = channels(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#1c1c1c' : '#ffffff';
}

/** Общие градиенты штырьков: подключаются один раз на страницу, дальше — `url(#pg-N)`. */
export function PegDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {PEG_COLORS.map((c, i) => (
          <radialGradient id={`pg-${i}`} key={c} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stop-color={mix(c, 255, 0.55)} />
            <stop offset="0.5" stop-color={c} />
            <stop offset="1" stop-color={mix(c, 0, 0.45)} />
          </radialGradient>
        ))}
      </defs>
    </svg>
  );
}

export interface PegProps {
  color: number;
  /** Показывать номер цвета (режим для дальтоников). */
  symbol?: boolean;
}

/** Объёмный штырёк: градиент, блик и тень. */
export function Peg({ color, symbol }: PegProps) {
  const base = PEG_COLORS[color] ?? PEG_COLORS[0];
  return (
    <svg class="peg" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <ellipse cx="21" cy="25" rx="15" ry="13" fill="rgba(0,0,0,0.3)" />
      <circle cx="20" cy="19" r="15" fill={`url(#pg-${color})`} stroke={mix(base, 0, 0.55)} stroke-width="1" />
      <ellipse cx="14" cy="12" rx="5.5" ry="3" fill="rgba(255,255,255,0.55)" transform="rotate(-35 14 12)" />
      {symbol && (
        <text x="20" y="25.5" text-anchor="middle" font-size="17" font-weight="800" fill={textColor(base)}>
          {color + 1}
        </text>
      )}
    </svg>
  );
}

/** Пустая лунка. */
export function Hole() {
  return <span class="hole" aria-hidden="true" />;
}

export type KeyKind = 'black' | 'white' | 'none';

/** Маленький ключ (чёрный / белый / пустая лунка). */
export function KeyPeg({ kind }: { kind: KeyKind }) {
  return <span class={`kp kp-${kind}`} aria-hidden="true" />;
}
