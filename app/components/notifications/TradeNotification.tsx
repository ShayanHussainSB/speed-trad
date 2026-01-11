"use client";

import { memo, useEffect, useState } from "react";
import { X, Trophy, TrendingUp, TrendingDown, Zap, Skull, AppWindow } from "lucide-react";
import { TradeNotification as NotificationType, useNotifications } from "@/app/contexts/NotificationContext";

interface TradeNotificationProps {
  notification: NotificationType;
}

// Asset logo mapping - using CoinGecko CDN images (matching Modal)
const ASSET_LOGOS: Record<string, string> = {
  SOL: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
  BTC: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
};

function extractBaseSymbol(symbol: string): string {
  return symbol.split(/[-\/]/)[0].toUpperCase();
}

// Format time from ISO string to HH:MM:SS
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Format price with $ and appropriate decimals
function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(3)}`;
}

function TradeNotificationComponent({ notification }: TradeNotificationProps) {
  const { removeNotification } = useNotifications();
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle exit animation
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  const isOpened = notification.type === "position_opened";
  const isClosed = notification.type === "position_closed";
  const isLiquidated = notification.type === "liquidated";
  const isAutoClosedTP = notification.type === "auto_closed_tp";
  const isWin = (isClosed || isAutoClosedTP) && (notification.pnl ?? 0) > 0;
  const isLong = notification.direction === "long";

  const assetSymbol = extractBaseSymbol(notification.symbol);
  const assetLogo = ASSET_LOGOS[assetSymbol] || ASSET_LOGOS.SOL;

  // Determine theme colors and icon based on state
  const getTheme = () => {
    if (isOpened) return {
      color: "var(--color-long)",
      bg: "bg-[var(--color-long)]",
      icon: <Zap className="w-5 h-5 text-black" />,
      label: "POSITION ENTRY",
    };
    if (isWin) return {
      color: "var(--warm-yellow)",
      bg: "bg-[var(--warm-yellow)]",
      icon: <Trophy className="w-5 h-5 text-black" />,
      label: "VICTORY",
    };
    if (isLiquidated) return {
      color: "var(--color-short)",
      bg: "bg-[var(--color-short)]",
      icon: <Skull className="w-5 h-5 text-white" />,
      label: "LIQUIDATED",
    };
    return { // Loss
      color: "var(--color-short)",
      bg: "bg-[var(--color-short)]",
      icon: <TrendingDown className="w-5 h-5 text-white" />,
      label: "TRADE CLOSED",
    };
  };

  const theme = getTheme();

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl w-[340px]
        backdrop-blur-xl bg-[#050010] 
        border border-[var(--border-subtle)]
        transition-all duration-300 ease-out transform group
        ${isVisible && !isExiting ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}
        hover:scale-[1.02]
      `}
      style={{
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
      }}
    >
      {/* Dynamic left border/glow bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg}`} />

      {/* Background radial glow */}
      <div
        className={`absolute -left-10 -top-10 w-40 h-40 blur-[60px] opacity-20 pointer-events-none rounded-full ${theme.bg}`}
      />

      {/* Grid texture overlay if available, otherwise just noise */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Content Container */}
      <div className="relative p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-lg 
              ${theme.bg} shadow-lg shadow-black/40
            `}>
              {theme.icon}
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest uppercase text-[var(--text-tertiary)] font-display">
                {theme.label}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Fallback to simple circle if image fails or generic handling */}
                <img src={assetLogo} alt={assetSymbol} className="w-3 h-3 rounded-full object-cover" />
                <span className="text-sm font-bold text-white leading-none">
                  {assetSymbol}-USDC
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Stats Row */}
        <div className="flex items-end justify-between bg-white/5 rounded-lg p-3 border border-white/5 relative overflow-hidden">
          {/* Status Badge watermark */}
          <div className="absolute top-0 right-0 p-1.5 opacity-5 pointer-events-none">
            {isLong ? <TrendingUp className="w-12 h-12" /> : <TrendingDown className="w-12 h-12" />}
          </div>

          <div>
            <div className="text-[10px] grid grid-cols-[auto_1fr] gap-1.5 font-bold tracking-wider text-[var(--text-tertiary)] uppercase mb-1">
              <span className={isLong ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}>
                {isLong ? "LONG" : "SHORT"}
              </span>
            </div>

            {/* Show PnL for closed trades, Entry for open */}
            {isOpened ? (
              <div className="text-xl font-black font-mono text-white tracking-tight">
                {formatPrice(notification.entryPrice ?? 0)}
              </div>
            ) : (
              <div className={`text-xl font-black font-mono tracking-tight ${isWin ? "text-[var(--warm-yellow)] drop-shadow-[0_0_5px_rgba(255,190,11,0.5)]" : "text-[var(--color-short)]"
                }`}>
                {isWin ? "+" : ""}${Math.abs(notification.pnl ?? 0).toFixed(2)}
              </div>
            )}
          </div>

          {/* Secondary Stat (Time or %) */}
          <div className="text-right z-10">
            {isOpened ? (
              <>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold mb-0.5">Time</div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  {formatTime(notification.timestamp)}
                </div>
              </>
            ) : (
              <>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold mb-0.5">Return</div>
                <div className={`text-sm font-black font-mono ${isWin ? "text-[var(--warm-yellow)]" : "text-[var(--color-short)]"
                  }`}>
                  {isWin ? "+" : ""}{notification.pnlPercent?.toFixed(2)}%
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className={`h-full ${theme.bg} shadow-[0_0_10px_currentColor]`}
          style={{
            animation: "shrinkWidth 4.5s linear forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export const TradeNotification = memo(TradeNotificationComponent);
export default TradeNotification;
