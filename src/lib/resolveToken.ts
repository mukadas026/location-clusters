import type { NextRequest } from "next/server";

export const TOKEN_HEADER = "x-moveet-token";

export function resolveToken(request: NextRequest): string | null {
  return request.headers.get(TOKEN_HEADER) || null;
}
