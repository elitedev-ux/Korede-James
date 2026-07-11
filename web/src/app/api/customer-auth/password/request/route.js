import {
  assertRateLimit,
  buildResetUrl,
  fail,
  ok,
  readBody,
  sendPasswordResetEmail,
  setCustomerResetToken,
  validateEmail,
} from "../../utils/customerAuth.js";

export async function POST(request) {
  try {
    assertRateLimit(request, "customer-password-request", { limit: 5 });
    const body = await readBody(request, { maxBytes: 8 * 1024 });
    const email = validateEmail(body.email);
    const reset = await setCustomerResetToken(email);
    let devResetUrl = null;

    if (reset) {
      const resetUrl = buildResetUrl(request, reset.token);
      const result = await sendPasswordResetEmail({ email, resetUrl });
      if (!result.sent) {
        devResetUrl = resetUrl;
      }
    }

    return ok({
      success: true,
      message: "If an account exists for that email, a reset link will be sent.",
      devResetUrl: process.env.NODE_ENV === "production" ? null : devResetUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to request reset.";
    const status =
      error instanceof Error && "status" in error
        ? error.status
        : message.includes("Supabase is not configured")
          ? 503
          : 400;
    return fail(message, status);
  }
}
