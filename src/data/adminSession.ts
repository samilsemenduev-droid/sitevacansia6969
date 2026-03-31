import { STORAGE_ADMIN_SESSION } from './storageKeys';

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(STORAGE_ADMIN_SESSION) === '1';
}

export function setAdminAuthenticated(value: boolean): void {
  if (value) sessionStorage.setItem(STORAGE_ADMIN_SESSION, '1');
  else sessionStorage.removeItem(STORAGE_ADMIN_SESSION);
}
