import { useState } from 'preact/hooks';
import { configForSettings } from '../../data/settings';
import {
  duelGuess,
  duelMatchWinner,
  duelNext,
  duelRematch,
  duelRoundWon,
  duelSetSecret,
  duelSetter,
  duelStartGuessing,
  newDuel,
  type DuelState,
  type Player,
} from '../../game/duelGame';
import { t } from '../../i18n';
import { navigate } from '../../router';
import { haptic, settings, toggleSound } from '../../store';
import { Board, type RowView } from '../components/Board';
import { Palette } from '../components/Palette';
import { playLidOpen, playLoss, playWin } from '../sound/sound';
import { useDraft } from '../useDraft';

export function Duel() {
  const cfg = configForSettings(settings.value);
  const [game, setGame] = useState<DuelState>(() => newDuel(cfg, 1));
  const draft = useDraft(game.config);

  const playerName = (p: Player) => t('duel.player', { n: p + 1 });

  const handleSetSecretSubmit = () => {
    if (!draft.code) return;
    haptic(15);
    setGame(duelSetSecret(game, draft.code));
    draft.reset();
  };

  const handleStartGuessing = () => {
    haptic(10);
    setGame(duelStartGuessing(game));
    draft.reset();
  };

  const handleGuessSubmit = () => {
    if (!draft.code) return;
    haptic(15);
    const next = duelGuess(game, draft.code);
    draft.reset();
    if (next.phase === 'roundOver') {
      const won = duelRoundWon(next);
      playLidOpen();
      setTimeout(() => {
        if (won) playWin();
        else playLoss();
      }, 350);
    }
    setGame(next);
  };

  const handleNextPhase = () => {
    haptic(10);
    setGame(duelNext(game));
    draft.reset();
  };

  const handleRematch = () => {
    haptic(10);
    setGame(duelRematch(game));
    draft.reset();
  };

  // 1. Фаза загадывания кода
  if (game.phase === 'setSecret') {
    const setter = duelSetter(game);
    const other = game.guesser;
    return (
      <div class="screen screen-game screen-duel-setup">
        <header class="game-header">
          <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
            ← {t('common.menu')}
          </button>
          <h2>{t('menu.duel')}</h2>
          <button
            type="button"
            class="btn btn-sm btn-icon"
            onClick={toggleSound}
            aria-label={settings.value.sound ? t('common.mute') : t('common.unmute')}
            title={settings.value.sound ? t('common.mute') : t('common.unmute')}
          >
            {settings.value.sound ? '🔊' : '🔇'}
          </button>
        </header>

        <main class="setup-content card">
          <div class="duel-phase-banner">
            <h3>{t('duel.setSecret', { name: playerName(setter) })}</h3>
            <p class="duel-warning">{t('duel.lookAway', { name: playerName(other) })}</p>
          </div>

          <div class="draft-preview">
            <Board
              config={game.config}
              rows={[
                {
                  guess: draft.draft,
                  active: true,
                  selected: draft.selected,
                  onSlot: draft.select,
                },
              ]}
              revealed={true}
              colorblind={settings.value.colorblind}
              onPlaceColor={draft.place}
              onDeselect={draft.deselect}
            />
          </div>

          <Palette
            config={game.config}
            draft={draft}
            colorblind={settings.value.colorblind}
            submitLabel={t('common.confirm')}
            submitDisabled={!draft.code}
            onSubmit={handleSetSecretSubmit}
          />
        </main>
      </div>
    );
  }

  // 2. Фаза передачи телефона
  if (game.phase === 'handoff') {
    const guesser = game.guesser;
    return (
      <div class="screen screen-game screen-duel-handoff">
        <header class="game-header">
          <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
            ← {t('common.menu')}
          </button>
          <h2>{t('menu.duel')}</h2>
          <button
            type="button"
            class="btn btn-sm btn-icon"
            onClick={toggleSound}
            aria-label={settings.value.sound ? t('common.mute') : t('common.unmute')}
            title={settings.value.sound ? t('common.mute') : t('common.unmute')}
          >
            {settings.value.sound ? '🔊' : '🔇'}
          </button>
        </header>

        <main class="setup-content card handoff-card">
          <div class="handoff-icon" aria-hidden="true">📱⇄</div>
          <h3>{t('duel.handoff', { name: playerName(guesser) })}</h3>
          <div class="setup-action">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              onClick={handleStartGuessing}
            >
              {t('duel.ready')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 3. Фаза угадывания кода
  if (game.phase === 'guess') {
    const guesser = game.guesser;
    const rows: RowView[] = [];
    for (let i = 0; i < game.config.maxAttempts; i++) {
      if (i < game.attempts.length) {
        rows.push({
          guess: game.attempts[i].guess,
          feedback: game.attempts[i].feedback,
        });
      } else if (i === game.attempts.length) {
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
      <div class="screen screen-game screen-duel">
        <header class="game-header">
          <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
            ← {t('common.menu')}
          </button>
          <div class="game-turn-info">
            <strong>{playerName(guesser)}</strong>: {t('game.attempt', { n: game.attempts.length + 1 })} / {game.config.maxAttempts}
          </div>
          <button
            type="button"
            class="btn btn-sm btn-icon"
            onClick={toggleSound}
            aria-label={settings.value.sound ? t('common.mute') : t('common.unmute')}
            title={settings.value.sound ? t('common.mute') : t('common.unmute')}
          >
            {settings.value.sound ? '🔊' : '🔇'}
          </button>
        </header>

        <main class="board-container">
          <Board
            config={game.config}
            rows={rows}
            secret={game.secret}
            revealed={false}
            colorblind={settings.value.colorblind}
            onPlaceColor={draft.place}
            onDeselect={draft.deselect}
          />
        </main>

        <Palette
          config={game.config}
          draft={draft}
          colorblind={settings.value.colorblind}
          submitLabel={t('game.submit')}
          submitDisabled={!draft.code}
          onSubmit={handleGuessSubmit}
        />
      </div>
    );
  }

  // 4. Фаза окончания раунда
  if (game.phase === 'roundOver') {
    const guesser = game.guesser;
    const won = duelRoundWon(game);
    const attemptsCount = game.attempts.length;

    return (
      <div class="screen screen-game screen-duel-roundover">
        <header class="game-header">
          <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
            ← {t('common.menu')}
          </button>
          <h2>{t('menu.duel')}</h2>
          <button
            type="button"
            class="btn btn-sm btn-icon"
            onClick={toggleSound}
            aria-label={settings.value.sound ? t('common.mute') : t('common.unmute')}
            title={settings.value.sound ? t('common.mute') : t('common.unmute')}
          >
            {settings.value.sound ? '🔊' : '🔇'}
          </button>
        </header>

        <main class="setup-content card roundover-card">
          <h3>
            {won
              ? t('duel.roundWon', { name: playerName(guesser), n: attemptsCount })
              : t('duel.roundLost', { name: playerName(guesser) })}
          </h3>

          <div class="secret-reveal-box">
            <p>{t('game.secret')}:</p>
            <Board
              config={game.config}
              rows={[]}
              secret={game.secret}
              revealed={true}
              endStatus={won ? 'won' : 'lost'}
              colorblind={settings.value.colorblind}
            />
          </div>

          <button
            type="button"
            class="btn btn-primary btn-lg"
            onClick={handleNextPhase}
          >
            {t('duel.next')} →
          </button>
        </main>
      </div>
    );
  }

  // 5. Фаза окончания матча (оба игрока сыграли)
  const winner = duelMatchWinner(game.results);
  const p1Moves = game.results[0];
  const p2Moves = game.results[1];

  return (
    <div class="screen screen-game screen-duel-matchover">
      <header class="game-header">
        <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
          ← {t('common.menu')}
        </button>
        <h2>{t('duel.matchOver')}</h2>
        <button
          type="button"
          class="btn btn-sm btn-icon"
          onClick={toggleSound}
          aria-label={settings.value.sound ? t('common.mute') : t('common.unmute')}
          title={settings.value.sound ? t('common.mute') : t('common.unmute')}
        >
          {settings.value.sound ? '🔊' : '🔇'}
        </button>
      </header>

      <main class="setup-content card matchover-card">
        <div class="match-winner-banner">
          {winner !== null ? (
            <h3 class="won">{t('duel.winner', { name: playerName(winner) })}</h3>
          ) : (
            <h3>{t('duel.draw')}</h3>
          )}
        </div>

        <div class="match-details">
          <div class="player-score-row">
            <span>{playerName(0)}</span>
            <strong>
              {p1Moves !== null && p1Moves <= game.config.maxAttempts
                ? t('duel.moves', { n: p1Moves })
                : t('duel.notSolved')}
            </strong>
          </div>
          <div class="player-score-row">
            <span>{playerName(1)}</span>
            <strong>
              {p2Moves !== null && p2Moves <= game.config.maxAttempts
                ? t('duel.moves', { n: p2Moves })
                : t('duel.notSolved')}
            </strong>
          </div>
        </div>

        <div class="series-score">
          <h4>{t('duel.score')}</h4>
          <p>
            {playerName(0)} <strong>{game.wins[0]}</strong> : <strong>{game.wins[1]}</strong> {playerName(1)}
            {game.draws > 0 && <small> {t('duel.drawsCount', { n: game.draws })}</small>}
          </p>
        </div>

        <div class="matchover-actions">
          <button type="button" class="btn btn-primary" onClick={handleRematch}>
            🔄 {t('duel.rematch')}
          </button>
          <button type="button" class="btn btn-secondary" onClick={() => navigate('home')}>
            {t('common.menu')}
          </button>
        </div>
      </main>
    </div>
  );
}
