import { t } from '../../i18n';
import { applyUpdate, needRefresh, offlineReady } from '../../pwa';

export function UpdateToast() {
  if (needRefresh.value) {
    return (
      <div class="update-toast" role="alert">
        <span>{t('update.available')}</span>
        <button type="button" class="btn btn-sm btn-primary" onClick={applyUpdate}>
          {t('update.reload')}
        </button>
      </div>
    );
  }

  if (offlineReady.value) {
    return (
      <div class="update-toast offline-toast" role="status">
        <span>{t('offline.ready')}</span>
      </div>
    );
  }

  return null;
}
