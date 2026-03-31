export type ApplicationPayload = {
  name: string;
  phone: string;
  cityId: string;
  cityName: string;
  /** Опционально: если пусто, сервер всё равно примет заявку. */
  telegramUsername?: string;
  vacancyId: string;
  vacancyTitle: string;
  comment: string;
  submittedAt: string;
  sourceUrl?: string;
  userAgent?: string;
};

export type SubmitApplicationResult =
  | { ok: true; sentAt: string }
  | { ok: false; error: string; statusCode?: number };

/**
 * В проде: тот же origin + Vite BASE_URL (важно для деплоя в подкаталог).
 * VITE_API_BASE_URL — только в dev, чтобы не утащить localhost в билд.
 */
function apiUrl(): string {
  if (import.meta.env.DEV) {
    const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
    if (base) {
      return `${base}/api/applications`;
    }
  }
  if (typeof window !== 'undefined') {
    const base = import.meta.env.BASE_URL;
    const rel = (base.endsWith('/') ? `${base}api/applications` : `${base}/api/applications`).replace(
      /\/{2,}/g,
      '/'
    );
    return new URL(rel, window.location.origin).href;
  }
  const prefix = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${prefix}/api/applications`;
}

export async function submitApplicationToApi(payload: ApplicationPayload): Promise<SubmitApplicationResult> {
  const url = apiUrl();
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[vacansia] submitApplicationToApi fetch failed', { url, error: e });
    return {
      ok: false,
      error: import.meta.env.DEV
        ? 'Нет соединения с сервером. Проверьте, что API запущен (npm run dev:server).'
        : 'Не удалось отправить заявку. Проверьте подключение к интернету и попробуйте снова.',
    };
  }

  const rawText = await res.text();
  const trimmed = rawText.trimStart();
  if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
    console.error('[vacansia] submitApplicationToApi got HTML instead of JSON', {
      url,
      httpStatus: res.status,
      preview: rawText.slice(0, 500),
    });
    return {
      ok: false,
      error:
        'Сервер вернул страницу вместо API. Проверьте Cloudflare Pages Functions (папка functions/) и public/_routes.json.',
      statusCode: res.status,
    };
  }

  let data: { ok?: boolean; error?: string; sentAt?: string; code?: string } = {};
  if (rawText.length > 0) {
    try {
      data = JSON.parse(rawText) as typeof data;
    } catch (e) {
      console.error('[vacansia] submitApplicationToApi JSON parse failed', {
        url,
        httpStatus: res.status,
        preview: rawText.slice(0, 500),
        error: e,
      });
      return {
        ok: false,
        error: 'Сервер вернул не JSON. Смотрите консоль: [vacansia] submitApplicationToApi JSON parse failed.',
        statusCode: res.status,
      };
    }
  }

  if (res.ok && data.ok === true && typeof data.sentAt === 'string') {
    return { ok: true, sentAt: data.sentAt };
  }

  if (typeof data.code === 'string' && data.code) {
    console.error('[vacansia] submitApplicationToApi API error code', data.code, {
      url,
      httpStatus: res.status,
      error: data.error,
    });
  }

  console.error('[vacansia] submitApplicationToApi unexpected response', {
    url,
    httpStatus: res.status,
    body: data,
    rawLength: rawText.length,
  });

  const fromBody =
    typeof data.error === 'string' && data.error.trim() ? data.error.trim() : '';
  const code = typeof data.code === 'string' ? data.code : '';

  const byCode =
    !fromBody && code === 'MISSING_TELEGRAM_ENV'
      ? 'На сервере не заданы TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID (Cloudflare Pages → Settings → Environment variables).'
      : !fromBody && code === 'TELEGRAM_OR_NETWORK_ERROR'
        ? 'Ошибка при отправке в Telegram или сети. Откройте консоль браузера (F12) — там код [vacansia] с деталями.'
        : '';

  const err =
    fromBody ||
    byCode ||
    (res.status === 404
      ? 'Маршрут API не найден (404). Убедитесь, что в репозитории есть functions/api/applications.ts и в dist попал _routes.json с include: ["/api/*"].'
      : res.status === 400
        ? 'Проверьте поля формы.'
        : res.status === 405
          ? 'Метод не поддерживается (405). Для заявки нужен POST на /api/applications.'
          : res.status === 502 || res.status === 503
            ? 'Сервер не смог отправить заявку в Telegram. Проверьте TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID и логи Functions в Cloudflare.'
            : `Не удалось отправить заявку (HTTP ${res.status}). Попробуйте позже или обновите страницу.`);

  return { ok: false, error: err, statusCode: res.status };
}

export function isPhonePlausible(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/** Убирает ведущий @; пустые строки после trim — пустая строка. */
export function normalizeTelegramUsername(input: string): string {
  let s = input.trim();
  if (s.startsWith('@')) s = s.slice(1).trim();
  return s;
}

/**
 * Публичное имя в Telegram: 5–32 символа, латиница, цифры, _; начинается с буквы.
 */
export function isTelegramUsernamePlausible(input: string): boolean {
  const u = normalizeTelegramUsername(input);
  return /^[a-zA-Z][a-zA-Z0-9_]{3,30}$/.test(u);
}
