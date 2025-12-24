import { NextRequest, NextResponse } from "next/server";

// Map Bulk.trade symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  "SOL": "solana",
  "BTC": "bitcoin",
  "ETH": "ethereum",
};

function getBaseSymbol(symbol: string): string {
  return symbol.replace("-USD", "").replace("-USDT", "").toUpperCase();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing required parameter: symbol" },
      { status: 400 }
    );
  }

  const baseSymbol = getBaseSymbol(symbol);
  const coinId = COINGECKO_IDS[baseSymbol];

  if (!coinId) {
    return NextResponse.json(
      { error: `Unsupported symbol: ${symbol}` },
      { status: 400 }
    );
  }

  try {
    // Use CoinGecko's free API for market data
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds (CoinGecko rate limits)
      }
    );

    if (!response.ok) {
      // Fallback to simple price endpoint if detailed fails
      const simpleRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`,
        { next: { revalidate: 30 } }
      );

      if (simpleRes.ok) {
        const simpleData = await simpleRes.json();
        const data = simpleData[coinId];
        return NextResponse.json({
          symbol: baseSymbol,
          volume24h: data?.usd_24h_vol || 0,
          openInterest: 0, // CoinGecko doesn't provide OI
          openInterestValue: 0,
          lastPrice: data?.usd || 0,
          priceChangePercent: data?.usd_24h_change || 0,
        });
      }

      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const marketData = data.market_data;

    // Return normalized data
    return NextResponse.json({
      symbol: baseSymbol,
      volume24h: marketData?.total_volume?.usd || 0,
      openInterest: 0, // CoinGecko doesn't provide futures OI
      openInterestValue: 0, // Would need derivatives API for this
      lastPrice: marketData?.current_price?.usd || 0,
      priceChange: marketData?.price_change_24h || 0,
      priceChangePercent: marketData?.price_change_percentage_24h || 0,
      highPrice: marketData?.high_24h?.usd || 0,
      lowPrice: marketData?.low_24h?.usd || 0,
      marketCap: marketData?.market_cap?.usd || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch ticker" },
      { status: 500 }
    );
  }
}
