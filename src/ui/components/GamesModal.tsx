import { useEffect, useState } from 'preact/hooks';
import {
  buildGameUrl,
  CURRENT_GAME_ID,
  getGamesCatalog,
  refreshGamesCatalog,
  type GameEntry,
} from '../../data/gamesCatalog';
import { locale, t } from '../../i18n';
import { haptic } from '../../store';

interface GamesModalProps {
  open: boolean;
  onClose: () => void;
}

export function GamesModal({ open, onClose }: GamesModalProps) {
  const [games, setGames] = useState<GameEntry[]>(() => getGamesCatalog());

  useEffect(() => {
    if (!open) return;
    setGames(getGamesCatalog());
    let active = true;
    refreshGamesCatalog().then((fresh) => {
      if (active) setGames(fresh);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const currentLocale = locale.value;

  return (
    <div
      class="games-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('games.title')}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptic(8);
          onClose();
        }
      }}
    >
      <div class="card games-modal-card">
        <div class="games-modal-header">
          <h2 class="games-modal-title">🎮 {t('games.title')}</h2>
          <button
            type="button"
            class="btn btn-icon games-modal-close-icon"
            aria-label={t('games.close')}
            onClick={() => {
              haptic(8);
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        <p class="games-modal-subtitle">{t('games.subtitle')}</p>

        <div class="games-catalog-list">
          {games.map((game) => {
            const isCurrent = game.id === CURRENT_GAME_ID;
            const title = game.title[currentLocale] || game.title.en;
            const desc = game.description[currentLocale] || game.description.en;
            const tags = game.tags?.[currentLocale] || game.tags?.en || [];
            const targetHref = buildGameUrl(game.url, currentLocale);

            if (isCurrent) {
              return (
                <div key={game.id} class="game-catalog-card game-catalog-card-current">
                  <div class="game-catalog-card-top">
                    <span class="game-catalog-icon" aria-hidden="true">
                      {game.icon}
                    </span>
                    <div class="game-catalog-info">
                      <div class="game-catalog-title-row">
                        <span class="game-catalog-title">{title}</span>
                        <span class="game-catalog-badge">{t('games.currentBadge')}</span>
                      </div>
                      <p class="game-catalog-desc">{desc}</p>
                      <div class="game-catalog-tags">
                        {tags.map((tag) => (
                          <span key={tag} class="game-catalog-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={game.id}
                href={targetHref}
                class="game-catalog-card game-catalog-card-link"
                data-game-id={game.id}
                onClick={() => haptic(10)}
              >
                <div class="game-catalog-card-top">
                  <span class="game-catalog-icon" aria-hidden="true">
                    {game.icon}
                  </span>
                  <div class="game-catalog-info">
                    <div class="game-catalog-title-row">
                      <span class="game-catalog-title">{title}</span>
                      <span class="btn btn-primary btn-sm game-catalog-play">
                        {t('games.playButton')} →
                      </span>
                    </div>
                    <p class="game-catalog-desc">{desc}</p>
                    <div class="game-catalog-tags">
                      {tags.map((tag) => (
                        <span key={tag} class="game-catalog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <p class="games-catalog-footer-hint">{t('games.footerHint')}</p>

        <div class="games-modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            onClick={() => {
              haptic(8);
              onClose();
            }}
          >
            {t('games.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
