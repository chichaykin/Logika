import { signal } from '@preact/signals';
import { registerSW } from 'virtual:pwa-register';

export const needRefresh = signal(false);
export const offlineReady = signal(false);

let doUpdate: ((reload?: boolean) => Promise<void>) | null = null;

/** Регистрирует Service Worker (офлайн + уведомление об обновлении). */
export function initPwa(): void {
  doUpdate = registerSW({
    onNeedRefresh() {
      needRefresh.value = true;
    },
    onOfflineReady() {
      offlineReady.value = true;
      setTimeout(() => (offlineReady.value = false), 4000);
    },
  });
}

export function applyUpdate(): void {
  void doUpdate?.(true);
}
