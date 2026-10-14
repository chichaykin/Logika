import type { PresetId } from '../../core/config';
import type { FeedbackMode } from '../../game/computerGame';
import { t } from '../../i18n';
import { navigate } from '../../router';
import { settings, updateSettings } from '../../store';

export function Settings() {
  const current = settings.value;

  const handlePresetChange = (preset: PresetId) => {
    updateSettings({ preset });
  };

  const handleCustomChange = (patch: Partial<typeof current.custom>) => {
    updateSettings({
      custom: {
        ...current.custom,
        ...patch,
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
