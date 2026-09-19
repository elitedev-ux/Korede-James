import { createHmac, timingSafeEqual } from "node:crypto";
import {
  confirmOrderPayment,
  readWorkspace,
} from "../../admin-workspace/utils/workspaceStore.js";
import {
  sendCommissionReceivedEmail,
  sendPaymentReceivedEmail,
} from "../../utils/email.js";
import { assertRateLimit, fail, ok } from "../../utils/supabaseRest.js";
import { validateTransactionForOrder } from "../utils/paymentVerification.js";

export async function POST(request) {
  try {
    await assertRateLimit(request, "paystack-webhook", { limit: 120 });
    const secretKey = getPaystackSecretKey();
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    if (!isValidSignature(rawBody, signature, secretKey)) {
      return fail("Invalid webhook signature.", 401);
    }

    const event = JSON.parse(rawBody || "{}");

    if (event.event !== "charge.success") {
      return ok({ received: true, ignored: true });
    }

    const transaction = event.data || {};
    if (transaction.status !== "success") {
      return ok({ received: true, ignored: true });
    }

    const reference = String(transaction.reference || "").trim();
    if (!reference) {
      return ok({ received: true, ignored: true });
    }

    const existingOrder = await findExistingOrder(reference);
    if (!existingOrder) {
      return ok({ received: true, recorded: false });
    }

    const validation = validateTransactionForOrder(transaction, existingOrder);
    if (!validation.valid) {
      console.error("Paystack webhook mismatch:", reference, validation.reason);
      return fail("Payment details did not match the pending order.", 400);
    }

    const payment = {
      method: "Paystack",
      reference,
      currency: transaction.currency,
      paidAt: transaction.paid_at || new Date().toISOString(),
      status: "paid",
    };
    const result = await confirmOrderPayment(reference, payment);

    if (result?.order && result?.request && !result.alreadyPaid) {
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
        method: "Paystack",
      });
    }

    return ok({ received: true, recorded: Boolean(result?.order) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process webhook.";
    return fail(
      message,
      error instanceof Error && "status" in error ? error.status : 500,
    );
  }
}

function isValidSignature(rawBody, signature, secretKey) {
  if (!signature) {
    return false;
  }

  const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY.");
  }

  return key;
}

async function findExistingOrder(reference) {
  const workspace = await readWorkspace();
  return (
    workspace.orders.find(
      (order) => String(order.paystackReference || "") === String(reference),
    ) || null
  );
}
