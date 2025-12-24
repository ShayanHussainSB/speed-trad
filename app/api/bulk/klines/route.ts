import { NextRequest, NextResponse } from "next/server";
import { BULK_API_BASE_URL } from "@/app/services/bulkTrade/constants";

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

  const params = new URLSearchParams({ symbol, interval });
  if (limit) params.append("limit", limit);
  if (startTime) params.append("startTime", startTime);
  if (endTime) params.append("endTime", endTime);

  try {
    const response = await fetch(`${BULK_API_BASE_URL}/klines?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch klines" },
      { status: 500 }
    );
  }
}
