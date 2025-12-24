"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { bulkTradeAPI, bulkTradeWS } from "@/app/services/bulkTrade";
import type {
  ConnectionStatus,
  MarketData,
  BulkTicker,
  BulkCandle,
  CandleInterval,
  ChartCandle,
} from "@/app/services/bulkTrade";
import { TICKER_THROTTLE_MS } from "@/app/services/bulkTrade";

const MAX_CANDLES = 2000; // Increased for historical data loading

interface MarketDataState {
  connectionStatus: ConnectionStatus;
  marketData: Map<string, MarketData>;
  candles: Map<string, ChartCandle[]>;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
}

type MarketDataAction =
  | { type: "SET_CONNECTION_STATUS"; status: ConnectionStatus }
  | { type: "UPDATE_MARKET_DATA"; symbol: string; data: MarketData }
  | { type: "UPDATE_CANDLES"; symbol: string; interval: string; candles: ChartCandle[] }
  | { type: "PREPEND_CANDLES"; symbol: string; interval: string; candles: ChartCandle[] }
  | { type: "ADD_CANDLE"; symbol: string; interval: string; candle: ChartCandle }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_HISTORY_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null };

function marketDataReducer(state: MarketDataState, action: MarketDataAction): MarketDataState {
  switch (action.type) {
    case "SET_CONNECTION_STATUS":
      return { ...state, connectionStatus: action.status };

    case "UPDATE_MARKET_DATA": {
      const newMarketData = new Map(state.marketData);
      newMarketData.set(action.symbol, action.data);
      return { ...state, marketData: newMarketData };
    }

    case "UPDATE_CANDLES": {
      const newCandles = new Map(state.candles);
      newCandles.set(`${action.symbol}:${action.interval}`, action.candles);
      return { ...state, candles: newCandles };
    }

    case "PREPEND_CANDLES": {
      const key = `${action.symbol}:${action.interval}`;
      const newCandles = new Map(state.candles);
      const existing = newCandles.get(key) || [];

      // Filter out duplicates (candles that already exist based on time)
      const existingTimes = new Set(existing.map(c => c.time));
      const uniqueNewCandles = action.candles.filter(c => !existingTimes.has(c.time));

      // Prepend older candles to the beginning
      let combined = [...uniqueNewCandles, ...existing];

      // Trim if exceeds max
      if (combined.length > MAX_CANDLES) {
        combined = combined.slice(combined.length - MAX_CANDLES);
      }

      newCandles.set(key, combined);
      return { ...state, candles: newCandles };
    }

    case "ADD_CANDLE": {
      const key = `${action.symbol}:${action.interval}`;
      const newCandles = new Map(state.candles);
      const existing = newCandles.get(key) || [];
      const lastCandle = existing[existing.length - 1];

      if (lastCandle && lastCandle.time === action.candle.time) {
        // Update existing candle (same time period)
        const updated = [...existing];
        updated[updated.length - 1] = action.candle;
        newCandles.set(key, updated);
      } else {
        // Add new candle
        const updated = [...existing, action.candle];
        if (updated.length > MAX_CANDLES) {
          updated.splice(0, updated.length - MAX_CANDLES);
        }
        newCandles.set(key, updated);
      }

      return { ...state, candles: newCandles };
    }

    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };

    case "SET_HISTORY_LOADING":
      return { ...state, isLoadingHistory: action.isLoading };

    case "SET_ERROR":
      return { ...state, error: action.error };

    default:
      return state;
  }
}

interface MarketDataContextType {
  state: MarketDataState;
  subscribeToTicker: (symbol: string) => void;
  unsubscribeFromTicker: (symbol: string) => void;
  subscribeToCandles: (symbol: string, interval: CandleInterval) => void;
  unsubscribeFromCandles: (symbol: string, interval: CandleInterval) => void;
  fetchCandles: (symbol: string, interval: CandleInterval) => Promise<ChartCandle[]>;
  fetchOlderCandles: (symbol: string, interval: CandleInterval, beforeTime: number) => Promise<ChartCandle[]>;
  getMarketData: (symbol: string) => MarketData | undefined;
  getCandles: (symbol: string, interval: string) => ChartCandle[];
}

const MarketDataContext = createContext<MarketDataContextType | null>(null);

