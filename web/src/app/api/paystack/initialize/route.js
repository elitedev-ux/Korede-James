import {
  assertRateLimit,
  assertSameOrigin,
  fail,
  ok,
  readBody,
} from "../../utils/supabaseRest.js";
import {
  DEFAULT_MARKET,
  getLineItemPrice,
} from "../../../../utils/pricing.js";
import { getPublicProductsFromWorkspace } from "../../../../utils/productCatalog.js";
import {
  appendErrorReport,
  appendOrder,
  readWorkspace,
} from "../../admin-workspace/utils/workspaceStore.js";
import {
  createPendingShippingQuote,
  resolveTrustedShippingQuote,
} from "../../shipping/rates/shippingQuote.js";
import {
  PAYSTACK_CHECKOUT_SOURCE,
  publicOrderReceipt,
} from "../utils/paymentVerification.js";

const PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    await assertRateLimit(request, "paystack-initialize", { limit: 20 });
    const secretKey = getPaystackSecretKey();
    const body = await readBody(request, { maxBytes: 64 * 1024 });
    const customer = resolveCustomer(body?.customer);
    const shippingAddress = resolveShippingAddress(body?.shippingAddress);
    const displayCurrency = resolveDisplayCurrency(body);
    const paymentCurrency = resolvePaystackCurrency();
    const items = await resolveCatalogItems(body?.items);
    const subtotal = sumItems(items, paymentCurrency);
    const shippingQuote = isDhlCheckoutEnabled()
      ? await resolveTrustedShippingQuote({
          quote: body?.payment?.shippingQuote,
          destination: shippingAddress,
          items,
          currency: paymentCurrency,
        })
      : createPendingShippingQuote({
          destination: shippingAddress,
          items,
          currency: paymentCurrency,
        });
    const shipping = Number(shippingQuote?.amount || 0);
    const amount = subtotal + shipping;
    const email = customer.email;
    const orderPayload = {
      customer,
      contact: customer.preferredContact,
      shipping: formatShippingAddress(shippingAddress),
      shippingAddress,
      items,
      payment: {
        displayCurrency,
        chargedCurrency: paymentCurrency,
        currency: paymentCurrency,
        subtotal,
        shipping,
        shippingQuote,
        total: amount,
        method: "Paystack",
        source: PAYSTACK_CHECKOUT_SOURCE,
        status: "pending",
      },
    };

    if (!amount || amount <= 0) {
      return fail("Payment amount is invalid.", 400);
    }

    const paystackPayload = {
      email,
      amount: toMinorUnits(amount),
      currency: paymentCurrency,
      callback_url: `${siteOrigin()}/checkout?payment=paystack`,
      metadata: {
        source: PAYSTACK_CHECKOUT_SOURCE,
      },
    };
    const { response, data } = await initializePaystackTransaction({
      secretKey,
      payload: paystackPayload,
    });

    if (!response.ok || !data?.status) {
      const providerMessage =
        data?.message || `Paystack returned HTTP ${response.status}.`;
      await recordPaymentError({
        message: providerMessage,
        details: JSON.stringify({
          status: response.status,
          currency: paymentCurrency,
          amount,
        }),
      });
      return fail("Unable to initialize payment. Please try again.", 502);
    }

    const reference = data.data?.reference;
    let pendingOrder = null;
    try {
      pendingOrder = await appendOrder({
        ...orderPayload,
        payment: {
          ...orderPayload.payment,
          reference,
        },
      });
    } catch (workspaceError) {
      await recordWorkspaceError({
        error: workspaceError,
        reference,
      });
      return fail(
        "Checkout is temporarily unavailable. No payment has been taken. Please try again shortly.",
        503,
      );
    }

    return ok({
      authorizationUrl: data.data?.authorization_url,
      accessCode: data.data?.access_code,
      reference,
      order: pendingOrder?.order
        ? publicOrderReceipt(pendingOrder.order)
        : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to initialize payment.";
    await recordPaymentError({
      message,
      details: error instanceof Error ? error.stack : "",
    });
    return fail(
      isPaymentNetworkError(error)
        ? "Payment service is temporarily unavailable. Please try again shortly."
        : message,
      isPaymentNetworkError(error)
        ? 503
        : error instanceof Error && "status" in error
          ? error.status
          : 500,
    );
  }
}

async function initializePaystackTransaction({ secretKey, payload }) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(PAYSTACK_INITIALIZE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status >= 500 && attempt === 0) {
        await wait(350);
        continue;
      }

      return { response, data };
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await wait(350);
        continue;
      }
    }
  }

  throw new PaymentNetworkError(
    lastError instanceof Error ? lastError.message : "Paystack request failed.",
    lastError,
  );
}

