import { trackEvent } from '@/lib/analytics';

/** Обёртка для событий аналитики из компонентов */
export function useTrack() {
  return { track: trackEvent };
}
