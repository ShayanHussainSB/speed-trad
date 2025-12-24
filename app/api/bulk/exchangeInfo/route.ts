import { NextResponse } from "next/server";
import { BULK_API_BASE_URL } from "@/app/services/bulkTrade/constants";

export async function GET() {
  try {
    const response = await fetch(`${BULK_API_BASE_URL}/exchangeInfo`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch exchange info" },
      { status: 500 }
    );
  }
}
