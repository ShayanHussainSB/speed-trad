import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/app/providers/WalletProvider";
import { MarketDataProvider } from "@/app/contexts/MarketDataContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speed Trad | Gamified Solana Trading",
  description: "The fastest way to trade SOL. Perpetuals & Spot trading with a gamified experience.",
  keywords: ["solana", "trading", "perpetuals", "spot", "crypto", "defi"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <MarketDataProvider>
            {children}
          </MarketDataProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
