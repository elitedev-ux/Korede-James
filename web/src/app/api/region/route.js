import { getMarketByCountry } from "../../../utils/pricing.js";

const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
];

export async function GET({ request } = {}) {
  const headers = request?.headers;
  const host = headers?.get("host") || "";
  const countryCode = readCountryCode(headers);
  const hasCountry = Boolean(countryCode);
  const domainMarket =
    !hasCountry && host.toLowerCase().includes("koredejames.com")
      ? "NG"
      : null;
  const market = domainMarket
    ? getMarketByCountry(domainMarket)
    : getMarketByCountry(countryCode);
  const resolvedCountryCode = countryCode || market.countryCode;

  return Response.json({
    market: market.code,
    currency: market.currency,
    countryCode: resolvedCountryCode,
    countryName: getCountryName(resolvedCountryCode, market.label),
    source: hasCountry ? "geo" : domainMarket ? "domain" : "fallback",
  });
}

function readCountryCode(headers) {
  if (!headers) {
    return "";
  }

  for (const header of COUNTRY_HEADERS) {
    const value = headers.get(header);
    if (value) {
      return String(value).slice(0, 2).toUpperCase();
    }
  }

  return "";
}

function getCountryName(countryCode, fallback) {
  if (!countryCode || countryCode === "INT") {
    return fallback || "International";
  }

  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode) || fallback || "International";
  } catch {
    return fallback || "International";
  }
}
