import { timingSafeEqual } from "node:crypto";
import { supabaseRequest } from "../../utils/supabaseRest.js";
import { formatMoney, sumLineItems } from "../../../../utils/pricing.js";

const WORKSPACE_ID = process.env.ADMIN_WORKSPACE_ID || "main";

const legacyRolePasswords = {
  Iamtheadmin: "owner",
  Iamtheeditor: "editor",
  Iamthestudio: "studio",
  Iamthesupport: "support",
};

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
    settings: Array.isArray(value.settings) ? value.settings : [],
    audit: Array.isArray(value.audit) ? value.audit : [],
  };
}

export async function readWorkspace() {
  const params = new URLSearchParams({
    select: "data",
    id: `eq.${WORKSPACE_ID}`,
    limit: "1",
  });
  const rows = await supabaseRequest(`admin_workspaces?${params.toString()}`);
  return normalizeWorkspace(rows?.[0]?.data);
}

export async function writeWorkspace(workspace) {
  const normalized = normalizeWorkspace(workspace);
  await supabaseRequest("admin_workspaces?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: WORKSPACE_ID,
      data: normalized,
      updated_at: new Date().toISOString(),
    }),
  });
  return normalized;
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
    paystackReference: payment.reference || "",
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
  const nextOrder = {
    ...existingOrder,
    status: "Accepted / deposit paid",
    paymentStatus: "paid",
    paymentConfirmedAt: existingOrder.paymentConfirmedAt || paidAt,
    total: payment.total || existingOrder.total,
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
      budget: payment.total || request.budget,
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

  const order = workspace.orders.find(
    (item) => normalizeLookup(item.id) === normalizedInputId
  );
  const request = workspace.requests.find((item) => {
    const requestIds = [
      item.id,
      item.id?.replace(/^req-/i, ""),
      order ? `req-${order.id}` : "",
    ].map(normalizeLookup);
    const matchesId = requestIds.includes(normalizedInputId);
    const matchesEmail =
      String(item.email || "").trim().toLowerCase() === normalizedEmail;

    if (order) {
      return (
        matchesEmail &&
        (requestIds.includes(normalizeLookup(`req-${order.id}`)) ||
          item.client === order.customer)
      );
    }

    return matchesId && matchesEmail;
  });

  if (!request) {
    return null;
  }

  return {
    request,
    order,
    displayId: order?.id || request.id,
  };
}

export function requireAdmin(request) {
  const suppliedCode = request.headers.get("x-kj-admin-code") || "";
  const role = findRoleForAccessCode(suppliedCode);

  if (!role) {
    throw new AdminAuthError();
  }

  return role;
}

function findRoleForAccessCode(suppliedCode) {
  const code = String(suppliedCode || "").trim();
  if (!code || code.length > 160) {
    return null;
  }

  const configuredCodes = readConfiguredRoleCodes();
  const entries = Object.entries(
    Object.keys(configuredCodes).length ? configuredCodes : legacyRolePasswords,
  );

  for (const [expectedCode, role] of entries) {
    if (safeEquals(code, expectedCode) && isKnownRole(role)) {
      return role;
    }
  }

  return null;
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
    Object.entries(codes).filter(([code, role]) => code && isKnownRole(role)),
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
  const suffix = Date.now().toString().slice(-6);
  return `${prefix}-${suffix}`;
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
