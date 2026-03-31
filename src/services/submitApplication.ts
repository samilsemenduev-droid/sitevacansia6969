export type ApplicationPayload = {
  name: string;
  phone: string;
  cityId: string;
  cityName: string;
  telegramUsername: string;
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

function apiUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  return base ? `${base}/api/applications` : '/api/applications';
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
  } catch {
    return {
      ok: false,
      error: import.meta.env.DEV
        ? 'Нет соединения с сервером. Проверьте, что API запущен (npm run dev:server).'
        : 'Не удалось отправить заявку. Проверьте подключение к интернету и попробуйте снова.',
    };
  }

  let data: { ok?: boolean; error?: string; sentAt?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* empty */
  }

  if (res.ok && data.ok === true && typeof data.sentAt === 'string') {
    return { ok: true, sentAt: data.sentAt };
  }

  const fromBody =
    typeof data.error === 'string' && data.error.trim() ? data.error.trim() : '';

  const err =
    fromBody ||
    (res.status === 400
      ? 'Проверьте поля формы.'
      : res.status === 502
        ? 'Сервер не смог доставить заявку в Telegram. Попробуйте позже.'
        : 'Не удалось отправить заявку. Попробуйте позже.');

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
