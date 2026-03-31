import { Router, type Request, type Response } from 'express';
import { handleApplicationPost } from '../handleApplicationPost.js';

export const applicationsRouter = Router();

applicationsRouter.post('/', async (req: Request, res: Response) => {
  const out = await handleApplicationPost(req.body);
  res.status(out.status).json(out.json);
});
