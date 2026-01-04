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
        group flex items-center gap-3 h-full px-5 relative transition-all duration-300
        ${isSelected
          ? "bg-white/[0.04]"
          : "hover:bg-white/[0.02]"
        }
      `}
    >
      {/* Symbol Block */}
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-full overflow-hidden flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform">
          {coin.icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-white" : "text-white/40"}`}>
          {coin.symbol}/USD
        </span>
      </div>

      <div className="w-[1px] h-3 bg-white/[0.08]" />

      {/* Stats Group */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold font-mono tabular-nums ${isSelected ? "text-white" : "text-white/60"}`}>
          {formatPrice(priceData.price)}
        </span>
        {priceData.priceChangePercent24h !== 0 && (
          <span className={`text-[9px] font-black tabular-nums scale-[0.9] origin-left ${isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
            {isPositive ? "" : ""}{priceData.priceChangePercent24h.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Loading indicator */}
      {priceData.isLoading && priceData.price === 0 && (
        <span className="text-[10px] text-white/20 animate-pulse">...</span>
      )}

      {/* App-Unified Selection Indicator */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-primary)]" />
      )}
    </button>
  );
}

export function PriceTicker({ selectedSymbol = "SOL", onSelectCoin }: PriceTickerProps) {
  return (
    <div className="flex items-stretch h-9">
      {COIN_DISPLAYS.map((coin, idx) => (
        <div key={coin.symbol} className="flex items-center">
          {idx > 0 && <div className="w-[1px] h-3 bg-white/[0.08]" />}
          <CoinButton
            coin={coin}
            isSelected={coin.symbol === selectedSymbol}
            onSelect={() => onSelectCoin?.(coin.symbol)}
          />
        </div>
      ))}
    </div>
  );
}

export default PriceTicker;
