import { ImageResponse } from "next/og";

export const alt =
  "hououin. see your valorant store before you launch the game";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#0d0d0c",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#8a8781",
          display: "flex",
          fontSize: 20,
          justifyContent: "space-between",
          letterSpacing: 7,
          textTransform: "uppercase",
        }}
      >
        <span>hououin.com</span>
        <span>daily rotation</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            color: "#eae7e2",
            display: "flex",
            fontSize: 78,
            letterSpacing: -2.5,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          See your store before you launch the game
        </div>
        <div style={{ color: "#b0aca5", display: "flex", fontSize: 26 }}>
          Scan once with Riot Mobile. No client, no password.
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {[0, 1, 2, 3].map((slot) => (
          <div
            key={slot}
            style={{
              background: "#161615",
              border: "1px solid #302e2b",
              display: "flex",
              height: 96,
              width: 258,
            }}
          />
        ))}
      </div>
    </div>,
    size
  );
}
