import { ok, readCustomerSession } from "../utils/customerAuth.js";

export async function GET(request) {
  return ok({ customer: await readCustomerSession(request) });
}
