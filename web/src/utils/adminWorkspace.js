export const ADMIN_WORKSPACE_STORAGE_KEY = "korede-james-admin-workspace-v2";
export const ADMIN_ACCESS_SECRET_KEY = "korede-james-admin-secret";

export function createEmptyAdminWorkspace() {
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
    settings: [],
    audit: [],
  };
}

export function readAdminWorkspace() {
  if (typeof window === "undefined") {
    return createEmptyAdminWorkspace();
  }

  try {
    const stored = window.localStorage.getItem(ADMIN_WORKSPACE_STORAGE_KEY);
    return normalizeAdminWorkspace(stored ? JSON.parse(stored) : {});
  } catch {
    return createEmptyAdminWorkspace();
  }
}

export function writeAdminWorkspace(workspace) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ADMIN_WORKSPACE_STORAGE_KEY,
    JSON.stringify(normalizeAdminWorkspace(workspace)),
  );
}

export async function fetchAdminWorkspace() {
  try {
    const data = await apiRequest("/api/admin-workspace", {
      headers: adminHeaders(),
    });
    writeAdminWorkspace(data.workspace);
    return normalizeAdminWorkspace(data.workspace);
  } catch {
    return readAdminWorkspace();
  }
}

export async function saveAdminWorkspace(workspace) {
  writeAdminWorkspace(workspace);

  try {
    const data = await apiRequest("/api/admin-workspace", {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ workspace }),
    });
    writeAdminWorkspace(data.workspace);
    return normalizeAdminWorkspace(data.workspace);
  } catch {
    return normalizeAdminWorkspace(workspace);
  }
}

export async function recordAdminInquiry(payload) {
  try {
    const data = await apiRequest("/api/commissions", {
      method: "POST",
      body: JSON.stringify({ ...payload, type: "inquiry" }),
    });
    writeAdminWorkspace(data.workspace);
    return data.request;
  } catch {
    return recordAdminInquiryLocally(payload);
  }
}

export async function recordAdminOrder(payload) {
  try {
    const data = await apiRequest("/api/commissions", {
      method: "POST",
      body: JSON.stringify({ ...payload, type: "order" }),
    });
    writeAdminWorkspace(data.workspace);
    return data.order;
  } catch {
    return recordAdminOrderLocally(payload);
  }
}

export async function trackAdminCommission({ commissionId, email }) {
  try {
    return await apiRequest("/api/commissions/track", {
      method: "POST",
      body: JSON.stringify({ commissionId, email }),
    });
  } catch {
    return findLocalCommissionRecord({ commissionId, email });
  }
}

function recordAdminInquiryLocally({
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
  const workspace = readAdminWorkspace();
  const firstName = customer?.firstName || "";
  const lastName = customer?.lastName || "";
  const customerName = customer?.name || [firstName, lastName].filter(Boolean).join(" ");
  const projectNotes = [
    project?.timeline ? `Timeline: ${project.timeline}` : "",
    project?.notes,
    notes,
  ]
    .filter(Boolean)
    .join("\n\n");
  const request = {
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

  writeAdminWorkspace({
    ...workspace,
    requests: [request, ...workspace.requests],
    customers: upsertWorkspaceCustomer(workspace.customers, {
      name: request.client,
      email: request.email,
      note: request.notes || source,
    }),
    audit: [
      createAuditEntry(`Received ${source.toLowerCase()} from ${request.client}`),
      ...workspace.audit,
    ],
  });

  return request;
}

function recordAdminOrderLocally({ customer, items, contact, shipping }) {
  const workspace = readAdminWorkspace();
  const orderId = createWorkspaceId("KJ");
  const itemSummary = items
    .map((item) => `${item.quantity || 1}x ${item.name}`)
    .join(", ");
  const contactSummary = formatWorkspaceDetails(contact);
  const shippingSummary = formatWorkspaceDetails(shipping);
  const request = {
    id: `req-${orderId.toLowerCase()}`,
    client: customer.name,
    email: customer.email,
    artifact: itemSummary || "Collection order",
    budget: "No payment due at submission",
    status: "Inquiry received",
    stage: "Inquiry received",
    due: "To be scheduled",
    updated: "Just now",
    phone: customer.phone,
    notes: [
      "Collection order submitted from website.",
      contactSummary ? `Contact: ${contactSummary}` : "",
      shippingSummary ? `Delivery: ${shippingSummary}` : "",
      itemSummary ? `Pieces: ${itemSummary}` : "",
      "Payment: no payment collected. Atelier review required.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
  const order = {
    id: orderId,
    customer: customer.name,
    total: "No payment due",
    status: "Inquiry received",
    refundLimit: "Not applicable",
    notes: request.notes,
  };

  writeAdminWorkspace({
    ...workspace,
    requests: [request, ...workspace.requests],
    orders: [order, ...workspace.orders],
    customers: upsertWorkspaceCustomer(workspace.customers, {
      name: customer.name,
      email: customer.email,
      note: `Submitted ${items.length} collection piece${items.length === 1 ? "" : "s"}.`,
    }),
    audit: [
      createAuditEntry(`Received free collection order ${orderId}`),
      ...workspace.audit,
    ],
  });

  return order;
}

function findLocalCommissionRecord({ commissionId, email }) {
  const workspace = readAdminWorkspace();
  const normalizedInputId = normalizeLookup(commissionId);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const order = workspace.orders.find(
    (item) => normalizeLookup(item.id) === normalizedInputId,
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

function normalizeAdminWorkspace(workspace) {
  return {
    ...createEmptyAdminWorkspace(),
    ...workspace,
    requests: workspace.requests || [],
    pieces: workspace.pieces || [],
    team: workspace.team || [],
    orders: workspace.orders || [],
    customers: workspace.customers || [],
    contracts: workspace.contracts || [],
    measurements: workspace.measurements || [],
    materials: workspace.materials || [],
    content: workspace.content || [],
    promotions: workspace.promotions || [],
    settings: workspace.settings || [],
    audit: workspace.audit || [],
  };
}

function upsertWorkspaceCustomer(customers, nextCustomer) {
  const normalizedEmail = String(nextCustomer.email || "").toLowerCase();
  const existing = customers.find(
    (customer) => String(customer.email || "").toLowerCase() === normalizedEmail,
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
      : customer,
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

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Workspace request failed.");
  }

  return data;
}

function adminHeaders() {
  if (typeof window === "undefined") {
    return {};
  }

  const code =
    window.sessionStorage.getItem(ADMIN_ACCESS_SECRET_KEY) ||
    window.localStorage.getItem(ADMIN_ACCESS_SECRET_KEY);

  return code ? { "x-kj-admin-code": code } : {};
}

function normalizeLookup(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
