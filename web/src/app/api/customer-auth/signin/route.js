import {
  assertRateLimit,
  createSessionResponse,
  fail,
  readBody,
  verifyCustomer,
} from "../utils/customerAuth.js";

export async function POST(request) {
  try {
    assertRateLimit(request, "customer-signin", { limit: 10 });
    const body = await readBody(request, { maxBytes: 8 * 1024 });
    const customer = await verifyCustomer(body.email, body.password);
    return createSessionResponse(customer, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    const status =
      error instanceof Error && "status" in error
        ? error.status
        : message.includes("Supabase is not configured")
          ? 503
          : 401;
    return fail(message, status);
  }
}
