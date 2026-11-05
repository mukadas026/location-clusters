"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OtpInput } from "@/components/OtpInput";
import { getStoredToken, setStoredToken } from "@/lib/tokenStorage";

const RESEND_COOLDOWN_SECONDS = 30;

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (getStoredToken()) router.replace("/");
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timeout);
  }, [cooldown]);

  async function requestCode() {
    setError("");
    setLoading(true);
    try {
      await postJson("/api/auth/otp/request", { phone });
      setStep("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verify(code: string) {
    setError("");
    setLoading(true);
    try {
      const { token } = await postJson("/api/auth/otp/verify", { phone, otp: code });
      setStoredToken(token);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setOtp("");
      setLoading(false);
    }
  }

  function handleOtpChange(value: string) {
    setOtp(value);
    if (value.length === 6) verify(value);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Moveet — Delivery Order Map</h1>

        {step === "phone" ? (
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              requestCode();
            }}
          >
            <label className="text-sm text-zinc-600 dark:text-zinc-400" htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              autoFocus
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="0241234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="mt-4 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Sending..." : "Send code"}
            </button>
          </form>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Enter the 6-digit code sent to {phone}.</p>
            <div className="mt-3">
              <OtpInput value={otp} onChange={handleOtpChange} disabled={loading} />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
              >
                Change number
              </button>
              <button
                className="text-zinc-600 underline hover:text-zinc-900 disabled:no-underline disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
                disabled={cooldown > 0 || loading}
                onClick={requestCode}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
