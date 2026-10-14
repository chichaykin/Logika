import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edgios/i.test(ua);
    if (isIosDevice && isSafari) {
      setIsIOS(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (deferredPrompt) {
    return (
      <div class="install-prompt-banner" role="region" aria-label={t('install.button')}>
        <span>{t('install.button')}</span>
        <div class="install-actions">
          <button type="button" class="btn btn-sm btn-primary" onClick={handleInstallClick}>
            {t('install.button')}
          </button>
          <button type="button" class="btn btn-sm" onClick={() => setDismissed(true)}>
            {t('install.dismiss')}
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div class="install-prompt-banner ios-prompt" role="region" aria-label={t('install.ios')}>
        <span>{t('install.ios')}</span>
        <button type="button" class="btn btn-sm" onClick={() => setDismissed(true)}>
          ✕
        </button>
      </div>
    );
  }

  return null;
}
