"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";

import { render } from "@/lib/offers";
import type { Offer } from "@/lib/offers";

const TILT = 7;
const REST = { x: 50, y: 38 };

export const Viewer = ({
  offer,
  onClose,
}: {
  offer: Offer;
  onClose: () => void;
}) => {
  const [variant, setVariant] = useState(offer.variants[0]);
  const [spot, setSpot] = useState(REST);
  const [zoom, setZoom] = useState(1);

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

  const scale = (event: WheelEvent<HTMLDivElement>) =>
    setZoom((current) =>
      Math.min(2.4, Math.max(0.7, current - event.deltaY * 0.0014))
    );

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
      className="fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)_auto] bg-[#0a0a09]"
      role="dialog"
    >
      <header className="px-edge pt-edge flex items-start justify-between gap-6">
        <span className="block">
          <span className="cap text-paper/35 mb-[10px] block">
            {offer.weapon} · {offer.tier}
          </span>
          <span className="text-paper block text-[clamp(22px,3vw,38px)] leading-[1.05] font-light tracking-[-0.024em]">
            {offer.name}
          </span>
        </span>
        <button
          className="cap text-paper/45 hover:text-paper cursor-pointer transition-colors duration-200"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </header>

      <div
        className="relative grid touch-none place-items-center overflow-hidden"
        onPointerLeave={() => setSpot(REST)}
        onPointerMove={follow}
        onWheel={scale}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(56% 64% at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 38%, transparent 72%)`,
          }}
        />

        <div
          className="relative transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1800px) rotateX(${lean.x}deg) rotateY(${lean.y}deg) scale(${zoom})`,
          }}
        >
          <div
            className="relative w-[min(74vw,860px)]"
            style={{ aspectRatio: ratio }}
          >
            <Image
              alt={offer.name}
              className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)]"
              fill
              priority
              sizes="74vw"
              src={source}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                WebkitMaskImage: `url(${source})`,
                WebkitMaskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 26%, transparent 46%)`,
                maskImage: `url(${source})`,
                maskPosition: "center",
                maskRepeat: "no-repeat",
                maskSize: "contain",
              }}
            />
          </div>

          <div
            aria-hidden="true"
            className="relative mt-[-7%] w-[min(74vw,860px)] scale-y-[-1] opacity-[0.13] blur-[2px]"
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
              sizes="74vw"
              src={source}
            />
          </div>
        </div>
      </div>

      <footer className="px-edge pb-edge flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        {offer.variants.length > 1 ? (
          <span className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
          <span className="cap text-paper/25">
            Move to light · scroll to zoom
          </span>
        )}

        <span className="text-paper/55 font-mono text-[13px] font-light tabular-nums">
          {offer.price} VP
        </span>
      </footer>
    </div>
  );
};
