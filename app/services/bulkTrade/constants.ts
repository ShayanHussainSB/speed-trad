export const BULK_API_BASE_URL = "https://exchange-api2.bulk.trade/api/v1";
export const BULK_WS_URL = "wss://exchange-wss.bulk.trade";
export const BINANCE_FUTURES_API_URL = "https://fapi.binance.com/fapi/v1";

export const CANDLE_INTERVALS = ["10s", "1m", "5m", "15m", "1h", "4h", "1d"] as const;

export const TIMEFRAME_MAP: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
};

// Convert Bulk.trade symbol (SOL-USD) to Binance Futures symbol (SOLUSDT)
export function toBinanceSymbol(bulkSymbol: string): string {
  // SOL-USD -> SOLUSDT, BTC-USD -> BTCUSDT, etc.
  const base = bulkSymbol.replace("-USD", "").replace("-USDT", "");
  return `${base}USDT`;
}

export const WS_RECONNECT_INITIAL_DELAY = 1000;
export const WS_RECONNECT_MAX_DELAY = 30000;
export const WS_RECONNECT_MULTIPLIER = 2;

export const TICKER_THROTTLE_MS = 50;
