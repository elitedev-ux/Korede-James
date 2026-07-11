const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendTransactionalEmail({ to, subject, preview, html }) {
  const recipient = normalizeEmail(to);
  if (!isValidEmail(recipient)) {
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
        to: [recipient],
        subject: cleanHeaderText(subject || "Korede James", 140),
        html: emailLayout({
          preview: cleanHeaderText(preview || "", 180),
          html,
        }),
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
    html: brandedMessage({
      eyebrow: "Private Account",
      title: "Client Portal",
      greeting: `Hello ${name},`,
      body: [
        "Your private Korede James client account has been created.",
        "Use the portal to follow commission updates, track atelier progress, and keep project records in one place.",
      ],
      details: [
        ["Access", "Client account"],
        ["Status", "Ready"],
      ],
      action: {
        label: "Open Account",
        href: accountUrl(),
      },
    }),
  });
}

export function sendPasswordResetEmail({ email, resetUrl }) {
  return sendTransactionalEmail({
    to: email,
    subject: "Reset your Korede James password",
    preview: "Use this secure link to reset your password.",
    html: brandedMessage({
      eyebrow: "Account Security",
      title: "Password Reset",
      body: [
        "Use the secure link below to reset your Korede James password.",
        "This link expires in 30 minutes. If you did not request this, you can ignore this email.",
      ],
      details: [
        ["Request", "Password reset"],
        ["Expiry", "30 minutes"],
      ],
      action: {
        label: "Reset Password",
        href: resetUrl,
      },
      fallbackUrl: resetUrl,
    }),
  });
}

export function sendNewsletterConfirmationEmail({ email }) {
  return sendTransactionalEmail({
    to: email,
    subject: "Welcome to the Korede James inner circle",
    preview: "You are now subscribed to Korede James atelier notes.",
    html: brandedMessage({
      eyebrow: "Inner Circle",
      title: "Subscription Confirmed",
      greeting: "Hello,",
      body: [
        "Thank you for joining the Korede James inner circle.",
        "You will receive collection notes, atelier updates, and private invitations when the studio has something considered to share.",
      ],
      details: [
        ["Subscription", "Active"],
        ["Frequency", "Occasional atelier notes"],
      ],
      action: {
        label: "Visit Korede James",
        href: siteOrigin(),
      },
    }),
  });
}

export function sendCommissionReceivedEmail({ email, client, displayId, artifact }) {
  return sendTransactionalEmail({
    to: email,
    subject: `Commission received: ${displayId}`,
    preview: "Your Korede James commission request has been received.",
    html: brandedMessage({
      eyebrow: "Commission Received",
      title: displayId || "Atelier Request",
      greeting: `Hello ${client || "there"},`,
      body: [
        "Thank you. Your Korede James commission request has been received.",
        "The atelier team will review the details and update the commission progress from the admin desk.",
      ],
      details: [
        ["Commission", displayId],
        artifact ? ["Request", artifact] : null,
        ["Next Step", "Atelier review"],
      ].filter(Boolean),
      action: {
        label: "Track Commission",
        href: trackUrl(displayId),
      },
    }),
  });
}

export function sendPaymentReceivedEmail({ email, client, displayId, total, method }) {
  return sendTransactionalEmail({
    to: email,
    subject: `Payment details received: ${displayId}`,
    preview: "Your commission payment details have been received.",
    html: brandedMessage({
      eyebrow: "Payment Record",
      title: "Details Received",
      greeting: `Hello ${client || "there"},`,
      body: [
        `Your payment details have been received for commission ${displayId}.`,
        "The studio will confirm the payment and next atelier steps.",
      ],
      details: [
        ["Commission", displayId],
        total ? ["Registered Value", total] : null,
        method ? ["Method", method] : null,
      ].filter(Boolean),
      action: {
        label: "View Commission",
        href: trackUrl(displayId),
      },
    }),
  });
}

