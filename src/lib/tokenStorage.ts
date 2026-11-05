"use client";

import { TOKEN_HEADER } from "./resolveToken";

const STORAGE_KEY = "moveet_api_token";

interface TokenClaims {
  orgName?: string;
  exp?: number;
}

function decodeClaims(token: string): TokenClaims | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** The logged-in session, or null if there is no token or its `exp` claim has passed. */
export function getSession(): { token: string; orgName: string } | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(STORAGE_KEY);
  if (!token) return null;

  const claims = decodeClaims(token);
  if (claims?.exp && claims.exp * 1000 < Date.now()) {
    clearStoredToken();
    return null;
  }

  return { token, orgName: claims?.orgName ?? "Organisation" };
}

export function getStoredToken(): string {
  return getSession()?.token ?? "";
}

/** Attaches the stored token so /api/orders* routes can forward it upstream; a 401 sends the user back to /login. */
export async function fetchWithToken(input: string, init?: RequestInit) {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set(TOKEN_HEADER, token);

  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    clearStoredToken();
    window.location.replace("/login");
  }
  return res;
}
