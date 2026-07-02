async function readRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  if (typeof req.body === "string") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function createWebRequest(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = `${protocol}://${host}${req.url}`;
  const headers = new Headers();

  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
      return;
    }

    if (typeof value !== "undefined") {
      headers.set(key, value);
    }
  });

  return { url, headers };
}

export async function bridgeRoute(req, res, handler, allowedMethod) {
  if (req.method !== allowedMethod) {
    res.setHeader("Allow", allowedMethod);
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed." }));
    return;
  }

  const { url, headers } = createWebRequest(req);
  const init = {
    method: req.method,
    headers,
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    const body = await readRequestBody(req);
    init.body = body || "{}";

    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  const response = await handler(new Request(url, init));
  res.statusCode = response.status;

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.end(await response.text());
}
