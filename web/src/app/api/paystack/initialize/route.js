import { assertRateLimit, fail, ok, readBody } from "../../utils/supabaseRest.js";
import { DEFAULT_MARKET, getLineItemPrice } from "../../../../utils/pricing.js";
import { appendOrder } from "../../admin-workspace/utils/workspaceStore.js";
import { resolveTrustedShippingQuote } from "../../shipping/rates/shippingQuote.js";

const PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";

export async function POST(request) {
  try {
    assertRateLimit(request, "paystack-initialize", { limit: 20 });
    const secretKey = getPaystackSecretKey();
    const body = await readBody(request, { maxBytes: 64 * 1024 });
    const displayCurrency = resolveDisplayCurrency(body);
    const paymentCurrency = resolvePaystackCurrency();
    const subtotal = sumItems(body?.items, paymentCurrency);
    const shippingQuote = await resolveTrustedShippingQuote({
      quote: body?.payment?.shippingQuote,
      destination: body?.shippingAddress,
      items: body?.items,
      currency: paymentCurrency,
    });
    const shipping = Number(shippingQuote?.amount || 0);
    const amount = resolvePaymentAmount({
      body,
      subtotal,
      shipping,
    });
    const email = String(body.customer?.email || "").trim();

    if (!email) {
      return fail("Customer email is required for payment.", 400);
    }

    if (!amount || amount <= 0) {
      return fail("Payment amount is invalid.", 400);
    }

    const response = await fetch(PAYSTACK_INITIALIZE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: toMinorUnits(amount),
        currency: paymentCurrency,
        callback_url: `${siteOrigin()}/checkout?payment=paystack`,
        metadata: {
          orderPayload: {
            ...body,
            payment: {
              ...(body.payment || {}),
              displayCurrency,
              chargedCurrency: paymentCurrency,
              currency: paymentCurrency,
              subtotal,
              shipping,
              shippingQuote,
              total: amount,
            },
          },
          source: "korede-james-checkout",
        },
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.status) {
      return fail(data?.message || "Unable to initialize Paystack payment.", 400);
    }

    const reference = data.data?.reference;
    const pendingOrder = await appendOrder({
      ...body,
      payment: {
        ...(body.payment || {}),
        displayCurrency,
        chargedCurrency: paymentCurrency,
        currency: paymentCurrency,
        subtotal,
        shipping,
        shippingQuote,
        total: amount,
        method: "Paystack",
        reference,
        status: "pending",
      },
    });

    return ok({
      authorizationUrl: data.data?.authorization_url,
      accessCode: data.data?.access_code,
      reference,
      order: pendingOrder.order,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to initialize payment.";
    return fail(
      message,
      error instanceof Error && "status" in error ? error.status : 500,
    );
  }
}

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY.");
  }

  return key;
}

function toMinorUnits(amount) {
  return Math.round(Number(amount || 0) * 100);
}

function resolvePaymentAmount({ body, subtotal, shipping }) {
  const computedTotal = Number(subtotal || 0) + Number(shipping || 0);

  if (computedTotal > 0) {
    return computedTotal;
  }

  const explicitTotal = Number(body?.payment?.total ?? body?.total ?? 0);

  if (Number.isFinite(explicitTotal) && explicitTotal > 0) {
    return explicitTotal;
  }

  return 0;
}

function sumItems(items = [], currency) {
  return items.reduce((sum, item) => {
    const price = getLineItemPrice(item, currency);
    const quantity = Number(item?.quantity) || 1;
    return sum + price * quantity;
  }, 0);
}

function resolveDisplayCurrency(body) {
  const requestedCurrency = String(
    body?.payment?.currency || body?.currency || "",
  ).toUpperCase();

  if (["NGN", "USD"].includes(requestedCurrency)) {
    return requestedCurrency;
  }

  return DEFAULT_MARKET.currency;
}

function resolvePaystackCurrency() {
  const currency = String(process.env.PAYSTACK_CURRENCY || "NGN").toUpperCase();
  return ["NGN", "USD"].includes(currency) ? currency : "NGN";
}

function siteOrigin() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    "https://korede-james.vercel.app"
  ).replace(/\/$/, "");
}
