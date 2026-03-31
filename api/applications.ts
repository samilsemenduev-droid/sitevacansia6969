import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApplicationPost } from '../server/handleApplicationPost.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Метод не поддерживается.' });
    return;
  }

  const out = await handleApplicationPost(req.body);
  res.status(out.status).json(out.json);
}
