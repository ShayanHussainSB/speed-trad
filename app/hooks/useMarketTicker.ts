"use client";

import { useEffect, useState, useCallback } from "react";

interface MarketTickerData {
  volume24h: number;
  marketCap: number;
  lastPrice: number;
  priceChangePercent: number;
  isLoading: boolean;
  error: string | null;
}

const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds (CoinGecko rate limits)

export function useMarketTicker(symbol: string): MarketTickerData {
  const [data, setData] = useState<MarketTickerData>({
    volume24h: 0,
    marketCap: 0,
    lastPrice: 0,
    priceChangePercent: 0,
    isLoading: true,
    error: null,
  });

  const fetchTicker = useCallback(async () => {
    if (!symbol) return;

    try {
      const response = await fetch(`/api/coingecko/ticker?symbol=${symbol}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const tickerData = await response.json();

      setData({
        volume24h: tickerData.volume24h || 0,
        marketCap: tickerData.marketCap || 0,
        lastPrice: tickerData.lastPrice || 0,
        priceChangePercent: tickerData.priceChangePercent || 0,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch ticker",
      }));
    }
  }, [symbol]);

  useEffect(() => {
    // Fetch immediately
    fetchTicker();

    // Set up polling interval
    const interval = setInterval(fetchTicker, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchTicker]);

  return data;
}

export default useMarketTicker;
