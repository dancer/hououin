"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";

import type { Offer } from "@/lib/offers";

const LAYERS = 20;
const DEPTH = 2.8;
const TILT = 38;
const SPIN = 0.26;

const stack = Array.from({ length: LAYERS }, (_, index) => index);

export const Viewer = ({
  offer,
  onClose,
}: {
  offer: Offer;
  onClose: () => void;
}) => {
  const [turn, setTurn] = useState({ x: -9, y: -24 });
  const [zoom, setZoom] = useState(1);
  const [idle, setIdle] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  useEffect(() => {
    if (!idle) {
      return;
    }
    let frame = requestAnimationFrame(function spin() {
      setTurn((current) => ({ ...current, y: current.y + SPIN }));
      frame = requestAnimationFrame(spin);
    });
    return () => cancelAnimationFrame(frame);
  }, [idle]);

  const grab = (event: PointerEvent<HTMLDivElement>) => {
    setIdle(false);
    drag.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const swing = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) {
      return;
    }
    const shiftX = event.clientX - drag.current.x;
    const shiftY = event.clientY - drag.current.y;
    drag.current = { x: event.clientX, y: event.clientY };
    setTurn((current) => ({
      x: Math.min(TILT, Math.max(-TILT, current.x - shiftY * 0.35)),
      y: current.y + shiftX * 0.42,
    }));
  };

  const release = () => {
    drag.current = null;
  };

  const scale = (event: WheelEvent<HTMLDivElement>) => {
    setIdle(false);
    setZoom((current) =>
      Math.min(2.6, Math.max(0.6, current - event.deltaY * 0.0014))
    );
  };

  return (
    <div
      aria-label={`${offer.name} in three dimensions`}
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
        className="relative grid cursor-grab touch-none place-items-center overflow-hidden active:cursor-grabbing"
        onPointerCancel={release}
        onPointerDown={grab}
        onPointerMove={swing}
        onPointerUp={release}
        onWheel={scale}
        style={{ perspective: "1500px" }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-[74vmin] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 68%)",
          }}
        />

        <div
          className="relative aspect-[512/230] w-[min(76vw,880px)]"
          style={{
            transform: `rotateX(${turn.x}deg) rotateY(${turn.y}deg) scale(${zoom})`,
            transformStyle: "preserve-3d",
          }}
        >
          {stack.map((layer) => {
            const front = layer === LAYERS - 1;
            return (
              <Image
                alt={front ? offer.name : ""}
                aria-hidden={!front}
                className="object-contain"
                fill
                key={`layer-${layer}`}
                priority={front}
                sizes="76vw"
                src={offer.image}
                style={{
                  filter: front ? "none" : "brightness(0.2)",
                  transform: `translateZ(${(layer - (LAYERS - 1) / 2) * DEPTH}px)`,
                }}
              />
            );
          })}
        </div>
      </div>

      <footer className="px-edge pb-edge flex flex-wrap items-center justify-between gap-4">
        <span className="cap text-paper/30">
          Drag to rotate · scroll to zoom
        </span>
        <span className="text-paper/55 font-mono text-[13px] font-light tabular-nums">
          {offer.price} VP
        </span>
      </footer>
    </div>
  );
};
