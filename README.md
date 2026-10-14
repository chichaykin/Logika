# Logika (Логика) — Mastermind PWA

[![CI](https://github.com/chichaykin/Logika/actions/workflows/ci.yml/badge.svg)](https://github.com/chichaykin/Logika/actions/workflows/ci.yml)
[![Deploy PWA](https://github.com/chichaykin/Logika/actions/workflows/deploy.yml/badge.svg)](https://github.com/chichaykin/Logika/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Preact-10.x-673ab8?logo=preact)](https://preactjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite)](https://vitejs.dev/)

> **A modern, tactile, and highly responsive Progressive Web App (PWA) reincarnation of the classic Mastermind / Bulls and Cows codebreaking game.** Built with Preact, Signals, TypeScript, procedural marble physics, and an off-thread Knuth Five-Guess AI solver.

---

[English](#english) | [Русский](#русский)

---

<a name="english"></a>
## 🌟 Highlights

- 🔮 **Photorealistic Marble Aesthetic**: Tactile glass and polished marble spheres with ambient occlusion, 3D highlights, subtle veining, and realistic wood/board socket inlays.
- 🎨 **4 Handcrafted Themes**:
  - **Dark Walnut (Luxe Noir)**: Rich walnut wood, polished brass inlays, and warm ambient vignette.
  - **Dark Slate**: Cool graphite slate stone, brushed metal highlights, and deep shadows.
  - **Light Travertine**: Honed cream travertine limestone, delicate marble veining, and warm bronze trim.
  - **Classic Retro**: Iconic 1972 vintage Mastermind board with warm amber bakelite tones.
- 📱 **Zero-Scroll Dynamic Viewport (`100dvh`)**: The entire game board scales seamlessly to fit any device screen—from small smartphones to large desktop displays—without requiring vertical scrolling.
- 🎯 **Ergonomic In-Place Marble Picker**: Tap any slot on the active row to open an inline popover picker that *always* opens below the current row, preserving complete visibility of all previous attempts and feedback pegs.
- 🤖 **Knuth Five-Guess AI Solver**: Play against or get hints from an optimal codebreaker algorithm running in an isolated Web Worker to maintain a smooth 60/120 FPS interface.
- 📶 **Progressive Web App (PWA)**: Works 100% offline with instant service worker caching and install prompts on iOS, Android, and Desktop.
- 🌐 **Bilingual (EN / RU)**: Full English and Russian localization with instant switching in settings.
- ♿ **Accessibility First**: Keyboard shortcuts (numbers `1-6`, `Enter`, `Esc`), ARIA live status announcements, and optional high-contrast mode with distinct color symbols.
- 🧪 **Thoroughly Tested**: Comprehensive suite of 60 Vitest unit tests and 12 Playwright end-to-end tests across Desktop Chrome and Mobile Safari emulation.

---

## 🎯 Rules of the Game

### Objective
The Secret Keeper (either the computer or player) generates a hidden code consisting of colored marbles (e.g., 4 marbles out of 6 possible colors). The Codebreaker must deduce the secret pattern within a limited number of guesses (default: 10 attempts).

### Feedback Pegs (Clues)
After each guess, the game provides clue pegs to evaluate your attempt:

| Clue Peg | Meaning | Description |
| :---: | :--- | :--- |
| ⚫ **Black / Dark** | **Exact Match** | A marble is of the **correct color** and in the **correct position**. |
| ⚪ **White / Light** | **Color Match** | A marble is of the **correct color**, but in the **wrong position**. |
| ⭕ **Empty / Blank** | **No Match** | The marble's color is not present in the remaining secret code. |

> **Note:** The position of clue pegs does **not** correlate to the positions of the marbles in your guess.

---

<a name="русский"></a>
## 🇷🇺 Описание на русском

**Логика (Mastermind)** — это элегантная реализация культовой настольной игры-головоломки, перенесённая в современный формат PWA.

### Ключевые особенности
- 🔮 **Мраморные шарики**: Реалистичные блики, внутренний градиент, тени в углублениях доски и тактильная анимация выбора.
- 🎨 **4 атмосферные темы**: Тёмное дерево (Орех и латунь / Luxe Noir), Тёмный сланец, Светлый травертин и Классическое ретро (1972).
- 📱 **Идеально под экраны мобильных и ПК**: Вёрстка строго в пределах `100dvh` (без раздражающего скролла).
- 🎯 **Умное меню выбора шаров**: Всплывающий выбор шаров появляется прямо под активным слотом и никогда не загораживает предыдущие ходы и подсказки.
- 🤖 **Решатель Кнута**: Математически оптимальный алгоритм поиска кода, работающий в фоновом потоке (Web Worker).
- 📶 **Работа офлайн**: Поддержка PWA — устанавливается на рабочий стол или экран телефона и работает без интернета.
- 🌐 **Два языка**: Мгновенное переключение между русским и английским языком в настройках.

### Как читать подсказки (чёрные и белые фишки)
- ⚫ **Чёрная (тёмная) фишка**: правильный цвет на своём месте.
- ⚪ **Белая (светлая) фишка**: правильный цвет, но стоит не на своём месте.
- Порядок фишек в подсказке произвольный и не указывает на конкретные позиции шариков.

---

## 🏗️ Architecture & Directory Structure

The project adheres to strict architectural boundaries with pure domain logic, separate state stores, and worker isolation:

```
MasterMindGame/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml            # Linting, typechecking, Vitest & Playwright E2E
│   │   └── deploy.yml        # Automated GitHub Pages PWA deployment
│   ├── ISSUE_TEMPLATE/       # Structured bug & feature request templates
│   └── pull_request_template.md
├── src/
│   ├── core/                 # Pure domain logic (ZERO dependencies on DOM/UI)
│   │   ├── types.ts          # Core types: Color, Peg, Guess, Feedback, GameConfig
│   │   ├── gameLogic.ts      # Secret generation, feedback calculation, validation
│   │   └── themes.ts         # Visual theme definitions & marble palettes
│   ├── solver/               # Knuth Five-Guess Solver
│   │   ├── knuth.ts          # Pure algorithm for minimax candidate reduction
│   │   ├── solver.worker.ts  # Web Worker executing search in background thread
│   │   └── client.ts         # Promise-based client wrapper for the worker
│   ├── game/                 # State management & game loops
│   │   ├── store.ts          # Reactive game state backed by @preact/signals
│   │   └── useDraft.ts       # Active row draft state, selection, & submission
│   ├── i18n/                 # Localization dictionaries
│   │   ├── en.ts             # English strings
│   │   ├── ru.ts             # Russian strings
│   │   └── index.ts          # Reactive locale switcher
│   ├── storage/              # Persistent settings & statistics in localStorage
│   └── ui/                   # Preact user interface & styles
│       ├── components/       # Board, Row, Slot, Palette, Pegs, RulesModal, etc.
│       ├── screens/          # GameScreen, SettingsScreen, StatsScreen
│       └── styles/           # CSS modules, marble textures, board theme variables
├── tests/
│   ├── unit/                 # Vitest unit tests (game logic, solver, store, draft)
│   └── e2e/                  # Playwright end-to-end tests (solo game, popover, PWA)
├── AGENTS.md                 # Invariant guide for AI coding assistants
├── CONTRIBUTING.md           # Contribution workflow and guidelines
└── vite.config.ts            # Vite + PWA configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or later
- **npm**: v10 or later

### Installation

```bash
# Clone the repository
git clone git@github.com:chichaykin/Logika.git
cd Logika

# Install dependencies
npm ci
```

### Running Locally

```bash
# Start local development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Building for Production

```bash
# Typecheck and build the production bundle
npm run build

# Preview the production build locally (port 4173)
npm run preview
```

---

## 🧪 Testing & Verification

The project includes strict verification scripts used in CI and local development:

```bash
# Run TypeScript typechecker
npm run typecheck

# Run ESLint
npm run lint

# Run Vitest unit tests
npm test

# Run Playwright end-to-end tests (builds preview automatically)
npm run test:e2e
```

---

## 🤖 Guide for AI Coding Agents

If you are an AI coding assistant (Antigravity, Cursor, GitHub Copilot, Claude Code, etc.), please read [AGENTS.md](AGENTS.md) before making modifications. It specifies critical codebase invariants:
1. **Pure Core**: `src/core/` must never import DOM, Preact, or browser APIs.
2. **Worker Isolation**: The solver must remain isolated in `src/solver/` and communicate exclusively via message passing.
3. **Viewport Invariant**: Never introduce page-level vertical scroll (`overflow: hidden` on body; UI stays within `100dvh`).
4. **Popover Positioning**: The marble picker popover must always render *below* the active row (`popover-down`).
5. **Bilingual Parity**: Every user-visible string must be mirrored identically in `src/i18n/en.ts` and `src/i18n/ru.ts`.

---

## 📄 License

This project is open-source and available under the terms of the [MIT License](LICENSE).
