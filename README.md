# Sitevacansia — сайт вакансий + Telegram-заявки

React + Vite + TypeScript + Tailwind CSS + Framer Motion. Публичная витрина, выбор города и вакансии, форма заявки, скрытая админ-панель. **Контент сайта** по-прежнему в **localStorage**. **Заявки** отправляются на **серверный API** (`POST /api/applications`), который вызывает **Telegram Bot API**; параллельно заявка пишется в **журнал в браузере** (статусы `pending` → `sent` / `failed`).

## Установка и запуск (локально)

```bash
cd Sitevacansia
npm install
```

Скопируйте `.env.example` в `.env` и заполните `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`.

**Фронт + Express API одной командой** (разработка):

```bash
npm run dev
```

- Vite: обычно `http://localhost:5173`
- Express: порт из `APP_PORT` (по умолчанию `8787`); запросы с фронта идут на `/api/...` и **проксируются** Vite на API.

Отдельно, если нужно:

```bash
npm run dev:client   # только Vite
npm run dev:server   # только API (tsx watch)
npm run start:server # API без watch
```

Сборка статики:

```bash
npm run build
npm run preview
```

> В режиме `preview` прокси Vite нет: задайте `VITE_API_BASE_URL=http://127.0.0.1:8787` и поднимите API (`npm run start:server`), либо тестируйте заявки через `npm run dev`.

## Деплой на Vercel (прод)

Статика собирается **Vite** (`dist`), заявки обрабатываются **Vercel Serverless Functions** в каталоге `api/` — отдельный Node-процесс на порту **не нужен**.

### 1. Репозиторий

1. Создайте репозиторий на GitHub и отправьте туда проект (без файла `.env` и без секретов в истории).

### 2. Импорт в Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → импорт репозитория.
2. **Framework Preset**: Vite (или Other — подойдёт и так).
3. **Build Command**: `npm run build` (совпадает с `vercel.json`).
4. **Output Directory**: `dist` (задано в `vercel.json`).
5. **Install Command**: `npm install` (по умолчанию).

### 3. Переменные окружения в Vercel

В **Project → Settings → Environment Variables** добавьте для **Production** (и при необходимости Preview):

| Имя | Значение | Где используется |
|-----|----------|------------------|
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather | только `api/applications` и общий код `server/handleApplicationPost.ts` → `server/services/telegram.ts` |
| `TELEGRAM_CHAT_ID` | id чата / канала | то же |

**Не** добавляйте `TELEGRAM_*` с префиксом `VITE_` — токен не должен попадать в клиентский бандл.

Опционально для админки: `VITE_ADMIN_LOGIN`, `VITE_ADMIN_PASSWORD` — только если нужны на проде.

`APP_PORT` и `VITE_API_BASE_URL` на Vercel **не обязательны**: фронт шлёт заявку на относительный путь `/api/applications` на том же домене.

### 4. Проверка после деплоя

1. Откройте выданный URL деплоя.
2. `GET /api/health` — должен вернуть JSON `{ "ok": true, "service": "sitevacansia-api" }`.
3. Отправьте тестовую заявку с формы — в Telegram должно прийти сообщение; в UI — состояние успеха или понятная ошибка.

### Как устроена отправка на Vercel

1. Браузер делает `POST /api/applications` с JSON-телом (как и локально).
2. Vercel направляет запрос в функцию `api/applications.ts`.
3. Вызывается `handleApplicationPost` (тот же сценарий валидации, что и у Express).
4. `sendTelegramMessage` читает **только** `process.env.TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` на сервере.
5. Ответ клиенту: `{ ok: true, sentAt }` или `{ ok: false, error }` с соответствующим HTTP-статусом.

Локальный Express (`server/index.ts`) остаётся для удобной разработки; в проде на Vercel он не запускается.

### `vercel.json`

В репозитории лежит минимальный `vercel.json`: команда сборки, каталог вывода и SPA-fallback на `index.html`. Маршруты `/api/*` обрабатываются функциями из `api/` **до** rewrite на `index.html`.

## Переменные окружения (справочник)

| Переменная | Где | Назначение |
|------------|-----|------------|
| `TELEGRAM_BOT_TOKEN` | **Vercel / `.env` сервера** | Токен бота. **Не** во фронте. |
| `TELEGRAM_CHAT_ID` | **Vercel / `.env` сервера** | Куда слать сообщения. |
| `APP_PORT` | **`.env` локально** | Порт Express; для Vercel не нужен. |
| `VITE_API_BASE_URL` | **`.env`** (опционально) | Полный URL API без слэша в конце, если фронт без прокси (preview и т.п.). |
| `VITE_ADMIN_LOGIN` / `VITE_ADMIN_PASSWORD` | `.env` | Логин админки (см. `adminConfig.ts`). |

## Структура проекта

```
Sitevacansia/
├── api/
│   ├── applications.ts          # Vercel: POST /api/applications
│   └── health.ts                # Vercel: GET /api/health
├── server/
│   ├── index.ts                 # Express (только локально / start:server)
│   ├── handleApplicationPost.ts # общая логика заявки
│   ├── routes/applications.ts
│   └── services/telegram.ts     # Bot API + текст сообщения
├── src/                         # фронтенд
├── vercel.json
├── .env.example
├── vite.config.ts               # dev: proxy /api → Express
└── package.json
```

## Поток заявки (пошагово)

1. Пользователь заполняет форму (`ApplyForm.tsx`).
2. Клиент валидирует поля и **сразу** добавляет запись в localStorage со статусом **`pending`**.
3. `fetch` на **`POST /api/applications`** (на Vercel — тот же origin; локально — прокси или `VITE_API_BASE_URL`).
4. Сервер валидирует body, собирает текст, вызывает **Telegram Bot API**.
5. При **успехе** → `{ ok: true, sentAt }` → запись **`sent`**, `telegramDelivered: true`.
6. При **ошибке** → UI и запись **`failed`** с `errorMessage`.

## Логика при ошибке Telegram / API

- Пользователь видит понятный текст (валидация, сеть, ответ сервиса).
- Внутренние сообщения про отсутствие env на сервере в ответ клиенту **не дублируются** — общая формулировка «Сервис временно недоступен».
- Заявка остаётся в localStorage со статусом **`failed`**.

## Статусы заявок в журнале

| Статус | Смысл |
|--------|--------|
| **pending** | Запись создана, ответ сервера ещё не обработан. |
| **sent** | Успех API; **`telegramDelivered: true`** — доставка в Telegram подтверждена сервером. |
| **failed** | Ошибка; текст в **`errorMessage`**. |

## Где менять Telegram

1. **Токен** — Vercel Environment Variables или `.env` локально: `TELEGRAM_BOT_TOKEN`.
2. **chat_id** — `TELEGRAM_CHAT_ID`.
3. Код: `server/services/telegram.ts`, обработчик: `server/handleApplicationPost.ts`.

## Админка

Локально: **`http://localhost:5173/__system/panel`**. На проде — тот же путь на вашем домене Vercel.

## Критично

- **Не** вшивать токен и `chat_id` в `src/`.
- На Vercel задайте `TELEGRAM_*` в настройках проекта.

## Дизайн публичной части (кратко)

- Фон **#060608**, акценты **amber / gold**, шрифты **Outfit** / **Inter**.
- Форма заявки: состояния успеха/ошибки, спиннер при отправке.

## Переход на Supabase и т.д.

Модели `SiteData` и `JobApplication` остаются контрактом; репозитории можно заменить на API.
