import { CONTACT_TELEGRAM_URL } from '@/config/contactTelegram';
import type { City, SiteContent, Vacancy, VacancyDetail } from '@/types';
import { deepMerge } from '@/utils/deepMerge';
import { applyCityPlaceholders } from '@/utils/placeholders';

function mapStringsInDetail(d: Partial<VacancyDetail>, cityName: string): VacancyDetail {
  const faq = Array.isArray(d.faq) ? d.faq : [];
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    premiumLead: applyCityPlaceholders(str(d.premiumLead), cityName),
    workDescription: applyCityPlaceholders(str(d.workDescription), cityName),
    pay: applyCityPlaceholders(str(d.pay), cityName),
    details: applyCityPlaceholders(str(d.details), cityName),
    conditions: applyCityPlaceholders(str(d.conditions), cityName),
    schedule: applyCityPlaceholders(str(d.schedule), cityName),
    requirements: applyCityPlaceholders(str(d.requirements), cityName),
    faq: faq.map((f, i) => ({
      id: typeof f?.id === 'string' ? f.id : `faq-${i}`,
      question: applyCityPlaceholders(str(f?.question), cityName),
      answer: applyCityPlaceholders(str(f?.answer), cityName),
    })),
    telegramUrl: str(d.telegramUrl),
    imageUrl: str(d.imageUrl),
  };
}

export function resolveVacancyDetail(
  vacancy: Vacancy,
  city: City,
  site: SiteContent
): VacancyDetail {
  const patch = vacancy.cityOverrides?.[city.id] ?? {};
  const baseRaw = vacancy.baseDetail;
  const baseRecord: Record<string, unknown> =
    baseRaw != null && typeof baseRaw === 'object' && !Array.isArray(baseRaw)
      ? (baseRaw as Record<string, unknown>)
      : {};
  const merged = deepMerge(
    baseRecord,
    patch as unknown as Record<string, unknown>
  ) as unknown as Partial<VacancyDetail>;
  if (patch.faq && Array.isArray(patch.faq)) {
    merged.faq = patch.faq;
  }
  const tg =
    merged.telegramUrl?.trim() || site.defaultTelegramUrl?.trim() || CONTACT_TELEGRAM_URL;
  merged.telegramUrl = tg;
  return mapStringsInDetail(merged, city.name);
}
