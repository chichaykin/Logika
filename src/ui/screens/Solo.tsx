import { useEffect, useRef, useState } from 'preact/hooks';
import type { Code } from '../../core/config';
import { configForSettings } from '../../data/settings';
import {
  loadActiveSolo,
  newSolo,
  registerSoloHint,
  saveActiveSolo,
  submitSoloGuess,
  type SoloState,
} from '../../game/soloGame';
import { t } from '../../i18n';
import { navigate } from '../../router';
import { solver } from '../../solver/client';
import { commitSolo, haptic, presetOf, settings, toggleSound } from '../../store';
import { Board, type RowView } from '../components/Board';
import { Palette } from '../components/Palette';
import { playLidOpen, playLoss, playWin } from '../sound/sound';
import { useDraft } from '../useDraft';

export function Solo() {
  const cfg = configForSettings(settings.value);
  const [game, setGame] = useState<SoloState>(() => {
    const active = loadActiveSolo();
    if (
      active &&
      active.config.length === cfg.length &&
      active.config.colors === cfg.colors &&
      active.config.repeats === cfg.repeats &&
      active.config.maxAttempts === cfg.maxAttempts
    ) {
      return active;
    }
    const fresh = newSolo(cfg);
    saveActiveSolo(fresh);
    return fresh;
  });

  const draft = useDraft(game.config);
  const [hintData, setHintData] = useState<{ guess: Code; remaining: number } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const isOver = game.status === 'won' || game.status === 'lost';
  const [revealed, setRevealed] = useState(() => isOver);
  const [showGameOver, setShowGameOver] = useState(() => isOver);

  const mountedRef = useRef(true);
  const hintReqRef = useRef(0);
  const revealTimerRef = useRef<number | null>(null);
  const overTimerRef = useRef<number | null>(null);

  const clearEndgameTimers = () => {
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (overTimerRef.current !== null) {
      clearTimeout(overTimerRef.current);
      overTimerRef.current = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      hintReqRef.current++;
      clearEndgameTimers();
    };
  }, []);

  useEffect(() => {
    saveActiveSolo(game.status === 'playing' ? game : null);
  }, [game]);

  const handleGuessSubmit = () => {
    if (!draft.code || game.status !== 'playing') return;
    hintReqRef.current++;
    setHintLoading(false);
    haptic(15);
    try {
      const next = submitSoloGuess(game, draft.code);
      setGame(next);
      draft.reset();
      setHintData(null);

      if (next.status === 'won' || next.status === 'lost') {
        commitSolo({
          preset: presetOf(next.config),
          won: next.status === 'won',
          attempts: next.attempts.length,
          hints: next.hintsUsed,
        });

        clearEndgameTimers();
        revealTimerRef.current = window.setTimeout(() => {
          if (!mountedRef.current) return;
          setRevealed(true);
          playLidOpen();

          overTimerRef.current = window.setTimeout(() => {
            if (!mountedRef.current) return;
            setShowGameOver(true);
            if (next.status === 'won') {
              playWin();
            } else {
              playLoss();
            }
          }, 380);
        }, 260);
      }
    } catch {
      // ignore
    }
  };

  const handleRequestHint = async () => {
    if (game.status !== 'playing' || hintLoading) return;
    const reqId = ++hintReqRef.current;
    setHintLoading(true);
    try {
      const res = await solver.hint(game.config, game.attempts);
      if (!mountedRef.current || hintReqRef.current !== reqId) return;
      setHintData(res);
      setGame((prev) => registerSoloHint(prev));
    } catch {
      // ignore
    } finally {
      if (mountedRef.current && hintReqRef.current === reqId) {
        setHintLoading(false);
      }
    }
  };

  const handleApplyHint = () => {
    if (!hintData) return;
    draft.set(hintData.guess);
    setHintData(null);
    haptic(10);
  };

  const startNewGame = () => {
    hintReqRef.current++;
    setHintLoading(false);
    clearEndgameTimers();
    const fresh = newSolo(cfg);
    setGame(fresh);
    draft.reset();
    setHintData(null);
    setConfirmNew(false);
    setRevealed(false);
    setShowGameOver(false);
    saveActiveSolo(fresh);
  };

  // Формируем строки для поля
  const rows: RowView[] = [];
  for (let i = 0; i < game.config.maxAttempts; i++) {
    if (i < game.attempts.length) {
      rows.push({
        guess: game.attempts[i].guess,
        feedback: game.attempts[i].feedback,
      });
    } else if (i === game.attempts.length && game.status === 'playing') {
      rows.push({
        guess: draft.draft,
        active: true,
        selected: draft.selected,
        onSlot: draft.select,
      });
    } else {
      rows.push({
        guess: new Array(game.config.length).fill(null),
      });
    }
  }

  return (
    <div class="screen screen-game screen-solo">
      <header class="game-header">
        <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
          ← {t('common.menu')}
        </button>
        <div class="game-turn-info">
          {game.status === 'playing' ? (
            <span>
              {t('game.attempt', { n: game.attempts.length + 1 })} / {game.config.maxAttempts}
            </span>
          ) : (
            <span class={`status-badge ${game.status}`}>
              {game.status === 'won' ? '🎉' : '❌'}
            </span>
          )}
        </div>
        <div class="game-header-actions">
          <button
            type="button"
            class="btn btn-sm btn-icon"
            onClick={toggleSound}
            aria-label={settings.value.sound ? t('common.mute') : t('common.unmute')}
            title={settings.value.sound ? t('common.mute') : t('common.unmute')}
          >
            {settings.value.sound ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            onClick={() => {
              if (game.status === 'playing' && game.attempts.length > 0) {
                setConfirmNew(true);
              } else {
                startNewGame();
              }
            }}
          >
            {t('common.newGame')}
          </button>
        </div>
      </header>

      {confirmNew && (
        <div class="modal-overlay" role="dialog" aria-modal="true">
          <div class="modal-card">
            <p>{t('game.confirmNew')}</p>
            <div class="modal-actions">
              <button type="button" class="btn btn-primary" onClick={startNewGame}>
                {t('common.yes')}
              </button>
              <button type="button" class="btn" onClick={() => setConfirmNew(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {hintData && (
        <div class="hint-banner" role="status">
          <div class="hint-info">
            <span>{t('game.hintRemaining', { n: hintData.remaining })}</span>
            <small>{t('game.hintBest')}</small>
          </div>
          <button type="button" class="btn btn-sm btn-primary" onClick={handleApplyHint}>
            {t('game.useHint')}
          </button>
          <button type="button" class="btn btn-sm" onClick={() => setHintData(null)}>
            ✕
          </button>
        </div>
      )}

      <main class="board-container">
        <Board
          config={game.config}
          rows={rows}
          secret={game.secret}
          revealed={revealed}
          endStatus={game.status === 'won' || game.status === 'lost' ? game.status : null}
          colorblind={settings.value.colorblind}
          onPlaceColor={game.status === 'playing' ? draft.place : undefined}
          onDeselect={game.status === 'playing' ? draft.deselect : undefined}
        />
      </main>

      {showGameOver ? (
        <div class="game-over-panel" role="region" aria-live="polite">
          <h2 class={`game-over-title ${game.status}`}>
            {game.status === 'won'
              ? t('game.won', { n: game.attempts.length })
              : t('game.lost')}
          </h2>
          <div class="game-over-actions">
            <button type="button" class="btn btn-primary" onClick={startNewGame}>
              {t('common.again')}
            </button>
            <button type="button" class="btn btn-secondary" onClick={() => navigate('home')}>
              {t('common.menu')}
            </button>
          </div>
        </div>
      ) : (
        <Palette
          config={game.config}
          draft={draft}
          colorblind={settings.value.colorblind}
          enabled={game.status === 'playing'}
          submitLabel={t('game.submit')}
          submitDisabled={!draft.code}
          onSubmit={handleGuessSubmit}
          extra={
            <button
              type="button"
              class="btn btn-hint"
              disabled={hintLoading || game.status !== 'playing'}
              onClick={handleRequestHint}
            >
              💡 {hintLoading ? '…' : t('game.hint')}
            </button>
          }
        />
      )}
    </div>
  );
}
