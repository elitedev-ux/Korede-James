import {
  buildResetUrl,
  fail,
  ok,
  readBody,
  sendPasswordResetEmail,
  setCustomerResetToken,
  validateEmail,
} from "../../utils/customerAuth";

export async function POST(request) {
  try {
    const body = await readBody(request);
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
      devResetUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to request reset.";
    const status = message.includes("Supabase is not configured") ? 503 : 400;
    return fail(message, status);
  }
}
