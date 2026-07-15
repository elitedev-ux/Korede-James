import {
  createCustomer,
  createSessionResponse,
  assertRateLimit,
  fail,
  readBody,
} from "../utils/customerAuth.js";
import { sendWelcomeEmail } from "../../utils/email.js";

export async function POST(request) {
  try {
    assertRateLimit(request, "customer-signup", { limit: 8 });
    const body = await readBody(request, { maxBytes: 16 * 1024 });
    const customer = await createCustomer(body);
    await sendWelcomeEmail(customer);
    return createSessionResponse(customer, request);
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
