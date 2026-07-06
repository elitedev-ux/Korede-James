import {
  appendOrder,
  readWorkspace,
} from "../../admin-workspace/utils/workspaceStore.js";
import {
  sendCommissionReceivedEmail,
  sendPaymentReceivedEmail,
} from "../../utils/email.js";
import { fail, ok } from "../../utils/supabaseRest.js";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

export async function GET(request) {
  try {
    const secretKey = getPaystackSecretKey();
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return fail("Paystack reference is required.", 400);
    }

    const existingOrder = await findExistingOrder(reference);
    if (existingOrder) {
      return ok({ order: existingOrder, alreadyRecorded: true });
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

    const orderPayload = transaction?.metadata?.orderPayload;
    if (!orderPayload) {
      return fail("Payment metadata is missing the order details.", 400);
    }

    const payment = {
      ...(orderPayload.payment || {}),
      method: "Paystack",
      reference,
      currency: transaction.currency || paystackCurrency(),
      paidAt: transaction.paid_at,
    };
    const result = await appendOrder({
      ...orderPayload,
      payment,
    });

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

    return ok({
      order: result.order,
      request: result.request,
      orderPayload,
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to verify payment.",
      500,
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

function paystackCurrency() {
  return process.env.PAYSTACK_CURRENCY || "NGN";
}
