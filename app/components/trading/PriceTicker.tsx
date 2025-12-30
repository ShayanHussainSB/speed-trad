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

// Only tokens supported by Bulk.trade API (SOL, BTC, ETH)
const SUPPORTED_COINS: CoinPrice[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2956.77,
    change24h: 3.44,
    color: "#627EEA",
    icon: (
      <img
        src="https://assets.coingecko.com/coins/images/279/standard/ethereum.png"
        alt="ETH"
        className="w-5 h-5 rounded-full object-cover"
      />
    ),
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 87960.1,
    change24h: 0.98,
    color: "#F7931A",
    icon: (
      <img
        src="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png"
        alt="BTC"
        className="w-5 h-5 rounded-full object-cover"
      />
    ),
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 125.987,
    change24h: 1.77,
    color: "#9945FF",
    icon: (
      <img
        src="https://assets.coingecko.com/coins/images/4128/standard/solana.png"
        alt="SOL"
        className="w-5 h-5 rounded-full object-cover"
      />
    ),
  },
];

interface PriceTickerProps {
  selectedSymbol?: string;
  onSelectCoin?: (symbol: string) => void;
}

export function PriceTicker({ selectedSymbol = "SOL", onSelectCoin }: PriceTickerProps) {
  const [prices, setPrices] = useState(SUPPORTED_COINS);

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
    <div className="fixed top-14 left-0 right-0 z-40 glass-dark">
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
      
      <div className="flex items-center justify-center gap-8 h-11 px-6 overflow-x-auto scrollbar-hide relative">
        {prices.map((coin) => {
          const isSelected = coin.symbol === selectedSymbol;
          const isPositive = coin.change24h >= 0;

          return (
            <button
              key={coin.symbol}
              onClick={() => onSelectCoin?.(coin.symbol)}
              className={`
                group flex items-center gap-3 py-1.5 px-2 relative transition-all duration-300 rounded-lg
                ${isSelected 
                  ? "opacity-100 bg-white/[0.03]" 
                  : "opacity-50 hover:opacity-90 hover:bg-white/[0.02]"
                }
              `}
            >
              <div className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                isSelected 
                  ? "border-[var(--sunset-orange)]/60 shadow-lg shadow-orange-500/20" 
                  : "border-white/10 group-hover:border-[var(--sunset-orange)]/30"
              }`}>
                {coin.icon}
              </div>
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-sm font-bold text-white tracking-wide uppercase"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  {coin.symbol}
                </span>
                <span className="text-sm font-bold font-mono text-white tabular-nums">
                  {formatPrice(coin.price)}
                </span>
                <span 
                  className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                    isPositive 
                      ? "bg-[var(--color-long)]/15 text-[var(--color-long)]" 
                      : "bg-[var(--color-short)]/15 text-[var(--color-short)]"
                  }`}
                  style={{ 
                    boxShadow: isPositive 
                      ? '0 0 10px rgba(255, 190, 11, 0.15)' 
                      : '0 0 10px rgba(255, 0, 110, 0.15)'
                  }}
                >
                  {isPositive ? "+" : ""}{coin.change24h.toFixed(1)}%
                </span>
              </div>

              {isSelected && (
                <div 
                  className="absolute -bottom-[1px] left-2 right-2 h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--warm-yellow), var(--sunset-orange), var(--hot-pink))',
                    boxShadow: '0 0 12px rgba(255, 107, 53, 0.6)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PriceTicker;
