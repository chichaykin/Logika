import { render } from 'preact';
import { App } from './app';
import { initPwa } from './pwa';
import { initAnalytics, trackPwaInstalled, trackScreenView } from './data/analytics';
import { cleanLangParamFromUrl, parseLangFromSearch, refreshGamesCatalog } from './data/gamesCatalog';
import { route } from './router';
import { settings, stats, updateSettings } from './store';
import './ui/styles/main.css';

// Синхронизация языка по query-параметру ?lang=ru|en при переходе из других игр коллекции
if (typeof window !== 'undefined') {
  const urlLang = parseLangFromSearch(window.location.search);
  if (urlLang) {
    if (settings.value.lang !== urlLang) {
      updateSettings({ lang: urlLang });
    }
    cleanLangParamFromUrl();
  }
  void refreshGamesCatalog();
}

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
