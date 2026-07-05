import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0d0d10",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "linear-gradient(135deg, #FFCE4B, #F5A623)",
            marginBottom: 40,
          }}
        />
        <div style={{ display: "flex", color: "#fff", fontSize: 64, fontWeight: 700 }}>
          Crazy Bee Labs
        </div>
        <div style={{ display: "flex", color: "#a5a5b0", fontSize: 32, marginTop: 18 }}>
          Small, sharp Mac and iPhone apps.
        </div>
      </div>
    ),
    { ...size },
  );
}
