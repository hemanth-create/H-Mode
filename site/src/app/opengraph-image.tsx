import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "H-Mode — cut Claude Code's token bill on three axes";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0a08",
          color: "#ece5d8",
          padding: 72,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: "rgba(215,135,0,0.25)",
              color: "#ffa028",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 32,
            }}
          >
            [H-MODE]
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Write less. Ship less.
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, color: "#ffa028", lineHeight: 1.05 }}>
            Mean more.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#8f8574" }}>
          <div>Coding · audit · review · context efficiency</div>
          <div style={{ color: "#d78700" }}>npx github:hemanth-create/H-Mode</div>
        </div>
      </div>
    ),
    size
  );
}
