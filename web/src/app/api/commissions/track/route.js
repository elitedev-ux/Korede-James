import { findTrackableCommission } from "../../admin-workspace/utils/workspaceStore.js";
import { fail, ok, readBody } from "../../utils/supabaseRest.js";

export async function POST(request) {
  try {
    const body = await readBody(request);
    const result = await findTrackableCommission({
      commissionId: body.commissionId,
      email: body.email,
    });

    if (!result) {
      return fail("No matching commission found.", 404);
    }

    return ok(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to track commission.";
    const status = message.includes("Supabase is not configured") ? 503 : 400;
    return fail(message, status);
  }
}
