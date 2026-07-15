import {
  assertRateLimit,
  fail,
  ok,
  readBody,
  updatePasswordWithToken,
} from "../../utils/customerAuth.js";

export async function POST(request) {
  try {
    assertRateLimit(request, "customer-password-confirm", { limit: 8 });
    const body = await readBody(request, { maxBytes: 8 * 1024 });
    await updatePasswordWithToken(body.token, body.password);
    return ok({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset password.";
    const status =
      error instanceof Error && "status" in error
        ? error.status
        : message.includes("Supabase is not configured")
          ? 503
          : 400;
    return fail(message, status);
  }
}
