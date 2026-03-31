import type { City, SiteContent, Vacancy, VacancyDetail } from '@/types';
import { deepMerge } from '@/utils/deepMerge';
import { applyCityPlaceholders } from '@/utils/placeholders';

function mapStringsInDetail(d: VacancyDetail, cityName: string): VacancyDetail {
  return {
    ...d,
    premiumLead: applyCityPlaceholders(d.premiumLead, cityName),
    workDescription: applyCityPlaceholders(d.workDescription, cityName),
    pay: applyCityPlaceholders(d.pay, cityName),
    details: applyCityPlaceholders(d.details, cityName),
    conditions: applyCityPlaceholders(d.conditions, cityName),
    schedule: applyCityPlaceholders(d.schedule, cityName),
    requirements: applyCityPlaceholders(d.requirements, cityName),
    faq: d.faq.map((f) => ({
      ...f,
      question: applyCityPlaceholders(f.question, cityName),
      answer: applyCityPlaceholders(f.answer, cityName),
    })),
    telegramUrl: d.telegramUrl,
    imageUrl: d.imageUrl,
  };
}

export function resolveVacancyDetail(
  vacancy: Vacancy,
  city: City,
  site: SiteContent
): VacancyDetail {
  const patch = vacancy.cityOverrides[city.id] ?? {};
  const merged = deepMerge(
    vacancy.baseDetail as unknown as Record<string, unknown>,
    patch as unknown as Record<string, unknown>
  ) as unknown as VacancyDetail;
  if (patch.faq && Array.isArray(patch.faq)) {
    merged.faq = patch.faq;
  }
  const tg =
    merged.telegramUrl?.trim() || site.defaultTelegramUrl?.trim() || 'https://t.me/';
  merged.telegramUrl = tg;
  return mapStringsInDetail(merged, city.name);
}
