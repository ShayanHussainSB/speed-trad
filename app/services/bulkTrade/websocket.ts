import {
  BULK_WS_URL,
  WS_RECONNECT_INITIAL_DELAY,
  WS_RECONNECT_MAX_DELAY,
  WS_RECONNECT_MULTIPLIER,
} from "./constants";
import type {
  ConnectionStatus,
  WsSubscription,
  CandleInterval,
  BulkTicker,
  BulkCandle,
} from "./types";

type TickerCallback = (symbol: string, ticker: BulkTicker) => void;
type CandleCallback = (symbol: string, interval: CandleInterval, candle: BulkCandle) => void;
type StatusCallback = (status: ConnectionStatus) => void;

interface Subscription {
  type: "ticker" | "candle";
  symbol: string;
  interval?: CandleInterval;
}

class BulkTradeWebSocket {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private tickerCallbacks: Set<TickerCallback> = new Set();
  private candleCallbacks: Set<CandleCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private isIntentionalClose = false;

  private getSubscriptionKey(sub: Subscription): string {
    return sub.interval ? `${sub.type}:${sub.symbol}:${sub.interval}` : `${sub.type}:${sub.symbol}`;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.isIntentionalClose = false;
    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(BULK_WS_URL);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus("connected");
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        if (!this.isIntentionalClose) {
          this.setStatus("disconnected");
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("[WS] Error:", error);
      };
    } catch (err) {
      console.error("[WS] Connection error:", err);
      this.setStatus("disconnected");
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.tickerCallbacks.clear();
    this.candleCallbacks.clear();
    this.statusCallbacks.clear();
    this.setStatus("disconnected");
  }

