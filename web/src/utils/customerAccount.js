import { readAdminWorkspace } from "./adminWorkspace";

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Account service is unreachable. Please try again.");
  }

  const rawText = await response.text();
  let data = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Account service returned ${response.status}. Please check the backend setup.`
    );
  }

  return data;
}

export async function getCustomerSession() {
  const data = await apiRequest("/api/customer-auth/session");
  return data.customer || null;
}

export async function getCustomerCommissions(customer) {
  const localCommissions = getLocalCustomerCommissions(customer);

  try {
    const data = await apiRequest("/api/customer-auth/commissions");
    return mergeCommissions(
      Array.isArray(data.commissions) ? data.commissions : [],
      localCommissions
    );
  } catch {
    return localCommissions;
  }
}

export async function clearCustomerSession() {
  await apiRequest("/api/customer-auth/logout", { method: "POST" });
}

export async function createCustomerAccount({
  firstName,
  lastName,
  email,
  password,
}) {
  const data = await apiRequest("/api/customer-auth/signup", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  return data.customer;
}

export async function signInCustomer(email, password) {
  const data = await apiRequest("/api/customer-auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.customer;
}

export async function requestCustomerPasswordReset(email) {
  return apiRequest("/api/customer-auth/password/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetCustomerPassword(token, password) {
  return apiRequest("/api/customer-auth/password/confirm", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

function getLocalCustomerCommissions(customer) {
  if (!customer?.email || typeof window === "undefined") {
    return [];
  }

  const workspace = readAdminWorkspace();
  const email = normalizeEmail(customer.email);
  const ordersByRequestId = new Map(
    workspace.orders.map((order) => [normalizeLookup(`req-${order.id}`), order])
  );

  return workspace.requests
    .filter((request) => normalizeEmail(request.email) === email)
    .map((request) => {
      const matchingOrder = ordersByRequestId.get(normalizeLookup(request.id));
      const displayId = matchingOrder?.id || request.id;

      return {
        id: request.id,
        displayId,
        artifact: request.artifact,
        status: request.status,
        stage: request.stage,
        updated: request.updated,
        budget: request.budget,
      };
    });
}

function mergeCommissions(primary, fallback) {
  const seen = new Set();

  return [...primary, ...fallback].filter((commission) => {
    const key = normalizeLookup(commission.displayId || commission.id);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function normalizeLookup(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
