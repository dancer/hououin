"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAccount } from "@/components/account";

type Mode = "qr" | "paste";

export const Connect = () => {
  const { open, setOpen, connect, refresh } = useAccount();
  const [mode, setMode] = useState<Mode>("qr");
  const [image, setImage] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const begin = useCallback(async () => {
    setError(null);
    setImage(null);
    stop();

    const res = await fetch("/api/qr", { method: "POST" });
    if (!res.ok) {
      setError("could not reach riot");
      return;
    }
    const body = await res.json();
    setImage(body.image);

    timer.current = setInterval(async () => {
      const check = await fetch("/api/qr");
      if (check.status === 410) {
        stop();
        setError("code expired");
        setImage(null);
        return;
      }
      const outcome = await check.json();
      if (outcome.status === "done") {
        stop();
        setOpen(false);
        await refresh();
      }
      if (outcome.status === "failed") {
        stop();
        setError("riot rejected the scan");
      }
    }, 2000);
  }, [refresh, setOpen, stop]);

  useEffect(() => {
    if (open && mode === "qr") {
      begin();
    }
    return stop;
  }, [begin, mode, open, stop]);

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

      <div className="border-paper/12 relative w-[min(94vw,460px)] border bg-[#111110] p-[clamp(20px,4vw,34px)]">
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

        <p className="text-paper m-0 mt-[10px] text-[clamp(20px,3vw,26px)] leading-[1.12] font-light tracking-[-0.024em]">
          {mode === "qr" ? "Scan with Riot Mobile" : "Paste your Riot cookie"}
        </p>

        {mode === "qr" ? (
          <div className="mt-[20px] grid justify-items-center gap-[16px]">
            <div className="bg-paper grid size-[212px] place-items-center">
              {image ? (
                <Image
                  alt="Riot login code"
                  className="size-full"
                  height={212}
                  src={image}
                  unoptimized
                  width={212}
                />
              ) : (
                <span className="cap text-ink-3">Loading</span>
              )}
            </div>
            <p className="text-paper/40 m-0 max-w-[30ch] text-center text-[12px] leading-[1.6] font-light">
              Open Riot Mobile, tap the QR button, and scan. Your password never
              leaves Riot.
            </p>
          </div>
        ) : (
          <div className="mt-[18px]">
            <textarea
              className="text-paper placeholder:text-paper/20 border-paper/15 focus:border-paper/40 h-[88px] w-full resize-none border bg-transparent p-3 font-mono text-[12px] leading-[1.5] outline-none"
              onChange={(event) => setValue(event.target.value)}
              placeholder="the full cookie header from auth.riotgames.com"
              spellCheck={false}
              value={value}
            />
            <button
              className="cap border-paper/25 text-paper hover:bg-paper hover:text-ink mt-[14px] w-full cursor-pointer border py-[11px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={busy || value.trim().length === 0}
              onClick={submit}
              type="button"
            >
              {busy ? "Checking" : "Connect"}
            </button>
          </div>
        )}

        {error ? (
          <p className="text-accent m-0 mt-[14px] text-center font-mono text-[11px]">
            {error}
          </p>
        ) : null}

        <div className="border-paper/10 mt-[20px] flex items-center justify-between gap-4 border-t pt-[14px]">
          <span className="cap text-paper/25">No password</span>
          <button
            className="cap text-paper/35 hover:text-paper cursor-pointer transition-colors duration-200"
            onClick={() => {
              stop();
              setError(null);
              setMode(mode === "qr" ? "paste" : "qr");
            }}
            type="button"
          >
            {mode === "qr" ? "Paste cookie" : "Use qr code"}
          </button>
        </div>
      </div>
    </div>
  );
};
