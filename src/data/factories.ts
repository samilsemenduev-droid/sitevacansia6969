import type { Vacancy, VacancyDetail, VacancyIconId } from '@/types';
import { newId } from '@/utils/id';

export function emptyVacancyDetail(): VacancyDetail {
  return {
    premiumLead: 'Премиальный лид для {город}.',
    workDescription: '',
    pay: '',
    details: '',
    conditions: '',
    schedule: '',
    requirements: '',
    faq: [
      { id: 'faq-0', question: 'Вопрос', answer: 'Ответ' },
      { id: 'faq-1', question: '', answer: '' },
    ],
    telegramUrl: '',
    imageUrl: '',
  };
}

export function createNewVacancy(nextOrder: number): Vacancy {
  return {
    id: newId('vac'),
    slug: `role-${Date.now()}`,
    title: 'Новая роль',
    iconId: 'courier' as VacancyIconId,
    shortDescription: 'Краткое описание для карточки.',
    order: nextOrder,
    enabled: true,
    baseDetail: emptyVacancyDetail(),
    cityOverrides: {},
  };
}
