import { createHmac, timingSafeEqual } from "node:crypto";
import {
  DEFAULT_MARKET,
  NGN_TO_USD_RATE,
  convertNgnToUsd,
} from "../../../../utils/pricing.js";

const DHL_RATE_PATH = "rates";
const DHL_PROVIDER = "DHL Express";
const QUOTE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const COUNTRY_CODES = {
  NIGERIA: "NG",
  NG: "NG",
  "UNITED STATES": "US",
  USA: "US",
  US: "US",
  "UNITED KINGDOM": "GB",
  UK: "GB",
  GB: "GB",
  GHANA: "GH",
  GH: "GH",
  CANADA: "CA",
  CA: "CA",
  FRANCE: "FR",
  FR: "FR",
  GERMANY: "DE",
  DE: "DE",
  ITALY: "IT",
  IT: "IT",
  SPAIN: "ES",
  ES: "ES",
  "SOUTH AFRICA": "ZA",
  ZA: "ZA",
};

export async function getEstimatedShippingQuote({
  destination,
  items = [],
  currency = DEFAULT_MARKET.currency,
} = {}) {
  const normalizedCurrency = normalizeCurrency(currency);
  const normalizedDestination = normalizeDestination(destination);
  const parcel = buildParcel(items);

  if (!normalizedDestination.countryCode || !normalizedDestination.city) {
    return signQuote(
      manualQuote({
        currency: normalizedCurrency,
        destination: normalizedDestination,
        parcel,
        reason: "Destination country and city are required for DHL estimate.",
      }),
    );
  }

  if (!isDhlConfigured()) {
    return signQuote(
      manualQuote({
        currency: normalizedCurrency,
        destination: normalizedDestination,
        parcel,
        reason: "DHL credentials are not configured yet.",
      }),
    );
  }

  try {
    const dhlRate = await fetchDhlRate({
      destination: normalizedDestination,
      parcel,
    });
    return signQuote(
      quotedDhlRate({
        rate: dhlRate,
        currency: normalizedCurrency,
        destination: normalizedDestination,
        parcel,
      }),
    );
  } catch (error) {
    return signQuote(
      manualQuote({
        currency: normalizedCurrency,
        destination: normalizedDestination,
        parcel,
        reason:
          error instanceof Error
            ? error.message
            : "DHL estimate is temporarily unavailable.",
      }),
    );
  }
}

export async function resolveTrustedShippingQuote({
  quote,
  destination,
  items = [],
  currency = DEFAULT_MARKET.currency,
} = {}) {
  const normalizedCurrency = normalizeCurrency(currency);
  const normalizedDestination = normalizeDestination(destination);
  const parcel = buildParcel(items);

  if (
    quote &&
    isSignedQuoteValid(quote) &&
    quoteMatchesCheckout(quote, normalizedDestination, parcel)
  ) {
    return normalizeQuoteForCurrency(quote, normalizedCurrency);
  }

  return getEstimatedShippingQuote({
    destination: normalizedDestination,
    items,
    currency: normalizedCurrency,
  });
}

export function createPendingShippingQuote({
  destination,
  items = [],
  currency = DEFAULT_MARKET.currency,
} = {}) {
  const normalizedCurrency = normalizeCurrency(currency);
  return signQuote(
    manualQuote({
      currency: normalizedCurrency,
      destination: normalizeDestination(destination),
      parcel: buildParcel(items),
      reason: "Automated dispatch estimates are pending activation.",
    }),
  );
}

function quotedDhlRate({ rate, currency, destination, parcel }) {
  const amounts = amountsByCurrency(rate.amount, rate.currency);
  const amount = amounts[currency] || 0;

  return {
    status: "quoted",
    provider: DHL_PROVIDER,
    serviceName: rate.serviceName || "DHL Express",
    amount,
    amounts,
    currency,
    sourceCurrency: rate.currency,
    sourceAmount: rate.amount,
    estimatedDelivery: rate.estimatedDelivery || "",
    transitDays: rate.transitDays || "",
    destination,
    parcel,
    generatedAt: new Date().toISOString(),
    note:
      "Estimated DHL dispatch fee. Final cost may change when the atelier tenders the finished package.",
  };
}

function manualQuote({ currency, destination, parcel, reason }) {
  return {
    status: "manual",
    provider: DHL_PROVIDER,
    serviceName: "DHL dispatch",
    amount: 0,
    amounts: { NGN: 0, USD: 0 },
    currency,
    sourceCurrency: currency,
    sourceAmount: 0,
    estimatedDelivery: "",
    transitDays: "",
    destination,
    parcel,
    generatedAt: new Date().toISOString(),
    note:
      "Dispatch fee will be confirmed by the atelier before the piece is sent.",
    reason,
  };
}

