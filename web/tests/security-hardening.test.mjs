import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { assertSameOrigin, readBody } from "../src/app/api/utils/supabaseRest.js";
import { createPendingShippingQuote } from "../src/app/api/shipping/rates/shippingQuote.js";
import { POST as subscribe } from "../src/app/api/newsletter/route.js";
import { POST as confirm } from "../src/app/api/newsletter/confirm/route.js";
import { GET as verificationLink, POST as verifyEmail } from "../src/app/api/customer-auth/email/verify/route.js";
import { validateTransactionForOrder } from "../src/app/api/paystack/utils/paymentVerification.js";

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
});

function jsonRequest(body, origin = "https://shop.example") {
  return new Request(`${origin}/api/test`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockBackend(handler) {
  process.env.NODE_ENV = "production";
  process.env.PUBLIC_SITE_URL = "https://shop.example";
  process.env.SUPABASE_URL = "https://database.example";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-key";
  globalThis.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://database.example/"));
    if (String(url).includes("rpc/consume_rate_limit")) return Response.json(true);
    return handler(String(url), options);
  };
}

test("production rejects cross-site and malformed origins", () => {
  process.env.NODE_ENV = "production";
  process.env.PUBLIC_SITE_URL = "https://shop.example";
  assert.doesNotThrow(() => assertSameOrigin(jsonRequest({})));
  for (const origin of ["https://attacker.example", "null", "not a URL"]) {
    const request = jsonRequest({});
    request.headers.set("Origin", origin);
    assert.throws(() => assertSameOrigin(request), { status: 403 });
  }
});

test("development accepts localhost rather than the configured production site", () => {
  process.env.NODE_ENV = "development";
  process.env.PUBLIC_SITE_URL = "https://shop.example";
  assert.doesNotThrow(() => assertSameOrigin(jsonRequest({}, "http://localhost:4000")));
});

test("JSON reader rejects invalid JSON, arrays, and wrong content types", async () => {
  for (const body of ["{broken", "[]", "null"]) {
    await assert.rejects(readBody(new Request("https://shop.example", {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    })), { status: 400 });
  }
  await assert.rejects(readBody(new Request("https://shop.example", {
    method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}",
  })), { status: 415 });
  assert.deepEqual(await readBody(jsonRequest({ valid: true })), { valid: true });
});

test("JSON reader cancels oversized streamed bodies without Content-Length", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) { controller.enqueue(new Uint8Array(17)); },
    cancel() { cancelled = true; },
  });
  const request = new Request("https://shop.example", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: stream, duplex: "half",
  });
  await assert.rejects(readBody(request, { maxBytes: 16 }), { status: 413 });
  assert.equal(cancelled, true);
});

test("shipping signing rejects absent or weak secrets", () => {
  for (const secret of ["", "weak"]) {
    process.env.SHIPPING_QUOTE_SECRET = secret;
    assert.throws(() => createPendingShippingQuote(), { status: 503 });
  }
  process.env.SHIPPING_QUOTE_SECRET = "x".repeat(32);
  assert.match(createPendingShippingQuote().signature, /^[a-f0-9]{64}$/);
});

test("newsletter stores only a token hash and does not expose subscriber data", async () => {
  let payload;
  mockBackend((url, options) => {
    assert.ok(url.endsWith("rpc/request_newsletter_subscription"));
    payload = JSON.parse(options.body);
    return Response.json(false);
  });
  const response = await subscribe(jsonRequest({ email: "CLIENT@example.com" }));
  assert.equal(response.status, 200);
  assert.equal(payload.p_email, "client@example.com");
  assert.match(payload.p_token_hash, /^[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(await response.json()), ["message"]);
});

test("newsletter rejects malformed confirmation tokens without a database lookup", async () => {
  mockBackend(() => { throw new Error("Unexpected database lookup"); });
  const response = await confirm(jsonRequest({ token: "forged" }));
  assert.equal(response.status, 400);
});

test("newsletter confirmation consumes the token and records consent", async () => {
  let update;
  mockBackend((url, options) => {
    if (options.method === "PATCH") {
      assert.ok(url.includes("status=eq.pending&confirmation_token_hash=eq."));
      update = JSON.parse(options.body);
      return Response.json([{ id: "subscriber-id" }]);
    }
    assert.ok(url.includes("confirmation_expires_at=gt."));
    return Response.json([{ id: "subscriber-id" }]);
  });
  const response = await confirm(jsonRequest({ token: "a".repeat(43) }));
  assert.equal(response.status, 200);
  assert.equal(update.status, "active");
  assert.equal(update.confirmation_token_hash, null);
  assert.equal(update.confirmation_expires_at, null);
  assert.ok(update.confirmed_at);
});

function uploadRequest(bytes) {
  const form = new FormData();
  form.set("scope", "commission-reference");
  form.set("file", new Blob([bytes], { type: "image/png" }), "reference.png");
  return new Request("https://shop.example/api/uploads", {
    method: "POST", headers: { Origin: "https://shop.example" }, body: form,
  });
}

test("uploads fail closed when public and private buckets share a name", async () => {
  mockBackend(() => { throw new Error("Storage must not be modified"); });
  process.env.SUPABASE_PUBLIC_UPLOAD_BUCKET = "same-bucket";
  process.env.SUPABASE_PRIVATE_UPLOAD_BUCKET = "same-bucket";
  const { POST } = await import("../src/app/api/uploads/route.js?shared-bucket-test");
  const response = await POST(uploadRequest(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])));
  assert.equal(response.status, 503);
});

