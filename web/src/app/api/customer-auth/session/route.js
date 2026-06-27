import { ok, readCustomerSession } from "../utils/customerAuth";

export async function GET(request) {
  return ok({ customer: readCustomerSession(request) });
}
