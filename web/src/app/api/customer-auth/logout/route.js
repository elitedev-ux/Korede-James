import { clearSessionResponse } from "../utils/customerAuth";

export async function POST() {
  return clearSessionResponse();
}
