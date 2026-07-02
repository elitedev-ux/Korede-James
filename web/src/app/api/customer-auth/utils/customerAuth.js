import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import {
  fail,
  ok,
  readBody,
  supabaseRequest,
} from "../../utils/supabaseRest.js";
import { sendPasswordResetEmail } from "../../utils/email.js";

const COOKIE_NAME = "kj_customer_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const RESET_TOKEN_MAX_AGE_MS = 1000 * 60 * 30;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export { fail, ok, readBody, sendPasswordResetEmail };

export function validateEmail(email) {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email address.");
  }
  return normalized;
}

export function validatePassword(password) {
  const value = String(password || "");
  if (value.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  return value;
}

function publicAccount(account) {
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    firstName: account.first_name,
    lastName: account.last_name,
    email: account.email,
  };
}

export async function findCustomerByEmail(email) {
  const normalized = normalizeEmail(email);
  const params = new URLSearchParams({
    select:
      "id,first_name,last_name,email,password_hash,password_salt,reset_token_hash,reset_expires_at",
    email: `eq.${normalized}`,
    limit: "1",
  });
  const rows = await supabaseRequest(`customer_accounts?${params.toString()}`);
  return rows?.[0] || null;
}

export async function findCustomerByResetToken(token) {
  const tokenHash = hashToken(token);
  const params = new URLSearchParams({
    select: "id,first_name,last_name,email,reset_token_hash,reset_expires_at",
    reset_token_hash: `eq.${tokenHash}`,
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

  const existing = await findCustomerByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account already exists for this email.");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(validatePassword(password), salt);
  const rows = await supabaseRequest("customer_accounts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      first_name: cleanFirstName,
      last_name: cleanLastName,
      email: normalizedEmail,
      password_hash: passwordHash,
      password_salt: salt,
    }),
  });

  return publicAccount(rows?.[0]);
}

export async function verifyCustomer(email, password) {
  const account = await findCustomerByEmail(validateEmail(email));
  if (!account || !verifyPassword(password, account.password_salt, account.password_hash)) {
    throw new Error("Email or password is incorrect.");
  }

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
  const account = await findCustomerByResetToken(String(token || ""));
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
      updated_at: new Date().toISOString(),
    }),
  });
}

export function createSessionResponse(customer, request) {
  const cookie = serializeCookie(COOKIE_NAME, signSession(customer), request);
  return ok({ customer }, { headers: { "Set-Cookie": cookie } });
}

export function clearSessionResponse() {
  return ok(
    { success: true },
    {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    }
  );
}

export function readCustomerSession(request) {
  const cookie = request.headers.get("cookie") || "";
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!value) {
    return null;
  }

  return verifySession(value);
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
  return (
    process.env.CUSTOMER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "dev-only-korede-james-customer-secret"
  );
}

function signSession(customer) {
  const payload = Buffer.from(
    JSON.stringify({
      ...customer,
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
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
    };
  } catch {
    return null;
  }
}

function serializeCookie(name, value, request) {
  const isSecure = new URL(request.url).protocol === "https:";
  return [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE}`,
    isSecure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
