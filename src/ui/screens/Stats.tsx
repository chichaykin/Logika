import { useState } from 'preact/hooks';
import { averageComputerMoves, averageSoloAttempts } from '../../data/stats';
import { t } from '../../i18n';
import { navigate } from '../../router';
import { clearStats, settings, stats } from '../../store';

export function Stats() {
  const [activePreset, setActivePreset] = useState<string>(settings.value.preset);
  const [confirmReset, setConfirmReset] = useState(false);

  const soloData = stats.value.solo[activePreset];
  const compData = stats.value.computer[activePreset];

  const soloPlayed = soloData?.played ?? 0;
  const soloWins = soloData?.wins ?? 0;
  const soloWinRate = soloPlayed > 0 ? Math.round((soloWins / soloPlayed) * 100) : 0;
  const avgSolo = averageSoloAttempts(soloData);

  const compPlayed = compData?.played ?? 0;
  const compSolved = compData?.solved ?? 0;
  const avgComp = averageComputerMoves(compData);

  // Ограничиваем гистограмму числом попыток пресета
  const maxBars = activePreset === 'hard' ? 12 : 10;
  const histogram = soloData?.histogram.slice(0, maxBars) ?? new Array(maxBars).fill(0);
  const maxCountInHisto = Math.max(...histogram, 1);

  const handleReset = () => {
    clearStats();
    setConfirmReset(false);
  };

  return (
    <div class="screen screen-stats">
      <header class="game-header">
        <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
          ← {t('common.menu')}
        </button>
        <h2>{t('stats.title')}</h2>
        <div style={{ width: 40 }} />
      </header>

      <main class="stats-content">
        <div class="preset-selector-tabs">
          <button
            type="button"
            class={`tab-btn ${activePreset === 'classic' ? 'active' : ''}`}
            onClick={() => setActivePreset('classic')}
          >
            {t('preset.classic')}
          </button>
          <button
            type="button"
            class={`tab-btn ${activePreset === 'hard' ? 'active' : ''}`}
            onClick={() => setActivePreset('hard')}
          >
            {t('preset.hard')}
          </button>
          {settings.value.preset === 'custom' && (
            <button
              type="button"
              class={`tab-btn ${activePreset === 'custom' ? 'active' : ''}`}
              onClick={() => setActivePreset('custom')}
            >
              {t('preset.custom')}
            </button>
          )}
        </div>

        {/* Секция: Соло против компьютера */}
        <section class="card stats-card">
          <h3>{t('stats.solo')}</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-val">{soloPlayed}</span>
              <span class="stat-lbl">{t('stats.played')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{soloWins}</span>
              <span class="stat-lbl">{t('stats.wins')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{soloWinRate}%</span>
              <span class="stat-lbl">{t('stats.winRate')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{soloData?.streak ?? 0}</span>
              <span class="stat-lbl">{t('stats.streak')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{soloData?.bestStreak ?? 0}</span>
              <span class="stat-lbl">{t('stats.bestStreak')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{avgSolo > 0 ? avgSolo.toFixed(1) : '—'}</span>
              <span class="stat-lbl">{t('stats.avgAttempts')}</span>
            </div>
          </div>

          {soloWins > 0 && (
            <div class="histogram-box">
              <h4>{t('stats.histogram')}</h4>
              <div class="histogram-bars">
                {histogram.map((count, i) => {
                  const pct = Math.round((count / maxCountInHisto) * 100);
                  return (
                    <div key={i} class="histo-row">
                      <span class="histo-num">{i + 1}</span>
                      <div class="histo-bar-track">
                        <div
                          class="histo-bar-fill"
                          style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                        >
                          <span class="histo-val">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Секция: Компьютер угадывает */}
        <section class="card stats-card">
          <h3>{t('stats.computer')}</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-val">{compPlayed}</span>
              <span class="stat-lbl">{t('stats.played')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{compSolved}</span>
              <span class="stat-lbl">{t('stats.solved')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{avgComp > 0 ? avgComp.toFixed(2) : '—'}</span>
              <span class="stat-lbl">{t('stats.avgMoves')}</span>
            </div>
          </div>
        </section>

        {/* Секция: Последние игры */}
        <section class="card stats-card">
          <h3>{t('stats.recent')}</h3>
          {stats.value.recent.length === 0 ? (
            <p class="empty-text">{t('stats.empty')}</p>
          ) : (
            <ul class="recent-list">
              {stats.value.recent.map((g, i) => (
                <li key={i} class={`recent-item ${g.won ? 'won' : 'lost'}`}>
                  <span class="recent-mode">
                    {g.mode === 'solo' ? t('stats.mode.solo') : t('stats.mode.computer')}
                  </span>
                  <span class="recent-preset">
                    {g.preset === 'classic'
                      ? t('preset.classic')
                      : g.preset === 'hard'
                        ? t('preset.hard')
                        : g.preset === 'custom'
                          ? t('preset.custom')
                          : g.preset}
                  </span>
                  <span class="recent-outcome">
                    {g.won ? `✓ ${g.attempts} ${t('duel.moves', { n: g.attempts })}` : `✗ ${t('stats.loss')}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div class="stats-footer-actions">
          <button
            type="button"
            class="btn btn-danger btn-sm"
            onClick={() => setConfirmReset(true)}
          >
            🗑️ {t('stats.reset')}
          </button>
        </div>
      </main>

      {confirmReset && (
        <div class="modal-overlay" role="dialog" aria-modal="true">
          <div class="modal-card">
            <p>{t('stats.resetConfirm')}</p>
            <div class="modal-actions">
              <button type="button" class="btn btn-danger" onClick={handleReset}>
                {t('common.yes')}
              </button>
              <button type="button" class="btn" onClick={() => setConfirmReset(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
