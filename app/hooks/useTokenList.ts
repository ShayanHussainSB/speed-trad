"use client";

import { useMemo, useEffect } from "react";
import { useMarketDataContext } from "@/app/contexts/MarketDataContext";
import type { Token } from "@/app/components/trading/TokenSelectorModal";

// Bulk.trade symbols for all supported tokens
const SUPPORTED_SYMBOLS = ["SOL-USD", "BTC-USD", "ETH-USD"];

// Only tokens supported by Bulk.trade API (SOL-USD, BTC-USD, ETH-USD)
// Using CoinGecko CDN for reliable token images
const TOKEN_METADATA: Record<string, Omit<Token, "price" | "change24h" | "volume24h">> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    icon: "#9945FF",
    image: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
    verified: true,
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    address: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
    icon: "#F7931A",
    image: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png",
    verified: true,
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    icon: "#627EEA",
    image: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
    verified: true,
  },
};

function extractBaseSymbol(bulkSymbol: string): string {
  return bulkSymbol.split("-")[0];
}

export function useTokenList(): {
  tokens: Token[];
  isLoading: boolean;
  getTokenBySymbol: (symbol: string) => Token | undefined;
} {
  const { state, subscribeToTicker, unsubscribeFromTicker } = useMarketDataContext();
  const { marketData, isLoading } = state;

  // Subscribe to all supported token tickers on mount
  useEffect(() => {
    SUPPORTED_SYMBOLS.forEach((symbol) => {
      subscribeToTicker(symbol);
    });

    return () => {
      SUPPORTED_SYMBOLS.forEach((symbol) => {
        unsubscribeFromTicker(symbol);
      });
    };
  }, [subscribeToTicker, unsubscribeFromTicker]);

  const tokens = useMemo(() => {
    const result: Token[] = [];
    const addedSymbols = new Set<string>();

    // Build tokens from live market data
    marketData.forEach((data, bulkSymbol) => {
      const baseSymbol = extractBaseSymbol(bulkSymbol);
      const metadata = TOKEN_METADATA[baseSymbol];

      if (metadata && !addedSymbols.has(baseSymbol)) {
        addedSymbols.add(baseSymbol);
        result.push({
          ...metadata,
          price: data.price,
          change24h: data.priceChangePercent24h,
          volume24h: data.volume24h,
        });
      }
    });

    // If no market data yet, show all supported tokens with placeholder data
    if (result.length === 0) {
      Object.values(TOKEN_METADATA).forEach((metadata) => {
        result.push({
          ...metadata,
          price: 0,
          change24h: 0,
          volume24h: 0,
        });
      });
    }

    result.sort((a, b) => b.volume24h - a.volume24h);
    return result;
  }, [marketData]);

  const getTokenBySymbol = useMemo(() => {
    const tokenMap = new Map(tokens.map(t => [t.symbol, t]));
    return (symbol: string) => tokenMap.get(symbol);
  }, [tokens]);

  return {
    tokens,
    isLoading,
    getTokenBySymbol,
  };
}

export default useTokenList;
