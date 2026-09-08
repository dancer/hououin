"use client";

import { useEffect, useState } from "react";

import { useAccount } from "@/components/account";
import { Code } from "@/components/code";
import { Trap } from "@/components/trap";

type Mode = "qr" | "paste";

export const Connect = () => {
  const { open, setOpen, connect, refresh } = useAccount();
  const [mode, setMode] = useState<Mode>("qr");
  const [code, setCode] = useState<{ cells: number[]; size: number } | null>(
    null
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!(open && mode === "qr")) {
      return;
    }

    let alive = true;
    let handle: ReturnType<typeof setTimeout> | undefined;
    setError(null);
    setCode(null);

    const poll = async () => {
      try {
        const check = await fetch("/api/qr");
        if (!alive) {
          return;
        }
        if (check.status === 410) {
          setError("code expired");
          setCode(null);
          return;
        }
        const outcome = await check.json();
        if (!alive) {
          return;
        }
        if (outcome.status === "done") {
          setOpen(false);
          await refresh();
          return;
        }
        if (outcome.status === "failed") {
          setError("riot rejected the scan");
          return;
        }
        handle = setTimeout(poll, 2000);
      } catch {
        if (alive) {
          setError("lost the connection to riot");
        }
      }
    };

    const begin = async () => {
      try {
        const res = await fetch("/api/qr", { method: "POST" });
        if (!alive) {
          return;
        }
        if (!res.ok) {
          setError("could not reach riot");
          return;
        }
        const body = await res.json();
        if (!alive) {
          return;
        }
        setCode({ cells: body.cells, size: body.size });
        handle = setTimeout(poll, 2000);
      } catch {
        if (alive) {
          setError("lost the connection to riot");
        }
      }
    };

    begin();
    return () => {
      alive = false;
      if (handle) {
        clearTimeout(handle);
      }
    };
  }, [mode, open, refresh, setOpen]);

  if (!open) {
    return null;
  }

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const failure = await connect(value);
      if (failure) {
        setError(failure);
        return;
      }
      setValue("");
    } catch {
      setError("could not reach the server");
    } finally {
      setBusy(false);
    }
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
        className="bg-paper/92 absolute inset-0 cursor-default backdrop-blur-sm"
        onClick={() => setOpen(false)}
        type="button"
      />

      <Trap
        className="border-rule-2 bg-paper-2 relative w-[min(94vw,470px)] border p-[clamp(20px,4vw,34px)]"
        onClose={() => setOpen(false)}
      >
        <div className="flex items-start justify-between gap-6">
          <span className="cap text-ink-3">Connect</span>
          <button
            className="cap text-ink-2 hover:text-ink cursor-pointer transition-colors duration-200"
            onClick={() => setOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>

        <p className="text-ink m-0 mt-[10px] text-[clamp(20px,3vw,26px)] leading-[1.12] font-light tracking-[-0.024em]">
          {mode === "qr" ? "Scan with Riot Mobile" : "Paste your Riot cookie"}
        </p>

        {mode === "qr" ? (
          <div className="mt-[20px] grid justify-items-center gap-[16px]">
            <div
              className="border-rule relative size-[248px] border transition-colors duration-500"
              style={{ background: code ? "#eae7e2" : "transparent" }}
            >
              <div
                className="size-full transition-opacity duration-500"
                style={{ opacity: code ? 1 : 0 }}
              >
                {code ? <Code cells={code.cells} size={code.size} /> : null}
              </div>
              {code ? null : (
                <div className="absolute inset-[14%] grid animate-pulse grid-cols-3 grid-rows-3 gap-[12%]">
                  <span className="border-ink-3/25 border-[3px]" />
                  <span />
                  <span className="border-ink-3/25 border-[3px]" />
                  <span />
                  <span />
                  <span />
                  <span className="border-ink-3/25 border-[3px]" />
                </div>
              )}
            </div>
            <p className="text-ink-2 m-0 max-w-[32ch] text-center text-[12px] leading-[1.6] font-light">
              Open Riot Mobile, tap the QR button, and scan. Your password never
              reaches this app.
            </p>
          </div>
        ) : (
          <div className="mt-[18px]">
            <label className="cap text-ink-3 mb-[10px] block" htmlFor="cookie">
              Cookie header
            </label>
            <textarea
              className="text-ink placeholder:text-ink-3 border-rule-2 focus:border-ink-2 h-[88px] w-full resize-none border bg-transparent p-3 font-mono text-[12px] leading-[1.5] outline-none"
              id="cookie"
              onChange={(event) => setValue(event.target.value)}
              placeholder="from auth.riotgames.com"
              spellCheck={false}
              value={value}
            />
            <button
              className="cap border-rule-2 text-ink hover:bg-ink hover:text-paper mt-[14px] w-full cursor-pointer border py-[11px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={busy || value.trim().length === 0}
              onClick={submit}
              type="button"
            >
              {busy ? "Checking" : "Connect"}
            </button>
          </div>
        )}

        {error ? (
          <p
            className="text-accent m-0 mt-[14px] text-center font-mono text-[11px]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="border-rule mt-[20px] flex items-center justify-between gap-4 border-t pt-[14px]">
          <span className="cap text-ink-3">No password</span>
          <button
            className="cap text-ink-2 hover:text-ink cursor-pointer transition-colors duration-200"
            onClick={() => {
              setError(null);
              setMode(mode === "qr" ? "paste" : "qr");
            }}
            type="button"
          >
            {mode === "qr" ? "Paste cookie" : "Use qr code"}
          </button>
        </div>
      </Trap>
    </div>
  );
};
