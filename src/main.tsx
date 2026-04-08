import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { SiteDataProvider } from './context/SiteDataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './styles/index.css';

/**
 * HashRouter матчит путь из hash. Пустой hash → часто нет совпадения с `path="/"` → пустой экран.
 */
function ensureHashRouterEntry(): void {
  if (typeof window === 'undefined') return;
  try {
    const h = window.location.hash;
    if (h === '' || h === '#') {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#/`
      );
    }
  } catch (e) {
    console.error('[vacansia] bootstrap: ensureHashRouterEntry failed', e);
  }
}

ensureHashRouterEntry();

if (import.meta.env.DEV) {
  console.info('[vacansia] bootstrap: start');
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[vacansia] bootstrap: #root not found');
  document.body.textContent = 'Ошибка: в разметке нет элемента #root.';
} else {
  if (import.meta.env.DEV) {
    console.info('[vacansia] bootstrap: #root ok, render');
  }
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
  if (import.meta.env.DEV) {
    console.info('[vacansia] bootstrap: createRoot().render invoked');
  }
}