async function recordPaymentError({ message, details }) {
  console.error("Paystack initialization error:", message);
  await appendErrorReport({
    source: "paystack",
    severity: "critical",
    message,
    context: "Payment initialization",
    details,
    route: "/api/paystack/initialize",
  }).catch(() => undefined);
}

async function recordWorkspaceError({ error, reference }) {
  console.error("Pending Paystack order persistence failed:", reference, error);
  await appendErrorReport({
    source: "admin-workspace",
    severity: "critical",
    message:
      error instanceof Error ? error.message : "Pending order could not be saved.",
    context: "Saving pending Paystack order",
    details: JSON.stringify({
      reference,
      stack: error instanceof Error ? error.stack : "",
    }),
    route: "/api/paystack/initialize",
  }).catch(() => undefined);
}

function isPaymentNetworkError(error) {
  return error instanceof PaymentNetworkError;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class PaymentNetworkError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = "PaymentNetworkError";
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

function sumItems(items = [], currency) {
  return items.reduce((sum, item) => {
    const price = getLineItemPrice(item, currency);
    const quantity = Number(item?.quantity) || 1;
    return sum + price * quantity;
  }, 0);
}

async function resolveCatalogItems(requestedItems) {
  if (!Array.isArray(requestedItems) || requestedItems.length < 1) {
    throw badRequest("Your cart is empty.");
  }

  if (requestedItems.length > 20) {
    throw badRequest("Too many separate items were submitted.");
  }

  const workspace = await readWorkspace();
  const productById = new Map(
    getPublicProductsFromWorkspace(workspace).map((product) => [
      String(product.id),
      product,
    ]),
  );
  let totalQuantity = 0;

  const items = requestedItems.map((requestedItem) => {
    const id = String(requestedItem?.id || "").trim();
    const product = productById.get(id);

    if (!product) {
      throw badRequest("One or more products are unavailable.");
    }

    const quantity = Number(requestedItem?.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
      throw badRequest("Each product quantity must be between 1 and 10.");
    }

    totalQuantity += quantity;
    if (totalQuantity > 20) {
      throw badRequest("The maximum checkout quantity is 20 pieces.");
    }

    const size = requireCatalogOption(
      requestedItem?.size,
      product.sizes,
      "size",
    );
    const color = requireCatalogOption(
      requestedItem?.color,
      product.colors,
      "colour",
    );

    return {
      ...product,
      size,
      color,
      quantity,
      tailoringNotes: limitedText(requestedItem?.tailoringNotes, 1_000),
      archivalNotes: limitedText(requestedItem?.archivalNotes, 1_000),
    };
  });

  return items;
}

function requireCatalogOption(value, options, label) {
  const normalizedValue = String(value || "").trim();
  const allowedOptions = Array.isArray(options)
    ? options.map((option) => String(option))
    : [];

  if (!normalizedValue || !allowedOptions.includes(normalizedValue)) {
    throw badRequest(`Please select a valid ${label}.`);
  }

  return normalizedValue;
}

function limitedText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function resolveCustomer(value) {
  const customer = value && typeof value === "object" ? value : {};
  const name = requiredText(customer.name, "Customer name", 120);
  const email = requiredText(customer.email, "Customer email", 254).toLowerCase();
  const phone = requiredText(customer.phone, "Customer phone", 32);
  const preferredContact = requiredText(
    customer.preferredContact || email,
    "Preferred contact",
    200,
  );

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badRequest("Please enter a valid customer email.");
  }
  if (!/^\+?[0-9() .-]{7,32}$/.test(phone)) {
    throw badRequest("Please enter a valid customer phone number.");
  }

  return { name, email, phone, preferredContact };
}

function resolveShippingAddress(value) {
  const address = value && typeof value === "object" ? value : {};
  return {
    address: requiredText(address.address, "Street address", 200),
    city: requiredText(address.city, "City", 100),
    region: requiredText(address.region, "State or region", 100),
    postalCode: requiredText(address.postalCode, "Postal code", 24),
    country: requiredText(address.country, "Country", 100),
  };
}

function requiredText(value, label, maxLength) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.length > maxLength) {
    throw badRequest(`${label} is required and must be ${maxLength} characters or fewer.`);
  }
  return normalized;
}

function formatShippingAddress(destination) {
  return [
    destination.address,
    destination.city,
    destination.region,
    destination.postalCode,
    destination.country,
  ].join(", ");
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
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

function isDhlCheckoutEnabled() {
  return String(process.env.DHL_CHECKOUT_ENABLED || "false").toLowerCase() === "true";
}

function siteOrigin() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    "https://korede-james.vercel.app"
  ).replace(/\/$/, "");
}
