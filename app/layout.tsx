import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { TabRail } from "@/components/TabRail";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plex-condensed",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OptiM — Operations Dashboard",
  description:
    "Staffing compliance, contract deadlines, and weekly reporting for JVM Solutions — one screen, one click.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexCondensed.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen bg-slate-100">
        <Header />
        <TabRail />
        {/* Pages render a full-bleed Readiness Strip, then constrain their own
            content; main stays full-width so the strip can span edge to edge. */}
        <main>{children}</main>
      </body>
    </html>
  );
}
