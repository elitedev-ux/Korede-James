import {
  createSessionResponse,
  fail,
  readBody,
  verifyCustomer,
} from "../utils/customerAuth";

export async function POST(request) {
  try {
    const body = await readBody(request);
    const customer = await verifyCustomer(body.email, body.password);
    return createSessionResponse(customer, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    const status = message.includes("Supabase is not configured") ? 503 : 401;
    return fail(message, status);
  }
}
