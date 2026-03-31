export const onRequestGet = async (): Promise<Response> => {
  console.log('[cf-applications] GET /api/health');
  return Response.json(
    { ok: true, service: 'sitevacansia-api', runtime: 'cloudflare-pages' },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
};
