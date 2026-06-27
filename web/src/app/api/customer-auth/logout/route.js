import { clearSessionResponse } from "../utils/customerAuth.js";

export async function POST() {
  return clearSessionResponse();
}
