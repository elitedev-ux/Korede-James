import {
  appendInquiry,
  appendOrder,
} from "../admin-workspace/utils/workspaceStore.js";
import {
  sendCommissionReceivedEmail,
  sendPaymentReceivedEmail,
} from "../utils/email.js";
import { fail, ok, readBody } from "../utils/supabaseRest.js";

export async function POST(request) {
  try {
    const body = await readBody(request);
    const type = body.type || "inquiry";

    if (type === "order") {
      const result = await appendOrder(body);
      await sendCommissionReceivedEmail({
        email: result.request.email,
        client: result.request.client,
        displayId: result.order.id,
        artifact: result.request.artifact,
      });
      await sendPaymentReceivedEmail({
        email: result.request.email,
        client: result.request.client,
        displayId: result.order.id,
        total: result.order.total,
        method: body.payment?.method,
      });
      return ok(result);
    }

    const result = await appendInquiry(body);
    await sendCommissionReceivedEmail({
      email: result.request.email,
      client: result.request.client,
      displayId: result.request.id,
      artifact: result.request.artifact,
    });
    return ok(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to record commission.";
    const status = message.includes("Supabase is not configured") ? 503 : 400;
    return fail(message, status);
  }
}
