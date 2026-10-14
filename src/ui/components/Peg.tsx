/** Цвета штырьков (индекс = номер цвета в коде). */
export const PEG_COLORS = ['#e03a2f', '#2f6fde', '#2fa84f', '#f28a1f', '#f4f1e8', '#2a2a2e', '#25b6c9', '#8a4fc2'] as const;

/** Определения градиентов и минеральных текстур мраморных шариков. */
export function PegDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true" focusable="false">
      <defs>
        {/* Базовая маска сферы */}
        <clipPath id="peg-sphere-clip">
          <circle cx="20" cy="19" r="15" />
        </clipPath>

        {/* 1. Красная яшма / Rosso Alicante */}
        <radialGradient id="pg-0" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#ff695e" />
          <stop offset="35%" stop-color="#d6281e" />
          <stop offset="70%" stop-color="#8a1109" />
          <stop offset="100%" stop-color="#3d0502" />
        </radialGradient>
        <g id="peg-veins-0">
          <path d="M7 14 Q16 11 23 20 T33 26" fill="none" stroke="#ffe0da" stroke-width="1.8" opacity="0.38" stroke-linecap="round" />
          <path d="M12 25 Q19 22 26 29" fill="none" stroke="#ffffff" stroke-width="0.9" opacity="0.45" stroke-linecap="round" />
          <path d="M14 9 Q20 15 29 13" fill="none" stroke="#540702" stroke-width="1.4" opacity="0.5" />
          <path d="M8 20 Q14 18 20 22" fill="none" stroke="#ffb5a8" stroke-width="0.7" opacity="0.3" />
        </g>

        {/* 2. Лазурит / Lapis Lazuli */}
        <radialGradient id="pg-1" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#6eaaff" />
          <stop offset="35%" stop-color="#256fe0" />
          <stop offset="70%" stop-color="#0f3f94" />
          <stop offset="100%" stop-color="#051745" />
        </radialGradient>
        <g id="peg-veins-1">
          <path d="M8 12 C14 8 22 17 32 15" fill="none" stroke="#e6f0ff" stroke-width="1.6" opacity="0.42" stroke-linecap="round" />
          <path d="M11 26 Q21 21 31 27" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.35" />
          <circle cx="15" cy="19" r="1.1" fill="#ffd700" opacity="0.7" />
          <circle cx="24" cy="22" r="0.8" fill="#ffd700" opacity="0.65" />
          <circle cx="19" cy="14" r="0.9" fill="#ffd700" opacity="0.6" />
          <circle cx="28" cy="17" r="0.7" fill="#ffd700" opacity="0.75" />
          <path d="M6 18 Q16 23 27 18" fill="none" stroke="#072257" stroke-width="1.5" opacity="0.5" />
        </g>

        {/* 3. Малахит / Изумрудный нефрит */}
        <radialGradient id="pg-2" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#5ff088" />
          <stop offset="35%" stop-color="#1ea648" />
          <stop offset="70%" stop-color="#0c5e26" />
          <stop offset="100%" stop-color="#03290e" />
        </radialGradient>
        <g id="peg-veins-2">
          <ellipse cx="23" cy="22" rx="9" ry="6" fill="none" stroke="#99ffb8" stroke-width="1.5" opacity="0.4" transform="rotate(-20 23 22)" />
          <ellipse cx="23" cy="22" rx="14" ry="10" fill="none" stroke="#043813" stroke-width="2.2" opacity="0.55" transform="rotate(-20 23 22)" />
          <ellipse cx="23" cy="22" rx="5" ry="3.2" fill="none" stroke="#bfffcf" stroke-width="1.2" opacity="0.45" transform="rotate(-20 23 22)" />
          <path d="M6 11 Q14 17 21 11 T34 16" fill="none" stroke="#064016" stroke-width="1.4" opacity="0.6" />
        </g>

        {/* 4. Медовый янтарь / Сердолик */}
        <radialGradient id="pg-3" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#ffe06b" />
          <stop offset="35%" stop-color="#f28716" />
          <stop offset="70%" stop-color="#a64c02" />
          <stop offset="100%" stop-color="#4d1f00" />
        </radialGradient>
        <g id="peg-veins-3">
          <path d="M7 16 Q18 10 27 18 T34 23" fill="none" stroke="#fff4a8" stroke-width="2" opacity="0.4" stroke-linecap="round" />
          <path d="M10 27 Q18 20 29 25" fill="none" stroke="#ffe57f" stroke-width="1" opacity="0.35" />
          <path d="M12 9 Q23 16 28 8" fill="none" stroke="#662700" stroke-width="1.5" opacity="0.45" />
          <circle cx="16" cy="21" r="2.5" fill="#ffd966" opacity="0.2" />
        </g>

        {/* 5. Каррарский белый мрамор */}
        <radialGradient id="pg-4" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#f4f1e8" />
          <stop offset="75%" stop-color="#d4cdc0" />
          <stop offset="100%" stop-color="#8a8375" />
        </radialGradient>
        <g id="peg-veins-4">
          <path d="M8 12 Q14 18 22 15 T31 23" fill="none" stroke="#635d52" stroke-width="1.2" opacity="0.32" stroke-linecap="round" />
          <path d="M16 16 Q20 22 27 20" fill="none" stroke="#4a443a" stroke-width="0.8" opacity="0.3" />
          <path d="M21 15 L25 10" fill="none" stroke="#544e45" stroke-width="0.6" opacity="0.28" />
          <path d="M9 25 Q17 23 25 30" fill="none" stroke="#877f72" stroke-width="1" opacity="0.25" />
        </g>

        {/* 6. Чёрный обсидиан / Nero Marquina */}
        <radialGradient id="pg-5" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#595c69" />
          <stop offset="35%" stop-color="#2d2e36" />
          <stop offset="70%" stop-color="#14141a" />
          <stop offset="100%" stop-color="#050508" />
        </radialGradient>
        <g id="peg-veins-5">
          <path d="M9 11 L18 16 L23 14 L32 24" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.55" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M18 16 L19 23 L26 27" fill="none" stroke="#d5daf0" stroke-width="0.8" opacity="0.45" stroke-linejoin="round" />
          <path d="M12 24 L16 28" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.4" />
          <path d="M23 14 L28 8" fill="none" stroke="#d5daf0" stroke-width="0.7" opacity="0.4" />
        </g>

        {/* 7. Амазонит / Бирюза */}
        <radialGradient id="pg-6" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#7df0ff" />
          <stop offset="35%" stop-color="#1eb5c9" />
          <stop offset="70%" stop-color="#0e6b78" />
          <stop offset="100%" stop-color="#032c33" />
        </radialGradient>
        <g id="peg-veins-6">
          <path d="M7 13 Q16 18 24 13 T33 22" fill="none" stroke="#cbfbff" stroke-width="1.5" opacity="0.42" stroke-linecap="round" />
          <path d="M11 25 Q19 21 28 27" fill="none" stroke="#b0844f" stroke-width="1.1" opacity="0.4" />
          <path d="M14 10 Q22 14 27 9" fill="none" stroke="#08424a" stroke-width="1.3" opacity="0.5" />
          <path d="M18 18 Q23 23 29 19" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.35" />
        </g>

        {/* 8. Аметист / Пурпурный флюорит */}
        <radialGradient id="pg-7" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stop-color="#cb8cfc" />
          <stop offset="35%" stop-color="#8a41cf" />
          <stop offset="70%" stop-color="#4d1b82" />
          <stop offset="100%" stop-color="#21053d" />
        </radialGradient>
        <g id="peg-veins-7">
          <path d="M8 15 Q15 9 24 17 T33 18" fill="none" stroke="#f2d9ff" stroke-width="1.7" opacity="0.45" stroke-linecap="round" />
          <path d="M10 26 Q19 23 29 28" fill="none" stroke="#ffffff" stroke-width="0.9" opacity="0.38" />
          <path d="M14 8 Q23 16 29 11" fill="none" stroke="#2d0554" stroke-width="1.5" opacity="0.55" />
          <path d="M16 17 L22 25" fill="none" stroke="#eed4ff" stroke-width="0.7" opacity="0.35" />
        </g>

        {/* Эффект затенения по краям (Френель) */}
        <radialGradient id="peg-rim-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="68%" stop-color="#000000" stop-opacity="0" />
          <stop offset="90%" stop-color="#000000" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.65" />
        </radialGradient>

        {/* Отражённый свет от стола (Ambient bounce light) снизу-справа */}
        <radialGradient id="peg-bounce" cx="0.72" cy="0.78" r="0.38">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24" />
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>

        {/* Глянцевый точечный блик */}
        <radialGradient id="peg-specular" cx="0.35" cy="0.3" r="0.45">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92" />
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.5" />
          <stop offset="70%" stop-color="#ffffff" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>

        {/* Золотая гравировка для цифр (режим дальтоников) */}
        <linearGradient id="peg-gold-num" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8db" />
          <stop offset="50%" stop-color="#e6bc53" />
          <stop offset="100%" stop-color="#9e771b" />
        </linearGradient>
        <linearGradient id="peg-silver-num" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#d4d8e0" />
          <stop offset="100%" stop-color="#6e737e" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export interface PegProps {
  color: number;
  /** Показывать номер цвета (режим для дальтоников). */
  symbol?: boolean;
}

