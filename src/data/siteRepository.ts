import type { SiteData, Vacancy, VacancyIconId } from '@/types';
import { getDefaultSiteData, SITE_PLATFORM_URL } from './defaultSeed';
import { STORAGE_SITE_DATA } from './storageKeys';

function safeParse(raw: string | null): SiteData | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as SiteData;
    if (v && v.version === 1 && Array.isArray(v.cities) && Array.isArray(v.vacancies) && v.site) {
      return v;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Старый плейсхолдер из сида — в localStorage у многих остался именно он. */
const LEGACY_PLATFORM_PLACEHOLDER = /^https?:\/\/example\.com\/platform\/?$/i;

function migratePlatformUrl(raw: string | undefined): string {
  const u = typeof raw === 'string' ? raw.trim() : '';
  if (!u || LEGACY_PLATFORM_PLACEHOLDER.test(u)) return SITE_PLATFORM_URL;
  return u;
}

export function loadSiteData(): SiteData {
  const stored = safeParse(localStorage.getItem(STORAGE_SITE_DATA));
  if (stored) {
    const prev = stored.site.platformUrl?.trim() ?? '';
    const normalized = normalizeSiteData(stored);
    if (normalized.site.platformUrl !== prev) {
      saveSiteData(normalized);
    }
    return normalized;
  }
  const fresh = getDefaultSiteData();
  saveSiteData(fresh);
  return fresh;
}

export function saveSiteData(data: SiteData): void {
  localStorage.setItem(STORAGE_SITE_DATA, JSON.stringify(normalizeSiteData(data)));
}

const LEGACY_LEAFLET_ID = 'leaflet';

function normalizeVacancyIconId(raw: string | undefined): VacancyIconId {
  if (raw === 'courier' || raw === 'carrier' || raw === 'graffiti') return raw;
  return 'courier';
}

function stripLeafletVacancies(list: Vacancy[]): Vacancy[] {
  return list.filter((v) => v.id !== LEGACY_LEAFLET_ID && v.slug !== LEGACY_LEAFLET_ID);
}

function normalizeSiteData(data: SiteData): SiteData {
  const cities = [...data.cities]
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ru'))
    .map((c, i) => ({ ...c, order: c.order ?? i }));
  const vacancies = stripLeafletVacancies([...data.vacancies])
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ru'))
    .map((v, i) => ({
      ...v,
      order: v.order ?? i,
      iconId: normalizeVacancyIconId(v.iconId as string),
      cityOverrides: v.cityOverrides || {},
    }));
  return {
    version: 1,
    cities,
    vacancies,
    site: { ...data.site, platformUrl: migratePlatformUrl(data.site.platformUrl) },
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
  const n = normalizeSiteData(parsed);
  saveSiteData(n);
  return n;
}
