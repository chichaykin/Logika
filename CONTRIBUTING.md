# Contributing to Logika

Thank you for your interest in contributing to **Logika (Mastermind PWA)**! We welcome bug reports, feature suggestions, architectural enhancements, and pull requests.

---

## 🛠️ Getting Started

1. **Fork and clone** the repository:
   ```bash
   git clone git@github.com:<your-username>/Logika.git
   cd Logika
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Start the local dev server**:
   ```bash
   npm run dev
   ```

---

## 📐 Development Guidelines & Invariants

Before writing or modifying code, please read [AGENTS.md](AGENTS.md) to familiarize yourself with:
- **Pure Core**: `src/core/` must never import DOM, Preact, or browser APIs.
- **Worker Isolation**: The Knuth solver must stay in `src/solver/` and run only in a Web Worker.
- **Zero-Scroll Layout**: The game board must fit within `100dvh` without page scrolling.
- **Popover Placement**: The marble picker popover must always position downward (`popover-down`).
- **Bilingual Parity**: All strings in `src/i18n/ru.ts` and `src/i18n/en.ts` must maintain identical keys.

---

## 🧪 Verification Checklist

Every pull request must pass all automated checks before merging:

```bash
# 1. TypeScript compilation check
npm run typecheck

# 2. ESLint code standard check
npm run lint

# 3. Unit tests (Vitest)
npm test

# 4. End-to-end tests (Playwright)
npm run build && npm run test:e2e
```

---

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or theme
- `fix:` A bug fix or visual correction
- `docs:` Documentation changes or README updates
- `test:` Adding or updating unit/e2e tests
- `refactor:` Code improvements without behavioral change
- `perf:` Performance improvements (e.g. worker solver optimization)
- `chore:` Dependency or toolchain updates

---

## 🚀 Submitting a Pull Request

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Make your changes and commit with conventional messages.
3. Verify that all tests and linting pass locally.
4. Push your branch and open a Pull Request against `main`.
5. Fill in the PR description template with the problem solved and testing steps.