async function fetchDhlRate({ destination, parcel }) {
  const baseUrl = String(process.env.DHL_API_BASE || "").replace(/\/$/, "");
  const url = new URL(`${baseUrl}/${DHL_RATE_PATH}`);
  const origin = getOriginAddress();
  const customsDeclarable = origin.countryCode !== destination.countryCode;

  setParam(url, "accountNumber", process.env.DHL_ACCOUNT_NUMBER);
  setParam(url, "originCountryCode", origin.countryCode);
  setParam(url, "originCityName", origin.city);
  setParam(url, "originPostalCode", origin.postalCode);
  setParam(url, "destinationCountryCode", destination.countryCode);
  setParam(url, "destinationCityName", destination.city);
  setParam(url, "destinationPostalCode", destination.postalCode);
  setParam(url, "weight", parcel.weightKg);
  setParam(url, "length", parcel.lengthCm);
  setParam(url, "width", parcel.widthCm);
  setParam(url, "height", parcel.heightCm);
  setParam(url, "plannedShippingDate", plannedShippingDate());
  setParam(url, "isCustomsDeclarable", customsDeclarable ? "true" : "false");
  setParam(url, "unitOfMeasurement", "metric");
  setParam(url, "strictValidation", "false");
  setParam(url, "nextBusinessDay", "false");

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.DHL_API_USERNAME}:${process.env.DHL_API_PASSWORD}`,
      ).toString("base64")}`,
      Accept: "application/json",
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "DHL estimate is temporarily unavailable.",
    );
  }

  const rate = extractBestRate(data);
  if (!rate) {
    throw new Error("DHL did not return a usable dispatch estimate.");
  }

  return rate;
}

function extractBestRate(data) {
  const products = Array.isArray(data?.products) ? data.products : [];
  const rates = products
    .map((product) => {
      const price = extractProductPrice(product);
      if (!price) {
        return null;
      }

      return {
        amount: price.amount,
        currency: price.currency,
        serviceName: product.productName || product.localProductName || product.productCode,
        estimatedDelivery:
          product.deliveryCapabilities?.estimatedDeliveryDateAndTime ||
          product.deliveryCapabilities?.deliveryDateAndTime ||
          "",
        transitDays: product.deliveryCapabilities?.totalTransitDays || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.amount - b.amount);

  return rates[0] || null;
}

function extractProductPrice(product) {
  const candidates = [];
  const totalPrices = Array.isArray(product?.totalPrice)
    ? product.totalPrice
    : product?.totalPrice
      ? [product.totalPrice]
      : [];

  totalPrices.forEach((price) => {
    candidates.push({
      amount: Number(price.price || price.amount || 0),
      currency: normalizeCurrency(price.priceCurrency || price.currency || ""),
    });
  });

  const breakdown = Array.isArray(product?.totalPriceBreakdown)
    ? product.totalPriceBreakdown
    : [];
  breakdown.forEach((entry) => {
    candidates.push({
      amount: Number(entry.price || entry.amount || 0),
      currency: normalizeCurrency(entry.priceCurrency || entry.currency || ""),
    });
  });

  return (
    candidates.find((candidate) => candidate.amount > 0 && candidate.currency) ||
    null
  );
}

function buildParcel(items = []) {
  const quantity = Math.max(
    1,
    items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0),
  );
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = Number(item?.shipping?.weightKg || item?.weightKg || 0);
    const fallbackWeight = defaultWeightForItem(item);
    return sum + (itemWeight || fallbackWeight) * (Number(item?.quantity) || 1);
  }, 0);

  return {
    weightKg: roundDecimal(
      Math.max(Number(process.env.DHL_MIN_WEIGHT_KG) || 0.5, totalWeight || 0.8),
    ),
    lengthCm: Number(process.env.DHL_DEFAULT_LENGTH_CM) || 45,
    widthCm: Number(process.env.DHL_DEFAULT_WIDTH_CM) || 35,
    heightCm: Math.max(
      Number(process.env.DHL_DEFAULT_HEIGHT_CM) || 12,
      Math.min(30, 10 + quantity * 3),
    ),
  };
}

function defaultWeightForItem(item = {}) {
  const category = String(item.category || item.silhouette || item.archetype || "")
    .toUpperCase();

  if (/COAT|JACKET/.test(category)) {
    return 1.4;
  }

  if (/SET|DRESS|SUIT/.test(category)) {
    return 1.2;
  }

  if (/PANTS|SKIRT/.test(category)) {
    return 0.9;
  }

  return 0.7;
}

