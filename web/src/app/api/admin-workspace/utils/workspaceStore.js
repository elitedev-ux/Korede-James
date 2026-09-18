import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { supabaseRequest } from "../../utils/supabaseRest.js";
import { formatMoney, sumLineItems } from "../../../../utils/pricing.js";

const WORKSPACE_ID = process.env.ADMIN_WORKSPACE_ID || "main";

const ADMIN_COOKIE_NAME = "kj_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export function createEmptyWorkspace() {
  return {
    requests: [],
    pieces: [],
    team: [],
    orders: [],
    customers: [],
    contracts: [],
    measurements: [],
    materials: [],
    content: [],
    promotions: [],
    newsletter: [],
    newsletterSegments: [],
    newsletterUpdates: [],
    errors: [],
    settings: [],
    audit: [],
  };
}

export function normalizeWorkspace(workspace) {
  const fallback = createEmptyWorkspace();
  const value = workspace && typeof workspace === "object" ? workspace : {};

  return {
    ...fallback,
    ...value,
    requests: Array.isArray(value.requests) ? value.requests : [],
    pieces: Array.isArray(value.pieces) ? value.pieces : [],
    team: Array.isArray(value.team) ? value.team : [],
    orders: Array.isArray(value.orders) ? value.orders : [],
    customers: Array.isArray(value.customers) ? value.customers : [],
    contracts: Array.isArray(value.contracts) ? value.contracts : [],
    measurements: Array.isArray(value.measurements) ? value.measurements : [],
    materials: Array.isArray(value.materials) ? value.materials : [],
    content: Array.isArray(value.content) ? value.content : [],
    promotions: Array.isArray(value.promotions) ? value.promotions : [],
    newsletter: Array.isArray(value.newsletter) ? value.newsletter : [],
    newsletterSegments: Array.isArray(value.newsletterSegments) ? value.newsletterSegments : [],
    newsletterUpdates: Array.isArray(value.newsletterUpdates) ? value.newsletterUpdates : [],
    errors: Array.isArray(value.errors) ? value.errors : [],
    settings: Array.isArray(value.settings) ? value.settings : [],
    audit: Array.isArray(value.audit) ? value.audit : [],
  };
}

export async function readWorkspace() {
  const params = new URLSearchParams({
    select: "data,version",
    id: `eq.${WORKSPACE_ID}`,
    limit: "1",
  });
  const rows = await supabaseRequest(`admin_workspaces?${params.toString()}`);
  return normalizeWorkspace({
    ...(rows?.[0]?.data || {}),
    _version: Number(rows?.[0]?.version || 0),
  });
}

export async function writeWorkspace(workspace) {
  const normalized = normalizeWorkspace(workspace);
  const expectedVersion = Number(normalized._version);
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    throw workspaceConflict();
  }

  const { _version, ...data } = normalized;
  try {
    const rows = await supabaseRequest("rpc/replace_admin_workspace", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        p_id: WORKSPACE_ID,
        p_data: data,
        p_expected_version: expectedVersion,
      }),
    });
    const saved = Array.isArray(rows) ? rows[0] : rows;
    if (!saved?.workspace_version) {
      throw workspaceConflict();
    }
    return normalizeWorkspace({
      ...(saved.workspace_data || data),
      _version: Number(saved.workspace_version),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Workspace changed before it could be saved")
    ) {
      throw workspaceConflict();
    }
    throw error;
  }
}

function workspaceConflict() {
  const error = new Error(
    "Workspace changed in another session. Refresh and try again.",
  );
  error.status = 409;
  return error;
}

export async function appendErrorReport(payload = {}) {
  const workspace = await readWorkspace();
  const report = normalizeErrorReport(payload);
  const recentMatchIndex = workspace.errors.findIndex(
    (entry) =>
      entry.fingerprint === report.fingerprint &&
      Date.now() - new Date(entry.lastSeenAt || entry.occurredAt || 0).getTime() <
        10 * 60 * 1000,
  );
  const errors = [...workspace.errors];

  if (recentMatchIndex >= 0) {
    const existing = errors[recentMatchIndex];
    errors[recentMatchIndex] = {
      ...existing,
      count: (Number(existing.count) || 1) + 1,
      lastSeenAt: report.lastSeenAt,
      details: report.details || existing.details,
      status: existing.status === "dismissed" ? "open" : existing.status,
    };
  } else {
    errors.unshift(report);
  }

  const nextWorkspace = normalizeWorkspace({
    ...workspace,
    errors: errors.slice(0, 250),
  });
  await writeWorkspace(nextWorkspace);
  return recentMatchIndex >= 0 ? errors[recentMatchIndex] : report;
}

