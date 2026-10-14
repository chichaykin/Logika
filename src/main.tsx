import { render } from 'preact';
import { App } from './app';
import { initPwa } from './pwa';
import './ui/styles/main.css';

// Инициализация Service Worker для PWA
initPwa();

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
