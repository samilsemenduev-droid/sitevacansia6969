import { formatApplicationMessage } from '../../functions/lib/formatApplicationMessage.js';

export { formatApplicationMessage };

const TELEGRAM_SEND_TIMEOUT_MS = 25_000;

/**
 * Отправка текста в Telegram Bot API (серверная сторона, токен только в env).
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы в .env');
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
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
      signal: AbortSignal.timeout(TELEGRAM_SEND_TIMEOUT_MS),
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'TimeoutError') {
      throw new Error('Таймаут при обращении к Telegram. Попробуйте позже.');
    }
    throw new Error('Не удалось связаться с Telegram. Проверьте сеть или повторите позже.');
  }

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
    error_code?: number;
  };

  if (!res.ok || !data.ok) {
    const code = typeof data.error_code === 'number' ? ` (${data.error_code})` : '';
    const msg = (data.description && String(data.description).trim()) || res.statusText || 'Telegram API error';
    throw new Error(`Telegram: ${msg}${code}`);
  }
}