test("private upload updates contain only settings and never return public storage URLs", async () => {
  process.env.SUPABASE_PUBLIC_UPLOAD_BUCKET = "public-test";
  process.env.SUPABASE_PRIVATE_UPLOAD_BUCKET = "private-test";
  let settings;
  mockBackend((url, options) => {
    if (options.method === "PUT") settings = JSON.parse(options.body);
    assert.ok(url.includes("/storage/v1/") && url.includes("private-test"));
    return Response.json({});
  });
  const { POST } = await import("../src/app/api/uploads/route.js?private-settings-test");
  const response = await POST(uploadRequest(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])));
  assert.equal(response.status, 200);
  assert.equal(settings.public, false);
  assert.equal("id" in settings, false);
  assert.equal("name" in settings, false);
  const data = await response.json();
  assert.equal(data.file.visibility, "private");
  assert.ok(data.file.url.startsWith("/api/uploads?path="));
});

test("uploads reject executable content disguised as a PNG", async () => {
  mockBackend(() => { throw new Error("Storage must not be modified"); });
  const { POST } = await import("../src/app/api/uploads/route.js?invalid-image-test");
  const response = await POST(uploadRequest(new TextEncoder().encode("<script>alert(1)</script>")));
  assert.equal(response.status, 400);
});

test("opening an email-verification link does not mutate account state", () => {
  const response = verificationLink(
    new Request(`https://shop.example/api/customer-auth/email/verify?token=${"a".repeat(43)}`),
  );
  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get("location"),
    `https://shop.example/account/verify-email?token=${"a".repeat(43)}`,
  );
});

test("email verification requires an explicit same-origin POST and consumes the token", async () => {
  let update;
  mockBackend((url, options) => {
    if (options.method === "PATCH") {
      update = JSON.parse(options.body);
      return Response.json(null);
    }
    assert.ok(url.includes("verification_token_hash=eq."));
    return Response.json([{
      id: "12345678-1234-1234-1234-123456789abc",
      first_name: "Test",
      last_name: "Customer",
      email: "customer@example.com",
      verification_expires_at: new Date(Date.now() + 60_000).toISOString(),
      session_version: 1,
    }]);
  });
  const response = await verifyEmail(jsonRequest({ token: "a".repeat(43) }));
  assert.equal(response.status, 200);
  assert.ok(update.email_verified_at);
  assert.equal(update.verification_token_hash, null);
  assert.equal(update.verification_expires_at, null);
});

test("payment verification rejects mismatched and replayed transaction identities", () => {
  const order = {
    paystackExpectedAmountMinor: 125000,
    paystackExpectedCurrency: "NGN",
    paystackExpectedEmail: "customer@example.com",
    paystackReference: "reference-1",
    paystackExpectedSource: "korede-james-checkout",
  };
  const transaction = {
    amount: 125000,
    currency: "NGN",
    customer: { email: "customer@example.com" },
    reference: "reference-1",
    metadata: { source: "korede-james-checkout" },
  };
  assert.equal(validateTransactionForOrder(transaction, order).valid, true);
  for (const changed of [
    { amount: 1 },
    { currency: "USD" },
    { customer: { email: "attacker@example.com" } },
    { reference: "another-order" },
    { metadata: { source: "forged" } },
  ]) {
    assert.equal(validateTransactionForOrder({ ...transaction, ...changed }, order).valid, false);
  }
});
