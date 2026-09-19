import {
  confirmOrderPayment,
  readWorkspace,
} from "../../admin-workspace/utils/workspaceStore.js";
import {
  sendCommissionReceivedEmail,
  sendPaymentReceivedEmail,
} from "../../utils/email.js";
import { assertRateLimit, fail, ok } from "../../utils/supabaseRest.js";
import {
  publicOrderReceipt,
  validateTransactionForOrder,
} from "../utils/paymentVerification.js";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

export async function GET(request) {
  try {
    await assertRateLimit(request, "paystack-verify", { limit: 30 });
    const secretKey = getPaystackSecretKey();
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference");

    if (!reference || !/^[a-zA-Z0-9._=-]{4,120}$/.test(reference)) {
      return fail("Paystack reference is required.", 400);
    }

    const existingOrder = await findExistingOrder(reference);
    if (!existingOrder) {
      return fail("No pending checkout matches this payment reference.", 400);
    }

    const response = await fetch(
      `${PAYSTACK_VERIFY_URL}/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );
    const data = await response.json().catch(() => ({}));
    const transaction = data?.data;

    if (!response.ok || !data?.status) {
      return fail(data?.message || "Unable to verify Paystack payment.", 400);
    }

    if (transaction?.status !== "success") {
      return fail("Payment was not successful.", 400);
    }

    const validation = validateTransactionForOrder(transaction, existingOrder);
    if (!validation.valid) {
      console.error("Paystack verification mismatch:", reference, validation.reason);
      return fail("Payment details did not match the pending order.", 400);
    }

    if (existingOrder.paymentStatus === "paid") {
      return ok({
        order: publicOrderReceipt(existingOrder),
        alreadyRecorded: true,
      });
    }

    const payment = {
      method: "Paystack",
      reference,
      currency: transaction.currency,
      paidAt: transaction.paid_at,
      status: "paid",
    };
    const result = await confirmOrderPayment(reference, payment);

    if (!result?.order || !result?.request) {
      return fail("Unable to record verified payment.", 500);
    }

    if (!result.alreadyPaid) {
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

    return ok({
      order: publicOrderReceipt(result.order),
      alreadyRecorded: result.alreadyPaid,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify payment.";
    return fail(
      message,
      error instanceof Error && "status" in error ? error.status : 500,
    );
  }
}

async function findExistingOrder(reference) {
  const workspace = await readWorkspace();
  return (
    workspace.orders.find(
      (order) => String(order.paystackReference || "") === String(reference),
    ) || null
  );
}

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY.");
  }

  return key;
}
