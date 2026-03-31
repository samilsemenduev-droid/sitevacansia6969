/**
 * Заготовка под аналитику кликов (Яндекс.Метрика, GA, собственный бэкенд).
 * Сейчас в dev пишет в консоль; в проде замените реализацию.
 */
export function trackEvent(name: string, payload?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, payload ?? {});
  }
}
