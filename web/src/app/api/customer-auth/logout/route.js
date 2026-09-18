import {
  assertSameOrigin,
  clearSessionResponse,
} from "../utils/customerAuth.js";

export async function POST(request) {
  assertSameOrigin(request);
  return clearSessionResponse(request);
}
