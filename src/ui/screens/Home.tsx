import { useEffect, useState } from 'preact/hooks';
import { configForSettings } from '../../data/settings';
import { loadActiveSolo, type SoloState } from '../../game/soloGame';
import { locale, t } from '../../i18n';
import { navigate } from '../../router';
import { haptic, settings, updateSettings } from '../../store';
import { GamesModal } from '../components/GamesModal';
import { InstallPrompt } from '../components/InstallPrompt';
import { Peg } from '../components/Peg';

export function Home() {
  const [activeSolo, setActiveSolo] = useState<SoloState | null>(null);
  const [gamesOpen, setGamesOpen] = useState(false);

  useEffect(() => {
    setActiveSolo(loadActiveSolo());
  }, []);

  const cfg = configForSettings(settings.value);
  const currentLocale = locale.value;

  const handleLangChange = (lang: 'ru' | 'en') => {
    updateSettings({ lang });
    haptic(8);
  };

  return (
    <div class="screen screen-home">
      <div class="home-top-bar">
        <button
          type="button"
          class="home-games-pill"
          onClick={() => {
            haptic(8);
            setGamesOpen(true);
          }}
          aria-label={t('games.title')}
          title={t('games.title')}
        >
          <span aria-hidden="true">🎮</span>
          <span>{t('games.button')}</span>
        </button>

        <div class="home-lang-switch" role="group" aria-label={t('settings.language')}>
          <span class="home-lang-icon" aria-hidden="true">🌐</span>
          <button
            type="button"
            class={`home-lang-btn ${currentLocale === 'ru' ? 'active' : ''}`}
            onClick={() => handleLangChange('ru')}
            aria-pressed={currentLocale === 'ru'}
            aria-label="Русский"
          >
            RU
          </button>
          <span class="home-lang-divider" aria-hidden="true" />
          <button
            type="button"
            class={`home-lang-btn ${currentLocale === 'en' ? 'active' : ''}`}
            onClick={() => handleLangChange('en')}
            aria-pressed={currentLocale === 'en'}
            aria-label="English"
          >
            EN
          </button>
        </div>
      </div>

      <header class="home-header">
        <div class="logo-box">
          <h1 class="logo-title">{t('app.title')}</h1>
          <div class="logo-pegs" aria-hidden="true">
            <span class="logo-peg-wrapper"><Peg color={0} /></span>
            <span class="logo-peg-wrapper"><Peg color={1} /></span>
            <span class="logo-peg-wrapper"><Peg color={2} /></span>
            <span class="logo-peg-wrapper"><Peg color={3} /></span>
          </div>
        </div>
        <p class="logo-subtitle">{t('app.subtitle')}</p>
      </header>

      {activeSolo && (
        <section class="card resume-card">
          <p class="resume-text">{t('menu.resume')}</p>
          <div class="resume-actions">
            <button
              type="button"
              class="btn btn-primary"
              onClick={() => navigate('solo')}
            >
              {t('common.confirm')} ({t('menu.resumeAttempt', { attempt: activeSolo.attempts.length + 1 })})
            </button>
          </div>
        </section>
      )}

      <nav class="menu-list" aria-label={t('menu.mainMenu')}>
        <button
          type="button"
          class="menu-item menu-item-primary"
          onClick={() => navigate('solo')}
        >
          <div class="menu-item-text">
            <span class="menu-item-title">{t('menu.solo')}</span>
            <span class="menu-item-desc">{t('menu.soloDesc')}</span>
          </div>
          <span class="menu-item-arrow" aria-hidden="true">→</span>
        </button>

        <button
          type="button"
          class="menu-item"
          onClick={() => navigate('computer')}
        >
          <div class="menu-item-text">
            <span class="menu-item-title">{t('menu.computer')}</span>
            <span class="menu-item-desc">{t('menu.computerDesc')}</span>
          </div>
          <span class="menu-item-arrow" aria-hidden="true">→</span>
        </button>

        <button
          type="button"
          class="menu-item"
          onClick={() => navigate('duel')}
        >
          <div class="menu-item-text">
            <span class="menu-item-title">{t('menu.duel')}</span>
            <span class="menu-item-desc">{t('menu.duelDesc')}</span>
          </div>
          <span class="menu-item-arrow" aria-hidden="true">→</span>
        </button>
      </nav>

      <div class="menu-secondary">
        <button type="button" class="btn btn-secondary" onClick={() => navigate('stats')}>
          📊 {t('menu.stats')}
        </button>
        <button type="button" class="btn btn-secondary" onClick={() => navigate('rules')}>
          📖 {t('menu.rules')}
        </button>
        <button type="button" class="btn btn-secondary" onClick={() => navigate('settings')}>
          ⚙️ {t('menu.settings')}
        </button>
      </div>

      <div class="preset-badge">
        <span>{t(`preset.${settings.value.preset}`)}</span>: {t('preset.summary', {
          length: cfg.length,
          colors: cfg.colors,
          attempts: cfg.maxAttempts,
        })} ({cfg.repeats ? t('preset.repeatsOn') : t('preset.repeatsOff')})
      </div>

      <InstallPrompt />
      <GamesModal open={gamesOpen} onClose={() => setGamesOpen(false)} />
    </div>
  );
}
