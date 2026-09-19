import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_MARKET,
  MARKET_OPTIONS,
  getMarketByCode,
} from "../utils/pricing";

const STORAGE_KEY = "korede-james-market";

const RegionContext = createContext({
  market: DEFAULT_MARKET,
  currency: DEFAULT_MARKET.currency,
  countryCode: DEFAULT_MARKET.countryCode,
  countryName: DEFAULT_MARKET.label,
  regionLabel: DEFAULT_MARKET.label,
  source: "fallback",
  isLoading: true,
  markets: MARKET_OPTIONS,
  setMarket: () => {},
});

export function RegionProvider({ children }) {
  const [region, setRegion] = useState({
    market: DEFAULT_MARKET,
    currency: DEFAULT_MARKET.currency,
    countryCode: DEFAULT_MARKET.countryCode,
    countryName: DEFAULT_MARKET.label,
    source: "fallback",
    isLoading: true,
  });

  const applyMarket = useCallback((marketCode, metadata = {}) => {
    const market = getMarketByCode(marketCode);
    setRegion({
      market,
      currency: market.currency,
      countryCode: metadata.countryCode || market.countryCode,
      countryName: metadata.countryName || market.label,
      source: metadata.source || "manual",
      isLoading: false,
    });
  }, []);

  const setMarket = useCallback(
    (marketCode) => {
      const market = getMarketByCode(marketCode);
      window.localStorage.setItem(STORAGE_KEY, market.code);
      applyMarket(market.code, {
        countryCode: market.countryCode,
        countryName: market.label,
        source: "manual",
      });
    },
    [applyMarket],
  );

  useEffect(() => {
    let isMounted = true;
    const storedMarket =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

    if (storedMarket) {
      applyMarket(storedMarket, { source: "manual" });
      return undefined;
    }

    fetch("/api/region")
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const market = getMarketByCode(data.market);
        setRegion({
          market,
          currency: market.currency,
          countryCode: data.countryCode || market.countryCode,
          countryName: data.countryName || market.label,
          source: data.source || "geo",
          isLoading: false,
        });
      })
      .catch(() => {
        if (isMounted) {
          applyMarket(DEFAULT_MARKET.code, { source: "fallback" });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [applyMarket]);

  const value = useMemo(
    () => ({
      ...region,
      regionLabel:
        region.countryName === "International"
          ? "International"
          : region.countryName || region.market.label,
      markets: MARKET_OPTIONS,
      setMarket,
    }),
    [region, setMarket],
  );

  return (
    <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
  );
}

export function useRegion() {
  return useContext(RegionContext);
}
