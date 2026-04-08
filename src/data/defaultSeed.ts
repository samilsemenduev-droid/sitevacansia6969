import { CONTACT_TELEGRAM_URL } from '@/config/contactTelegram';
import type { City, SiteData, Vacancy, VacancyDetail } from '@/types';
import { SEED_CITY_NAMES } from './cityNames';

/** Ссылка на площадку (карточка «Перейти на сайт»). */
export const SITE_PLATFORM_URL = 'http://hrs.best';

function faq(items: { q: string; a: string }[]): VacancyDetail['faq'] {
  return items.map((it, i) => ({
    id: `faq-${i}`,
    question: it.q,
    answer: it.a,
  }));
}

function detailCourier(): VacancyDetail {
  return {
    premiumLead:
      '{Город}: пеший курьер — бесконтактная доставка, без продаж и личных встреч с получателями.',
    workDescription:
      'Товар уже расфасован и упакован. Нужно доставить и разложить по согласованным локациям в течение смены и предоставить отчёт о проделанной работе. Формат и маршруты согласовываются с куратором.',
    pay:
      'От 5 000 до 10 000 ₽ в день в зависимости от объёма и города. Бонусы за стабильную работу. Выплаты по согласованному графику; при необходимости компенсируем проезд и мелкие расходы.',
    details: 'Куратор объясняет формат и гибкий график. Всё через отчётность и связь в чате.',
    conditions: 'Договорные условия, выплаты по согласованному графику.',
    schedule: 'Гибкий график, без жёсткой привязки ко времени — детали у куратора.',
    requirements: 'Смартфон для связи и отчёта, ответственность; при необходимости обучим на старте.',
    faq: faq([
      { q: 'Нужно что‑то продавать?', a: 'Нет, только доставка и раскладка по точкам, без встреч с получателями.' },
      { q: 'Вакансия актуальна?', a: 'Да — уточняйте свободные слоты у куратора в Telegram.' },
    ]),
    telegramUrl: CONTACT_TELEGRAM_URL,
    imageUrl: '',
  };
}

function detailCarrier(): VacancyDetail {
  return {
    premiumLead: '{Город}: перевозка по маршруту. Обучаем безопасной схеме ведения рейсов.',
    workDescription:
      'Перевозка груза между точками по внутреннему регламенту. На старте — пошаговое обучение работе с автомобилем и грузом с учётом безопасности и требований маршрута.',
    pay:
      'От 10 000 до 20 000 ₽ в день в зависимости от рейса и загрузки. Зарплата по согласованному графику. Расходы во время поездок по регламенту компании.',
    details: 'Постоянные направления для проверенных водителей; подробности — при созвоне.',
    conditions: 'Оформление и выплаты по регламенту компании.',
    schedule: 'Рейсы и смены согласовываются индивидуально.',
    requirements: 'Права подходящей категории, исправное ТС (класс уточняется при найме).',
    faq: faq([
      { q: 'Когда выплаты?', a: 'По согласованному графику — уточняет куратор.' },
      { q: 'Расходы в дороге?', a: 'Компенсируем по регламенту — всё фиксируем заранее.' },
    ]),
    telegramUrl: CONTACT_TELEGRAM_URL,
    imageUrl: '',
  };
}

function buildCities(): City[] {
  return SEED_CITY_NAMES.map((name, index) => ({
    id: `city_${index}`,
    name,
    enabled: true,
    order: index,
  }));
}

function buildVacancies(): Vacancy[] {
  const list: Omit<Vacancy, 'order'>[] = [
    {
      id: 'courier',
      slug: 'courier',
      title: 'Пеший курьер',
      iconId: 'courier',
      shortDescription: 'От 5 000–10 000 ₽ в день. Бесконтактная доставка, гибкий график.',
      enabled: true,
      baseDetail: detailCourier(),
      cityOverrides: {},
    },
    {
      id: 'carrier',
      slug: 'carrier',
      title: 'Водитель',
      iconId: 'carrier',
      shortDescription: 'От 10 000–20 000 ₽ в день. Расходы в пути по регламенту.',
      enabled: true,
      baseDetail: detailCarrier(),
      cityOverrides: {},
    },
  ];
  return list.map((v, order) => ({ ...v, order }));
}

export function getDefaultSiteData(): SiteData {
  return {
    version: 1,
    cities: buildCities(),
    vacancies: buildVacancies(),
    site: {
      heroBadge: 'Набор открыт',
      heroTitle: 'Смены с нормальной оплатой',
      heroSubtitle: 'Город, направление, заявка — дальше созвонимся и договоримся.',
      reviewsChannelUrl: 'https://t.me/your_reviews_channel',
      platformUrl: SITE_PLATFORM_URL,
      defaultTelegramUrl: CONTACT_TELEGRAM_URL,
      applySectionTitle: 'Оставить заявку',
      applySectionSubtitle: 'Имя и телефон — перезвоним в рабочее время.',
      footerNote:
        'Контент сайта и журнал заявок хранятся в браузере на этом устройстве. Заявки отправляются на сервер и доставляются в Telegram.',
    },
  };
}
