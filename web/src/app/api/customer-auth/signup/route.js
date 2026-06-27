import {
  createCustomer,
  createSessionResponse,
  fail,
  readBody,
} from "../utils/customerAuth.js";

export async function POST(request) {
  try {
    const body = await readBody(request);
    const customer = await createCustomer(body);
    return createSessionResponse(customer, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    const status = message.includes("Supabase is not configured") ? 503 : 400;
    return fail(message, status);
  }
}
