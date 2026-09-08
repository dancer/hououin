"use client";

import { useEffect, useState } from "react";

import { useAccount } from "@/components/account";

const STEPS = [
  "Sign in at account.riotgames.com with Remember me ticked",
  "Open devtools, Network tab, then load auth.riotgames.com",
  "Click the auth.riotgames.com request and find Request Headers",
  "Copy the whole cookie header and paste it below",
];

export const Connect = () => {
  const { open, setOpen, connect } = useAccount();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [setOpen]);

  if (!open) {
    return null;
  }

  const submit = async () => {
    setBusy(true);
    setError(null);
    const failure = await connect(value);
    setBusy(false);
    if (failure) {
      setError(failure);
      return;
    }
    setValue("");
  };

  return (
    <div
      aria-label="Connect your Riot account"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center p-[clamp(16px,4vw,48px)]"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-[#0a0a09]/94 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        type="button"
      />

      <div className="border-paper/12 relative w-[min(94vw,560px)] border bg-[#111110] p-[clamp(20px,4vw,36px)]">
        <div className="flex items-start justify-between gap-6">
          <span className="cap text-paper/35">Connect</span>
          <button
            className="cap text-paper/45 hover:text-paper cursor-pointer transition-colors duration-200"
            onClick={() => setOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>

        <p className="text-paper m-0 mt-[10px] text-[clamp(20px,3vw,27px)] leading-[1.12] font-light tracking-[-0.024em]">
          Paste your Riot cookie
        </p>

        <ol className="text-paper/45 m-0 mt-[18px] grid list-none gap-[7px] p-0 text-[12px] leading-[1.55] font-light">
          {STEPS.map((step, index) => (
            <li className="flex gap-3" key={step}>
              <span className="text-paper/25 font-mono tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <textarea
          className="text-paper placeholder:text-paper/20 border-paper/15 focus:border-paper/40 mt-[18px] h-[92px] w-full resize-none border bg-transparent p-3 font-mono text-[12px] leading-[1.5] outline-none"
          onChange={(event) => setValue(event.target.value)}
          placeholder="ssid=eyJ...   or the full cookie header"
          spellCheck={false}
          value={value}
        />

        <p className="text-paper/30 m-0 mt-[10px] text-[11px] leading-[1.5] font-light">
          This is password equivalent. It is encrypted, kept in an httpOnly
          cookie on this machine, and only ever sent to auth.riotgames.com.
        </p>

        {error ? (
          <p className="text-accent m-0 mt-[10px] font-mono text-[11px]">
            {error}
          </p>
        ) : null}

        <div className="mt-[18px] flex items-center justify-between gap-4">
          <span className="cap text-paper/25">Never shared</span>
          <button
            className="cap border-paper/25 text-paper hover:bg-paper hover:text-ink cursor-pointer border px-[18px] py-[10px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={busy || value.trim().length === 0}
            onClick={submit}
            type="button"
          >
            {busy ? "Checking" : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};
