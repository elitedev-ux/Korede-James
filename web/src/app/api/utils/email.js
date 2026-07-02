const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendTransactionalEmail({ to, subject, preview, html }) {
  if (!isValidEmail(to)) {
    return { sent: false, reason: "invalid-recipient" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    process.env.CUSTOMER_AUTH_FROM_EMAIL ||
    process.env.KJ_EMAIL_FROM;

  if (!apiKey || !from) {
    return { sent: false, reason: "missing-config" };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: emailLayout({ preview, html }),
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      console.warn("[email] Resend rejected email", {
        to,
        subject,
        status: response.status,
        message,
      });
      return { sent: false, reason: message || "resend-error" };
    }

    return { sent: true };
  } catch (error) {
    console.warn("[email] Resend email failed", {
      to,
      subject,
      error: error instanceof Error ? error.message : "email-error",
    });
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "email-error",
    };
  }
}

export function sendWelcomeEmail(customer) {
  const name = customerName(customer);

  return sendTransactionalEmail({
    to: customer?.email,
    subject: "Welcome to Korede James",
    preview: "Your private client account is ready.",
    html: `
      <p>Hello ${escapeHtml(name)},</p>
      <p>Your private Korede James client account has been created. You can now use it to follow commission updates, track atelier progress, and keep your project records in one place.</p>
      <p><a href="${escapeHtml(accountUrl())}">Open your account</a></p>
    `,
  });
}

export function sendPasswordResetEmail({ email, resetUrl }) {
  return sendTransactionalEmail({
    to: email,
    subject: "Reset your Korede James password",
    preview: "Use this secure link to reset your password.",
    html: `
      <p>Use this secure link to reset your Korede James password:</p>
      <p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>
      <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
    `,
  });
}

export function sendCommissionReceivedEmail({ email, client, displayId, artifact }) {
  return sendTransactionalEmail({
    to: email,
    subject: `Commission received: ${displayId}`,
    preview: "Your Korede James commission request has been received.",
    html: `
      <p>Hello ${escapeHtml(client || "there")},</p>
      <p>Thank you. Your Korede James commission request has been received.</p>
      <p><strong>Commission number:</strong> ${escapeHtml(displayId)}</p>
      ${artifact ? `<p><strong>Request:</strong> ${escapeHtml(artifact)}</p>` : ""}
      <p>The atelier team will review the details and update the commission progress from the admin desk.</p>
      <p><a href="${escapeHtml(trackUrl(displayId))}">Track your commission</a></p>
    `,
  });
}

export function sendPaymentReceivedEmail({ email, client, displayId, total, method }) {
  return sendTransactionalEmail({
    to: email,
    subject: `Payment details received: ${displayId}`,
    preview: "Your commission payment details have been received.",
    html: `
      <p>Hello ${escapeHtml(client || "there")},</p>
      <p>Your payment details have been received for commission ${escapeHtml(displayId)}.</p>
      ${total ? `<p><strong>Registered value:</strong> ${escapeHtml(total)}</p>` : ""}
      ${method ? `<p><strong>Method:</strong> ${escapeHtml(method)}</p>` : ""}
      <p>The studio will confirm the payment and next atelier steps.</p>
    `,
  });
}

export function sendCommissionProgressEmail({ request, displayId }) {
  return sendTransactionalEmail({
    to: request?.email,
    subject: `Commission update: ${displayId}`,
    preview: "Your Korede James commission progress has been updated.",
    html: `
      <p>Hello ${escapeHtml(request?.client || "there")},</p>
      <p>Your Korede James commission progress has been updated.</p>
      <p><strong>Commission number:</strong> ${escapeHtml(displayId)}</p>
      <p><strong>Status:</strong> ${escapeHtml(request?.status || "Updated")}</p>
      <p><strong>Stage:</strong> ${escapeHtml(request?.stage || "Updated")}</p>
      <p><a href="${escapeHtml(trackUrl(displayId))}">Track your commission</a></p>
    `,
  });
}

export async function notifyCommissionProgressUpdates({ previousWorkspace, nextWorkspace }) {
  const previousRequests = new Map(
    (previousWorkspace?.requests || []).map((request) => [request.id, request])
  );
  const ordersByRequestId = new Map(
    (nextWorkspace?.orders || []).map((order) => [normalizeLookup(`req-${order.id}`), order])
  );
  const updatedRequests = (nextWorkspace?.requests || []).filter((request) => {
    const previous = previousRequests.get(request.id);
    return (
      previous &&
      (previous.status !== request.status || previous.stage !== request.stage)
    );
  });

  await Promise.all(
    updatedRequests.map((request) => {
      const order = ordersByRequestId.get(normalizeLookup(request.id));
      return sendCommissionProgressEmail({
        request,
        displayId: order?.id || request.id,
      });
    })
  );
}

function emailLayout({ preview, html }) {
  return `
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview || "")}</div>
    <main style="font-family:Georgia,'Times New Roman',serif;color:#111;line-height:1.7;padding:32px;background:#ffffff">
      <p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#8a5a2e;margin:0 0 20px">Korede James</p>
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:620px">
        ${html}
      </div>
    </main>
  `;
}

function accountUrl() {
  return `${siteOrigin()}/account`;
}

function trackUrl(displayId) {
  return `${siteOrigin()}/track?commission=${encodeURIComponent(displayId || "")}`;
}

function siteOrigin() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    "https://korede-james.vercel.app"
  ).replace(/\/$/, "");
}

function customerName(customer) {
  return [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || "there";
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function normalizeLookup(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
