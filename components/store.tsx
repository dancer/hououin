"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";

import { useAccount } from "@/components/account";
import { Viewer } from "@/components/viewer";
import { offers as demo } from "@/lib/offers";
import type { Offer } from "@/lib/offers";

const DAY = 86_400_000;

const pad = (value: number) => String(value).padStart(2, "0");

const BLANK: Offer[] = [0, 1, 2, 3].map((index) => ({
  colour: "#5f5c57",
  image: "",
  name: "",
  price: 0,
  tier: "",
  variants: [],
  weapon: `slot-${index}`,
}));

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
  const { seats, state, setOpen, refresh } = useAccount();
  const [viewing, setViewing] = useState<number | null>(null);
  const [clock, setClock] = useState({ burned: 0, countdown: "--:--:--" });

  const live = state.status === "on" ? state : null;
  const seconds = live?.seconds ?? null;
  const deadline = useMemo(
    () => (seconds === null ? null : Date.now() + seconds * 1000),
    [seconds, live]
  );

  useEffect(() => {
    let asked = false;
    const tick = () => {
      setClock(read(deadline));
      if (deadline && Date.now() >= deadline && !asked) {
        asked = true;
        setTimeout(refresh, 1500);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline, refresh]);

  const stale = state.status === "expired";
  const broke = state.status === "failed";
  const waiting = seats.length > 0 && state.status === "loading";
  let offers = demo;
  if (live) {
    ({ offers } = live);
  } else if (waiting) {
    offers = BLANK;
  }

  const shown = viewing === null ? null : offers[viewing];

  if (broke) {
    return (
      <div className="border-rule grid justify-items-center gap-5 border py-[clamp(40px,8vh,72px)]">
        <p className="text-ink-2 m-0 text-[14px] font-light">
          Could not reach Riot just now.
        </p>
        <button
          className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
          onClick={() => refresh()}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  if (stale) {
    return (
      <div className="border-rule grid justify-items-center gap-5 border py-[clamp(40px,8vh,72px)]">
        <p className="text-ink-2 m-0 text-[14px] font-light">
          That Riot session has run out.
        </p>
        <button
          className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
          onClick={() => setOpen(true)}
          type="button"
        >
          Sign in again
        </button>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-[clamp(16px,2.4vh,26px)]">
      <div className="grid grid-cols-1 gap-[clamp(10px,1.2vw,16px)] sm:grid-cols-2 lg:grid-cols-4">
        {offers.map((offer, index) => (
          <button
            className="slab rise border-rule group hover:border-rule-2 relative flex h-[clamp(190px,26vh,250px)] cursor-pointer flex-col justify-between overflow-hidden border p-[clamp(14px,1.4vw,20px)] text-left transition-colors duration-300 disabled:cursor-default"
            disabled={waiting}
            key={offer.name || offer.weapon}
            onClick={() => setViewing(index)}
            onMouseMove={track}
            style={{ animationDelay: `${index * 90}ms` }}
            type="button"
          >
            <span className="relative flex items-baseline justify-between gap-3">
              <span className="cap text-ink-3">slot {pad(index + 1)}</span>
              <span className="cap text-ink-3">{offer.tier}</span>
            </span>

            {offer.image ? (
              <span className="pointer-events-none absolute inset-x-[6%] top-[26%] bottom-[34%]">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="object-contain drop-shadow-[0_14px_26px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  fill
                  priority={index < 2}
                  sizes="(max-width: 640px) 90vw, 24vw"
                  src={offer.image}
                  unoptimized
                />
              </span>
            ) : null}

            <span className="relative block">
              <span className="text-ink block truncate text-[clamp(14px,1.3vw,17px)] font-light tracking-[-0.012em]">
                {offer.name}
              </span>
              <span
                className="mt-[5px] block font-mono text-[12px] font-light tabular-nums"
                style={{ color: offer.price > 0 ? offer.colour : undefined }}
              >
                {offer.price > 0 ? `${offer.price} VP` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-[clamp(10px,1.6vw,22px)]">
        <span className="bg-accent blink size-[5px] shrink-0" />
        {live ? null : (
          <span className="cap text-ink-3 whitespace-nowrap">Sample</span>
        )}
        <span className="cap text-ink-3 whitespace-nowrap">Resets in</span>
        <span className="text-accent font-mono text-[clamp(13px,1.35vw,16px)] font-light tracking-tight tabular-nums">
          {clock.countdown}
        </span>
        <span className="bg-rule relative h-px flex-1">
          <span
            className="bg-ink-3 absolute inset-y-0 left-0 transition-[width] duration-1000 ease-linear"
            style={{ width: `${clock.burned * 100}%` }}
          />
        </span>
        <span className="cap text-ink-3 hidden whitespace-nowrap sm:inline">
          00:00 utc
        </span>
      </div>

      {shown?.image ? (
        <Viewer offer={shown} onClose={() => setViewing(null)} />
      ) : null}
    </div>
  );
};
