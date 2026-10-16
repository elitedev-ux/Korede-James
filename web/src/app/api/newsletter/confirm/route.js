import { createHash } from "node:crypto";
import {
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  readBody,
  supabaseRequest,
} from "../../utils/supabaseRest.js";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "newsletter-confirm", { limit: 12 });
    const body = await readBody(request, { maxBytes: 2 * 1024 });
    const token = String(body.token || "").trim();

    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return fail("This confirmation link is invalid or expired.", 400);
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const rows = await supabaseRequest(
      `newsletter_subscribers?select=id&status=eq.pending&confirmation_token_hash=eq.${tokenHash}&confirmation_expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1`,
    );
    const subscriber = Array.isArray(rows) ? rows[0] : rows;

    if (!subscriber?.id) {
      return fail("This confirmation link is invalid or expired.", 400);
    }

    const updated = await supabaseRequest(
      `newsletter_subscribers?id=eq.${encodeURIComponent(subscriber.id)}&status=eq.pending&confirmation_token_hash=eq.${tokenHash}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "active",
          confirmation_token_hash: null,
          confirmation_expires_at: null,
          subscribed_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
        }),
      },
    );

    if (!Array.isArray(updated) || updated.length !== 1) {
      return fail("This confirmation link has already been used.", 409);
    }

    return ok({ message: "Your subscription is confirmed." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to confirm subscription.",
      error instanceof Error && "status" in error ? error.status : 500,
    );
  }
}
