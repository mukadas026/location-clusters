import { NextRequest, NextResponse } from "next/server";
import { fetchAllOrders, MoveetApiError } from "@/lib/moveetApi";
import { toMapOrder } from "@/lib/mapOrder";
import { resolveToken } from "@/lib/resolveToken";

export async function GET(request: NextRequest) {
  const token = resolveToken(request);
  if (!token) {
    return NextResponse.json(
      { error: "No Moveet API token configured. Set MOVEET_API_TOKEN or add one in Settings." },
      { status: 401 }
    );
  }

  const status = request.nextUrl.searchParams.get("status") || undefined;
  const search = request.nextUrl.searchParams.get("search") || undefined;

  try {
    const { orders, truncated } = await fetchAllOrders({ status, search }, token);
    return NextResponse.json({ orders: orders.map(toMapOrder), truncated });
  } catch (error) {
    if (error instanceof MoveetApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
