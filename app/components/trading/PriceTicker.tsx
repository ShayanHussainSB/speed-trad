"use client";

import { useEffect, useState } from "react";

interface CoinPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: React.ReactNode;
  color: string;
}

const MOCK_PRICES: CoinPrice[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2956.77,
    change24h: 3.44,
    color: "#627EEA",
    icon: (
      <div className="w-5 h-5 rounded-full bg-[#627EEA] flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">E</span>
      </div>
    ),
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 87960.1,
    change24h: 0.98,
    color: "#F7931A",
    icon: (
      <div className="w-5 h-5 rounded-full bg-[#F7931A] flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">B</span>
      </div>
    ),
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 125.987,
    change24h: 1.77,
    color: "#9945FF",
    icon: (
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">S</span>
      </div>
    ),
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 1.8731,
    change24h: -0.15,
    color: "#23292F",
    icon: (
      <div className="w-5 h-5 rounded-full bg-[#23292F] flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">X</span>
      </div>
    ),
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.12872,
    change24h: 2.12,
    color: "#C2A633",
    icon: (
      <div className="w-5 h-5 rounded-full bg-[#C2A633] flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">D</span>
      </div>
    ),
  },
];

interface PriceTickerProps {
  selectedSymbol?: string;
  onSelectCoin?: (symbol: string) => void;
}

export function PriceTicker({ selectedSymbol = "SOL", onSelectCoin }: PriceTickerProps) {
  const [prices, setPrices] = useState(MOCK_PRICES);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((coin) => ({
          ...coin,
          price: coin.price * (1 + (Math.random() - 0.5) * 0.001),
          change24h: coin.change24h + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(5)}`;
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
        {prices.map((coin) => {
          const isSelected = coin.symbol === selectedSymbol;
          const isPositive = coin.change24h >= 0;

          return (
            <button
              key={coin.symbol}
              onClick={() => onSelectCoin?.(coin.symbol)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all
                ${isSelected
                  ? "bg-[var(--bg-elevated)] border border-[var(--border-default)]"
                  : "hover:bg-[var(--bg-secondary)]"
                }
              `}
            >
              {coin.icon}
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {coin.symbol}
              </span>
              <span className={`text-sm font-medium ${isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
              </span>
              <span className="text-sm font-mono text-[var(--text-secondary)]">
                {formatPrice(coin.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PriceTicker;
