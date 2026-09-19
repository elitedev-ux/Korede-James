import {
  buildVerificationUrl,
  createCustomer,
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  readBody,
} from "../utils/customerAuth.js";
import { sendEmailVerificationEmail } from "../../utils/email.js";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "customer-signup", { limit: 8 });
    const body = await readBody(request, { maxBytes: 16 * 1024 });
    const registration = await createCustomer(body);
    const verificationUrl = buildVerificationUrl(
      request,
      registration.verificationToken,
    );
    await sendEmailVerificationEmail({
      customer: registration.customer,
      verificationUrl,
    });
    return ok(
      {
        success: true,
        requiresVerification: true,
        message: "Check your email to verify your account before signing in.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    const status =
      error instanceof Error && "status" in error
        ? error.status
        : message.includes("Supabase is not configured")
          ? 503
          : 400;
    return fail(message, status);
  }
}
