# AGENTS.md — AI Agent Guidance & Codebase Invariants

Welcome, AI coding assistant (Antigravity, Cursor, GitHub Copilot, Claude Code, Devin, etc.). This document outlines the architectural boundaries, design decisions, and strict invariants of the **Logika (Mastermind PWA)** repository.

Please follow these instructions closely when reading, modifying, or testing the codebase.

---

## 1. Architectural Boundaries

The codebase follows a strict layered architecture:

```
src/
├── core/       # 1. PURE DOMAIN LOGIC
├── solver/     # 2. ALGORITHMIC WORKER
├── game/       # 3. REACTIVE STATE
├── storage/    # 4. PERSISTENCE
├── i18n/       # 5. LOCALIZATION
└── ui/         # 6. PRESENTATION & STYLES
```

### Layer Rules
1. **`src/core/` (Pure Logic)**:
   - Contains mathematical calculations, secret generation, feedback evaluation (`exact` and `color` matches), and theme definitions.
   - **Invariant**: ZERO dependencies on Preact, React, DOM, or browser APIs. All functions must be deterministic and pure.
   - Verified by: `tests/unit/core.test.ts`.

2. **`src/solver/` (Knuth Solver)**:
   - Implements Knuth's Five-Guess minimax algorithm.
   - **Invariant**: Must run exclusively in a background Web Worker (`solver.worker.ts`) wrapped by the async client (`client.ts`). Never execute heavy candidate searches directly on the UI thread.
   - Verified by: `tests/unit/solver.test.ts`.

3. **`src/game/` (State Management)**:
   - Uses `@preact/signals` for granular, fine-grained reactivity.
   - `src/game/store.ts`: Game mode, current guesses, scores, history, hints.
   - `src/game/useDraft.ts`: Draft marble selections for the active row, slot selection focus, and submission validation.
   - Verified by: `tests/unit/store.test.ts` and `tests/unit/draft.test.ts`.

4. **`src/i18n/` (Localization)**:
   - **Invariant**: Key parity between `src/i18n/en.ts` and `src/i18n/ru.ts` is strictly enforced. Any new key added to one MUST be added to the other.

5. **`src/ui/` (Presentation)**:
   - Built with Preact components and modular CSS.
   - Follows zero-scroll layout rules and accessible HTML semantics.

---

## 2. Critical Codebase Invariants (DO NOT BREAK)

### 🚫 Invariant 1: Zero-Scroll Viewport (`100dvh`)
- The entire application layout must fit within `100dvh` on mobile and desktop devices without triggering page scrollbars.
- The board dynamically shrinks rows, marble radii, and gaps using CSS `clamp()`, `minmax()`, and flexbox/grid containers.
- **Never** add fixed heights (e.g. `height: 800px`) that overflow the viewport.

### 🚫 Invariant 2: Marble Picker Popover Position (`popover-down`)
- When a user taps a slot on the active row, the marble selection popover (`.slot-popover`) MUST always render **below** the active row.
- **Never** place the popover above the active row: rendering above obscures previous guesses and feedback clues, hindering the player's deduction process.
- Verified by: `tests/e2e/solo.spec.ts` ("popover opens below active row").

### 🚫 Invariant 3: Esc and Outside-Click Behavior
- Pressing `Escape` or tapping on the board outside the popover calls `draft.deselect()`.
- It closes the marble popover and unselects the active slot, but **must never erase** the player's drafted marbles.

### 🚫 Invariant 4: Accessibility & Keyboard Control
- Slots and buttons must be accessible via keyboard:
  - Keys `1` through `6` place the corresponding color into the selected slot.
  - `Enter` submits the guess if all slots are filled.
  - `Escape` dismisses the picker.
  - Feedback peg groups must use accessible ARIA attributes (`role="group"`, `aria-label`).

---

## 3. Verification & Testing Protocol

Before creating a commit or submitting a pull request, run all verification steps:

```bash
# 1. Typecheck the entire project
npm run typecheck

# 2. Run ESLint
npm run lint

# 3. Run all Vitest unit tests
npm test

# 4. Build the production bundle
npm run build

# 5. Run all Playwright end-to-end tests
npm run test:e2e
```

### Writing New Tests
- **Domain Logic / Store Changes**: Add unit tests under `tests/unit/*.test.ts`.
- **UI Flow / Interaction Changes**: Add or update Playwright tests under `tests/e2e/*.spec.ts`.

---

## 4. Git & Commit Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` for new user-facing features or options.
  - `fix:` for bug fixes or alignment corrections.
  - `refactor:` for code restructuring without behavior changes.
  - `test:` for adding or updating unit/e2e tests.
  - `docs:` for documentation updates.
  - `chore:` for dependency updates or CI changes.
- Keep commits atomic and self-contained.
