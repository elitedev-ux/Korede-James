export function ok(data, init = {}) {
  return json(data, init);
}

export function fail(message, status = 400) {
  return json({ error: message }, { status });
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
    throw new Error("Request body is too large.");
  }

  const contentType = request.headers.get("content-type") || "";
  if (
    requireJson &&
    contentLength > 0 &&
    !contentType.toLowerCase().includes("application/json")
  ) {
    throw new Error("Request content type must be application/json.");
  }

  try {
    const text = await request.text();

    if (new TextEncoder().encode(text).length > maxBytes) {
      throw new Error("Request body is too large.");
    }

    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (error instanceof Error && error.message === "Request body is too large.") {
      throw error;
    }

    return {};
  }
}

export function assertRateLimit(request, scope, { limit = 20, windowMs = RATE_LIMIT_WINDOW_MS } = {}) {
  const clientKey = `${scope}:${getClientIp(request)}`;
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
}

export async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
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
    throw new Error(data?.message || data?.error || "Supabase request failed.");
  }

  return data;
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

  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}

function getClientIp(request) {
  const headers = request?.headers;
  const forwardedFor = headers?.get("x-forwarded-for") || "";
  const realIp = headers?.get("x-real-ip") || "";
  const vercelForwardedFor = headers?.get("x-vercel-forwarded-for") || "";

  return (
    forwardedFor.split(",")[0]?.trim() ||
    vercelForwardedFor.split(",")[0]?.trim() ||
    realIp.trim() ||
    "unknown"
  );
}