const initialState: MarketDataState = {
  connectionStatus: "disconnected",
  marketData: new Map(),
  candles: new Map(),
  isLoading: false,
  isLoadingHistory: false,
  error: null,
};

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(marketDataReducer, initialState);
  const lastTickerUpdateRef = useRef<Map<string, number>>(new Map());

  const tickerToMarketData = useCallback((symbol: string, ticker: BulkTicker): MarketData => ({
    symbol,
    // Use markPrice for real-time updates (changes more frequently than lastPrice)
    price: ticker.markPrice || ticker.lastPrice,
    priceChange24h: ticker.priceChange,
    priceChangePercent24h: ticker.priceChangePercent,
    high24h: ticker.highPrice,
    low24h: ticker.lowPrice,
    volume24h: ticker.quoteVolume,
    openInterest: ticker.openInterest,
    lastUpdated: ticker.timestamp || Date.now(),
  }), []);

  const bulkCandleToChartCandle = useCallback((candle: BulkCandle): ChartCandle => ({
    time: Math.floor(candle.t / 1000),
    open: candle.o,
    high: candle.h,
    low: candle.l,
    close: candle.c,
    volume: candle.v,
  }), []);

  const handleTickerUpdate = useCallback((symbol: string, ticker: BulkTicker) => {
    const now = Date.now();
    const lastUpdate = lastTickerUpdateRef.current.get(symbol) || 0;

    if (now - lastUpdate < TICKER_THROTTLE_MS) return;

    lastTickerUpdateRef.current.set(symbol, now);
    dispatch({
      type: "UPDATE_MARKET_DATA",
      symbol,
      data: tickerToMarketData(symbol, ticker),
    });
  }, [tickerToMarketData]);

  const handleCandleUpdate = useCallback((symbol: string, interval: CandleInterval, candle: BulkCandle) => {
    dispatch({
      type: "ADD_CANDLE",
      symbol,
      interval,
      candle: bulkCandleToChartCandle(candle),
    });
  }, [bulkCandleToChartCandle]);

  useEffect(() => {
    let isMounted = true;

    bulkTradeWS.connect();

    const unsubStatus = bulkTradeWS.onStatusChange((status) => {
      if (isMounted) {
        dispatch({ type: "SET_CONNECTION_STATUS", status });
      }
    });

    const unsubTicker = bulkTradeWS.onTicker(handleTickerUpdate);
    const unsubCandle = bulkTradeWS.onCandle(handleCandleUpdate);

    return () => {
      isMounted = false;
      unsubStatus();
      unsubTicker();
      unsubCandle();
      bulkTradeWS.disconnect();
    };
  }, [handleTickerUpdate, handleCandleUpdate]);

  const subscribeToTicker = useCallback((symbol: string) => {
    bulkTradeWS.subscribeTicker(symbol);
  }, []);

  const unsubscribeFromTicker = useCallback((symbol: string) => {
    bulkTradeWS.unsubscribeTicker(symbol);
  }, []);

  const subscribeToCandles = useCallback((symbol: string, interval: CandleInterval) => {
    bulkTradeWS.subscribeCandle(symbol, interval);
  }, []);

  const unsubscribeFromCandles = useCallback((symbol: string, interval: CandleInterval) => {
    bulkTradeWS.unsubscribeCandle(symbol, interval);
  }, []);

  const fetchCandles = useCallback(async (symbol: string, interval: CandleInterval): Promise<ChartCandle[]> => {
    try {
      dispatch({ type: "SET_LOADING", isLoading: true });

      // Bulk.trade API caps at 200 candles max
      const bulkCandles = await bulkTradeAPI.getKlines(symbol, interval, { limit: 200 });

      if (!bulkCandles || bulkCandles.length === 0) {
        dispatch({ type: "SET_LOADING", isLoading: false });
        return [];
      }

      const chartCandles = bulkCandles.map(bulkCandleToChartCandle);

      dispatch({
        type: "UPDATE_CANDLES",
        symbol,
        interval,
        candles: chartCandles,
      });

      dispatch({ type: "SET_LOADING", isLoading: false });
      return chartCandles;
    } catch (err) {
      dispatch({ type: "SET_LOADING", isLoading: false });
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to fetch candles" });
      return [];
    }
  }, [bulkCandleToChartCandle]);

  // Fetch older candles for infinite scroll (before a given timestamp)
  // Uses Binance Futures API for historical data since Bulk.trade doesn't support pagination
  const fetchOlderCandles = useCallback(async (
    symbol: string,
    interval: CandleInterval,
    beforeTime: number
  ): Promise<ChartCandle[]> => {
    try {
      dispatch({ type: "SET_HISTORY_LOADING", isLoading: true });

      // beforeTime is in seconds (from lightweight-charts), convert to ms for API
      const beforeTimeMs = beforeTime * 1000;
      const limit = 200;

      // Fetch candles BEFORE the oldest candle we have using Binance API
      const bulkCandles = await bulkTradeAPI.getHistoricalKlines(symbol, interval, {
        endTime: beforeTimeMs - 1, // Exclude the oldest candle we already have
        limit,
      });

      if (!bulkCandles || bulkCandles.length === 0) {
        dispatch({ type: "SET_HISTORY_LOADING", isLoading: false });
        return [];
      }

      const chartCandles = bulkCandles.map(bulkCandleToChartCandle);

      dispatch({
        type: "PREPEND_CANDLES",
        symbol,
        interval,
        candles: chartCandles,
      });

      dispatch({ type: "SET_HISTORY_LOADING", isLoading: false });
      return chartCandles;
    } catch (err) {
      dispatch({ type: "SET_HISTORY_LOADING", isLoading: false });
      console.error("Failed to fetch older candles:", err);
      return [];
    }
  }, [bulkCandleToChartCandle]);

  const getMarketData = useCallback((symbol: string): MarketData | undefined => {
    return state.marketData.get(symbol);
  }, [state.marketData]);

  const getCandles = useCallback((symbol: string, interval: string): ChartCandle[] => {
    return state.candles.get(`${symbol}:${interval}`) || [];
  }, [state.candles]);

  const contextValue: MarketDataContextType = useMemo(() => ({
    state,
    subscribeToTicker,
    unsubscribeFromTicker,
    subscribeToCandles,
    unsubscribeFromCandles,
    fetchCandles,
    fetchOlderCandles,
    getMarketData,
    getCandles,
  }), [
    state,
    subscribeToTicker,
    unsubscribeFromTicker,
    subscribeToCandles,
    unsubscribeFromCandles,
    fetchCandles,
    fetchOlderCandles,
    getMarketData,
    getCandles,
  ]);

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketDataContext() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error("useMarketDataContext must be used within MarketDataProvider");
  }
  return context;
}

export default MarketDataContext;
