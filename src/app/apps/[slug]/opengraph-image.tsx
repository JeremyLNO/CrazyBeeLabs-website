import { ImageResponse } from "next/og";
import { CATALOG } from "@/lib/catalog";
import { getShowcaseApp } from "@/lib/showcase";
import { appGradientCss } from "@/lib/appGradients";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mac = CATALOG.find((a) => a.slug === slug);
  const showcase = getShowcaseApp(slug);
  const name = mac?.name ?? showcase?.name ?? "Crazy Bee Labs";
  const tagline = mac?.tagline ?? showcase?.tagline ?? "";
  const initial = name.trim().charAt(0).toUpperCase();

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
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: appGradientCss(slug),
            color: "#fff",
            fontSize: 60,
            fontWeight: 700,
            marginBottom: 44,
          }}
        >
          {initial}
        </div>
        <div style={{ display: "flex", color: "#fff", fontSize: 64, fontWeight: 700 }}>
          {name}
        </div>
        <div
          style={{
            display: "flex",
            color: "#a5a5b0",
            fontSize: 30,
            marginTop: 16,
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            display: "flex",
            color: "#FFCE4B",
            fontSize: 24,
            fontWeight: 700,
            marginTop: 48,
          }}
        >
          Crazy Bee Labs
        </div>
      </div>
    ),
    { ...size },
  );
}
