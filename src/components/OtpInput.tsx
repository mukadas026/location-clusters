"use client";

import { useRef } from "react";

const LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function focus(index: number) {
    refs.current[Math.max(0, Math.min(index, LENGTH - 1))]?.focus();
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }
    onChange((value.slice(0, index) + digits + value.slice(index + digits.length)).slice(0, LENGTH));
    focus(index + digits.length);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      onChange(value.slice(0, index - 1));
      focus(index - 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!digits) return;
    e.preventDefault();
    onChange(digits);
    focus(digits.length);
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length: LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          autoFocus={i === 0}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="h-12 w-11 rounded-md border border-zinc-300 bg-white text-center text-lg font-semibold text-zinc-900 focus:border-zinc-500 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      ))}
    </div>
  );
}
