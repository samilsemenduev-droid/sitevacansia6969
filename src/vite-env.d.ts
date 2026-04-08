/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_LOGIN?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  /** Полный URL API без завершающего слэша; если пусто — запросы идут на тот же origin (прокси Vite `/api`). */
  readonly VITE_API_BASE_URL?: string;
  /** Ссылка t.me/... для кнопки «Связаться» и сидов по умолчанию (опционально). */
  readonly VITE_CONTACT_TELEGRAM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
