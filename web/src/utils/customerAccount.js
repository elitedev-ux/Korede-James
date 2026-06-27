async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export async function getCustomerSession() {
  const data = await apiRequest("/api/customer-auth/session");
  return data.customer || null;
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
