import { sendNewsletterConfirmationEmail } from "../utils/email.js";
import { fail, ok, readBody, supabaseRequest } from "../utils/supabaseRest.js";
import { requireAdmin } from "../admin-workspace/utils/workspaceStore.js";

export async function GET(request) {
  try {
    requireAdmin(request);
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
    const body = await readBody(request);
    const email = validateEmail(body.email);
    const source = String(body.source || "homepage").trim() || "homepage";

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

export async function PATCH(request) {
  try {
    requireAdmin(request);
    const body = await readBody(request);
    const email = validateEmail(body.email);
    const status = validateStatus(body.status);
    const source = String(body.source || "homepage").trim() || "homepage";
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

function handleNewsletterError(error, fallbackMessage) {
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (message.toLowerCase().includes("newsletter_subscribers")) {
    return fail(
      "Newsletter storage is not ready. Run web/db/newsletter-subscribers.sql in Supabase.",
      500,
    );
  }

  if (message === "Admin access is required.") {
    return fail(message, 401);
  }

  const status = message.includes("Supabase is not configured") ? 503 : 400;
  return fail(message || fallbackMessage, status);
}
