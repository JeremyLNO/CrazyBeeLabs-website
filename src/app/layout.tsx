import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Providers } from "@/components/site/Providers";
import { AmbientBackground } from "@/components/site/AmbientBackground";
import { PageViewTracker } from "@/components/site/PageViewTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.crazybeelabs.com"),
  title: { default: "Crazy Bee Labs", template: "%s — Crazy Bee Labs" },
  description:
    "Account, licenses and downloads for Crazy Bee Labs macOS apps.",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>
        <Providers>
          <PageViewTracker />
          <AmbientBackground />
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
