import { handleApplicationPost } from '../server/handleApplicationPost.js';
import type { ServerlessRequest, ServerlessResponse } from './serverlessHandlerTypes.js';

export default async function handler(req: ServerlessRequest, res: ServerlessResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Метод не поддерживается.' });
    return;
  }

  const out = await handleApplicationPost(req.body);
  res.status(out.status).json(out.json);
}