function normalizeDestination(destination = {}) {
  const countryInput = String(
    destination.countryCode || destination.country || "",
  ).trim();

  return {
    countryCode: normalizeCountryCode(countryInput),
    country: String(destination.country || destination.countryCode || "").trim(),
    city: String(destination.city || "").trim(),
    region: String(destination.region || "").trim(),
    postalCode: String(destination.postalCode || "").trim(),
    address: String(destination.address || "").trim(),
  };
}

function normalizeCountryCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) {
    return "";
  }

  if (/^[A-Z]{2}$/.test(normalized)) {
    return normalized;
  }

  return COUNTRY_CODES[normalized] || normalized.slice(0, 2);
}

function getOriginAddress() {
  return {
    countryCode: normalizeCountryCode(process.env.DHL_SHIPPER_COUNTRY || "NG"),
    city: process.env.DHL_SHIPPER_CITY || "Lagos",
    postalCode: process.env.DHL_SHIPPER_POSTAL_CODE || "",
  };
}

function isDhlConfigured() {
  return Boolean(
    process.env.DHL_API_BASE &&
      process.env.DHL_API_USERNAME &&
      process.env.DHL_API_PASSWORD &&
      process.env.DHL_ACCOUNT_NUMBER,
  );
}

function signQuote(quote) {
  return {
    ...quote,
    signature: createQuoteSignature(quote),
  };
}

function isSignedQuoteValid(quote) {
  if (!quote?.signature || !quote?.generatedAt) {
    return false;
  }

  const generatedAt = new Date(quote.generatedAt).getTime();
  if (!generatedAt || Date.now() - generatedAt > QUOTE_MAX_AGE_MS) {
    return false;
  }

  const expected = createQuoteSignature({ ...quote, signature: undefined });
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(String(quote.signature));

  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

function createQuoteSignature(quote) {
  return createHmac("sha256", quoteSecret())
    .update(canonicalQuote(quote))
    .digest("hex");
}

function canonicalQuote(quote) {
  return JSON.stringify({
    status: quote.status,
    provider: quote.provider,
    serviceName: quote.serviceName,
    amounts: quote.amounts,
    currency: quote.currency,
    sourceCurrency: quote.sourceCurrency,
    sourceAmount: quote.sourceAmount,
    destination: quote.destination,
    parcel: quote.parcel,
    generatedAt: quote.generatedAt,
  });
}

function quoteMatchesCheckout(quote, destination, parcel) {
  return (
    quote?.destination?.countryCode === destination.countryCode &&
    normalizeText(quote?.destination?.city) === normalizeText(destination.city) &&
    normalizeText(quote?.destination?.postalCode) ===
      normalizeText(destination.postalCode) &&
    Number(quote?.parcel?.weightKg) === Number(parcel.weightKg) &&
    Number(quote?.parcel?.lengthCm) === Number(parcel.lengthCm) &&
    Number(quote?.parcel?.widthCm) === Number(parcel.widthCm) &&
    Number(quote?.parcel?.heightCm) === Number(parcel.heightCm)
  );
}

function normalizeQuoteForCurrency(quote, currency) {
  return {
    ...quote,
    currency,
    amount: Number(quote.amounts?.[currency] || 0),
    signature: createQuoteSignature({
      ...quote,
      currency,
      amount: Number(quote.amounts?.[currency] || 0),
      signature: undefined,
    }),
  };
}

function amountsByCurrency(amount, currency) {
  const normalizedAmount = Math.max(0, Math.round(Number(amount) || 0));
  const normalizedCurrency = normalizeCurrency(currency);

  if (normalizedCurrency === "USD") {
    return {
      USD: normalizedAmount,
      NGN: normalizedAmount * NGN_TO_USD_RATE,
    };
  }

  return {
    NGN: normalizedAmount,
    USD: convertNgnToUsd(normalizedAmount),
  };
}

function normalizeCurrency(currency) {
  const normalized = String(currency || "").toUpperCase();
  return ["NGN", "USD"].includes(normalized) ? normalized : DEFAULT_MARKET.currency;
}

function quoteSecret() {
  return (
    process.env.CUSTOMER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.PAYSTACK_SECRET_KEY ||
    "korede-james-local-quote-secret"
  );
}

function setParam(url, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    url.searchParams.set(key, String(value));
  }
}

function plannedShippingDate() {
  return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function roundDecimal(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}
