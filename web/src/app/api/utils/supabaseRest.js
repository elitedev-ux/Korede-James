export function ok(data, init = {}) {
  return json(data, init);
}

export function fail(message, status = 400) {
  return json(
    {
      error:
        status >= 500
          ? "Service temporarily unavailable. Please try again later."
          : message,
    },
    { status },
  );
}

const MAX_JSON_BODY_BYTES = 256 * 1024;
const MAX_ADMIN_BODY_BYTES = 8 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateLimitBuckets = new Map();

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), usb=(), bluetooth=(), payment=(self)",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Robots-Tag": "noindex, nofollow",
};

export { MAX_ADMIN_BODY_BYTES };

export async function readBody(
  request,
  { maxBytes = MAX_JSON_BODY_BYTES, requireJson = true } = {},
) {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > maxBytes) {
    throw requestBodyError("Request body is too large.", 413);
  }

  const contentType = request.headers.get("content-type") || "";
  if (
    requireJson &&
    request.body !== null &&
    contentType.split(";")[0].trim().toLowerCase() !== "application/json"
  ) {
    throw requestBodyError("Request content type must be application/json.", 415);
  }

  if (!request.body) return {};
  const reader = request.body.getReader();
  const chunks = [];
  let byteCount = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      byteCount += value.byteLength;
      if (byteCount > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw requestBodyError("Request body is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(byteCount);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(bytes);
  try {
    const body = text ? JSON.parse(text) : {};
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error();
    }
    return body;
  } catch {
    throw requestBodyError("Request body must be a valid JSON object.", 400);
  }
}

function requestBodyError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const configuredOrigin =
    process.env.PUBLIC_SITE_URL || process.env.VITE_PUBLIC_SITE_URL || "";
  let suppliedOrigin = "";
  let allowedOrigin = "";

  try {
    suppliedOrigin = origin ? new URL(origin).origin : "";
    allowedOrigin =
      process.env.NODE_ENV === "production" && configuredOrigin
        ? new URL(configuredOrigin).origin
        : new URL(request.url).origin;
  } catch {
    // Invalid URL syntax is treated as an untrusted origin below.
  }

  if (
    !suppliedOrigin ||
    !allowedOrigin ||
    suppliedOrigin !== allowedOrigin ||
    (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none")
  ) {
    const error = new Error("Cross-origin request rejected.");
    error.status = 403;
    throw error;
  }
}

export async function assertRateLimit(
  request,
  scope,
  { limit = 20, windowMs = RATE_LIMIT_WINDOW_MS } = {},
) {
  const clientKey = rateLimitKey(scope, getClientIp(request));

  if (hasSupabaseConfig()) {
    try {
      const allowed = await supabaseRequest("rpc/consume_rate_limit", {
        method: "POST",
        body: JSON.stringify({
          p_key_hash: clientKey,
          p_limit: Math.max(1, Math.min(10_000, Math.floor(limit))),
          p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
        }),
      });
      if (!allowed) {
        throw new RateLimitError();
      }
      return;
    } catch (error) {
      if (error instanceof RateLimitError || process.env.NODE_ENV === "production") {
        throw error;
      }
    }
  }

  assertLocalRateLimit(clientKey, { limit, windowMs });
}

function assertLocalRateLimit(clientKey, { limit, windowMs }) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(clientKey);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(clientKey, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    throw new RateLimitError();
  }

  if (rateLimitBuckets.size > 10_000) {
    for (const [key, value] of rateLimitBuckets) {
      if (value.resetAt <= now) {
        rateLimitBuckets.delete(key);
      }
    }
    while (rateLimitBuckets.size > 10_000) {
      rateLimitBuckets.delete(rateLimitBuckets.keys().next().value);
    }
  }
}

export async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetchBackend(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    console.error("Supabase request failed:", {
      path: String(path).split("?")[0],
      status: response.status,
      code: data?.code,
      message: data?.message || data?.error,
    });
    const isConflict = data?.code === "40001";
    const error = new Error(
      isConflict
        ? "Workspace changed before it could be saved."
        : "Database service request failed.",
    );
    error.status = isConflict ? 409 : 503;
    throw error;
  }

  return data;
}

export async function supabaseStorageFetch(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetchBackend(`${url}/storage/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options.body && typeof options.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });

  if (options.allowNotFound && response.status === 404) {
    return { status: 404, data: null };
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    console.error("Supabase storage request failed:", {
      path: String(path).split("?")[0],
      status: response.status,
      message: data?.message || data?.error,
    });
    const error = new Error("File storage service request failed.");
    error.status = 503;
    throw error;
  }

  return { status: response.status, data };
}

export class RateLimitError extends Error {
  constructor() {
    super("Too many requests. Please wait a moment and try again.");
    this.status = 429;
  }
}

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      ...SECURITY_HEADERS,
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const normalizedUrl = url.replace(/\/$/, "");
  try {
    const parsedUrl = new URL(normalizedUrl);
    if (!["https:", "http:"].includes(parsedUrl.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error("SUPABASE_URL is not a valid web address.");
  }

  return {
    url: normalizedUrl,
    key,
  };
}

async function fetchBackend(url, options = {}) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(15_000),
      });
      if (response.status >= 500 && attempt === 0) {
        if (response.body) {
          await response.body.cancel().catch(() => undefined);
        }
        await wait(350);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await wait(350);
        continue;
      }
    }
  }

  console.error("Backend service request failed:", url, lastError);
  throw new Error("Workspace service is temporarily unreachable.");
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getClientIp(request) {
  const headers = request?.headers;
  const vercelForwardedFor = headers?.get("x-vercel-forwarded-for") || "";
  const netlifyIp = headers?.get("x-nf-client-connection-ip") || "";
  const cloudflareIp = headers?.get("cf-connecting-ip") || "";

  return (
    vercelForwardedFor.split(",")[0]?.trim() ||
    netlifyIp.trim() ||
    cloudflareIp.trim() ||
    "unknown"
  );
}

function rateLimitKey(scope, clientIp) {
  const secret =
    process.env.RATE_LIMIT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "local-development-rate-limit";
  return createHmac("sha256", secret)
    .update(`${String(scope).slice(0, 100)}:${clientIp}`)
    .digest("hex");
}

function hasSupabaseConfig() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY),
  );
}
import { createHmac } from "node:crypto";
