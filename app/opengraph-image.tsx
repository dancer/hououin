import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { offers } from "@/lib/offers";

export const alt =
  "hououin. see your valorant store before you launch the game";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

const inline = async (file: string) => {
  const bytes = await readFile(path.join(process.cwd(), "public", file));
  return `data:image/png;base64,${bytes.toString("base64")}`;
};

export default async function Image() {
  const art = await Promise.all(
    offers.map((offer) => inline(offer.image.replace(/^\//u, "")))
  );

  return new ImageResponse(
    <div
      style={{
        background: "#0d0d0c",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: 64,
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#8a8781",
          display: "flex",
          fontSize: 19,
          justifyContent: "space-between",
          letterSpacing: 7,
          textTransform: "uppercase",
        }}
      >
        <span>hououin.com</span>
        <span>daily rotation</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            color: "#eae7e2",
            display: "flex",
            fontSize: 66,
            letterSpacing: -2.2,
            lineHeight: 1.05,
            maxWidth: 820,
          }}
        >
          See your store before you launch the game
        </div>
        <div style={{ color: "#b0aca5", display: "flex", fontSize: 24 }}>
          Scan once with Riot Mobile. No client, no password.
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {offers.map((offer, index) => (
          <div
            key={offer.name}
            style={{
              background: "#161615",
              border: "1px solid #302e2b",
              display: "flex",
              flexDirection: "column",
              height: 178,
              justifyContent: "space-between",
              padding: 16,
              width: 258,
            }}
          >
            <div
              style={{
                color: "#5f5c57",
                display: "flex",
                fontSize: 13,
                justifyContent: "space-between",
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              <span>slot 0{index + 1}</span>
              <span>{offer.tier}</span>
            </div>

            <img
              alt=""
              height={62}
              src={art[index]}
              style={{ objectFit: "contain" }}
              width={226}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ color: "#eae7e2", fontSize: 17 }}>
                {offer.name}
              </span>
              <span style={{ color: offer.colour, fontSize: 14 }}>
                {offer.price} VP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
