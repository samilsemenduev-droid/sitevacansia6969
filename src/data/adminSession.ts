import { STORAGE_ADMIN_SESSION } from './storageKeys';

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_ADMIN_SESSION) === '1';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(STORAGE_ADMIN_SESSION, '1');
    else sessionStorage.removeItem(STORAGE_ADMIN_SESSION);
  } catch (e) {
    console.warn('[vacansia] setAdminAuthenticated failed', e);
  }
}
