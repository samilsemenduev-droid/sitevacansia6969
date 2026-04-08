import { CONTACT_TELEGRAM_URL } from '@/config/contactTelegram';
import type { City, SiteData, Vacancy, VacancyDetail, VacancyIconId } from '@/types';
import { getDefaultSiteData, SITE_PLATFORM_URL } from './defaultSeed';
import { STORAGE_SITE_DATA } from './storageKeys';

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function safeParse(raw: string | null): SiteData | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (
      !v ||
      typeof v !== 'object' ||
      (v as SiteData).version !== 1 ||
      !Array.isArray((v as SiteData).cities) ||
      !Array.isArray((v as SiteData).vacancies) ||
      !isPlainObject((v as SiteData).site)
    ) {
      return null;
    }
    return v as SiteData;
  } catch {
    return null;
  }
}

/** Старые URL из сидов — подменяем на актуальный SITE_PLATFORM_URL. */
const LEGACY_PLATFORM_PATTERNS = [
  /^https?:\/\/example\.com\/platform\/?$/i,
  /^https?:\/\/rutor\.or\.at\/forums\/kadrovoye-agent-stvo-satigo-rf-kz-rb\.1613\/?$/i,
];

function migratePlatformUrl(raw: string | undefined): string {
  const u = typeof raw === 'string' ? raw.trim() : '';
  if (!u || LEGACY_PLATFORM_PATTERNS.some((re) => re.test(u))) return SITE_PLATFORM_URL;
  return u;
}

/** Старый контакт «Связаться» в localStorage → подменяем на актуальный из конфига. */
const LEGACY_TELEGRAM_CONTACT = /t\.me\/aljeksandra007/i;

function migrateTelegramContactUrl(raw: string | undefined): string {
  const u = typeof raw === 'string' ? raw.trim() : '';
  if (!u || LEGACY_TELEGRAM_CONTACT.test(u)) return CONTACT_TELEGRAM_URL;
  return u;
}

function migrateVacancyTelegramUrls(v: Vacancy): Vacancy {
  const baseDetail: VacancyDetail = {
    ...v.baseDetail,
    telegramUrl: migrateTelegramContactUrl(v.baseDetail?.telegramUrl),
  };
  const cityOverrides: Record<string, Partial<VacancyDetail>> = {};
  for (const [cityId, patch] of Object.entries(v.cityOverrides ?? {})) {
    if (!patch || typeof patch !== 'object') continue;
    const p = patch as Partial<VacancyDetail>;
    cityOverrides[cityId] =
      typeof p.telegramUrl === 'string'
        ? { ...p, telegramUrl: migrateTelegramContactUrl(p.telegramUrl) }
        : { ...p };
  }
  return { ...v, baseDetail, cityOverrides };
}

function isValidCity(c: unknown): c is City {
  return (
    c != null &&
    typeof c === 'object' &&
    typeof (c as City).id === 'string' &&
    typeof (c as City).name === 'string'
  );
}

function isValidVacancy(v: unknown): v is Vacancy {
  return v != null && typeof v === 'object' && typeof (v as Vacancy).id === 'string';
}

export function loadSiteData(): SiteData {
  try {
    return loadSiteDataUnchecked();
  } catch (e) {
    console.error('[vacansia] loadSiteData failed, resetting storage', e);
    storageRemove(STORAGE_SITE_DATA);
    const fresh = getDefaultSiteData();
    trySaveSiteData(fresh);
    return fresh;
  }
}

