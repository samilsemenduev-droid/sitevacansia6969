/**
 * Минимальные типы для HTTP-handlers в `api/*`.
 * Совместимы с сигнатурой Vercel Serverless Functions без зависимости от @vercel/node.
 */
export type ServerlessRequest = {
  method?: string;
  body?: unknown;
};

export type ServerlessResponse = {
  status(code: number): ServerlessResponse;
  json(body: unknown): void;
};
