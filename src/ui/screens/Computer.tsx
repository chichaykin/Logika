import { useRef, useState } from 'preact/hooks';
import type { Code, Feedback } from '../../core/config';
import { isPossibleFeedback } from '../../core/feedback';
import { configForSettings } from '../../data/settings';
import {
  applyFeedback,
  autoFeedback,
  markContradiction,
  newComputerGame,
  setComputerGuess,
  undoLastFeedback,
  type ComputerState,
  type FeedbackMode,
} from '../../game/computerGame';
import { t } from '../../i18n';
import { navigate } from '../../router';
import { solver } from '../../solver/client';
import { commitComputer, haptic, presetOf, settings } from '../../store';
import { Board, type RowView } from '../components/Board';
import { FeedbackInput } from '../components/FeedbackInput';
import { Palette } from '../components/Palette';
import { useDraft } from '../useDraft';

export function Computer() {
  const cfg = configForSettings(settings.value);

  // Фаза выбора режима: если секрет не задан для auto, сначала просим ввести
  const [mode, setMode] = useState<FeedbackMode>(settings.value.feedbackMode);
  const [hasStarted, setHasStarted] = useState(false);
  const secretDraft = useDraft(cfg);

  const [game, setGame] = useState<ComputerState>(() =>
    newComputerGame(cfg, settings.value.feedbackMode, null)
  );
  const [thinking, setThinking] = useState(false);
  const [manualFb, setManualFb] = useState<Feedback>({ black: 0, white: 0 });
  const [fbError, setFbError] = useState<string | null>(null);

  const computingRef = useRef(false);

  // Запуск первого хода при старте игры
  const makeMove = async (curGame: ComputerState) => {
    if (computingRef.current || curGame.status !== 'playing') return;
    computingRef.current = true;
    setThinking(true);
    setFbError(null);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 550));

    try {
      const [nextGuess] = await Promise.all([
        solver.nextGuess(curGame.config, curGame.history),
        minDelay,
      ]);

      let updated = setComputerGuess(curGame, nextGuess);

      if (updated.mode === 'auto') {
        const autoFb = autoFeedback(updated);
        updated = applyFeedback(updated, autoFb);
        setGame(updated);

        if (updated.status === 'solved' || updated.status === 'failed') {
          commitComputer({
            preset: presetOf(updated.config),
            solved: updated.status === 'solved',
            moves: updated.history.length,
          });
        } else {
          // Следующий шаг с паузой
          setTimeout(() => {
            computingRef.current = false;
            makeMove(updated);
          }, 400);
          return;
        }
      } else {
        setGame(updated);
        setManualFb({ black: 0, white: 0 });
      }
    } catch {
      // Ошибка солвера (нет кандидатов)
      const at = await solver.findContradiction(curGame.config, curGame.history);
      setGame(markContradiction(curGame, at ?? curGame.history.length));
    } finally {
      computingRef.current = false;
      setThinking(false);
    }
  };

  const handleStartGame = (chosenMode: FeedbackMode, secret: Code | null) => {
    const fresh = newComputerGame(cfg, chosenMode, secret);
    setGame(fresh);
    setMode(chosenMode);
    setHasStarted(true);
    makeMove(fresh);
  };

  const handleConfirmManualFeedback = async () => {
    if (!isPossibleFeedback(manualFb, game.config.length)) {
      setFbError(t('computer.keysInvalid'));
      return;
    }
    haptic(15);
    setFbError(null);

    try {
      const updated = applyFeedback(game, manualFb);
      setGame(updated);

      if (updated.status === 'solved' || updated.status === 'failed') {
        commitComputer({
          preset: presetOf(updated.config),
          solved: updated.status === 'solved',
          moves: updated.history.length,
        });
        return;
      }

      // Проверяем, нет ли противоречия после этого ответа
      const contradictionIdx = await solver.findContradiction(updated.config, updated.history);
      if (contradictionIdx !== null) {
        setGame(markContradiction(updated, contradictionIdx + 1));
        return;
      }

      // Если всё в порядке, компьютер думает над следующим ходом
      makeMove(updated);
    } catch {
      setFbError(t('computer.keysInvalid'));
    }
  };

  const handleUndo = () => {
    const rolled = undoLastFeedback(game);
    setGame(rolled);
    setManualFb({ black: 0, white: 0 });
    setFbError(null);
  };

  const startNew = () => {
    setHasStarted(false);
    secretDraft.reset();
    setManualFb({ black: 0, white: 0 });
    setFbError(null);
  };

  // Экран ввода кода перед началом (для режима auto или выбора режима)
  if (!hasStarted) {
    return (
      <div class="screen screen-game screen-computer-setup">
        <header class="game-header">
          <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
            ← {t('common.menu')}
          </button>
          <h2>{t('menu.computer')}</h2>
          <div style={{ width: 40 }} />
        </header>

        <main class="setup-content card">
          <h3>{t('computer.chooseMode')}</h3>

          <div class="mode-select-buttons">
            <button
              type="button"
              class={`mode-card ${mode === 'manual' ? 'selected' : ''}`}
              onClick={() => setMode('manual')}
            >
              <strong>{t('computer.modeManual')}</strong>
              <small>{t('computer.modeManualDesc')}</small>
            </button>

            <button
              type="button"
              class={`mode-card ${mode === 'auto' ? 'selected' : ''}`}
              onClick={() => setMode('auto')}
            >
              <strong>{t('computer.modeAuto')}</strong>
              <small>{t('computer.modeAutoDesc')}</small>
            </button>
          </div>

          {mode === 'auto' ? (
            <div class="secret-picker">
              <h4>{t('computer.enterSecret')}</h4>
              <div class="draft-preview">
                <Board
                  config={cfg}
                  rows={[
                    {
                      guess: secretDraft.draft,
                      active: true,
                      selected: secretDraft.selected,
                      onSlot: secretDraft.select,
                    },
                  ]}
                  revealed={true}
                  colorblind={settings.value.colorblind}
                />
              </div>
              <Palette
                config={cfg}
                draft={secretDraft}
                colorblind={settings.value.colorblind}
                submitLabel={t('common.start')}
                submitDisabled={!secretDraft.code}
                onSubmit={() => handleStartGame('auto', secretDraft.code)}
              />
            </div>
          ) : (
            <div class="setup-action">
              <button
                type="button"
                class="btn btn-primary btn-lg"
                onClick={() => handleStartGame('manual', null)}
              >
                {t('common.start')}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Формируем строки для поля
  const rows: RowView[] = [];
  for (let i = 0; i < game.config.maxAttempts; i++) {
    if (i < game.history.length) {
      rows.push({
        guess: game.history[i].guess,
        feedback: game.history[i].feedback,
      });
    } else if (i === game.history.length && game.pendingGuess) {
      // Текущий ход компьютера
      rows.push({
        guess: game.pendingGuess,
        active: true,
        keys:
          game.mode === 'manual' && game.status === 'playing' ? (
            <FeedbackInput
              length={game.config.length}
              value={manualFb}
              onChange={setManualFb}
              disabled={thinking}
            />
          ) : undefined,
      });
    } else {
      rows.push({
        guess: new Array(game.config.length).fill(null),
      });
    }
  }

  const isOver = game.status === 'solved' || game.status === 'failed';
  const isContradiction = game.status === 'contradiction';

  return (
    <div class="screen screen-game screen-computer">
      <header class="game-header">
        <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
          ← {t('common.menu')}
        </button>
        <div class="game-turn-info">
          <span>
            {t('game.attempt', { n: game.history.length + (game.pendingGuess ? 1 : 0) })} / {game.config.maxAttempts}
          </span>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" onClick={startNew}>
          {t('common.newGame')}
        </button>
      </header>

      {thinking && (
        <div class="thinking-banner" role="status">
          <span class="spinner" aria-hidden="true" />
          <span>{t('computer.thinking')}</span>
        </div>
      )}

      {isContradiction && (
        <div class="contradiction-banner" role="alert">
          <p>{t('computer.contradiction', { n: game.contradictionAt ?? game.history.length })}</p>
          <button type="button" class="btn btn-sm btn-primary" onClick={handleUndo}>
            ↩ {t('computer.undo')}
          </button>
        </div>
      )}

      {fbError && (
        <div class="error-banner" role="alert">
          <span>{fbError}</span>
        </div>
      )}

      <main class="board-container">
        <Board
          config={game.config}
          rows={rows}
          secret={game.secret}
          revealed={isOver && game.secret !== null}
          colorblind={settings.value.colorblind}
        />
      </main>

      {isOver ? (
        <div class="game-over-panel" role="region" aria-live="polite">
          <h2 class={`game-over-title ${game.status}`}>
            {game.status === 'solved'
              ? t('computer.solved', { n: game.history.length })
              : t('computer.failed')}
          </h2>
          <div class="game-over-actions">
            <button type="button" class="btn btn-primary" onClick={startNew}>
              {t('common.again')}
            </button>
            <button type="button" class="btn btn-secondary" onClick={() => navigate('home')}>
              {t('common.menu')}
            </button>
          </div>
        </div>
      ) : game.mode === 'manual' && game.pendingGuess && !isContradiction ? (
        <div class="manual-feedback-bar">
          <p class="manual-hint">{t('computer.markKeys')}</p>
          <div class="manual-actions">
            <button
              type="button"
              class="btn btn-primary"
              disabled={thinking}
              onClick={handleConfirmManualFeedback}
            >
              {t('computer.keysConfirm')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
