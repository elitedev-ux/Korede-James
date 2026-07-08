import { sendNewsletterConfirmationEmail } from "../utils/email.js";
import { fail, ok, readBody, supabaseRequest } from "../utils/supabaseRest.js";

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
    const message = error instanceof Error ? error.message : "Unable to subscribe.";

    if (message.toLowerCase().includes("newsletter_subscribers")) {
      return fail(
        "Newsletter storage is not ready. Run web/db/newsletter-subscribers.sql in Supabase.",
        500,
      );
    }

    return fail(message, 400);
  }
}

function validateEmail(value) {
  const email = String(value || "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  return email;
}
