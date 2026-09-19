export const MARKET_OPTIONS = [
  {
    code: "NG",
    label: "Nigeria",
    countryCode: "NG",
    currency: "NGN",
    symbol: "\u20A6",
    domain: "koredejames.com",
  },
  {
    code: "INT",
    label: "International",
    countryCode: "INT",
    currency: "USD",
    symbol: "$",
    domain: null,
  },
];

export const DEFAULT_MARKET = MARKET_OPTIONS[1];
export const NGN_TO_USD_RATE = 1000;

export function getMarketByCode(code) {
  return MARKET_OPTIONS.find((market) => market.code === code) || DEFAULT_MARKET;
}

export function getMarketByCurrency(currency) {
  return (
    MARKET_OPTIONS.find((market) => market.currency === currency) ||
    DEFAULT_MARKET
  );
}

export function getMarketByCountry(countryCode) {
  return String(countryCode || "").toUpperCase() === "NG"
    ? MARKET_OPTIONS[0]
    : DEFAULT_MARKET;
}

export function createPrices({ NGN = 0, USD } = {}) {
  const ngn = normalizeAmount(NGN);
  return {
    NGN: ngn,
    USD: normalizeAmount(USD ?? convertNgnToUsd(ngn)),
  };
}

export function convertNgnToUsd(value) {
  const amount = normalizeAmount(value);
  if (!amount) {
    return 0;
  }

  return Math.max(1, Math.round(amount / NGN_TO_USD_RATE));
}

export function getProductPrices(product) {
  if (product?.prices && typeof product.prices === "object") {
    return {
      NGN: normalizeAmount(product.prices.NGN ?? product.price),
      USD: normalizeAmount(product.prices.USD ?? convertNgnToUsd(product.price)),
    };
  }

  return createPrices({ NGN: product?.price || 0, USD: product?.usdPrice });
}

export function getProductPrice(product, currency = DEFAULT_MARKET.currency) {
  const prices = getProductPrices(product);
  return normalizeAmount(prices[currency] ?? prices[DEFAULT_MARKET.currency]);
}

export function getLineItemPrice(item, currency = DEFAULT_MARKET.currency) {
  return getProductPrice(item, currency);
}

export function sumLineItems(items = [], currency = DEFAULT_MARKET.currency) {
  return items.reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 1;
    return sum + getLineItemPrice(item, currency) * quantity;
  }, 0);
}

export function formatMoney(value, currency = DEFAULT_MARKET.currency) {
  const market = getMarketByCurrency(currency);
  const amount = normalizeAmount(value);
  return `${market.symbol}${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatProductPrice(product, currency = DEFAULT_MARKET.currency) {
  const value = getProductPrice(product, currency);
  return value ? formatMoney(value, currency) : "";
}

function normalizeAmount(value) {
  const amount = Number(value) || 0;
  return Math.max(0, Math.round(amount));
}
