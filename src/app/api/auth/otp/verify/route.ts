import { NextRequest, NextResponse } from "next/server";
import { MoveetApiError, verifyOtp } from "@/lib/moveetApi";

export async function POST(request: NextRequest) {
  const { phone, otp } = await request.json().catch(() => ({}));
  if (typeof phone !== "string" || !phone.trim() || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Enter the full 6-digit code" }, { status: 400 });
  }

  try {
    const { tokenType, token } = await verifyOtp(phone.trim(), otp);

    if (!token) {
      return NextResponse.json({ error: "No token received" }, { status: 502 });
    }
    if (tokenType !== "org") {
      return NextResponse.json({ error: "This app is for organisation accounts" }, { status: 403 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    if (error instanceof MoveetApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
