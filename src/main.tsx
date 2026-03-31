import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { SiteDataProvider } from './context/SiteDataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './styles/index.css';

/**
 * HashRouter сопоставляет маршруты с hash. При открытии `https://хост/` hash пустой —
 * в частых конфигурациях RR6 не матчит `path="/"`, экран остаётся пустым. Явно ставим `#/`.
 */
function ensureHashRouterEntry(): void {
  if (typeof window === 'undefined') return;
  const h = window.location.hash;
  if (h === '' || h === '#') {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
  }
}

ensureHashRouterEntry();
console.info('[vacansia] bootstrap: start');

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[vacansia] bootstrap: #root not found');
  document.body.textContent = 'Ошибка: в разметке нет элемента #root.';
} else {
  console.info('[vacansia] bootstrap: #root ok, render');
  queueMicrotask(() => console.info('[vacansia] bootstrap: microtask after schedule (проверка, что main.tsx дошёл до конца)'));
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <SiteDataProvider>
            <App />
          </SiteDataProvider>
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>
  );
  console.info('[vacansia] bootstrap: createRoot().render invoked');
}
