# Cloudflare Pages — деплой Sitevacansia

## А) Почему был белый экран и `Infinite loop` в `_redirects`

1. **Правило вида `/* /index.html 200` (или эквивалент в `_redirects`)**  
   На Cloudflare оно часто применяется **и к** `/assets/*.js` и `/assets/*.css`. Браузер запрашивает JS, получает **HTML** (`index.html`), пытается выполнить его как скрипт → **ошибка** → **белый экран**.  
   В логах/диагностике CF это может проявляться как **Invalid _redirects** / **Infinite loop**, если правила конфликтуют или замыкаются.

2. **Пустой hash у `HashRouter`**  
   При открытии `https://хост/` без `#/...` маршрут `/` мог не совпасть → пустой экран. В `main.tsx` принудительно выставляется `#/`.

3. **`wrangler deploy` вместо Pages**  
   Обычный `wrangler deploy` деплоит **Worker**, а не статический сайт из `dist`. Для сайта нужен **Pages** (Git или `wrangler pages deploy dist`).

4. **Неверный `base` в Vite**  
   Если `base` не совпадает с путём сайта, ссылки на `/assets/...` ломаются → те же симптомы.

**В репозитории сейчас нет файла `public/_redirects` с SPA-fallback — его не добавлять.**

---

## Б) Изменённые / контролируемые файлы (аудит)

| Область | Файлы |
|---------|--------|
| Сборка | `vite.config.ts` — явный `base: '/'`, `build.outDir` / `assetsDir` |
| Pages + CLI | `wrangler.toml` — только Pages (`pages_build_output_dir`), комментарий про `wrangler deploy` |
| Маршруты Functions | `public/_routes.json` — явно `/api/applications`, `/api/health`, `/api/*` |
| SPA / 404 | `public/404.html` — без агрессивного `_redirects` |
| Bootstrap | `src/main.tsx` — try/catch у `ensureHashRouterEntry`, меньше шума в prod |
| Данные | `src/context/SiteDataContext.tsx` — fallback `getDefaultSiteData()` при сбое `loadSiteData` |
| Логи | `src/App.tsx` — подробные логи только в `DEV` |
| Документация | `CLOUDFLARE-PAGES.md` (этот файл) |

**Обязательно:** папка `functions/` в корне репозитория (API заявок).

---

## В) Настройки в Dashboard Cloudflare Pages

| Поле | Значение |
|------|----------|
| **Framework preset** | Vite (или None) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (корень репо, чтобы видна была `functions/`) |
| **Node** | 18 или 20 (рекомендуется 20; в `package.json` указано `>=18.17.0`) |

### Environment variables (Runtime / Production)

| Variable | Нужна для | Обязательна для UI? |
|----------|-----------|---------------------|
| `TELEGRAM_BOT_TOKEN` | `POST /api/applications` → Telegram | Нет (сайт откроется) |
| `TELEGRAM_CHAT_ID` | то же | Нет |

Не задавай в **Production** `VITE_API_BASE_URL=http://127.0.0.1:...` — в production-коде он не используется, но путает при отладке.

---

## Г) Локальные команды

```bash
npm install
npm run dev          # Vite + опционально API (см. package.json)
npm run build        # tsc + vite build → dist/
npm run preview      # проверка собранного dist на localhost
```

Проверка API локально: поднять `npm run start:server` и использовать `npm run dev` (прокси `/api`).

---

## Д) Чистый деплой с нуля (Pages + Git)

1. Закоммить и запушить репозиторий.
2. [Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → подключить Git.
3. Указать: **Build command** `npm run build`, **Output** `dist`, **Root** `/`.
4. Добавить `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` (для формы).
5. **Save and Deploy**.
6. Дождаться зелёного деплоя.

**CLI (альтернатива):** после `npm run build`:

```bash
npx wrangler pages deploy dist --project-name=<имя_проекта_в_Pages>
```

**Не использовать:** `npx wrangler deploy` (без `pages`) для этого сайта.

---

## Е) Чеклист после деплоя

- [ ] Открывается `https://<project>.pages.dev/` — не белый экран, виден контент.
- [ ] В DevTools → Network: `index-*.js` и `index-*.css` из `/assets/` со статусом **200**, тип **script** / **stylesheet** (не `document`/HTML).
- [ ] `https://<project>.pages.dev/api/health` → JSON `ok: true`.
- [ ] Форма заявки (при заданных `TELEGRAM_*`) уходит без общей ошибки.
- [ ] В консоли нет ошибки вида «Failed to load module script» / MIME / unexpected token `<`.

---

## Ж) Файлы `functions/`

- `functions/api/health.ts` — GET `/api/health`
- `functions/api/applications.ts` — POST `/api/applications`

Поддерживаются нативно Cloudflare Pages при наличии папки `functions` в **корне** проекта при сборке из Git.
