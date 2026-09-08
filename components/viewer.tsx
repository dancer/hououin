"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PointerEvent } from "react";

import { render } from "@/lib/offers";
import type { Offer } from "@/lib/offers";

const TILT = 6;
const REST = { x: 50, y: 40 };

export const Viewer = ({
  offer,
  onClose,
}: {
  offer: Offer;
  onClose: () => void;
}) => {
  const [variant, setVariant] = useState(offer.variants[0]);
  const [spot, setSpot] = useState(REST);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setSpot({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
  };

  const source = render(offer.slug, variant);
  const ratio = `${offer.width} / ${offer.height}`;
  const lean = {
    x: ((REST.y - spot.y) / 50) * TILT,
    y: ((spot.x - REST.x) / 50) * TILT,
  };

  return (
    <div
      aria-label={`Inspect ${offer.name}`}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center p-[clamp(16px,4vw,48px)]"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-[#0a0a09]/94 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <div
        className="border-paper/12 relative w-[min(94vw,600px)] border bg-[#111110] p-[clamp(20px,4vw,38px)] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9)]"
        onPointerLeave={() => setSpot(REST)}
        onPointerMove={follow}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(62% 70% at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.07) 0%, transparent 70%)`,
          }}
        />

        <div className="relative flex items-start justify-between gap-6">
          <span className="cap text-paper/35">
            {offer.weapon} · {offer.tier}
          </span>
          <button
            className="cap text-paper/45 hover:text-paper cursor-pointer transition-colors duration-200"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <p className="text-paper relative m-0 mt-[10px] text-[clamp(21px,3.4vw,30px)] leading-[1.1] font-light tracking-[-0.024em]">
          {offer.name}
        </p>

        <div
          className="relative mx-auto mt-[clamp(18px,3vw,30px)] w-full max-w-[512px] transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1600px) rotateX(${lean.x}deg) rotateY(${lean.y}deg)`,
          }}
        >
          <div className="relative w-full" style={{ aspectRatio: ratio }}>
            <Image
              alt={offer.name}
              className="object-contain drop-shadow-[0_26px_38px_rgba(0,0,0,0.85)]"
              fill
              priority
              sizes="512px"
              src={source}
              unoptimized
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                WebkitMaskImage: `url(${source})`,
                WebkitMaskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.08) 26%, transparent 46%)`,
                maskImage: `url(${source})`,
                maskPosition: "center",
                maskRepeat: "no-repeat",
                maskSize: "contain",
              }}
            />
          </div>

          <div
            aria-hidden="true"
            className="relative mt-[-7%] w-full scale-y-[-1] opacity-[0.13] blur-[2px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to top, transparent 14%, black 96%)",
              aspectRatio: ratio,
              maskImage: "linear-gradient(to top, transparent 14%, black 96%)",
            }}
          >
            <Image
              alt=""
              className="object-contain"
              fill
              sizes="512px"
              src={source}
              unoptimized
            />
          </div>
        </div>

        <div className="border-paper/10 relative mt-[clamp(16px,2.6vw,26px)] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-[clamp(14px,2.2vw,20px)]">
          {offer.variants.length > 1 ? (
            <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {offer.variants.map((name) => (
                <button
                  aria-pressed={name === variant}
                  className={`cap cursor-pointer transition-colors duration-200 ${
                    name === variant
                      ? "text-paper"
                      : "text-paper/30 hover:text-paper/60"
                  }`}
                  key={name}
                  onClick={() => setVariant(name)}
                  type="button"
                >
                  {name}
                </button>
              ))}
            </span>
          ) : (
            <span className="cap text-paper/25">Move to light</span>
          )}

          <span className="text-paper/55 font-mono text-[13px] font-light tabular-nums">
            {offer.price} VP
          </span>
        </div>
      </div>
    </div>
  );
};
