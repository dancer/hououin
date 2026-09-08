"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";

import { useAccount } from "@/components/account";
import { Viewer } from "@/components/viewer";
import { offers as demo } from "@/lib/offers";

const DAY = 86_400_000;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const pad = (value: number) => String(value).padStart(2, "0");

const read = (deadline: number | null) => {
  const now = Date.now();
  const left = deadline
    ? Math.max(0, deadline - now)
    : DAY - (now - new Date().setUTCHours(0, 0, 0, 0));
  const hours = Math.floor(left / 3_600_000);
  const minutes = Math.floor((left % 3_600_000) / 60_000);
  const seconds = Math.floor((left % 60_000) / 1000);
  return {
    burned: 1 - left / DAY,
    countdown: [hours, minutes, seconds].map(pad).join(":"),
  };
};

const track = (event: MouseEvent<HTMLButtonElement>) => {
  const box = event.currentTarget.getBoundingClientRect();
  const node = event.currentTarget;
  node.style.setProperty(
    "--x",
    `${((event.clientX - box.left) / box.width) * 100}%`
  );
  node.style.setProperty(
    "--y",
    `${((event.clientY - box.top) / box.height) * 100}%`
  );
};

export const Store = () => {
  const { state } = useAccount();
  const [active, setActive] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);
  const [clock, setClock] = useState({ burned: 0, countdown: "--:--:--" });

  const live = state.status === "on" ? state : null;
  const seconds = live?.seconds ?? null;
  const deadline = useMemo(
    () => (seconds === null ? null : Date.now() + seconds * 1000),
    [seconds]
  );

  useEffect(() => {
    const tick = () => setClock(read(deadline));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const offers = live ? live.offers : demo;
  const shown = viewing === null ? null : offers[viewing];

  return (
    <div className="grid w-full gap-[clamp(16px,2.4vh,26px)]">
      <div className="flex h-[clamp(200px,32vh,380px)] gap-[clamp(6px,0.9vw,12px)] sm:h-[clamp(230px,38vh,400px)]">
        {offers.map((offer, index) => {
          const open = index === active;
          return (
            <button
              aria-pressed={open}
              className={`rise relative flex-[1] cursor-pointer overflow-hidden border text-left transition-all duration-[600ms] ${
                open
                  ? "slab border-transparent shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)]"
                  : "border-rule-2 hover:border-ink-3"
              }`}
              key={offer.name}
              onClick={() => (open ? setViewing(index) : setActive(index))}
              onMouseEnter={() => setActive(index)}
              onMouseMove={track}
              style={{
                animationDelay: `${index * 110}ms`,
                flexGrow: open ? 6 : 1,
                transitionTimingFunction: EASE,
              }}
              type="button"
            >
              <span
                className="absolute inset-0 block min-w-[168px] transition-opacity duration-300 sm:min-w-[248px]"
                style={{
                  opacity: open ? 1 : 0,
                  transitionDelay: open ? "180ms" : "0ms",
                }}
              >
                <span className="absolute top-[15%] bottom-[31%] left-1/2 w-[min(88%,512px)] -translate-x-1/2">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.6)]"
                    fill
                    priority={index === 0}
                    sizes="512px"
                    unoptimized
                    src={offer.image}
                  />
                </span>

                <span className="absolute inset-0 flex flex-col justify-between p-[clamp(18px,2.2vw,30px)]">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="cap text-paper/40">
                      slot {pad(index + 1)}
                    </span>
                    <span className="cap text-paper/40">{offer.tier}</span>
                  </span>

                  <span className="flex items-end justify-between gap-4">
                    <span className="block">
                      <span className="cap text-paper/40 mb-[12px] block">
                        {offer.weapon}
                      </span>
                      <span className="text-paper block text-[clamp(24px,3.4vw,42px)] leading-[1.04] font-light tracking-[-0.024em]">
                        {offer.name}
                      </span>
                      <span className="text-paper/60 mt-[14px] block font-mono text-[clamp(12px,1.2vw,15px)] font-light tabular-nums">
                        {offer.price} VP
                      </span>
                    </span>
                    <span className="cap text-paper/35 hidden whitespace-nowrap sm:block">
                      Inspect
                    </span>
                  </span>
                </span>
              </span>

              <span
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                style={{
                  opacity: open ? 0 : 1,
                  transitionDelay: open ? "0ms" : "180ms",
                }}
              >
                <span className="text-ink-3 absolute top-[clamp(14px,2vh,20px)] font-mono text-[11px] font-light tabular-nums">
                  {pad(index + 1)}
                </span>
                <span className="cap text-ink-3 rotate-180 whitespace-nowrap [writing-mode:vertical-rl]">
                  {offer.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-[clamp(10px,1.6vw,22px)]">
        <span className="bg-accent blink size-[5px] shrink-0" />
        <span className="cap text-ink-3 whitespace-nowrap">Resets in</span>
        <span className="text-accent font-mono text-[clamp(13px,1.35vw,16px)] font-light tracking-tight tabular-nums">
          {clock.countdown}
        </span>
        <span className="bg-rule relative h-px flex-1">
          <span
            className="bg-ink absolute inset-y-0 left-0 transition-[width] duration-1000 ease-linear"
            style={{ width: `${clock.burned * 100}%` }}
          />
        </span>
        <span className="cap text-ink-3 hidden whitespace-nowrap sm:inline">
          00:00 utc
        </span>
      </div>

      {shown ? <Viewer offer={shown} onClose={() => setViewing(null)} /> : null}
    </div>
  );
};
