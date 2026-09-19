const recentReports = new Map();
const DEDUPE_WINDOW_MS = 60 * 1000;

export function reportAppError(error, metadata = {}) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const normalized = normalizeClientError(error, metadata);
  const lastReportedAt = recentReports.get(normalized.fingerprint) || 0;
  if (Date.now() - lastReportedAt < DEDUPE_WINDOW_MS) {
    return Promise.resolve();
  }
  recentReports.set(normalized.fingerprint, Date.now());

  return fetch("/api/errors/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalized),
    keepalive: true,
  }).catch(() => undefined);
}

function normalizeClientError(error, metadata) {
  const errorObject = error instanceof Error ? error : null;
  const message = String(errorObject?.message || error || "Unknown browser error");
  const route = String(metadata.route || window.location.pathname).split(/[?#]/)[0];
  const source = String(metadata.source || "frontend");
  const context = String(metadata.context || "Browser runtime");
  const details = String(metadata.details || errorObject?.stack || "").slice(0, 2000);

  return {
    source,
    severity: metadata.severity || "error",
    message: message.slice(0, 500),
    context: context.slice(0, 300),
    details,
    route,
    occurredAt: new Date().toISOString(),
    fingerprint: `${source}|${route}|${message}`.slice(0, 700),
  };
}
