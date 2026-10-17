import { render } from 'preact';
import { App } from './app';
import { initPwa } from './pwa';
import { initAnalytics, trackPwaInstalled, trackScreenView } from './data/analytics';
import { route } from './router';
import { settings, stats } from './store';
import './ui/styles/main.css';

// Инициализация Service Worker для PWA
initPwa();

// Инициализация аналитики (GA4)
initAnalytics(settings.value, stats.value);

// Отслеживание смены экранов (route.subscribe вызывается сразу с текущим экраном и при каждой навигации)
if (typeof window !== 'undefined') {
  route.subscribe((r) => {
    trackScreenView(r, settings.value);
  });

  window.addEventListener('appinstalled', () => {
    trackPwaInstalled(settings.value);
  });
}

// Запрос на сохранение данных в браузере (чтобы Safari/Chrome не удаляли статистику)
if (typeof navigator !== 'undefined' && 'storage' in navigator && typeof navigator.storage?.persist === 'function') {
  navigator.storage.persist().catch(() => {
    // игнорируем ошибку
  });
}

const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
