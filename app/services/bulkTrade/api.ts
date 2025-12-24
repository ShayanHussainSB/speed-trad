import type { BulkMarketInfo, BulkCandle, CandleInterval } from "./types";

class BulkTradeAPI {
  private async fetchProxy<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getExchangeInfo(): Promise<BulkMarketInfo[]> {
    return this.fetchProxy<BulkMarketInfo[]>("/api/bulk/exchangeInfo");
  }

  async getKlines(
    symbol: string,
    interval: CandleInterval,
    options?: {
      startTime?: number;
      endTime?: number;
      limit?: number;
    }
  ): Promise<BulkCandle[]> {
    const params = new URLSearchParams({ symbol, interval });

    if (options?.startTime) params.append("startTime", options.startTime.toString());
    if (options?.endTime) params.append("endTime", options.endTime.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    return this.fetchProxy<BulkCandle[]>(`/api/bulk/klines?${params.toString()}`);
  }

  // Fetch historical candles from Kraken API (for infinite scroll)
  async getHistoricalKlines(
    symbol: string,
    interval: CandleInterval,
    options: {
      startTime?: number;
      endTime: number;
      limit?: number;
    }
  ): Promise<BulkCandle[]> {
    const params = new URLSearchParams({ symbol, interval });

    if (options.startTime) params.append("startTime", options.startTime.toString());
    params.append("endTime", options.endTime.toString());
    if (options.limit) params.append("limit", options.limit.toString());

    return this.fetchProxy<BulkCandle[]>(`/api/kraken/klines?${params.toString()}`);
  }
}

export const bulkTradeAPI = new BulkTradeAPI();

export default BulkTradeAPI;
