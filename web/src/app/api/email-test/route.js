import { requireAdmin } from "../admin-workspace/utils/workspaceStore.js";
import { sendTransactionalEmail } from "../utils/email.js";
import { fail, ok, readBody } from "../utils/supabaseRest.js";

export async function POST(request) {
  try {
    requireAdmin(request);
    const body = await readBody(request);
    const to = body.to;

    if (!to) {
      return fail("Recipient email is required.", 400);
    }

    const result = await sendTransactionalEmail({
      to,
      subject: "Korede James email test",
      preview: "This confirms Resend is connected.",
      html: `
        <p>This is a Korede James email delivery test.</p>
        <p>If you received this, Resend is connected correctly.</p>
      `,
    });

    return ok({ success: result.sent, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send test email.";
    return fail(message, message.includes("Admin access") ? 401 : 400);
  }
}
