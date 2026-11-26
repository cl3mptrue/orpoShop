const API_TARGET = process.env.API_TARGET ?? 'http://localhost:8080';
const PORT = Number(process.env.WEB_PORT ?? 5173);
const ROOT = import.meta.dir + '/web/';

const html = await Bun.file(ROOT + 'index.html').text();
const build = await Bun.build({
  entrypoints: [ROOT + 'src/main.tsx'],
  target: 'browser',
  format: 'esm',
  sourcemap: 'external',
});

if (!build.success) {
  for (const log of build.logs) console.error(log);
  process.exit(1);
}

const js = build.outputs.find((o) => o.path.endsWith('.js'))!;
const map = build.outputs.find((o) => o.path.endsWith('.map'));
const css = build.outputs.find((o) => o.path.endsWith('.css'));

const page = html.replace(
  '</head>',
  `${css ? '<link rel="stylesheet" href="/assets/style.css">' : ''}</head>`,
).replace(
  /<script type="module" src="[^"]*"><\/script>/,
  '<script type="module" src="/assets/main.js"></script>',
);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/swagger')) {
      const headers: Record<string, string> = {};
      const type = req.headers.get('content-type');
      if (type) headers['Content-Type'] = type;
      const auth = req.headers.get('authorization');
      if (auth) headers.Authorization = auth;
      const payload = req.method === 'GET' || req.method === 'HEAD' ? null : await req.text();

      const upstream = await fetch(API_TARGET + url.pathname + url.search, {
        method: req.method,
        headers,
        body: payload,
      });

      if (upstream.status === 204) {
        return new Response(null, { status: 204, headers: { 'X-Gateway': 'bun-proxy' } });
      }
      return new Response(await upstream.text(), {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
          'Cache-Control': 'no-store',
          'X-Gateway': 'bun-proxy',
        },
      });
    }

    if (url.pathname === '/assets/main.js') {
      return new Response(js, { headers: { 'Content-Type': 'text/javascript' } });
    }
    if (url.pathname === '/assets/main.js.map' && map) {
      return new Response(map, { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/assets/style.css' && css) {
      return new Response(css, { headers: { 'Content-Type': 'text/css' } });
    }
    if (url.pathname === '/' || !url.pathname.split('/').pop()!.includes('.')) {
      return new Response(page, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    return new Response('Not found', { status: 404 });
  },
});

console.log(`Miroy Shop web: http://localhost:${PORT}  →  API ${API_TARGET}`);
