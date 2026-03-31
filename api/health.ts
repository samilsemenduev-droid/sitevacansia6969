import type { ServerlessRequest, ServerlessResponse } from './serverlessHandlerTypes.js';

export default function handler(req: ServerlessRequest, res: ServerlessResponse): void {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false });
    return;
  }
  res.status(200).json({ ok: true, service: 'sitevacansia-api' });
}
