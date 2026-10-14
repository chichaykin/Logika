import { useEffect, useState } from 'preact/hooks';
import { configForSettings } from '../../data/settings';
import { loadActiveSolo, type SoloState } from '../../game/soloGame';
import { t } from '../../i18n';
import { navigate } from '../../router';
import { settings } from '../../store';
import { InstallPrompt } from '../components/InstallPrompt';

export function Home() {
  const [activeSolo, setActiveSolo] = useState<SoloState | null>(null);

  useEffect(() => {
    setActiveSolo(loadActiveSolo());
  }, []);

  const cfg = configForSettings(settings.value);

  return (
    <div class="screen screen-home">
      <header class="home-header">
        <div class="logo-box">
          <h1 class="logo-title">{t('app.title')}</h1>
          <div class="logo-pegs" aria-hidden="true">
            <span class="logo-peg lp-red" />
            <span class="logo-peg lp-blue" />
            <span class="logo-peg lp-green" />
            <span class="logo-peg lp-yellow" />
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
              {t('common.confirm')} ({activeSolo.attempts.length + 1}-я попытка)
            </button>
          </div>
        </section>
      )}

      <nav class="menu-list" aria-label="Главное меню">
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
    </div>
  );
}
