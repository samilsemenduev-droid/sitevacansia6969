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
      '{Город}: бесконтактная доставка — только развоз, без продаж и личных встреч.',
    workDescription:
      'Товар уже расфасован и упакован. Нужно разложить его по согласованным локациям в течение 6–8 часов после получения и предоставить отчёт о проделанной работе.',
    pay:
      'От 15 000 ₽ в день, от 120 000 ₽ в неделю. Бонусы за честную работу. Выплаты 2 раза в неделю; первая зарплата — на 3-й день работы. При необходимости компенсируем проезд и мелкие расходы.',
    details: 'Куратор объясняет формат и гибкий график. Всё через отчётность и связь в чате.',
    conditions: 'Договорные условия, выплаты по согласованному графику.',
    schedule: 'К жёсткому времени не привязаны — гибкий график, детали у куратора.',
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
    premiumLead: '{Город}: бесконтактная работа по перевозке. Обучаем безопасной схеме ведения рейсов.',
    workDescription:
      'Перевозка груза между точками по внутреннему регламенту. На старте — пошаговое обучение работе с автомобилем и грузом так, чтобы соблюдать безопасность и требования маршрута.',
    pay:
      'Рейсы от 1 000 $. В среднем от 10 000 $ в месяц. Зарплата 2 раза в неделю. Все расходы во время поездок оплачиваем.',
    details: 'Постоянные направления для проверенных водителей; подробности — при созвоне.',
    conditions: 'Оформление и выплаты по регламенту компании.',
    schedule: 'Рейсы и смены согласовываются индивидуально.',
    requirements: 'Права подходящей категории, исправное ТС (класс уточняется при найме).',
    faq: faq([
      { q: 'Когда выплаты?', a: 'Два раза в неделю по согласованному графику.' },
      { q: 'Расходы в дороге?', a: 'Компенсируем по регламенту — всё фиксируем заранее.' },
    ]),
    telegramUrl: CONTACT_TELEGRAM_URL,
    imageUrl: '',
  };
}

function detailGraffiti(): VacancyDetail {
  const surveyCam =
    'https://play.google.com/store/apps/details?id=com.gps.survey.cam&hl=ru&gl=US';
  return {
    premiumLead: '{Город}: вакансия граффитчика — оплата после проверки качества.',
    workDescription:
      'Нанесение граффити по заданию. На каждом фото должны быть координаты (геометка). Работа должна быть чёткой и разборчивой. Минимальное расстояние между граффити — 70–100 м.',
    pay:
      '100–150 ₽ за одно граффити. Выплата только на кошелёк BTC. Важно: выплата начисляется только после проверки и от 25 граффити (минимальный порог для вывода).',
    details:
      `Стоимость баллончиков возмещаем после предоставления чека; без чека возврат не делаем. Дубли или чужие работы не оплачиваются. Приложения для съёмки: iPhone — GPS Camera 55; Android — SurveyCam (GPS камера): ${surveyCam}`,
    conditions:
      'Если видно, что граффити не ваши или есть дубли — выплаты не будет. Итоговая оплата только после модерации.',
    schedule: 'Объёмы и сроки согласуются в чате с куратором.',
    requirements:
      'Соблюдать правила съёмки: только указанные приложения (GPS Camera 55 на iPhone, SurveyCam на Android).',
    faq: faq([
      { q: 'Как получить деньги за баллончики?', a: 'Пришлите чек — возместим после проверки. Без чека возврат не производится.' },
      { q: 'Почему от 25 граффити?', a: 'Так устроена выплата: набираете минимум, затем начисление после проверки всех работ.' },
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
      title: 'Курьер',
      iconId: 'courier',
      shortDescription: 'От 15 000 ₽/день. Бесконтактная доставка, гибкий график.',
      enabled: true,
      baseDetail: detailCourier(),
      cityOverrides: {},
    },
    {
      id: 'carrier',
      slug: 'carrier',
      title: 'Водитель',
      iconId: 'carrier',
      shortDescription: 'Рейсы от 1 000 $, ~10 000 $/мес. Расходы в пути оплачиваем.',
      enabled: true,
      baseDetail: detailCarrier(),
      cityOverrides: {},
    },
    {
      id: 'graffiti',
      slug: 'graffiti',
      title: 'Граффитчик',
      iconId: 'graffiti',
      shortDescription: '100–150 ₽ за работу, выплата на BTC. Минимум 25 граффити.',
      enabled: true,
      baseDetail: detailGraffiti(),
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