export async function appendInquiry(payload) {
  const workspace = await readWorkspace();
  const request = createInquiryRecord(payload);
  const nextWorkspace = normalizeWorkspace({
    ...workspace,
    requests: [request, ...workspace.requests],
    customers: upsertWorkspaceCustomer(workspace.customers, {
      name: request.client,
      email: request.email,
      note: request.notes || payload.source || "Website inquiry",
    }),
    audit: [
      createAuditEntry(`Received ${(payload.source || "Website inquiry").toLowerCase()} from ${request.client}`),
      ...workspace.audit,
    ],
  });

  await writeWorkspace(nextWorkspace);
  return { request, workspace: nextWorkspace };
}

export async function appendOrder(payload) {
  const workspace = await readWorkspace();
  const orderId = createWorkspaceId("KJ");
  const items = Array.isArray(payload.items) ? payload.items : [];
  const itemSummary = items
    .map((item) => `${item.quantity || 1}x ${item.name}`)
    .join(", ");
  const contactSummary = formatWorkspaceDetails(payload.contact);
  const shippingSummary = formatWorkspaceDetails(payload.shipping);
  const payment = payload.payment || {};
  const currency = payment.currency || "NGN";
  const paymentStatus = payment.status || (payment.paidAt ? "paid" : "pending");
  const computedSubtotal = sumLineItems(items, currency);
  const subtotal = Number(payment.subtotal) || computedSubtotal;
  const shipping = Number(payment.shipping) || 0;
  const total = Number(payment.total) || subtotal + shipping;
  const totalLabel = formatCurrency(total, currency);
  const shippingQuote = normalizeShippingQuote(payment.shippingQuote);
  const shippingLabel = shipping ? formatCurrency(shipping, currency) : "Atelier confirmation";
  const dispatchSummary = formatDispatchSummary(shippingQuote, shippingLabel);
  const customer = payload.customer || {};
  const request = {
    id: `req-${orderId.toLowerCase()}`,
    client: customer.name || "Website Client",
    email: customer.email || "No email provided",
    artifact: itemSummary || "Collection order",
    budget: totalLabel,
    status: paymentStatus === "paid" ? "Accepted / deposit paid" : "Inquiry received",
    stage: paymentStatus === "paid" ? "Accepted / deposit paid" : "Inquiry received",
    due: "To be scheduled",
    updated: "Just now",
    phone: customer.phone || "",
    notes: [
      "Collection order submitted from website.",
      contactSummary ? `Contact: ${contactSummary}` : "",
      shippingSummary ? `Delivery: ${shippingSummary}` : "",
      dispatchSummary ? `Dispatch: ${dispatchSummary}` : "",
      itemSummary ? `Pieces: ${itemSummary}` : "",
      `Payment: ${totalLabel} via ${payment.method || "Card"}${payment.cardLast4 ? ` ending ${payment.cardLast4}` : ""}${paymentStatus === "paid" ? " confirmed" : " pending confirmation"}.`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
  const order = {
    id: orderId,
    customer: request.client,
    total: totalLabel,
    status: paymentStatus === "paid" ? "Accepted / deposit paid" : "Awaiting payment confirmation",
    refundLimit: "Not applicable",
    notes: request.notes,
    subtotal: formatCurrency(subtotal, currency),
    shipping: shippingLabel,
    shippingQuote,
    paystackReference: payment.reference || "",
    paystackExpectedAmountMinor: Math.round(total * 100),
    paystackExpectedCurrency: String(currency).toUpperCase(),
    paystackExpectedEmail: String(customer.email || "").trim().toLowerCase(),
    paystackExpectedSource: String(payment.source || ""),
    paymentStatus,
    paymentConfirmedAt: payment.paidAt || "",
  };
  const nextWorkspace = normalizeWorkspace({
    ...workspace,
    requests: [request, ...workspace.requests],
    orders: [order, ...workspace.orders],
    customers: upsertWorkspaceCustomer(workspace.customers, {
      name: request.client,
      email: request.email,
      note: `Submitted ${items.length} collection piece${items.length === 1 ? "" : "s"}.`,
    }),
    audit: [
      createAuditEntry(
        paymentStatus === "paid"
          ? `Received paid collection order ${orderId}`
          : `Opened Paystack checkout for collection order ${orderId}`,
      ),
      ...workspace.audit,
    ],
  });

  await writeWorkspace(nextWorkspace);
  return { order, request, workspace: nextWorkspace };
}

export async function confirmOrderPayment(reference, payment = {}) {
  const workspace = await readWorkspace();
  const normalizedReference = String(reference || "");
  const existingOrder = workspace.orders.find(
    (order) => String(order.paystackReference || "") === normalizedReference,
  );

  if (!existingOrder) {
    return null;
  }

  const wasAlreadyPaid = existingOrder.paymentStatus === "paid";
  const paidAt = payment.paidAt || new Date().toISOString();
  const totalLabel = existingOrder.total;
  const nextOrder = {
    ...existingOrder,
    status: "Accepted / deposit paid",
    paymentStatus: "paid",
    paymentConfirmedAt: existingOrder.paymentConfirmedAt || paidAt,
    total: totalLabel,
    notes: appendUniqueLine(
      existingOrder.notes,
      `Payment confirmed via ${payment.method || "Paystack"}${normalizedReference ? ` (${normalizedReference})` : ""}.`,
    ),
  };
  const requestId = normalizeLookup(`req-${existingOrder.id}`);
  const nextRequests = workspace.requests.map((request) => {
    if (normalizeLookup(request.id) !== requestId) {
      return request;
    }

    return {
      ...request,
      status: "Accepted / deposit paid",
      stage: "Accepted / deposit paid",
      updated: "Just now",
      budget: totalLabel || request.budget,
      notes: appendUniqueLine(
        request.notes,
        `Payment confirmed via ${payment.method || "Paystack"}${normalizedReference ? ` (${normalizedReference})` : ""}.`,
      ),
    };
  });
  const nextWorkspace = normalizeWorkspace({
    ...workspace,
    orders: workspace.orders.map((order) =>
      String(order.paystackReference || "") === normalizedReference ? nextOrder : order,
    ),
    requests: nextRequests,
    audit: wasAlreadyPaid
      ? workspace.audit
      : [
          createAuditEntry(`Confirmed Paystack payment for ${existingOrder.id}`),
          ...workspace.audit,
        ],
  });

  await writeWorkspace(nextWorkspace);

  return {
    order: nextOrder,
    request:
      nextWorkspace.requests.find((request) => normalizeLookup(request.id) === requestId) ||
      null,
    workspace: nextWorkspace,
    alreadyPaid: wasAlreadyPaid,
  };
}

export async function findTrackableCommission({ commissionId, email }) {
  const workspace = await readWorkspace();
  const normalizedInputId = normalizeLookup(commissionId);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (
    normalizedInputId.length < 8 ||
    normalizedInputId.length > 80 ||
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return null;
  }

  const order = workspace.orders.find(
    (item) => safeEquals(normalizeLookup(item.id), normalizedInputId),
  );
  let request = null;
  workspace.requests.forEach((item) => {
    const requestIds = [
      item.id,
      item.id?.replace(/^req-/i, ""),
    ]
      .map(normalizeLookup)
      .filter(Boolean);
    const targetIds = [
      normalizedInputId,
      order ? normalizeLookup(`req-${order.id}`) : "",
    ].filter(Boolean);
    const matchesId = requestIds.some((id) =>
      targetIds.some((targetId) => safeEquals(id, targetId)),
    );
    const matchesEmail = safeEquals(
      String(item.email || "").trim().toLowerCase(),
      normalizedEmail,
    );

    if (order) {
      if (matchesEmail && matchesId) {
        request = item;
      }
      return;
    }

    if (matchesId && matchesEmail) {
      request = item;
    }
  });

  if (!request) {
    return null;
  }

  return {
    displayId: order?.id || request.id,
    request: {
      artifact: request.artifact,
      status: request.status,
      stage: request.stage,
      updated: request.updated,
    },
  };
}

export function requireAdmin(request) {
  const role = verifyAdminSession(readCookie(request, ADMIN_COOKIE_NAME));

  if (!role) {
    throw new AdminAuthError();
  }

  return role;
}

export function authenticateAdminCode(suppliedCode) {
  const code = String(suppliedCode || "").trim();
  if (!code || code.length > 160) {
    throw new AdminAuthError();
  }

  const configuredCodes = readConfiguredRoleCodes();
  const entries = Object.entries(configuredCodes);

  if (!entries.length) {
    const error = new Error("Admin authentication is not configured.");
    error.status = 503;
    throw error;
  }

  for (const [expectedCode, role] of entries) {
    if (safeEquals(code, expectedCode) && isKnownRole(role)) {
      return role;
    }
  }

  throw new AdminAuthError();
}

export function createAdminSessionCookie(role, request) {
  if (!isKnownRole(role)) {
    throw new AdminAuthError();
  }

  const payload = Buffer.from(
    JSON.stringify({
      role,
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", adminSessionSecret())
    .update(payload)
    .digest("base64url");

  return serializeAdminCookie(`${payload}.${signature}`, request);
}

export function clearAdminSessionCookie(request) {
  return serializeAdminCookie("", request, 0);
}

function readConfiguredRoleCodes() {
  const fromJson = process.env.ADMIN_ROLE_CODES || "";
  const fromIndividual = {
    [process.env.ADMIN_OWNER_CODE || ""]: "owner",
    [process.env.ADMIN_EDITOR_CODE || ""]: "editor",
    [process.env.ADMIN_STUDIO_CODE || ""]: "studio",
    [process.env.ADMIN_SUPPORT_CODE || ""]: "support",
  };

  try {
    const parsed = fromJson ? JSON.parse(fromJson) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return removeEmptyCodes({ ...fromIndividual, ...parsed });
    }
  } catch {
    // Fall through to individual environment variables.
  }

  return removeEmptyCodes(fromIndividual);
}

function removeEmptyCodes(codes) {
  return Object.fromEntries(
    Object.entries(codes).filter(
      ([code, role]) => code.length >= 16 && isKnownRole(role),
    ),
  );
}

function isKnownRole(role) {
  return ["owner", "editor", "studio", "support"].includes(role);
}

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function verifyAdminSession(value) {
  const [payload, signature] = String(value || "").split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = createHmac("sha256", adminSessionSecret())
    .update(payload)
    .digest("base64url");
  if (!safeEquals(signature, expected)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      !isKnownRole(session.role) ||
      !session.exp ||
      session.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return session.role;
  } catch {
    return null;
  }
}

function adminSessionSecret() {
  const secret = String(process.env.ADMIN_SESSION_SECRET || "");
  if (secret.length < 32) {
    const error = new Error("Admin authentication is not configured.");
    error.status = 503;
    throw error;
  }
  return secret;
}

function readCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function serializeAdminCookie(value, request, maxAge = ADMIN_SESSION_MAX_AGE) {
  const forwardedProto = request.headers.get("x-forwarded-proto") || "";
  const isSecure =
    process.env.NODE_ENV === "production" ||
    forwardedProto.split(",")[0]?.trim() === "https" ||
    new URL(request.url).protocol === "https:";

  return [
    `${ADMIN_COOKIE_NAME}=${value}`,
    "Path=/api",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
    "Priority=High",
    isSecure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export class AdminAuthError extends Error {
  constructor() {
    super("Admin access is required.");
    this.status = 401;
  }
}

function createInquiryRecord({
  client,
  email,
  artifact,
  budget = "To be quoted",
  due = "",
  notes = "",
  phone = "",
  source = "Website inquiry",
  attachments = [],
  customer,
  project,
}) {
  const firstName = customer?.firstName || "";
  const lastName = customer?.lastName || "";
  const customerName =
    customer?.name || [firstName, lastName].filter(Boolean).join(" ");
  const projectNotes = [
    project?.timeline ? `Timeline: ${project.timeline}` : "",
    project?.notes,
    notes,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: createWorkspaceId("REQ"),
    client: client || customerName || "Website Client",
    email: email || customer?.email || "No email provided",
    artifact: artifact || project?.type || project?.title || "General inquiry",
    budget: project?.budget || budget,
    status: "Inquiry received",
    stage: "Inquiry received",
    due: due || project?.timeline || "Not specified",
    updated: "Just now",
    phone: phone || customer?.phone || "",
    notes: [source, projectNotes].filter(Boolean).join("\n\n"),
    attachments: normalizeAttachments(attachments),
  };
}

function upsertWorkspaceCustomer(customers, nextCustomer) {
  const normalizedEmail = String(nextCustomer.email || "").toLowerCase();
  const existing = customers.find(
    (customer) => String(customer.email || "").toLowerCase() === normalizedEmail
  );

  if (!existing) {
    return [
      {
        name: nextCustomer.name,
        email: nextCustomer.email,
        orders: 1,
        note: nextCustomer.note,
      },
      ...customers,
    ];
  }

  return customers.map((customer) =>
    String(customer.email || "").toLowerCase() === normalizedEmail
      ? {
          ...customer,
          name: nextCustomer.name || customer.name,
          note: nextCustomer.note || customer.note,
          orders: (customer.orders || 0) + 1,
        }
      : customer
  );
}

function createAuditEntry(action) {
  return {
    id: createWorkspaceId("audit"),
    actor: "Website",
    action,
    time: "Just now",
  };
}

function createWorkspaceId(prefix) {
  return `${prefix}-${randomBytes(12).toString("base64url")}`;
}

function normalizeErrorReport(payload) {
  const occurredAt = validIsoDate(payload.occurredAt) || new Date().toISOString();
  const source = cleanErrorText(payload.source, 80) || "website";
  const message = cleanErrorText(payload.message, 500) || "Unknown application error";
  const route = cleanRoute(payload.route);
  const context = cleanErrorText(payload.context, 300);
  const details = cleanErrorText(payload.details, 2000);
  const fingerprint = cleanErrorText(
    payload.fingerprint || `${source}|${route}|${message}`,
    700,
  ).toLowerCase();

  return {
    id: createWorkspaceId("error"),
    fingerprint,
    source,
    severity: ["critical", "error", "warning"].includes(payload.severity)
      ? payload.severity
      : "error",
    status: "open",
    message,
    context,
    details,
    route,
    occurredAt,
    lastSeenAt: new Date().toISOString(),
    count: 1,
  };
}

function cleanErrorText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanRoute(value) {
  const route = cleanErrorText(value, 300).split(/[?#]/)[0];
  return route.startsWith("/") ? route : route ? `/${route}` : "";
}

function validIsoDate(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function formatWorkspaceDetails(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return Object.values(value).filter(Boolean).join(", ");
}

function formatCurrency(value, currency = "NGN") {
  return formatMoney(value, currency);
}

function normalizeLookup(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function appendUniqueLine(notes = "", line = "") {
  const current = String(notes || "");
  const nextLine = String(line || "").trim();

  if (!nextLine || current.includes(nextLine)) {
    return current;
  }

  return [current, nextLine].filter(Boolean).join("\n");
}

function normalizeAttachments(attachments) {
  return Array.isArray(attachments)
    ? attachments
        .map((file) => ({
          name: String(file?.name || "Reference file").slice(0, 160),
          url: String(file?.url || ""),
          mimeType: String(file?.mimeType || ""),
          size: Number(file?.size || 0),
        }))
        .filter((file) => file.url)
    : [];
}

function normalizeShippingQuote(quote) {
  if (!quote || typeof quote !== "object") {
    return null;
  }

  return {
    status: String(quote.status || "manual"),
    provider: String(quote.provider || "DHL Express"),
    serviceName: String(quote.serviceName || "DHL dispatch"),
    amount: Number(quote.amount || 0),
    currency: String(quote.currency || "NGN"),
    estimatedDelivery: String(quote.estimatedDelivery || ""),
    transitDays: String(quote.transitDays || ""),
    generatedAt: String(quote.generatedAt || ""),
    note: String(quote.note || ""),
  };
}

function formatDispatchSummary(quote, shippingLabel) {
  if (!quote) {
    return shippingLabel;
  }

  if (quote.status !== "quoted") {
    return `${quote.provider} pending final atelier confirmation`;
  }

  return [
    `${quote.provider} estimate ${shippingLabel}`,
    quote.serviceName,
    quote.estimatedDelivery ? `ETA ${quote.estimatedDelivery}` : "",
  ]
    .filter(Boolean)
    .join(" / ");
}
