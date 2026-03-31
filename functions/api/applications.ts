import { handleApplicationPostCf } from '../lib/applicationsCore';

type PagesEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export const onRequestGet = async (): Promise<Response> => {
  return Response.json(
    {
      ok: false,
      error: 'Отправка заявки только методом POST (JSON). Этот адрес не открывают в браузере.',
      code: 'METHOD_NOT_ALLOWED',
    },
    { status: 405, headers: jsonHeaders }
  );
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      ...jsonHeaders,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const onRequestPost = async (context: {
  request: Request;
  env: PagesEnv;
}): Promise<Response> => {
  console.info('[cf-applications] POST /api/applications');

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    console.error('[cf-applications] invalid JSON body');
    return Response.json(
      { ok: false, error: 'Ожидается JSON-тело запроса.', code: 'INVALID_JSON' },
      { status: 400, headers: jsonHeaders }
    );
  }

  const out = await handleApplicationPostCf(body, context.env);
  return Response.json(out.json, { status: out.status, headers: jsonHeaders });
};
