import { fail, ok, readBody } from "../../utils/supabaseRest.js";

const PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";

export async function POST(request) {
  try {
    const secretKey = getPaystackSecretKey();
    const body = await readBody(request);
    const amount = Number(body.total || 0);
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
        currency: paystackCurrency(),
        callback_url: `${siteOrigin()}/checkout?payment=paystack`,
        metadata: {
          orderPayload: body,
          source: "korede-james-checkout",
        },
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.status) {
      return fail(data?.message || "Unable to initialize Paystack payment.", 400);
    }

    return ok({
      authorizationUrl: data.data?.authorization_url,
      accessCode: data.data?.access_code,
      reference: data.data?.reference,
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to initialize payment.",
      500,
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

function paystackCurrency() {
  return process.env.PAYSTACK_CURRENCY || "USD";
}

function siteOrigin() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    "https://korede-james.vercel.app"
  ).replace(/\/$/, "");
}
