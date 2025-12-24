import { NextRequest, NextResponse } from "next/server";
import { BINANCE_FUTURES_API_URL, toBinanceSymbol } from "@/app/services/bulkTrade/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing required parameter: symbol" },
      { status: 400 }
    );
  }

  // Convert Bulk.trade symbol to Binance format (SOL-USD -> SOLUSDT)
  const binanceSymbol = toBinanceSymbol(symbol);

  try {
    // Fetch both 24hr ticker and open interest in parallel
    const [tickerRes, oiRes] = await Promise.all([
      fetch(`${BINANCE_FUTURES_API_URL}/ticker/24hr?symbol=${binanceSymbol}`, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 5 }, // Cache for 5 seconds
      }),
      fetch(`${BINANCE_FUTURES_API_URL}/openInterest?symbol=${binanceSymbol}`, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 5 },
      }),
    ]);

    if (!tickerRes.ok) {
      return NextResponse.json(
        { error: `Binance API error: ${tickerRes.status} ${tickerRes.statusText}` },
        { status: tickerRes.status }
      );
    }

    const tickerData = await tickerRes.json();
    const oiData = oiRes.ok ? await oiRes.json() : { openInterest: "0" };

    // Return normalized data
    return NextResponse.json({
      symbol: tickerData.symbol,
      volume24h: parseFloat(tickerData.quoteVolume) || 0, // Quote volume in USDT
      openInterest: parseFloat(oiData.openInterest) || 0, // Open interest in base asset
      openInterestValue: parseFloat(oiData.openInterest) * parseFloat(tickerData.lastPrice) || 0, // OI in USDT
      lastPrice: parseFloat(tickerData.lastPrice) || 0,
      priceChange: parseFloat(tickerData.priceChange) || 0,
      priceChangePercent: parseFloat(tickerData.priceChangePercent) || 0,
      highPrice: parseFloat(tickerData.highPrice) || 0,
      lowPrice: parseFloat(tickerData.lowPrice) || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch ticker from Binance" },
      { status: 500 }
    );
  }
}
