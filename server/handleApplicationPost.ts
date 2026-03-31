import { formatApplicationMessage, sendTelegramMessage } from './services/telegram.js';

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

export type ApplicationPostResult = {
  status: number;
  json: { ok: true; sentAt: string } | { ok: false; error: string };
};

/**
 * Общая логика POST /api/applications: валидация, Telegram, JSON-ответ.
 * Используется Express (локально) и Vercel Function.
 */
export async function handleApplicationPost(body: unknown): Promise<ApplicationPostResult> {
  try {
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
      return {
        status: 400,
        json: { ok: false, error: 'Заполните имя, телефон, город и вакансию.' },
      };
    }

    if (telegramUsername && !isTelegramUsernamePlausible(telegramUsername)) {
      return {
        status: 400,
        json: {
          ok: false,
          error:
            'Укажите корректный username Telegram: латиница, 5–32 символа, начинается с буквы.',
        },
      };
    }

    if (!isPhonePlausible(phone)) {
      return {
        status: 400,
        json: { ok: false, error: 'Укажите корректный номер телефона (минимум 10 цифр).' },
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

    const textWithMeta =
      userAgent && userAgent.length > 0 ? `${text}\n\nUser-Agent: ${userAgent}` : text;

    await sendTelegramMessage(textWithMeta);

    return {
      status: 200,
      json: { ok: true, sentAt: new Date().toISOString() },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('[applications]', message);
    const safe =
      /TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID|не заданы в|\.env\b/i.test(message)
        ? 'Сервис временно недоступен. Попробуйте позже.'
        : message;
    return { status: 502, json: { ok: false, error: safe } };
  }
}
