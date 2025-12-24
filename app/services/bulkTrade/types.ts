export interface BulkMarketInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: "TRADING" | "SUSPENDED" | "CLOSED";
  pricePrecision: number;
  sizePrecision: number;
  tickSize: number;
  lotSize: number;
  minNotional: number;
  maxLeverage: number;
  orderTypes: string[];
  timeInForces: string[];
}

export interface BulkTicker {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  markPrice: number;
  oraclePrice: number;
  openInterest: number;
  fundingRate: number;
  timestamp: number;
}

export interface BulkCandle {
  t: number;
  T: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  n: number;
}

export type WsSubscriptionType =
  | "ticker"
  | "candle"
  | "trades"
  | "l2Snapshot"
  | "l2Delta"
  | "risk";

export type CandleInterval = "10s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export interface WsSubscription {
  type: WsSubscriptionType;
  symbol: string;
  interval?: CandleInterval;
  nlevels?: number;
  aggregation?: number;
}

export interface WsSubscribeMessage {
  method: "subscribe" | "unsubscribe";
  subscription: WsSubscription[];
}

export interface WsTickerUpdate {
  type: "ticker";
  symbol: string;
  data: BulkTicker;
}

export interface WsCandleUpdate {
  type: "candle";
  symbol: string;
  interval: CandleInterval;
  data: BulkCandle;
}

export interface WsTradeUpdate {
  type: "trades";
  symbol: string;
  data: {
    s: string;
    px: number;
    sz: number;
    ts: number;
    side: "buy" | "sell";
    makerPk?: string;
    takerPk?: string;
    liquidation?: boolean;
  };
}

export type WsMessage = WsTickerUpdate | WsCandleUpdate | WsTradeUpdate;

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "reconnecting";

export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  openInterest: number;
  lastUpdated: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
  isAvailable: boolean;
}
