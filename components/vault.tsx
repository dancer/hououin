"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { useAccount } from "@/components/account";
import type { Offer } from "@/lib/offers";

const COLS = 5;
const CELL = 320;
const HEAD = 46;
const SHOT = 150;
const PAD = 48;
const TOP = 150;
const SHELL = Array.from({ length: 15 }, (_, index) => `shell-${index}`);

type State =
  | { status: "loading" }
  | { status: "off" }
  | { status: "on"; handle: string; skins: Offer[] };

const load = async (src: string) => {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return null;
    }
    return await createImageBitmap(await res.blob());
  } catch {
    return null;
  }
};

export const Vault = () => {
  const { setOpen, state: account } = useAccount();
  const [state, setState] = useState<State>({ status: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const pull = async () => {
      try {
        const res = await fetch("/api/collection");
        if (!res.ok) {
          setState({ status: "off" });
          return;
        }
        const body = await res.json();
        setState({ handle: body.handle, skins: body.skins, status: "on" });
      } catch {
        setState({ status: "off" });
      }
    };
    pull();
  }, [account.status]);

  const download = useCallback(async () => {
    if (state.status !== "on") {
      return;
    }
    setBusy(true);
    await document.fonts.ready;

    const { skins, handle } = state;
    const rows = Math.ceil(skins.length / COLS);
    const canvas = document.createElement("canvas");
    canvas.width = COLS * CELL + PAD * 2;
    canvas.height = TOP + rows * (HEAD + SHOT) + PAD;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }

    const face = getComputedStyle(document.body).fontFamily;
    const mono = "ui-monospace, monospace";

    ctx.fillStyle = "#0a0a09";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#eeedeb";
    ctx.font = `500 30px ${face}`;
    ctx.fillText("hououin.com", PAD, 74);

    ctx.fillStyle = "#6a6965";
    ctx.font = `400 17px ${face}`;
    ctx.letterSpacing = "5px";
    ctx.fillText(
      `${handle.toUpperCase()}   ${skins.length} SKINS`.trim(),
      PAD,
      110
    );
    ctx.letterSpacing = "0px";

    ctx.strokeStyle = "#2a2a27";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, 128.5);
    ctx.lineTo(canvas.width - PAD, 128.5);
    ctx.stroke();

    const images = await Promise.all(skins.map((skin) => load(skin.image)));

    for (const [index, skin] of skins.entries()) {
      const x = PAD + (index % COLS) * CELL;
      const y = TOP + Math.floor(index / COLS) * (HEAD + SHOT);

      ctx.fillStyle = "#eeedeb";
      ctx.font = `300 17px ${face}`;
      const name =
        skin.name.length > 26 ? `${skin.name.slice(0, 25)}…` : skin.name;
      ctx.fillText(name, x, y + 4);

      ctx.fillStyle = skin.price > 0 ? skin.colour : "#6a6965";
      ctx.font = `300 14px ${mono}`;
      ctx.fillText(skin.price > 0 ? `${skin.price} VP` : "not sold", x, y + 26);

      const art = images[index];
      if (art) {
        const box = { h: SHOT - 30, w: CELL - 30 };
        const scale = Math.min(box.w / art.width, box.h / art.height, 1);
        const w = art.width * scale;
        const h = art.height * scale;
        ctx.drawImage(art, x, y + 40 + (box.h - h) / 2, w, h);
      }
    }

    canvas.toBlob((blob) => {
      setBusy(false);
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "collection.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-[clamp(20px,3vh,32px)]">
        <div className="border-rule flex items-center justify-between border-b pb-[14px]">
          <span className="cap text-ink-3">Reading your locker</span>
        </div>
        <div className="grid grid-cols-2 gap-x-[clamp(14px,2vw,28px)] gap-y-[clamp(20px,2.6vw,34px)] sm:grid-cols-3 lg:grid-cols-5">
          {SHELL.map((key) => (
            <div key={key}>
              <span className="bg-rule block h-[12px] w-[70%]" />
              <span className="bg-rule/60 mt-[8px] block h-[9px] w-[34%]" />
              <span className="bg-rule/35 mt-[12px] block h-[74px] w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "off") {
    return (
      <div className="grid justify-items-center gap-5 py-20">
        <p className="text-ink-2 m-0 text-[14px] font-light">
          Connect your account to see your collection.
        </p>
        <button
          className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[18px] py-[10px] transition-colors duration-300 hover:border-transparent"
          onClick={() => setOpen(true)}
          type="button"
        >
          Connect your account
        </button>
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 gap-[clamp(20px,3vh,32px)]">
      <div className="border-rule flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b pb-[14px]">
        <span className="cap text-ink-3">
          {state.handle} · {state.skins.length} skins
        </span>
        <button
          className="cap border-rule-2 hover:bg-ink hover:text-paper cursor-pointer border px-[16px] py-[9px] transition-colors duration-300 hover:border-transparent disabled:opacity-40"
          disabled={busy}
          onClick={download}
          type="button"
        >
          {busy ? "Rendering" : "Download png"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-[clamp(14px,2vw,28px)] gap-y-[clamp(20px,2.6vw,34px)] sm:grid-cols-3 lg:grid-cols-5">
        {state.skins.map((skin) => (
          <div className="min-w-0" key={skin.name}>
            <span className="text-ink block truncate text-[13px] font-light">
              {skin.name}
            </span>
            <span
              className="mt-[3px] block font-mono text-[11px] font-light tabular-nums"
              style={{ color: skin.price > 0 ? skin.colour : undefined }}
            >
              {skin.price > 0 ? `${skin.price} VP` : "not sold"}
            </span>
            <div className="relative mt-[10px] h-[74px] w-full">
              <Image
                alt=""
                aria-hidden="true"
                className="object-contain object-left"
                fill
                sizes="240px"
                src={skin.image}
                unoptimized
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
