import type { PresetId } from '../../core/config';
import type { FeedbackMode } from '../../game/computerGame';
import { t } from '../../i18n';
import { navigate } from '../../router';
import { settings, updateSettings } from '../../store';
import { playMarbleDrop } from '../sound/sound';

export function Settings() {
  const current = settings.value;

  const handlePresetChange = (preset: PresetId) => {
    updateSettings({ preset });
  };

  const handleCustomChange = (patch: Partial<typeof current.custom>) => {
    const raw = { ...current.custom, ...patch };
    updateSettings({
      custom: {
        length: Math.min(5, Math.max(4, Number(raw.length) || 4)),
        colors: Math.min(8, Math.max(6, Number(raw.colors) || 6)),
        maxAttempts: Math.min(20, Math.max(4, Number(raw.maxAttempts) || 10)),
        repeats: Boolean(raw.repeats),
      },
    });
  };

  return (
    <div class="screen screen-settings">
      <header class="game-header">
        <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
          ← {t('common.menu')}
        </button>
        <h2>{t('settings.title')}</h2>
        <div style={{ width: 40 }} />
      </header>

      <main class="settings-content">
        {/* Тема оформления */}
        <section class="card settings-section">
          <h3>{t('settings.theme')}</h3>
          <div class="theme-grid">
            <button
              type="button"
              class={`btn theme-btn ${current.theme === 'luxe' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ theme: 'luxe' })}
            >
              <span class="theme-dot dot-luxe" aria-hidden="true" />
              <span>{t('settings.themeLuxe')}</span>
            </button>
            <button
              type="button"
              class={`btn theme-btn ${current.theme === 'slate' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ theme: 'slate' })}
            >
              <span class="theme-dot dot-slate" aria-hidden="true" />
              <span>{t('settings.themeSlate')}</span>
            </button>
            <button
              type="button"
              class={`btn theme-btn ${current.theme === 'travertine' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ theme: 'travertine' })}
            >
              <span class="theme-dot dot-travertine" aria-hidden="true" />
              <span>{t('settings.themeTravertine')}</span>
            </button>
            <button
              type="button"
              class={`btn theme-btn ${current.theme === 'emerald' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ theme: 'emerald' })}
            >
              <span class="theme-dot dot-emerald" aria-hidden="true" />
              <span>{t('settings.themeEmerald')}</span>
            </button>
            <button
              type="button"
              class={`btn theme-btn ${current.theme === 'retro' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ theme: 'retro' })}
            >
              <span class="theme-dot dot-retro" aria-hidden="true" />
              <span>{t('settings.themeRetro')}</span>
            </button>
          </div>
        </section>

        {/* Язык */}
        <section class="card settings-section">
          <h3>{t('settings.language')}</h3>
          <div class="btn-group">
            <button
              type="button"
              class={`btn ${current.lang === 'auto' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ lang: 'auto' })}
            >
              {t('settings.langAuto')}
            </button>
            <button
              type="button"
              class={`btn ${current.lang === 'ru' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ lang: 'ru' })}
            >
              Русский
            </button>
            <button
              type="button"
              class={`btn ${current.lang === 'en' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ lang: 'en' })}
            >
              English
            </button>
          </div>
        </section>

        {/* Доступность и отклик */}
        <section class="card settings-section">
          <label class="setting-row">
            <span>{t('settings.colorblind')}</span>
            <input
              type="checkbox"
              class="toggle-checkbox"
              checked={current.colorblind}
              onChange={(e) => updateSettings({ colorblind: (e.target as HTMLInputElement).checked })}
            />
          </label>

          <label class="setting-row">
            <span>{t('settings.vibration')}</span>
            <input
              type="checkbox"
              class="toggle-checkbox"
              checked={current.vibration}
              onChange={(e) => updateSettings({ vibration: (e.target as HTMLInputElement).checked })}
            />
          </label>

          <label class="setting-row">
            <div>
              <span>{t('settings.sound')}</span>
              <div class="setting-desc" style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '2px' }}>
                {t('settings.soundDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              class="toggle-checkbox"
              checked={current.sound}
              onChange={(e) => {
                const nextVal = (e.target as HTMLInputElement).checked;
                updateSettings({ sound: nextVal });
                if (nextVal) playMarbleDrop(0, 0);
              }}
            />
          </label>

          <label class="setting-row">
            <div>
              <span>{t('settings.analytics')}</span>
              <div class="setting-desc" style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '2px' }}>
                {t('settings.analyticsDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              class="toggle-checkbox"
              checked={current.analytics}
              onChange={(e) => updateSettings({ analytics: (e.target as HTMLInputElement).checked })}
            />
          </label>
        </section>

        {/* Режим подсказок для компьютера */}
        <section class="card settings-section">
          <h3>{t('settings.feedbackMode')}</h3>
          <div class="btn-group">
            <button
              type="button"
              class={`btn ${current.feedbackMode === 'manual' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ feedbackMode: 'manual' as FeedbackMode })}
            >
              {t('settings.keysManual')}
            </button>
            <button
              type="button"
              class={`btn ${current.feedbackMode === 'auto' ? 'btn-primary' : ''}`}
              onClick={() => updateSettings({ feedbackMode: 'auto' as FeedbackMode })}
            >
              {t('settings.keysAuto')}
            </button>
          </div>
        </section>

        {/* Сложность */}
        <section class="card settings-section">
          <h3>{t('settings.difficulty')}</h3>
          <div class="btn-group">
            <button
              type="button"
              class={`btn ${current.preset === 'classic' ? 'btn-primary' : ''}`}
              onClick={() => handlePresetChange('classic')}
            >
              {t('preset.classic')} (4×6)
            </button>
            <button
              type="button"
              class={`btn ${current.preset === 'hard' ? 'btn-primary' : ''}`}
              onClick={() => handlePresetChange('hard')}
            >
              {t('preset.hard')} (5×8)
            </button>
            <button
              type="button"
              class={`btn ${current.preset === 'custom' ? 'btn-primary' : ''}`}
              onClick={() => handlePresetChange('custom')}
            >
              {t('preset.custom')}
            </button>
          </div>

          {current.preset === 'custom' && (
            <div class="custom-config-fields">
              <label class="config-field">
                <span>{t('settings.length')} (4–5):</span>
                <input
                  type="number"
                  min="4"
                  max="5"
                  value={current.custom.length}
                  onChange={(e) =>
                    handleCustomChange({ length: Number((e.target as HTMLInputElement).value) })
                  }
                />
              </label>

              <label class="config-field">
                <span>{t('settings.colors')} (6–8):</span>
                <input
                  type="number"
                  min="6"
                  max="8"
                  value={current.custom.colors}
                  onChange={(e) =>
                    handleCustomChange({ colors: Number((e.target as HTMLInputElement).value) })
                  }
                />
              </label>

              <label class="config-field">
                <span>{t('settings.attempts')} (4–20):</span>
                <input
                  type="number"
                  min="4"
                  max="20"
                  value={current.custom.maxAttempts}
                  onChange={(e) =>
                    handleCustomChange({ maxAttempts: Number((e.target as HTMLInputElement).value) })
                  }
                />
              </label>

              <label class="setting-row">
                <span>{t('settings.repeats')}</span>
                <input
                  type="checkbox"
                  class="toggle-checkbox"
                  checked={current.custom.repeats}
                  onChange={(e) =>
                    handleCustomChange({ repeats: (e.target as HTMLInputElement).checked })
                  }
                />
              </label>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
