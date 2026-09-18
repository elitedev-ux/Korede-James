import { appendInquiry } from "../admin-workspace/utils/workspaceStore.js";
import { sendCommissionReceivedEmail } from "../utils/email.js";
import {
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  readBody,
} from "../utils/supabaseRest.js";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "commission-submit", { limit: 10 });
    const body = await readBody(request, { maxBytes: 64 * 1024 });
    if (body.type && body.type !== "inquiry") {
      return fail("Unsupported commission request type.", 400);
    }

    const result = await appendInquiry(body);
    await sendCommissionReceivedEmail({
      email: result.request.email,
      client: result.request.client,
      displayId: result.request.id,
      artifact: result.request.artifact,
    });
    return ok(
      {
        request: {
          id: result.request.id,
          status: result.request.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to record commission.";
    const status =
      error instanceof Error && "status" in error
        ? error.status
        : message.includes("Supabase is not configured")
          ? 503
          : 400;
    return fail(message, status);
  }
}
