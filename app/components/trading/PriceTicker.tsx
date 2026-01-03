"use client";

import { useLivePrice } from "@/app/hooks/useLivePrice";
import { DEMO_CONFIG } from "@/app/config/demoTrading";

interface CoinDisplay {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

// Supported coins matching DEMO_CONFIG.ASSETS
const COIN_DISPLAYS: CoinDisplay[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    color: "#F7931A",
    icon: (
      <img
        src="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png"
        alt="BTC"
        className="w-4 h-4 rounded-full object-cover"
      />
    ),
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    color: "#627EEA",
    icon: (
      <img
        src="https://assets.coingecko.com/coins/images/279/standard/ethereum.png"
        alt="ETH"
        className="w-4 h-4 rounded-full object-cover"
      />
    ),
  },
  {
    symbol: "SOL",
    name: "Solana",
    color: "#9945FF",
    icon: (
      <img
        src="https://assets.coingecko.com/coins/images/4128/standard/solana.png"
        alt="SOL"
        className="w-4 h-4 rounded-full object-cover"
      />
    ),
  },
];

interface PriceTickerProps {
  selectedSymbol?: string;
  onSelectCoin?: (symbol: string) => void;
}

function CoinButton({ 
  coin, 
  isSelected, 
  onSelect 
}: { 
  coin: CoinDisplay; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  // Use exchange symbol format for price subscription
  const priceData = useLivePrice(`${coin.symbol}-USD`);
  const isPositive = priceData.priceChangePercent24h >= 0;

  const formatPrice = (price: number) => {
    if (price <= 0) return "$--";
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`
        group flex items-center gap-2 py-1.5 px-3 relative transition-all duration-200 rounded-full
        ${isSelected 
          ? "bg-white/[0.08] border border-white/10" 
          : "hover:bg-white/[0.04]"
        }
      `}
    >
      {/* Icon */}
      <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center">
        {coin.icon}
      </div>
      
      {/* Symbol */}
      <span className={`text-sm font-bold tracking-wide ${
        isSelected ? "text-white" : "text-[var(--text-secondary)]"
      }`}>
        {coin.symbol}
      </span>
      
      {/* Price */}
      <span className={`text-sm font-mono font-semibold tabular-nums ${
        isSelected ? "text-white" : "text-[var(--text-secondary)]"
      }`}>
        {formatPrice(priceData.price)}
      </span>
      
      {/* Change % */}
      {priceData.priceChangePercent24h !== 0 && (
        <span className={`text-xs font-bold ${
          isPositive ? "text-emerald-400" : "text-rose-400"
        }`}>
          {isPositive ? "+" : ""}{priceData.priceChangePercent24h.toFixed(1)}%
        </span>
      )}

      {/* Loading indicator */}
      {priceData.isLoading && priceData.price === 0 && (
        <span className="text-xs text-[var(--text-muted)] animate-pulse">...</span>
      )}
    </button>
  );
}

export function PriceTicker({ selectedSymbol = "SOL", onSelectCoin }: PriceTickerProps) {
  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-[#0a0a12]/90 backdrop-blur-md border-b border-white/[0.04]">
      <div className="flex items-center justify-center gap-2 h-10 px-4 overflow-x-auto scrollbar-hide">
        {COIN_DISPLAYS.map((coin) => (
          <CoinButton
            key={coin.symbol}
            coin={coin}
            isSelected={coin.symbol === selectedSymbol}
            onSelect={() => onSelectCoin?.(coin.symbol)}
          />
        ))}
      </div>
    </div>
  );
}

export default PriceTicker;
