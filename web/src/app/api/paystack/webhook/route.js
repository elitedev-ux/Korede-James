import { createHmac, timingSafeEqual } from "node:crypto";
import {
  appendOrder,
  confirmOrderPayment,
} from "../../admin-workspace/utils/workspaceStore.js";
import {
  sendCommissionReceivedEmail,
  sendPaymentReceivedEmail,
} from "../../utils/email.js";
import { assertRateLimit, fail, ok } from "../../utils/supabaseRest.js";

export async function POST(request) {
  try {
    assertRateLimit(request, "paystack-webhook", { limit: 120 });
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

    const payment = {
      method: "Paystack",
      reference,
      currency: transaction.currency || paystackCurrency(),
      paidAt: transaction.paid_at || new Date().toISOString(),
      status: "paid",
      total: minorToMajor(transaction.amount),
    };
    let result = await confirmOrderPayment(reference, payment);

    if (!result?.order) {
      const orderPayload = transaction.metadata?.orderPayload;
      if (!orderPayload) {
        return ok({ received: true, recorded: false });
      }

      result = await appendOrder({
        ...orderPayload,
        payment: {
          ...(orderPayload.payment || {}),
          ...payment,
        },
      });
    }

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

function minorToMajor(amount) {
  const value = Number(amount || 0);
  return Number.isFinite(value) && value > 0 ? Math.round(value / 100) : 0;
}

function paystackCurrency() {
  return process.env.PAYSTACK_CURRENCY || "NGN";
}
