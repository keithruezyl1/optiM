import type { Metadata } from "next";
import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
  IBM_Plex_Mono,
  Newsreader,
} from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getStaffData, getContractData } from "@/lib/reportData";
import { staffStats, contractStats } from "@/lib/status";

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

// Web fallback that closely resembles Apple's New York. On Apple devices the
// CSS `ui-serif` / "New York" stack is preferred; elsewhere (e.g. the Windows
// Loom machine) this loads instead. Used for H1/H2 and the big stat numerals.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false, // Newsreader lacks override metrics in next/font
});

export const metadata: Metadata = {
  title: "OptiM — Operations Dashboard",
  description:
    "Staffing compliance, contract deadlines, and weekly reporting for JVM Solutions — one screen, one click.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Live counts for the sidebar's nested status items. Computed from the same
  // source of truth as the pages, so the nav badges always reconcile.
  const [staff, contracts] = await Promise.all([getStaffData(), getContractData()]);
  const sStats = staffStats(staff);
  const cStats = contractStats(contracts);

  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexCondensed.variable} ${plexMono.variable} ${newsreader.variable}`}
    >
      <body className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen">
          {/* Sidebar reads useSearchParams; Suspense keeps the static not-found
              page from de-opting at build time. */}
          <Suspense fallback={<div className="w-16 shrink-0 bg-navy-900" />}>
            <Sidebar staffStats={sStats} contractStats={cStats} />
          </Suspense>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
