import {
  appendInquiry,
  appendOrder,
} from "../admin-workspace/utils/workspaceStore.js";
import { fail, ok, readBody } from "../utils/supabaseRest.js";

export async function POST(request) {
  try {
    const body = await readBody(request);
    const type = body.type || "inquiry";

    if (type === "order") {
      const result = await appendOrder(body);
      return ok(result);
    }

    const result = await appendInquiry(body);
    return ok(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to record commission.";
    const status = message.includes("Supabase is not configured") ? 503 : 400;
    return fail(message, status);
  }
}
