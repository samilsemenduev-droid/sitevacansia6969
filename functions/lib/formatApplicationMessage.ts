/**
 * Текст заявки для Telegram (Express/Vercel и Cloudflare Pages Functions).
 * Лежит внутри functions/lib, чтобы бандлер Pages не тянул модули извне /functions.
 */

export type FormatApplicationMessageInput = {
  name: string;
  phone: string;
  cityName: string;
  vacancyTitle: string;
  comment: string;
  submittedAt: string;
  sourceLabel: string;
  sourceUrl?: string;
  /** Если пусто — в сообщении будет «не указан». */
  telegramUsername?: string;
  /** Опционально, для внутренней нумерации вакансий. */
  vacancyId?: string;
};

export function formatApplicationMessage(payload: FormatApplicationMessageInput): string {
  const commentBlock = payload.comment.trim() ? payload.comment.trim() : '—';
  const sourceLine = payload.sourceUrl
    ? `${payload.sourceLabel}\n${payload.sourceUrl}`
    : payload.sourceLabel;

  const tgRaw = (payload.telegramUsername ?? '').trim();
  const tgLine = tgRaw
    ? tgRaw.startsWith('@')
      ? tgRaw
      : `@${tgRaw}`
    : 'не указан';

  const lines: string[] = [
    'Новая заявка с сайта',
    '────────────────────',
    '',
    `Имя:          ${payload.name}`,
    `Телефон:      ${payload.phone}`,
    `Город:        ${payload.cityName}`,
    `Вакансия:     ${payload.vacancyTitle}`,
  ];

  if (payload.vacancyId) {
    lines.push(`ID вакансии:  ${payload.vacancyId}`);
  }

  lines.push(
    `Telegram:     ${tgLine}`,
    '',
    `Комментарий:`,
    commentBlock,
    '',
    `Дата:         ${payload.submittedAt}`,
    '',
    `Источник:`,
    sourceLine
  );

  return lines.join('\n');
}