  subscribeTicker(symbol: string): void {
    const sub: Subscription = { type: "ticker", symbol };
    const key = this.getSubscriptionKey(sub);

    if (this.subscriptions.has(key)) return;

    this.subscriptions.set(key, sub);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe([{ type: "ticker", symbol }]);
    }
  }

  unsubscribeTicker(symbol: string): void {
    const key = `ticker:${symbol}`;
    this.subscriptions.delete(key);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendUnsubscribe([{ type: "ticker", symbol }]);
    }
  }

  subscribeCandle(symbol: string, interval: CandleInterval): void {
    const sub: Subscription = { type: "candle", symbol, interval };
    const key = this.getSubscriptionKey(sub);

    if (this.subscriptions.has(key)) return;

    this.subscriptions.set(key, sub);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe([{ type: "candle", symbol, interval }]);
    }
  }

  unsubscribeCandle(symbol: string, interval: CandleInterval): void {
    const key = `candle:${symbol}:${interval}`;
    this.subscriptions.delete(key);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendUnsubscribe([{ type: "candle", symbol, interval }]);
    }
  }

  onTicker(callback: TickerCallback): () => void {
    this.tickerCallbacks.add(callback);
    return () => this.tickerCallbacks.delete(callback);
  }

  onCandle(callback: CandleCallback): () => void {
    this.candleCallbacks.add(callback);
    return () => this.candleCallbacks.delete(callback);
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    callback(this.status);
    return () => this.statusCallbacks.delete(callback);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusCallbacks.forEach(cb => cb(status));
  }

  private sendSubscribe(subscriptions: WsSubscription[]): void {
    const message = {
      method: "subscribe",
      subscription: subscriptions,
    };
    this.ws?.send(JSON.stringify(message));
  }

  private sendUnsubscribe(subscriptions: WsSubscription[]): void {
    const message = {
      method: "unsubscribe",
      subscription: subscriptions,
    };
    this.ws?.send(JSON.stringify(message));
  }

  private resubscribeAll(): void {
    const subs: WsSubscription[] = [];

    this.subscriptions.forEach(sub => {
      if (sub.type === "ticker") {
        subs.push({ type: "ticker", symbol: sub.symbol });
      } else if (sub.type === "candle" && sub.interval) {
        subs.push({ type: "candle", symbol: sub.symbol, interval: sub.interval });
      }
    });

    if (subs.length > 0) {
      this.sendSubscribe(subs);
    }
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle subscription confirmation
      if (message.channel === "subscriptionResponse" || message.type === "subscribed") {
        return;
      }

      // Handle ticker updates - support multiple message formats
      // Bulk.trade format: {"type":"ticker","data":{"ticker":{...}}}
      const isTicker = message.type === "ticker" || message.channel === "ticker";
      if (isTicker) {
        // Handle nested ticker format: message.data.ticker
        const tickerData = message.data?.ticker || message.data || message;
        const symbol = tickerData?.symbol || message.symbol;

        if (symbol && tickerData) {
          // Normalize ticker data to handle different field naming conventions
          const normalizedTicker: BulkTicker = {
            symbol,
            priceChange: tickerData.priceChange ?? tickerData.price_change ?? 0,
            priceChangePercent: tickerData.priceChangePercent ?? tickerData.price_change_percent ?? tickerData.priceChangePct ?? 0,
            lastPrice: tickerData.lastPrice ?? tickerData.last_price ?? tickerData.price ?? 0,
            highPrice: tickerData.highPrice ?? tickerData.high_price ?? tickerData.high ?? 0,
            lowPrice: tickerData.lowPrice ?? tickerData.low_price ?? tickerData.low ?? 0,
            volume: tickerData.volume ?? tickerData.vol ?? 0,
            quoteVolume: tickerData.quoteVolume ?? tickerData.quote_volume ?? tickerData.quoteVol ?? tickerData.turnover ?? 0,
            markPrice: tickerData.markPrice ?? tickerData.mark_price ?? tickerData.lastPrice ?? tickerData.last_price ?? tickerData.price ?? 0,
            oraclePrice: tickerData.oraclePrice ?? tickerData.oracle_price ?? tickerData.indexPrice ?? 0,
            openInterest: tickerData.openInterest ?? tickerData.open_interest ?? tickerData.oi ?? 0,
            fundingRate: tickerData.fundingRate ?? tickerData.funding_rate ?? 0,
            timestamp: tickerData.timestamp ?? tickerData.ts ?? Date.now(),
          };
          this.tickerCallbacks.forEach(cb => cb(symbol, normalizedTicker));
        }
        return;
      }

      // Handle candle/kline updates - support multiple message formats
      // Bulk.trade likely format: {"type":"candle","data":{"candle":{...}}} or similar
      const isCandle = message.type === "candle" || message.channel === "candle" ||
                       message.type === "kline" || message.channel === "kline";
      if (isCandle) {
        // Handle potentially nested candle format
        const candleWrapper = message.data?.candle || message.data?.kline || message.data || message;
        const symbol = candleWrapper?.symbol || message.symbol || message.s;
        const interval = candleWrapper?.interval || message.interval || message.i;
        const candleData = candleWrapper?.candle || candleWrapper?.kline || candleWrapper;

        if (symbol && interval && candleData) {
          if (Array.isArray(candleData)) {
            candleData.forEach((candle: BulkCandle) => {
              this.candleCallbacks.forEach(cb => cb(symbol, interval, candle));
            });
          } else {
            // Transform if needed (handle both {o,h,l,c} and {open,high,low,close} formats)
            const normalizedCandle: BulkCandle = {
              t: candleData.t || candleData.time || Date.now(),
              T: candleData.T || candleData.closeTime || Date.now(),
              o: candleData.o ?? candleData.open ?? 0,
              h: candleData.h ?? candleData.high ?? 0,
              l: candleData.l ?? candleData.low ?? 0,
              c: candleData.c ?? candleData.close ?? 0,
              v: candleData.v ?? candleData.volume ?? 0,
              n: candleData.n ?? 0,
            };
            this.candleCallbacks.forEach(cb => cb(symbol, interval, normalizedCandle));
          }
        }
        return;
      }
    } catch {
      // Silently ignore parse errors for malformed messages
    }
  }

  private scheduleReconnect(): void {
    if (this.isIntentionalClose) return;

    const delay = Math.min(
      WS_RECONNECT_INITIAL_DELAY * Math.pow(WS_RECONNECT_MULTIPLIER, this.reconnectAttempts),
      WS_RECONNECT_MAX_DELAY
    );

    this.setStatus("reconnecting");
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

export const bulkTradeWS = new BulkTradeWebSocket();

export default BulkTradeWebSocket;
