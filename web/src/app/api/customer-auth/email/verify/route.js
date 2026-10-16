import {
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  readBody,
  verifyCustomerEmailToken,
} from "../../utils/customerAuth.js";
import { sendWelcomeEmail } from "../../../utils/email.js";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "customer-email-verify", { limit: 20 });
    const body = await readBody(request, { maxBytes: 2 * 1024 });
    const token = body.token;
    const customer = await verifyCustomerEmailToken(token);
    await sendWelcomeEmail(customer);
    return ok({ success: true, message: "Email verified. You can sign in now." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Verification link is invalid or expired.",
      error instanceof Error && "status" in error ? error.status : 400,
    );
  }
}

export function GET(request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const target = new URL("/account/verify-email", request.url);
  if (/^[a-zA-Z0-9_-]{20,160}$/.test(token)) target.searchParams.set("token", token);
  return Response.redirect(target, 303);
}
