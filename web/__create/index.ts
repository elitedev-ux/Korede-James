import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { API_BASENAME, api } from './route-builder';

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  console.error('Unhandled application error:', err);
  return c.json(
    {
      error: 'Service temporarily unavailable. Please try again later.',
      requestId: c.get('requestId'),
    },
    500
  );
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}
for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024, // 4.5mb to match vercel limit
      onError: (c) => {
        return c.json({ error: 'Body size limit exceeded' }, 413);
      },
    })
  );
}

app.all('/integrations/:path{.+}', async (c) => {
  const integrationBase = process.env.CREATE_INTEGRATIONS_BASE_URL;
  const integrationToken = process.env.CREATE_INTEGRATIONS_TOKEN;
  if (!integrationBase || !integrationToken) {
    return c.json({ error: 'Integration service is not configured.' }, 503);
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(integrationBase);
    if (baseUrl.protocol !== 'https:') {
      throw new Error('HTTPS is required.');
    }
  } catch {
    return c.json({ error: 'Integration service is not configured.' }, 503);
  }

  const requestedPath = c.req.param('path');
  if (!requestedPath || requestedPath.includes('..') || requestedPath.includes('\\')) {
    return c.json({ error: 'Invalid integration path.' }, 400);
  }

  const queryParams = c.req.query();
  const safePath = requestedPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const url = new URL(`integrations/${safePath}`, `${baseUrl.toString().replace(/\/$/, '')}/`);
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers({
    Authorization: `Bearer ${integrationToken}`,
    Accept: c.req.header('accept') || 'application/json',
  });
  const contentType = c.req.header('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  if (process.env.CREATE_HOST) {
    headers.set('x-createxyz-host', process.env.CREATE_HOST);
  }
  if (process.env.CREATE_PROJECT_GROUP_ID) {
    headers.set('x-createxyz-project-group-id', process.env.CREATE_PROJECT_GROUP_ID);
  }

  const response = await proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-expect-error -- duplex is accepted by the runtime even though the
    // type declarations don't include it; required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers,
  });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('set-cookie');
  responseHeaders.set('Cache-Control', 'no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
});

app.route(API_BASENAME, api);

export default await createHonoServer({
  app,
  defaultLogger: false,
});
