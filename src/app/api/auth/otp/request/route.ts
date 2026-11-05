import { NextRequest, NextResponse } from "next/server";
import { MoveetApiError, requestOtp } from "@/lib/moveetApi";

export async function POST(request: NextRequest) {
  const { phone } = await request.json().catch(() => ({}));
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Enter your phone number" }, { status: 400 });
  }

  try {
    await requestOtp(phone.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof MoveetApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
