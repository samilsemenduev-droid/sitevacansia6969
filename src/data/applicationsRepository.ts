import type { ApplicationStatus, JobApplication } from '@/types';
import { STORAGE_APPLICATIONS } from './storageKeys';

function readAll(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_APPLICATIONS);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown[];
    return Array.isArray(arr) ? arr.map(normalizeApplication).filter((x): x is JobApplication => x !== null) : [];
  } catch {
    return [];
  }
}

function writeAll(list: JobApplication[]): void {
  try {
    localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(list));
  } catch (e) {
    console.warn('[vacansia] applications writeAll failed', e);
  }
}

function normalizeApplication(raw: unknown): JobApplication | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.createdAt !== 'string') return null;

  const name = typeof o.name === 'string' ? o.name : '';
  const phone = typeof o.phone === 'string' ? o.phone : '';
  const cityId = typeof o.cityId === 'string' ? o.cityId : '';
  const cityName = typeof o.cityName === 'string' ? o.cityName : '';
  const vacancyId = typeof o.vacancyId === 'string' ? o.vacancyId : '';
  const vacancyTitle = typeof o.vacancyTitle === 'string' ? o.vacancyTitle : '';
  const comment = typeof o.comment === 'string' ? o.comment : '';
  const telegramUsername = typeof o.telegramUsername === 'string' ? o.telegramUsername : '';

  let status: ApplicationStatus;
  if (o.status === 'pending' || o.status === 'sent' || o.status === 'failed') {
    status = o.status;
  } else {
    status = 'sent';
  }

  let telegramDelivered = typeof o.telegramDelivered === 'boolean' ? o.telegramDelivered : false;
  if (!('status' in o) && !('telegramDelivered' in o)) {
    telegramDelivered = false;
  }

  const sentAt = typeof o.sentAt === 'string' ? o.sentAt : undefined;
  const errorMessage = typeof o.errorMessage === 'string' ? o.errorMessage : undefined;
  const sourceUrl = typeof o.sourceUrl === 'string' ? o.sourceUrl : undefined;

  return {
    id: o.id,
    createdAt: o.createdAt,
    status,
    sentAt,
    errorMessage,
    telegramDelivered,
    name,
    phone,
    cityId,
    cityName,
    telegramUsername,
    vacancyId,
    vacancyTitle,
    comment,
    sourceUrl,
  };
}

/** Добавить запись в начало списка (новые сверху). */
export function addApplication(app: JobApplication): void {
  const list = readAll();
  list.unshift(app);
  writeAll(list);
}

/** Частичное обновление по id. */
export function patchApplication(id: string, partial: Partial<JobApplication>): JobApplication | null {
  const list = readAll();
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...partial };
  writeAll(list);
  return list[i];
}

export function listApplications(): JobApplication[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function clearApplications(): void {
  try {
    localStorage.removeItem(STORAGE_APPLICATIONS);
  } catch (e) {
    console.warn('[vacansia] clearApplications failed', e);
  }
}
