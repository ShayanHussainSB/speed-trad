import { NextRequest, NextResponse } from "next/server";

const KRAKEN_API_URL = "https://api.kraken.com/0/public";

// Map Bulk.trade symbols to Kraken pairs
const KRAKEN_PAIRS: Record<string, string> = {
  SOL: "SOLUSD",
  BTC: "XBTUSD",
  ETH: "ETHUSD",
};

// Map interval strings to Kraken interval values (in minutes)
const INTERVAL_MAP: Record<string, number> = {
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "4h": 240,
  "1d": 1440,
};

function getBaseSymbol(symbol: string): string {
  return symbol.replace("-USD", "").replace("-USDT", "").toUpperCase();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval");
  const limit = searchParams.get("limit");
  const endTime = searchParams.get("endTime");

  if (!symbol || !interval) {
    return NextResponse.json(
      { error: "Missing required parameters: symbol, interval" },
      { status: 400 }
    );
  }

  const baseSymbol = getBaseSymbol(symbol);
  const krakenPair = KRAKEN_PAIRS[baseSymbol];

  if (!krakenPair) {
    return NextResponse.json(
      { error: `Unsupported symbol: ${symbol}` },
      { status: 400 }
    );
  }

  const krakenInterval = INTERVAL_MAP[interval];
  if (!krakenInterval) {
    return NextResponse.json(
      { error: `Unsupported interval: ${interval}` },
      { status: 400 }
    );
  }

  // Build Kraken API URL
  const params = new URLSearchParams({
    pair: krakenPair,
    interval: krakenInterval.toString(),
  });

  // Kraken uses 'since' parameter (Unix timestamp in seconds)
  // We need to calculate start time based on endTime and limit
  if (endTime) {
    const endTimeSeconds = Math.floor(Number(endTime) / 1000);
    const limitNum = limit ? parseInt(limit, 10) : 200;
    const intervalMs = krakenInterval * 60 * 1000;
    const startTimeSeconds = Math.floor((Number(endTime) - limitNum * intervalMs) / 1000);
    params.append("since", startTimeSeconds.toString());
  }

  try {
    const response = await fetch(`${KRAKEN_API_URL}/OHLC?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Kraken API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.error && data.error.length > 0) {
      return NextResponse.json(
        { error: `Kraken API error: ${data.error.join(", ")}` },
        { status: 400 }
      );
    }

    // Get the OHLC data from the result
    // Kraken returns keys like XXBTZUSD, XETHZUSD, SOLUSD - find the data key (not 'last')
    const resultKeys = Object.keys(data.result).filter(k => k !== "last");
    const ohlcData = resultKeys.length > 0 ? data.result[resultKeys[0]] : [];

    // Filter by endTime if specified (Kraken returns data from 'since' onwards)
    let filteredData = ohlcData;
    if (endTime) {
      const endTimeSeconds = Math.floor(Number(endTime) / 1000);
      filteredData = ohlcData.filter((k: (number | string)[]) => Number(k[0]) < endTimeSeconds);
    }

    // Limit the results
    const limitNum = limit ? parseInt(limit, 10) : 200;
    const slicedData = filteredData.slice(-limitNum);

    // Convert Kraken OHLC format to BulkCandle format
    // Kraken: [time, open, high, low, close, vwap, volume, count]
    // BulkCandle: { t, T, o, h, l, c, v, n }
    const candles = slicedData.map((k: (number | string)[]) => {
      const openTime = Number(k[0]) * 1000; // Convert to ms
      const intervalMs = krakenInterval * 60 * 1000;
      return {
        t: openTime,
        T: openTime + intervalMs - 1, // Close time
        o: parseFloat(k[1] as string),
        h: parseFloat(k[2] as string),
        l: parseFloat(k[3] as string),
        c: parseFloat(k[4] as string),
        v: parseFloat(k[6] as string), // Volume is at index 6
        n: Number(k[7]), // Trade count is at index 7
      };
    });

    return NextResponse.json(candles);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch klines from Kraken" },
      { status: 500 }
    );
  }
}
