import type { NextRequest } from "next/server";

export const TOKEN_HEADER = "x-moveet-token";

/** Client-supplied token (from the settings modal's localStorage copy) wins; falls back to the server env default. */
export function resolveToken(request: NextRequest): string | null {
  return request.headers.get(TOKEN_HEADER) || process.env.MOVEET_API_TOKEN || null;
}
