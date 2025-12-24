"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMarketDataContext } from "@/app/contexts/MarketDataContext";
import type { MarketData } from "@/app/services/bulkTrade";

interface LivePriceData {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  openInterest: number;
  lastUpdated: number;
  isLoading: boolean;
}

export function useLivePrice(symbol: string): LivePriceData {
  const { state, subscribeToTicker, unsubscribeFromTicker } = useMarketDataContext();

  useEffect(() => {
    if (!symbol) return;
    subscribeToTicker(symbol);
    return () => unsubscribeFromTicker(symbol);
  }, [symbol, subscribeToTicker, unsubscribeFromTicker]);

  // Get market data directly from state to ensure reactivity
  const marketData = state.marketData.get(symbol);

  return {
    price: marketData?.price ?? 0,
    priceChange24h: marketData?.priceChange24h ?? 0,
    priceChangePercent24h: marketData?.priceChangePercent24h ?? 0,
    high24h: marketData?.high24h ?? 0,
    low24h: marketData?.low24h ?? 0,
    volume24h: marketData?.volume24h ?? 0,
    openInterest: marketData?.openInterest ?? 0,
    lastUpdated: marketData?.lastUpdated ?? 0,
    isLoading: state.isLoading,
  };
}

export function useLivePrices(symbols: string[]): Map<string, MarketData> {
  const { state, subscribeToTicker, unsubscribeFromTicker } = useMarketDataContext();
  const symbolsRef = useRef<string[]>([]);

  useEffect(() => {
    const prevSymbols = symbolsRef.current;
    const newSymbols = symbols.filter(s => !prevSymbols.includes(s));
    const removedSymbols = prevSymbols.filter(s => !symbols.includes(s));

    newSymbols.forEach(symbol => subscribeToTicker(symbol));
    removedSymbols.forEach(symbol => unsubscribeFromTicker(symbol));
    symbolsRef.current = symbols;

    return () => {
      symbols.forEach(symbol => unsubscribeFromTicker(symbol));
    };
  }, [symbols, subscribeToTicker, unsubscribeFromTicker]);

  return useMemo(() => {
    const result = new Map<string, MarketData>();
    symbols.forEach(symbol => {
      const data = state.marketData.get(symbol);
      if (data) result.set(symbol, data);
    });
    return result;
  }, [symbols, state.marketData]);
}

export default useLivePrice;
