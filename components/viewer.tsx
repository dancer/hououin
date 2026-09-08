"use client";

import Image from "next/image";
import { useState } from "react";
import type { PointerEvent } from "react";

import { Trap } from "@/components/trap";
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
  const [pick, setPick] = useState(0);
  const [spot, setSpot] = useState(REST);
  const [ratio, setRatio] = useState(512 / 200);

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setSpot({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
  };

  const source = offer.variants[pick]?.image ?? offer.image;
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
        className="bg-paper/92 absolute inset-0 cursor-default backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <Trap
        className="border-rule-2 bg-paper-2 relative max-h-[92vh] w-[min(94vw,600px)] overflow-hidden border p-[clamp(18px,3.4vw,32px)] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9)]"
        onClose={onClose}
      >
        <div onPointerLeave={() => setSpot(REST)} onPointerMove={follow}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(62% 70% at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.06) 0%, transparent 70%)`,
            }}
          />

          <div className="relative flex items-start justify-between gap-6">
            <span className="cap text-ink-3">
              {offer.weapon} · {offer.tier}
            </span>
            <button
              className="cap text-ink-2 hover:text-ink cursor-pointer transition-colors duration-200"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>

          <p className="text-ink relative m-0 mt-[10px] text-[clamp(21px,3.4vw,30px)] leading-[1.1] font-light tracking-[-0.024em]">
            {offer.name}
          </p>

          <div
            className="relative mx-auto mt-[clamp(16px,2.6vw,26px)] w-full max-w-[512px]"
            style={{
              transform: `perspective(1600px) rotateX(${lean.x}deg) rotateY(${lean.y}deg)`,
              transition: "transform 500ms ease-out",
            }}
          >
            <div
              className="relative max-h-[34vh] w-full"
              style={{ aspectRatio: ratio }}
            >
              <Image
                alt={offer.name}
                className="object-contain drop-shadow-[0_26px_38px_rgba(0,0,0,0.85)]"
                fill
                onLoad={(event) => {
                  const node = event.currentTarget;
                  if (node.naturalHeight > 0) {
                    setRatio(node.naturalWidth / node.naturalHeight);
                  }
                }}
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
              className="relative mt-[-4%] max-h-[9vh] w-full scale-y-[-1] opacity-[0.12] blur-[2px]"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to top, transparent 14%, black 96%)",
                aspectRatio: ratio,
                maskImage:
                  "linear-gradient(to top, transparent 14%, black 96%)",
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

          <div className="border-rule relative mt-[clamp(14px,2.2vw,22px)] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-[clamp(12px,2vw,18px)]">
            {offer.variants.length > 1 ? (
              <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {offer.variants.map((variant, index) => (
                  <button
                    aria-pressed={index === pick}
                    className={`cap cursor-pointer transition-colors duration-200 ${
                      index === pick
                        ? "text-ink"
                        : "text-ink-3 hover:text-ink-2"
                    }`}
                    key={variant.image}
                    onClick={() => setPick(index)}
                    type="button"
                  >
                    {variant.name}
                  </button>
                ))}
              </span>
            ) : (
              <span className="cap text-ink-3">Move to light</span>
            )}

            <span className="text-ink-2 font-mono text-[13px] font-light tabular-nums">
              {offer.price} VP
            </span>
          </div>
        </div>
      </Trap>
    </div>
  );
};
