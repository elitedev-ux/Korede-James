import {
  sendNewsletterCampaignEmail,
  sendNewsletterConfirmationEmail,
} from "../utils/email.js";
import {
  assertRateLimit,
  fail,
  ok,
  readBody,
  supabaseRequest,
} from "../utils/supabaseRest.js";
import { requireAdmin } from "../admin-workspace/utils/workspaceStore.js";

export async function GET(request) {
  try {
    assertRateLimit(request, "newsletter-admin-read", { limit: 120 });
    requireNewsletterAdmin(request);
    const subscribers = await supabaseRequest(
      "newsletter_subscribers?select=id,email,status,source,subscribed_at,updated_at&order=subscribed_at.desc&limit=500",
    );

    return ok({ subscribers: Array.isArray(subscribers) ? subscribers : [] });
  } catch (error) {
    return handleNewsletterError(error, "Unable to load newsletter subscribers.");
  }
}

export async function POST(request) {
  try {
    const body = await readBody(request, { maxBytes: 8 * 1024 });

    if (body.mode === "campaign") {
      assertRateLimit(request, "newsletter-admin-campaign", { limit: 10 });
      requireNewsletterAdmin(request);
      return sendNewsletterCampaign(body);
    }

    assertRateLimit(request, "newsletter-subscribe", { limit: 8 });
    const email = validateEmail(body.email);
    const source = cleanText(body.source || "homepage", 60) || "homepage";

    const rows = await supabaseRequest(
      "newsletter_subscribers?on_conflict=email",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          email,
          source,
          status: "active",
        }),
      },
    );

    const subscriber = Array.isArray(rows) ? rows[0] : rows;
    const emailResult = await sendNewsletterConfirmationEmail({ email });

    return ok({
      subscriber,
      emailSent: Boolean(emailResult?.sent),
      message: "Subscription received.",
    });
  } catch (error) {
    return handleNewsletterError(error, "Unable to subscribe.");
  }
}

async function sendNewsletterCampaign(body) {
  const subject = cleanText(body.subject || body.title || "A note from Korede James", 140);
  const title = cleanText(body.title || subject, 80);
  const message = cleanLongText(body.message || body.notes || "", 3000);

  if (!message) {
    throw new Error("Add a newsletter message before sending.");
  }

  const subscribers = await supabaseRequest(
    "newsletter_subscribers?select=email,status&status=eq.active&limit=1000",
  );
  const activeSubscribers = Array.isArray(subscribers) ? subscribers : [];
  const results = await Promise.all(
    activeSubscribers.map((subscriber) =>
      sendNewsletterCampaignEmail({
        email: subscriber.email,
        subject,
        title,
        message,
      }),
    ),
  );
  const sent = results.filter((result) => result?.sent).length;

  return ok({
    sent,
    total: activeSubscribers.length,
    message: `Newsletter sent to ${sent} subscriber${sent === 1 ? "" : "s"}.`,
  });
}

export async function PATCH(request) {
  try {
    assertRateLimit(request, "newsletter-admin-write", { limit: 60 });
    requireNewsletterAdmin(request);
    const body = await readBody(request, { maxBytes: 8 * 1024 });
    const email = validateEmail(body.email);
    const status = validateStatus(body.status);
    const source = cleanText(body.source || "homepage", 60) || "homepage";
    const rows = await supabaseRequest(
      `newsletter_subscribers?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status,
          source,
          updated_at: new Date().toISOString(),
        }),
      },
    );

    return ok({ subscriber: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    return handleNewsletterError(error, "Unable to update newsletter subscriber.");
  }
}

function validateEmail(value) {
  const email = String(value || "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  return email;
}

function validateStatus(value) {
  const status = String(value || "active").trim().toLowerCase();
  const allowedStatuses = ["active", "paused", "unsubscribed"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Use active, paused, or unsubscribed for newsletter status.");
  }

  return status;
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanLongText(value, maxLength) {
  return String(value || "")
    .replace(/\r/g, "")
    .trim()
    .slice(0, maxLength);
}

function handleNewsletterError(error, fallbackMessage) {
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (message.toLowerCase().includes("newsletter_subscribers")) {
    return fail(
      "Newsletter storage is not ready. Run web/db/newsletter-subscribers.sql in Supabase.",
      500,
    );
  }

  if (message === "Admin access is required." || message === "Owner or editor access is required.") {
    return fail(message, message === "Admin access is required." ? 401 : 403);
  }

  const status = message.includes("Supabase is not configured") ? 503 : 400;
  return fail(
    message || fallbackMessage,
    error instanceof Error && "status" in error ? error.status : status,
  );
}

function requireNewsletterAdmin(request) {
  const role = requireAdmin(request);
  if (!["owner", "editor"].includes(role)) {
    throw new Error("Owner or editor access is required.");
  }
  return role;
}
