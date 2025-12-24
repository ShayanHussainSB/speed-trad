"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMarketDataContext } from "@/app/contexts/MarketDataContext";
import type { ChartCandle, CandleInterval } from "@/app/services/bulkTrade";
import { TIMEFRAME_MAP } from "@/app/services/bulkTrade";

interface UseMarketDataOptions {
  autoSubscribe?: boolean;
}

interface MarketDataResult {
  candles: ChartCandle[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchOlderCandles: (beforeTime: number) => Promise<ChartCandle[]>;
}

export function useMarketData(
  symbol: string,
  timeframe: string,
  options: UseMarketDataOptions = { autoSubscribe: true }
): MarketDataResult {
  const {
    state,
    fetchCandles,
    fetchOlderCandles: contextFetchOlderCandles,
    subscribeToCandles,
    unsubscribeFromCandles,
    getCandles,
  } = useMarketDataContext();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string>("");

  const interval = (TIMEFRAME_MAP[timeframe] || "5m") as CandleInterval;
  const cacheKey = `${symbol}:${interval}`;

  const refetch = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    try {
      await fetchCandles(symbol, interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [symbol, interval, fetchCandles]);

  useEffect(() => {
    if (!symbol) return;

    if (fetchedRef.current !== cacheKey) {
      fetchedRef.current = cacheKey;
      refetch();
    }

    if (options.autoSubscribe) {
      subscribeToCandles(symbol, interval);
      return () => unsubscribeFromCandles(symbol, interval);
    }
  }, [symbol, interval, cacheKey, options.autoSubscribe, refetch, subscribeToCandles, unsubscribeFromCandles]);

  const candles = getCandles(symbol, interval);

  // Wrapper for fetchOlderCandles that uses current symbol/interval
  const fetchOlderCandles = useCallback(async (beforeTime: number): Promise<ChartCandle[]> => {
    if (!symbol) return [];
    return contextFetchOlderCandles(symbol, interval, beforeTime);
  }, [symbol, interval, contextFetchOlderCandles]);

  return {
    candles,
    isLoading: isLoading || state.isLoading,
    isLoadingHistory: state.isLoadingHistory,
    error: error || state.error,
    refetch,
    fetchOlderCandles,
  };
}

export default useMarketData;
