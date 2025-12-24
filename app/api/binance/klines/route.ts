import { NextRequest, NextResponse } from "next/server";
import { BINANCE_FUTURES_API_URL, toBinanceSymbol } from "@/app/services/bulkTrade/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval");
  const limit = searchParams.get("limit");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  if (!symbol || !interval) {
    return NextResponse.json(
      { error: "Missing required parameters: symbol, interval" },
      { status: 400 }
    );
  }

  // Convert Bulk.trade symbol to Binance format
  const binanceSymbol = toBinanceSymbol(symbol);

  const params = new URLSearchParams({ symbol: binanceSymbol, interval });
  if (limit) params.append("limit", limit);
  if (startTime) params.append("startTime", startTime);
  if (endTime) params.append("endTime", endTime);

  try {
    const response = await fetch(`${BINANCE_FUTURES_API_URL}/klines?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Binance API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert Binance kline format to BulkCandle format
    // Binance: [openTime, open, high, low, close, volume, closeTime, ...]
    // BulkCandle: { t, T, o, h, l, c, v, n }
    const candles = data.map((k: (string | number)[]) => ({
      t: Number(k[0]),           // Open time
      T: Number(k[6]),           // Close time
      o: parseFloat(k[1] as string),  // Open
      h: parseFloat(k[2] as string),  // High
      l: parseFloat(k[3] as string),  // Low
      c: parseFloat(k[4] as string),  // Close
      v: parseFloat(k[5] as string),  // Volume
      n: Number(k[8]),           // Number of trades
    }));

    return NextResponse.json(candles);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch klines from Binance" },
      { status: 500 }
    );
  }
}
