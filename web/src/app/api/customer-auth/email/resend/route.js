import {
  assertRateLimit,
  assertSameOrigin,
  buildVerificationUrl,
  fail,
  ok,
  readBody,
  requestCustomerEmailVerification,
  validateEmail,
} from "../../utils/customerAuth.js";
import { sendEmailVerificationEmail } from "../../../utils/email.js";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "customer-email-resend", { limit: 5 });
    const body = await readBody(request, { maxBytes: 8 * 1024 });
    const email = validateEmail(body.email);
    const verification = await requestCustomerEmailVerification(email);
    if (verification) {
      await sendEmailVerificationEmail({
        customer: verification.customer,
        verificationUrl: buildVerificationUrl(request, verification.token),
      });
    }
    return ok({
      success: true,
      message: "If an unverified account exists, a new verification link will be sent.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to request verification.",
      error instanceof Error && "status" in error ? error.status : 400,
    );
  }
}
