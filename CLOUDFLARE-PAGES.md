# Запуск на Cloudflare Pages (dash.cloudflare.com)

## 1. Создать проект

1. Открой [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Выбери репозиторий **Sitevacansia**.
3. **Build settings:**
   - **Framework preset:** Vite (или None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (корень репозитория, чтобы подхватилась папка `functions/`)

## 2. Переменные окружения (обязательно для заявок)

**Settings** → **Environment variables** → **Production** (и при необходимости **Preview**):

| Variable | Значение |
|----------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен от @BotFather (лучше **Encrypt**) |
| `TELEGRAM_CHAT_ID` | ID чата/группы, куда слать заявки |

Не добавляй `VITE_API_BASE_URL` с `localhost` в **Production** — форма шлёт запросы на тот же домен (`/api/applications`).

## 3. После деплоя — проверка

1. Открой `https://<твой-проект>.pages.dev/api/health` — должен быть JSON с `"ok": true`.
2. На сайте нажми **«Перейти на сайт»** — должна открыться площадка **http://hrs.best**.
3. Отправь тестовую заявку — сообщение должно прийти в Telegram.

## 4. Свой домен (опционально)

**Custom domains** → привяжи домен, DNS по инструкции Cloudflare (прокси оранжевое облако).

## 5. Файлы, важные для CF

- `functions/api/applications.ts` — приём заявок и отправка в Telegram.
- `functions/api/health.ts` — проверка API.
- `public/_routes.json` — маршруты `/api/*` для Functions.
- `public/404.html` — корректная работа SPA и API на Pages.
- `wrangler.toml` — подсказка для `wrangler pages dev` (локально).
