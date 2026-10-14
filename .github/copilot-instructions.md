# GitHub Copilot Instructions for Logika (Mastermind PWA)

Please refer to [AGENTS.md](../AGENTS.md) for complete codebase invariants and architectural guidelines.

## Quick Summary
1. **Pure Domain Logic**: All logic in `src/core/` must be pure with no UI/DOM dependencies.
2. **Knuth Solver**: Must run in a Web Worker (`src/solver/solver.worker.ts`), never on the main thread.
3. **Zero-Scroll Viewport**: The board must fit in `100dvh` without page scrolling.
4. **Popover Positioning**: The slot popover must always render below the active row (`popover-down`).
5. **Localization**: Maintain 1:1 key parity between `src/i18n/en.ts` and `src/i18n/ru.ts`.
6. **Verification**: Always run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run test:e2e` after making changes.
