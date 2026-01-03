import type { Metadata, Viewport } from "next";
import { Rajdhani, Space_Mono, Inter } from "next/font/google";
import { WalletProvider } from "@/app/providers/WalletProvider";
import { MarketDataProvider } from "@/app/contexts/MarketDataContext";
import { DemoTradingProvider } from "@/app/contexts/DemoTradingContext";
import { NotificationProvider } from "@/app/contexts/NotificationContext";
import "./globals.css";

// Rajdhani - Primary display font (geometric, racing aesthetic)
const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Inter - Body text for readability
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Space Mono - Code and technical displays
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "updn.trade | Race the Market",
  description: "Trade Like You're Racing. The chart moves. You react. Up to 1000x leverage.",
  keywords: ["solana", "trading", "perpetuals", "spot", "crypto", "defi", "speed trading"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3A0CA3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.variable} ${inter.variable} ${spaceMono.variable} antialiased`}
      >
        <WalletProvider>
          <MarketDataProvider>
            <DemoTradingProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </DemoTradingProvider>
          </MarketDataProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
