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
    newsletter: [],
    newsletterSegments: [],
    newsletterUpdates: [],
    errors: [],
    settings: [],
    audit: [],
  };
}

export async function authenticateAdminAccess(code) {
  const data = await apiRequest("/api/admin-auth/session", {
    method: "POST",
    body: JSON.stringify({ code: String(code || "").trim() }),
  });
  return data.role;
}

export async function fetchAdminAccessSession() {
  const data = await apiRequest("/api/admin-auth/session");
  return data.role;
}

export async function logoutAdminAccess() {
  await apiRequest("/api/admin-auth/session", { method: "DELETE" });
}

export async function fetchAdminWorkspace() {
  const data = await apiRequest("/api/admin-workspace");
  return normalizeAdminWorkspace(data.workspace);
}

export async function saveAdminWorkspace(workspace) {
  const data = await apiRequest("/api/admin-workspace", {
    method: "PATCH",
    body: JSON.stringify({
      workspace: normalizeAdminWorkspace(workspace),
    }),
  });
  return normalizeAdminWorkspace(data.workspace);
}

export async function updateAdminErrorReport(id, status) {
  const data = await apiRequest("/api/errors/report", {
    method: "PATCH",
    body: JSON.stringify({ id, status }),
  });
  return normalizeAdminWorkspace(data.workspace);
}

export async function fetchNewsletterSubscribers() {
  const data = await apiRequest("/api/newsletter");
  return Array.isArray(data.subscribers) ? data.subscribers : [];
}

export async function updateNewsletterSubscriber(subscriber) {
  const data = await apiRequest("/api/newsletter", {
    method: "PATCH",
    body: JSON.stringify(subscriber),
  });
  return data.subscriber;
}

export async function sendNewsletterCampaign({ subject, title, message }) {
  return apiRequest("/api/newsletter", {
    method: "POST",
    body: JSON.stringify({
      mode: "campaign",
      subject,
      title,
      message,
    }),
  });
}

export async function recordAdminInquiry(payload) {
  const data = await apiRequest("/api/commissions", {
    method: "POST",
    body: JSON.stringify({ ...payload, type: "inquiry" }),
  });
  return data.request;
}

export async function recordAdminOrder(payload) {
  const data = await apiRequest("/api/commissions", {
    method: "POST",
    body: JSON.stringify({ ...payload, type: "order" }),
  });
  return data.order;
}

export async function trackAdminCommission({ commissionId, email }) {
  return apiRequest("/api/commissions/track", {
    method: "POST",
    body: JSON.stringify({ commissionId, email }),
  });
}

function normalizeAdminWorkspace(workspace = {}) {
  return {
    ...createEmptyAdminWorkspace(),
    ...workspace,
    requests: Array.isArray(workspace.requests) ? workspace.requests : [],
    pieces: Array.isArray(workspace.pieces) ? workspace.pieces : [],
    team: Array.isArray(workspace.team) ? workspace.team : [],
    orders: Array.isArray(workspace.orders) ? workspace.orders : [],
    customers: Array.isArray(workspace.customers) ? workspace.customers : [],
    contracts: Array.isArray(workspace.contracts) ? workspace.contracts : [],
    measurements: Array.isArray(workspace.measurements) ? workspace.measurements : [],
    materials: Array.isArray(workspace.materials) ? workspace.materials : [],
    content: Array.isArray(workspace.content) ? workspace.content : [],
    promotions: Array.isArray(workspace.promotions) ? workspace.promotions : [],
    newsletter: Array.isArray(workspace.newsletter) ? workspace.newsletter : [],
    newsletterSegments: Array.isArray(workspace.newsletterSegments)
      ? workspace.newsletterSegments
      : [],
    newsletterUpdates: Array.isArray(workspace.newsletterUpdates)
      ? workspace.newsletterUpdates
      : [],
    errors: Array.isArray(workspace.errors) ? workspace.errors : [],
    settings: Array.isArray(workspace.settings) ? workspace.settings : [],
    audit: Array.isArray(workspace.audit) ? workspace.audit : [],
  };
}

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Live service is temporarily unavailable. Please try again.");
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Live service request failed.");
  }

  return data;
}
