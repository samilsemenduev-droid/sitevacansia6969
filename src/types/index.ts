export type FaqItem = { id: string; question: string; answer: string };

export type VacancyDetail = {
  premiumLead: string;
  workDescription: string;
  pay: string;
  details: string;
  conditions: string;
  schedule: string;
  requirements: string;
  faq: FaqItem[];
  telegramUrl: string;
  imageUrl: string;
};

export type VacancyIconId = 'courier' | 'carrier' | 'graffiti';

export type Vacancy = {
  id: string;
  slug: string;
  title: string;
  iconId: VacancyIconId;
  shortDescription: string;
  order: number;
  enabled: boolean;
  baseDetail: VacancyDetail;
  /** Ключ — id города; частичное переопределение полей карточки */
  cityOverrides: Record<string, Partial<VacancyDetail>>;
};

export type City = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
};

export type SiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  reviewsChannelUrl: string;
  platformUrl: string;
  /** Общая ссылка «Связаться», если нет переопределения у вакансии */
  defaultTelegramUrl: string;
  applySectionTitle: string;
  applySectionSubtitle: string;
  footerNote: string;
};

export type SiteData = {
  version: 1;
  cities: City[];
  vacancies: Vacancy[];
  site: SiteContent;
};

/** Статус доставки заявки (локальный журнал + отражение ответа API). */
export type ApplicationStatus = 'pending' | 'sent' | 'failed';

/**
 * Локальная запись заявки (localStorage): сначала pending, после ответа API — sent | failed.
 * Дублирует полезную нагрузку, отправляемую на POST /api/applications.
 */
export type JobApplication = {
  id: string;
  name: string;
  phone: string;
  cityName: string;
  /** @username в Telegram (без ведущего @). */
  telegramUsername: string;
  vacancyId: string;
  vacancyTitle: string;
  comment: string;
  createdAt: string;
  sentAt?: string;
  status: ApplicationStatus;
  errorMessage?: string;
  /** Совпадает с status === 'sent' после успешного ответа API. */
  telegramDelivered: boolean;
  /** Технический id города UI (карточки); текст города в заявке — cityName. */
  cityId: string;
  /** URL страницы отправки — попадает в «Источник» в Telegram. */
  sourceUrl?: string;
};
