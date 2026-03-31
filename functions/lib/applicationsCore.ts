/**
 * Логика POST /api/applications для Cloudflare Pages Functions (fetch + context.env).
 */

import { formatApplicationMessage } from './formatApplicationMessage';

export type ApplicationPostResult = {
  status: number;
  json:
    | { ok: true; sentAt: string }
    | { ok: false; error: string; code?: string };
};

type Body = {
  name?: unknown;
  phone?: unknown;
  cityId?: unknown;
  cityName?: unknown;
  telegramUsername?: unknown;
  vacancyId?: unknown;
  vacancyTitle?: unknown;
  comment?: unknown;
  submittedAt?: unknown;
  sourceUrl?: unknown;
  userAgent?: unknown;
};

export type TelegramEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

const TELEGRAM_SEND_TIMEOUT_MS = 25_000;

function trimStr(v: unknown, max = 2000): string {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  return s.length > max ? s.slice(0, max) : s;
}

function isPhonePlausible(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

function normalizeTelegramUsername(input: string): string {
  let s = input.trim();
  if (s.startsWith('@')) s = s.slice(1).trim();
  return s;
}

function isTelegramUsernamePlausible(input: string): boolean {
  const u = normalizeTelegramUsername(input);
  return /^[a-zA-Z][a-zA-Z0-9_]{3,30}$/.test(u);
}

async function sendTelegramMessageCf(token: string, chatId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TELEGRAM_SEND_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Таймаут при обращении к Telegram. Попробуйте позже.');
    }
    throw new Error('Не удалось связаться с Telegram. Проверьте сеть или повторите позже.');
  } finally {
    clearTimeout(timer);
  }

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
    error_code?: number;
  };

  if (!res.ok || !data.ok) {
    const code = typeof data.error_code === 'number' ? ` (${data.error_code})` : '';
    const msg = (data.description && String(data.description).trim()) || res.statusText || 'Telegram API error';
    console.error('[cf-applications] Telegram API not ok', { status: res.status, error_code: data.error_code });
    throw new Error(`Telegram: ${msg}${code}`);
  }
}

export async function handleApplicationPostCf(
  body: unknown,
  env: TelegramEnv
): Promise<ApplicationPostResult> {
  try {
    const token = env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = env.TELEGRAM_CHAT_ID?.trim();
    if (!token || !chatId) {
      console.error(
        '[cf-applications] MISSING_TELEGRAM_ENV: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в Cloudflare Pages → Settings → Environment variables (Production и Preview при необходимости). Токен не должен иметь префикс VITE_.'
      );
      return {
        status: 503,
        json: {
          ok: false,
          error:
            'Заявки не доставляются в Telegram: в настройках Cloudflare Pages не заданы TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID.',
          code: 'MISSING_TELEGRAM_ENV',
        },
      };
    }

    const b = body as Body;

    const name = trimStr(b.name, 200);
    const phone = trimStr(b.phone, 40);
    const cityName = trimStr(b.cityName, 120);
    const telegramUsername = normalizeTelegramUsername(trimStr(b.telegramUsername, 64));
    const vacancyId = trimStr(b.vacancyId, 80);
    const vacancyTitle = trimStr(b.vacancyTitle, 200);
    const comment = trimStr(b.comment, 2000);
    const sourceUrl = trimStr(b.sourceUrl, 500) || undefined;
    const userAgent = trimStr(b.userAgent, 500) || undefined;

    const rawDate = b.submittedAt ? new Date(String(b.submittedAt)) : new Date();
    const submittedAt = Number.isNaN(rawDate.getTime())
      ? new Date().toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : rawDate.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

    if (!name || !phone || !cityName || !vacancyTitle) {
      console.error('[cf-applications] validation failed: required fields', {
        hasName: !!name,
        hasPhone: !!phone,
        hasCity: !!cityName,
        hasVacancyTitle: !!vacancyTitle,
      });
      return {
        status: 400,
        json: {
          ok: false,
          error: 'Заполните имя, телефон, город и вакансию.',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (telegramUsername && !isTelegramUsernamePlausible(telegramUsername)) {
      console.error('[cf-applications] validation failed: telegram username');
      return {
        status: 400,
        json: {
          ok: false,
          error:
            'Укажите корректный username Telegram: латиница, 5–32 символа, начинается с буквы.',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (!isPhonePlausible(phone)) {
      console.error('[cf-applications] validation failed: phone');
      return {
        status: 400,
        json: {
          ok: false,
          error: 'Укажите корректный номер телефона (минимум 10 цифр).',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const text = formatApplicationMessage({
      name,
      phone,
      cityName,
      vacancyTitle,
      comment,
      submittedAt,
      sourceLabel: 'Сайт вакансий',
      sourceUrl,
      telegramUsername: telegramUsername || undefined,
      vacancyId: vacancyId || undefined,
    });

    let textWithMeta =
      userAgent && userAgent.length > 0 ? `${text}\n\n───\nUser-Agent: ${userAgent}` : text;
    const maxLen = 4000;
    if (textWithMeta.length > maxLen) {
      textWithMeta = `${textWithMeta.slice(0, maxLen - 40)}\n\n…(сообщение обрезано, лимит Telegram)`;
    }

    await sendTelegramMessageCf(token, chatId, textWithMeta);
    console.log('[cf-applications] telegram send ok');

    return {
      status: 200,
      json: { ok: true, sentAt: new Date().toISOString() },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('[cf-applications] handler error', message);
    const isConfigHint = /TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID|не заданы в|\.env\b/i.test(message);
    const safe = isConfigHint
      ? 'На сервере не настроены TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID (Cloudflare Pages → Environment variables).'
      : message;
    const code = isConfigHint ? 'MISSING_TELEGRAM_ENV' : 'TELEGRAM_OR_NETWORK_ERROR';
    return { status: 502, json: { ok: false, error: safe, code } };
  }
}
