import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import {
  fail,
  assertRateLimit,
  assertSameOrigin,
  ok,
  readBody,
  supabaseRequest,
} from "../../utils/supabaseRest.js";
import { sendPasswordResetEmail } from "../../utils/email.js";

const COOKIE_NAME = "kj_customer_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const RESET_TOKEN_MAX_AGE_MS = 1000 * 60 * 30;
const VERIFICATION_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export {
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  readBody,
  sendPasswordResetEmail,
};

export function validateEmail(email) {
  const normalized = normalizeEmail(email);
  if (normalized.length > 254) {
    throw new Error("Enter a valid email address.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email address.");
  }
  return normalized;
}

export function validatePassword(password) {
  const value = String(password || "");
  if (value.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }
  if (value.length > 128) {
    throw new Error("Password must be 128 characters or fewer.");
  }
  return value;
}

function publicAccount(account) {
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    firstName: account.first_name ?? account.firstName,
    lastName: account.last_name ?? account.lastName,
    email: account.email,
  };
}

function sessionAccount(account) {
  return {
    ...publicAccount(account),
    sessionVersion: Number(account.session_version ?? account.sessionVersion ?? 1),
  };
}

export async function findCustomerByEmail(email) {
  const normalized = normalizeEmail(email);
  const params = new URLSearchParams({
    select:
      "id,first_name,last_name,email,password_hash,password_salt,email_verified_at,verification_token_hash,verification_expires_at,session_version,reset_token_hash,reset_expires_at",
    email: `eq.${normalized}`,
    limit: "1",
  });
  const rows = await supabaseRequest(`customer_accounts?${params.toString()}`);
  return rows?.[0] || null;
}

export async function findCustomerById(id) {
  const customerId = String(id || "");
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(customerId)) {
    return null;
  }
  const params = new URLSearchParams({
    select:
      "id,first_name,last_name,email,email_verified_at,session_version",
    id: `eq.${customerId}`,
    limit: "1",
  });
  const rows = await supabaseRequest(`customer_accounts?${params.toString()}`);
  return rows?.[0] || null;
}

export async function findCustomerByResetToken(token) {
  const tokenHash = hashToken(token);
  const params = new URLSearchParams({
    select: "id,first_name,last_name,email,session_version,reset_token_hash,reset_expires_at",
    reset_token_hash: `eq.${tokenHash}`,
    limit: "1",
  });
  const rows = await supabaseRequest(`customer_accounts?${params.toString()}`);
  return rows?.[0] || null;
}

export async function findCustomerByVerificationToken(token) {
  const tokenHash = hashToken(token);
  const params = new URLSearchParams({
    select:
      "id,first_name,last_name,email,email_verified_at,verification_token_hash,verification_expires_at,session_version",
    verification_token_hash: `eq.${tokenHash}`,
    limit: "1",
  });
  const rows = await supabaseRequest(`customer_accounts?${params.toString()}`);
  return rows?.[0] || null;
}

export async function createCustomer({ firstName, lastName, email, password }) {
  const normalizedEmail = validateEmail(email);
  const cleanFirstName = String(firstName || "").trim();
  const cleanLastName = String(lastName || "").trim();

  if (!cleanFirstName || !cleanLastName) {
    throw new Error("Enter your first and last name.");
  }
  if (cleanFirstName.length > 80 || cleanLastName.length > 80) {
    throw new Error("Names must be 80 characters or fewer.");
  }

  const existing = await findCustomerByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account already exists for this email address.");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(validatePassword(password), salt);
  const verificationToken = randomBytes(32).toString("base64url");
  const verificationExpiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_MAX_AGE_MS,
  ).toISOString();
  const rows = await supabaseRequest("customer_accounts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      first_name: cleanFirstName,
      last_name: cleanLastName,
      email: normalizedEmail,
      password_hash: passwordHash,
      password_salt: salt,
      verification_token_hash: hashToken(verificationToken),
      verification_expires_at: verificationExpiresAt,
      verification_requested_at: new Date().toISOString(),
      session_version: 1,
    }),
  });

  return {
    customer: publicAccount(rows?.[0]),
    verificationToken,
  };
}

export async function verifyCustomer(email, password) {
  const account = await findCustomerByEmail(validateEmail(email));
  if (!account || !verifyPassword(password, account.password_salt, account.password_hash)) {
    throw new Error("Email or password is incorrect.");
  }

  if (!account.email_verified_at) {
    throw new Error("Verify your email address before signing in.");
  }

  return sessionAccount(account);
}