export function sendCommissionProgressEmail({ request, displayId }) {
  return sendTransactionalEmail({
    to: request?.email,
    subject: `Commission update: ${displayId}`,
    preview: "Your Korede James commission progress has been updated.",
    html: brandedMessage({
      eyebrow: "Atelier Update",
      title: "Progress Changed",
      greeting: `Hello ${request?.client || "there"},`,
      body: [
        "Your Korede James commission progress has been updated.",
        "You can open the private tracking page to review the current status and atelier stage.",
      ],
      details: [
        ["Commission", displayId],
        ["Status", request?.status || "Updated"],
        ["Stage", request?.stage || "Updated"],
      ],
      action: {
        label: "Track Commission",
        href: trackUrl(displayId),
      },
    }),
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
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <title>Korede James</title>
      </head>
      <body style="margin:0;padding:0;background:#f6f4ef;color:#111111;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preview || "")}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ef;margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:36px 14px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fbfaf7;border:1px solid #ddd6ca;">
                <tr>
                  <td style="padding:28px 30px;border-bottom:1px solid #e5ded2;text-align:center;">
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1;letter-spacing:0.32em;text-transform:uppercase;color:#111111;">
                      Korede James
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:1.6;letter-spacing:0.36em;text-transform:uppercase;color:#8a5a2e;margin-top:12px;">
                      Atelier Correspondence
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:34px 30px 30px;">
                    ${html}
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 30px;background:#111111;color:#ffffff;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:#d8c7ae;">
                          Private Atelier Desk
                        </td>
                        <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#f6f4ef;">
                          <a href="${escapeHtml(siteOrigin())}" style="color:#f6f4ef;text-decoration:none;">koredejames.com</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="max-width:640px;margin:18px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#8a8378;text-align:center;">
                You are receiving this email because you used Korede James client services.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function brandedMessage({
  eyebrow,
  title,
  greeting,
  body = [],
  details = [],
  action,
  fallbackUrl,
}) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:1.6;letter-spacing:0.38em;text-transform:uppercase;color:#8a5a2e;margin-bottom:14px;">
            ${escapeHtml(eyebrow || "Korede James")}
          </div>
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.08;letter-spacing:0.18em;text-transform:uppercase;font-weight:400;color:#111111;margin:0 0 26px;">
            ${escapeHtml(title || "Atelier Note")}
          </h1>
          <div style="width:72px;height:1px;background:#ddd6ca;margin:0 0 28px;"></div>
          ${greeting ? paragraph(greeting) : ""}
          ${body.map((line) => paragraph(line)).join("")}
          ${details.length ? detailTable(details) : ""}
          ${action ? actionButton(action) : ""}
          ${
            fallbackUrl
              ? `<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#6f6a63;margin:22px 0 0;">If the button does not work, copy this link into your browser:<br><a href="${escapeHtml(fallbackUrl)}" style="color:#111111;text-decoration:underline;word-break:break-all;">${escapeHtml(fallbackUrl)}</a></p>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}

function paragraph(value) {
  return `
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.85;color:#3d3934;margin:0 0 18px;">
      ${escapeHtml(value)}
    </p>
  `;
}

function detailTable(rows) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5ded2;border-bottom:1px solid #e5ded2;margin:28px 0 30px;">
      ${rows
        .map(
          ([label, value]) => `
            <tr>
              <td style="width:42%;padding:14px 0;border-bottom:1px solid #eee8de;font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;color:#8a5a2e;vertical-align:top;">
                ${escapeHtml(label)}
              </td>
              <td style="padding:14px 0;border-bottom:1px solid #eee8de;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#111111;text-align:right;vertical-align:top;">
                ${escapeHtml(value || "Pending")}
              </td>
            </tr>
          `
        )
        .join("")}
    </table>
  `;
}

function actionButton({ label, href }) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 0;">
      <tr>
        <td style="background:#111111;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:16px 24px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;font-weight:700;color:#ffffff;text-decoration:none;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
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
  const email = normalizeEmail(value);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function cleanHeaderText(value = "", maxLength = 140) {
  return String(value).replace(/[\r\n]+/g, " ").trim().slice(0, maxLength);
}

function normalizeLookup(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
