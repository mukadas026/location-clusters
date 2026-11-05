import { NextRequest, NextResponse } from "next/server";
import { fetchOrderById, MoveetApiError } from "@/lib/moveetApi";
import { resolveToken } from "@/lib/resolveToken";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = resolveToken(request);
  if (!token) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const order = await fetchOrderById(id, token);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof MoveetApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