export async function requestCustomerEmailVerification(email) {
  const normalizedEmail = validateEmail(email);
  const account = await findCustomerByEmail(normalizedEmail);
  if (!account || account.email_verified_at) return null;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_MAX_AGE_MS).toISOString();
  const accepted = await supabaseRequest("rpc/request_customer_email_verification", {
    method: "POST",
    body: JSON.stringify({
      p_email: normalizedEmail,
      p_token_hash: hashToken(token),
      p_expires_at: expiresAt,
    }),
  });

  return accepted === true ? { customer: publicAccount(account), token } : null;
}

export async function verifyCustomerEmailToken(token) {
  const verificationToken = String(token || "");
  if (!/^[a-zA-Z0-9_-]{20,160}$/.test(verificationToken)) {
    throw new Error("Verification link is invalid or expired.");
  }
  const account = await findCustomerByVerificationToken(verificationToken);
  if (
    !account ||
    !account.verification_expires_at ||
    new Date(account.verification_expires_at).getTime() < Date.now()
  ) {
    throw new Error("Verification link is invalid or expired.");
  }

  await supabaseRequest(`customer_accounts?id=eq.${account.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      email_verified_at: new Date().toISOString(),
      verification_token_hash: null,
      verification_expires_at: null,
      updated_at: new Date().toISOString(),
    }),
  });

  return publicAccount(account);
}

export async function setCustomerResetToken(email) {
  const account = await findCustomerByEmail(validateEmail(email));
  if (!account) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_MAX_AGE_MS).toISOString();

  await supabaseRequest(`customer_accounts?id=eq.${account.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      reset_token_hash: hashToken(token),
      reset_requested_at: new Date().toISOString(),
      reset_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }),
  });

  return { account: publicAccount(account), token, expiresAt };
}

export async function updatePasswordWithToken(token, password) {
  const resetToken = String(token || "");
  if (!/^[a-zA-Z0-9_-]{20,160}$/.test(resetToken)) {
    throw new Error("Reset link is invalid or expired.");
  }
  const account = await findCustomerByResetToken(resetToken);
  if (!account) {
    throw new Error("Reset link is invalid or expired.");
  }

  if (!account.reset_expires_at || new Date(account.reset_expires_at).getTime() < Date.now()) {
    throw new Error("Reset link is invalid or expired.");
  }

  const salt = randomBytes(16).toString("hex");
  await supabaseRequest(`customer_accounts?id=eq.${account.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      password_hash: hashPassword(validatePassword(password), salt),
      password_salt: salt,
      reset_token_hash: null,
      reset_requested_at: null,
      reset_expires_at: null,
      session_version: Number(account.session_version || 1) + 1,
      updated_at: new Date().toISOString(),
    }),
  });
}

export function createSessionResponse(customer, request) {
  const cookie = serializeCookie(COOKIE_NAME, signSession(customer), request);
  return ok({ customer: publicAccount(customer) }, { headers: { "Set-Cookie": cookie } });
}

export function clearSessionResponse(request) {
  return ok(
    { success: true },
    {
      headers: {
        "Set-Cookie": serializeCookie(COOKIE_NAME, "", request, 0),
      },
    }
  );
}

export async function readCustomerSession(request) {
  const cookie = request.headers.get("cookie") || "";
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!value) {
    return null;
  }

  const session = verifySession(value);
  if (!session) {
    return null;
  }

  const account = await findCustomerById(session.id);
  if (
    !account?.email_verified_at ||
    Number(account.session_version || 1) !== Number(session.sessionVersion)
  ) {
    return null;
  }

  return publicAccount(account);
}

export function buildResetUrl(request, token) {
  const origin =
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    new URL(request.url).origin;
  const url = new URL("/account/reset-password", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

export function buildVerificationUrl(request, token) {
  const origin =
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    new URL(request.url).origin;
  const url = new URL("/account/verify-email", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(String(password || ""), salt), "hex");
  const expected = Buffer.from(expectedHash || "", "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

function hashToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

function sessionSecret() {
  const secret = String(
    process.env.CUSTOMER_AUTH_SECRET || process.env.AUTH_SECRET || "",
  );
  if (secret.length < 32) {
    const error = new Error("Customer authentication is not configured.");
    error.status = 503;
    throw error;
  }
  return secret;
}

function signSession(customer) {
  const payload = Buffer.from(
    JSON.stringify({
      id: customer.id,
      sessionVersion: Number(customer.sessionVersion || 1),
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifySession(value) {
  const [payload, signature] = String(value).split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      id: session.id,
      sessionVersion: session.sessionVersion,
    };
  } catch {
    return null;
  }
}

function serializeCookie(name, value, request, maxAge = SESSION_MAX_AGE) {
  const forwardedProto = request.headers.get("x-forwarded-proto") || "";
  const isSecure =
    process.env.NODE_ENV === "production" ||
    forwardedProto.split(",")[0]?.trim() === "https" ||
    new URL(request.url).protocol === "https:";
  return [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    "Priority=High",
    isSecure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
