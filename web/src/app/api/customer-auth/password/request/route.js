import {
  assertRateLimit,
  assertSameOrigin,
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
    assertSameOrigin(request);
    await assertRateLimit(request, "customer-password-request", { limit: 5 });
    const body = await readBody(request, { maxBytes: 8 * 1024 });
    const email = validateEmail(body.email);
    const reset = await setCustomerResetToken(email);

    if (reset) {
      const resetUrl = buildResetUrl(request, reset.token);
      await sendPasswordResetEmail({ email, resetUrl });
    }

    return ok({
      success: true,
      message: "If an account exists for that email, a reset link will be sent.",
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