/** Реалистичный мраморный шарик: природные прожилки минерала, сферический объем и глянцевый блик. */
export function Peg({ color, symbol }: PegProps) {
  const c = Math.max(0, Math.min(7, color));
  const isWhite = c === 4;

  return (
    <svg class="peg" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {/* Мягкая контактная тень в лунке */}
      <ellipse cx="20" cy="34" rx="12.5" ry="4" fill="rgba(0,0,0,0.42)" />

      {/* Базовая минеральная сфера с радиальным градиентом */}
      <circle cx="20" cy="19" r="15" fill={`url(#pg-${c})`} />

      {/* Природные прожилки камня */}
      <g clip-path="url(#peg-sphere-clip)">
        <use href={`#peg-veins-${c}`} />
      </g>

      {/* Затенение по краям сферы */}
      <circle cx="20" cy="19" r="15" fill="url(#peg-rim-shadow)" />

      {/* Отражённый свет снизу (bounce light от поверхности доски) */}
      <circle cx="20" cy="19" r="15" fill="url(#peg-bounce)" />

      {/* Глянцевый овальный блик полировки */}
      <ellipse cx="15.2" cy="13.2" rx="5.4" ry="3.2" fill="url(#peg-specular)" transform="rotate(-35 15.2 13.2)" />
      {/* Чёткий микро-блик источника света */}
      <circle cx="13.5" cy="11.8" r="1.3" fill="#ffffff" opacity="0.95" />

      {/* Золотая гравировка для дальтоников */}
      {symbol && (
        <g>
          <text
            x="20"
            y="25.5"
            text-anchor="middle"
            font-size="16"
            font-weight="900"
            fill="rgba(0,0,0,0.7)"
            dy="1"
          >
            {color + 1}
          </text>
          <text
            x="20"
            y="25.5"
            text-anchor="middle"
            font-size="16"
            font-weight="900"
            fill={isWhite ? 'url(#peg-silver-num)' : 'url(#peg-gold-num)'}
          >
            {color + 1}
          </text>
        </g>
      )}
    </svg>
  );
}

/** Пустая лунка с фаской и глубокой внутренней тенью. */
export function Hole() {
  return <span class="hole" aria-hidden="true" />;
}

export type KeyKind = 'black' | 'white' | 'none';

/** Маленький ключ (чёрный жемчуг / белый жемчуг / пустая лунка). */
export function KeyPeg({ kind }: { kind: KeyKind }) {
  return <span class={`kp kp-${kind}`} aria-hidden="true" />;
}