function loadSiteDataUnchecked(): SiteData {
  const stored = safeParse(storageGet(STORAGE_SITE_DATA));
  if (stored) {
    let normalized: SiteData;
    try {
      normalized = normalizeSiteData(stored);
    } catch (e) {
      console.warn('[vacansia] normalizeSiteData failed, using default', e);
      storageRemove(STORAGE_SITE_DATA);
      const fresh = getDefaultSiteData();
      trySaveSiteData(fresh);
      return fresh;
    }
    if (normalized.cities.length === 0 || normalized.vacancies.length === 0) {
      storageRemove(STORAGE_SITE_DATA);
      const fresh = getDefaultSiteData();
      trySaveSiteData(fresh);
      return fresh;
    }
    trySaveSiteData(normalized);
    return normalized;
  }
  const fresh = getDefaultSiteData();
  trySaveSiteData(fresh);
  return fresh;
}

function trySaveSiteData(data: SiteData): void {
  try {
    const json = JSON.stringify(normalizeSiteData(data));
    if (!storageSet(STORAGE_SITE_DATA, json)) {
      console.warn('[vacansia] localStorage.setItem failed (quota or disabled)');
    }
  } catch (e) {
    console.warn('[vacansia] trySaveSiteData failed', e);
  }
}

export function saveSiteData(data: SiteData): void {
  try {
    const json = JSON.stringify(normalizeSiteData(data));
    storageSet(STORAGE_SITE_DATA, json);
  } catch (e) {
    console.warn('[vacansia] saveSiteData failed', e);
  }
}

const LEGACY_LEAFLET_ID = 'leaflet';

function normalizeVacancyIconId(raw: string | undefined): VacancyIconId {
  if (raw === 'carrier') return 'carrier';
  if (raw === 'courier' || raw === 'graffiti') return 'courier';
  return 'courier';
}

const REMOVED_VACANCY_GRAFFITI = 'graffiti';

function stripDeprecatedVacancies(list: Vacancy[]): Vacancy[] {
  return list.filter(
    (v) =>
      v.id !== LEGACY_LEAFLET_ID &&
      v.slug !== LEGACY_LEAFLET_ID &&
      v.id !== REMOVED_VACANCY_GRAFFITI &&
      v.slug !== REMOVED_VACANCY_GRAFFITI
  );
}

function normalizeSiteData(data: SiteData): SiteData {
  const rawCities = Array.isArray(data.cities) ? data.cities : [];
  const rawVacancies = Array.isArray(data.vacancies) ? data.vacancies : [];
  const cities = rawCities
    .filter(isValidCity)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name, 'ru'))
    .map((c, i) => ({ ...c, order: c.order ?? i }));
  const vacancies = stripDeprecatedVacancies(rawVacancies.filter(isValidVacancy))
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) ||
        String(a.title ?? '').localeCompare(String(b.title ?? ''), 'ru')
    )
    .map((v, i) =>
      migrateVacancyTelegramUrls({
        ...v,
        order: v.order ?? i,
        iconId: normalizeVacancyIconId(v.iconId as string),
        cityOverrides: isPlainObject(v.cityOverrides) ? v.cityOverrides : {},
      })
    );
  const siteDefaults = getDefaultSiteData().site;
  const fromStored = (isPlainObject(data.site) ? data.site : {}) as Partial<SiteData['site']>;
  const platformRaw =
    typeof fromStored.platformUrl === 'string' ? fromStored.platformUrl : undefined;
  const mergedSite = {
    ...siteDefaults,
    ...fromStored,
    platformUrl: migratePlatformUrl(platformRaw),
  };
  mergedSite.defaultTelegramUrl = migrateTelegramContactUrl(mergedSite.defaultTelegramUrl);
  return {
    version: 1,
    cities,
    vacancies,
    site: mergedSite,
  };
}

export function resetSiteDataToDefault(): SiteData {
  const fresh = getDefaultSiteData();
  saveSiteData(fresh);
  return fresh;
}

export function exportSiteDataJson(data: SiteData): string {
  return JSON.stringify(normalizeSiteData(data), null, 2);
}

export function importSiteDataJson(json: string): SiteData | null {
  const parsed = safeParse(json);
  if (!parsed) return null;
  try {
    const n = normalizeSiteData(parsed);
    saveSiteData(n);
    return n;
  } catch {
    return null;
  }
}
