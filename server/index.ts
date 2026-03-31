import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { applicationsRouter } from './routes/applications.js';

const app = express();
const PORT = Number(process.env.APP_PORT || process.env.PORT || 8787);

app.use(
  cors({
    origin: (_origin, cb) => cb(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '48kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'sitevacansia-api' });
});

app.use('/api/applications', applicationsRouter);

app.listen(PORT, () => {
  console.log(`[sitevacansia] API http://localhost:${PORT}`);
  if (!process.env.TELEGRAM_BOT_TOKEN?.trim() || !process.env.TELEGRAM_CHAT_ID?.trim()) {
    console.warn(
      '[sitevacansia] Внимание: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — POST /api/applications вернёт ошибку.'
    );
  }
});
