/**
 * Учётные данные админки по умолчанию.
 * Переопределение: переменные VITE_ADMIN_LOGIN и VITE_ADMIN_PASSWORD в `.env`
 * (см. `.env.example`).
 */
export const ADMIN_DEFAULT_LOGIN = 'admin';
export const ADMIN_DEFAULT_PASSWORD = 'vacansia2026';

export function getAdminCredentials(): { login: string; password: string } {
  return {
    login: import.meta.env.VITE_ADMIN_LOGIN?.trim() || ADMIN_DEFAULT_LOGIN,
    password: import.meta.env.VITE_ADMIN_PASSWORD?.trim() || ADMIN_DEFAULT_PASSWORD,
  };
}
