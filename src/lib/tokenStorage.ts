"use client";

import { TOKEN_HEADER } from "./resolveToken";

const STORAGE_KEY = "moveet_api_token";

export function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) || "";
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(STORAGE_KEY, token);
  else window.localStorage.removeItem(STORAGE_KEY);
}

/** Attaches the locally-stored token override, if any, so /api/orders* routes can forward it upstream. */
export function fetchWithToken(input: string, init?: RequestInit) {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set(TOKEN_HEADER, token);
  return fetch(input, { ...init, headers });
}
