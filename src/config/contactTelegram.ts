/**
 * Единая ссылка «Связаться» в Telegram (менеджер / куратор).
 * Меняется в одном месте:
 * - переменная окружения VITE_CONTACT_TELEGRAM_URL при сборке (Cloudflare Pages → Environment variables для **Build**), или
 * - значение ниже по умолчанию, или
 * - в админке: «Контент сайта» → Telegram по умолчанию / у вакансии поле «Telegram (связаться)».
 */
const fromEnv = (import.meta.env.VITE_CONTACT_TELEGRAM_URL ?? '').trim();

export const CONTACT_TELEGRAM_URL =
  fromEnv || 'https://t.me/aljeksandra007';
