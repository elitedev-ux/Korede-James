export const ADMIN_WORKSPACE_STORAGE_KEY = "korede-james-admin-workspace-v2";

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

export function recordAdminInquiry({
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

export function recordAdminOrder({ customer, items, contact, shipping }) {
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
