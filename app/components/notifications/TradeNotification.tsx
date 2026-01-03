"use client";

import { memo, useEffect, useState } from "react";
import { X } from "lucide-react";
import { TradeNotification as NotificationType, useNotifications } from "@/app/contexts/NotificationContext";
import { AvatarIcon } from "@/app/components/avatars/AvatarIcon";

interface TradeNotificationProps {
  notification: NotificationType;
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

// Format PnL with sign and color
function formatPnL(pnl: number, pnlPercent: number): { text: string; isPositive: boolean } {
  const sign = pnl >= 0 ? "+" : "";
  const percentSign = pnlPercent >= 0 ? "+" : "";
  return {
    text: `${sign}$${Math.abs(pnl).toFixed(2)} (${percentSign}${pnlPercent.toFixed(2)}%)`,
    isPositive: pnl >= 0,
  };
}

function TradeNotificationComponent({ notification }: TradeNotificationProps) {
  const { removeNotification } = useNotifications();
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    // Small delay for smoother entrance
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
  const isWin = isClosed && (notification.pnl ?? 0) > 0;
  const isLoss = (isClosed || isLiquidated) && (notification.pnl ?? 0) <= 0;
  const isLong = notification.direction === "long";

  // Determine border glow color
  const getBorderColor = () => {
    if (isOpened) return isLong ? "var(--color-long)" : "var(--color-short)";
    if (isWin) return "var(--color-long)";
    return "var(--color-short)";
  };

  const borderColor = getBorderColor();

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        backdrop-blur-xl bg-[rgba(10,0,20,0.95)]
        border-2 transition-all duration-300 ease-out
        ${isVisible && !isExiting ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}
      `}
      style={{
        borderColor: borderColor,
        boxShadow: `
          0 0 20px ${borderColor}40,
          0 0 40px ${borderColor}20,
          0 8px 32px rgba(0, 0, 0, 0.5)
        `,
        width: "320px",
      }}
    >
      {/* Glow effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(ellipse at top left, ${borderColor}40, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative p-4 flex items-start gap-4">
        {/* Avatar - Show for wins or liquidations */}
        {(isWin || isLiquidated) && (
          <div
            className={`
              flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden
              flex items-center justify-center
              ${isWin ? "bg-[var(--color-long)]/10" : "bg-[var(--color-short)]/10"}
            `}
            style={{
              boxShadow: isWin
                ? "0 0 20px rgba(255, 190, 11, 0.3)"
                : "0 0 20px rgba(255, 0, 110, 0.3)",
            }}
          >
            <AvatarIcon
              avatarId={notification.avatarId || (isWin ? "rocket" : "skull")}
              size={56}
            />
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-display font-bold tracking-wide text-white uppercase">
              {isOpened ? "Position Opened" : isLiquidated ? "Liquidated" : "Position Closed"}
            </span>
            {isOpened && (
              <span
                className={`
                  px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                  ${isLong ? "bg-[var(--color-long)] text-black" : "bg-[var(--color-short)] text-white"}
                `}
              >
                {isLong ? "Long" : "Short"}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1">
            {/* Position Opened: Show entry price and time */}
            {isOpened && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">Open Price</span>
                  <span className="text-sm font-mono font-semibold text-white">
                    {formatPrice(notification.entryPrice ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">Time Executed</span>
                  <span className="text-sm font-mono font-semibold text-[var(--text-secondary)]">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
              </>
            )}

            {/* Position Closed: Show PnL and close price */}
            {(isClosed || isLiquidated) && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">PNL</span>
                  {(() => {
                    const { text, isPositive } = formatPnL(
                      notification.pnl ?? 0,
                      notification.pnlPercent ?? 0
                    );
                    return (
                      <span
                        className={`text-sm font-mono font-bold ${
                          isPositive ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                        }`}
                      >
                        {text}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">Close Price</span>
                  <span className="text-sm font-mono font-semibold text-white">
                    {formatPrice(notification.closePrice ?? 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="h-0.5 bg-white/10 overflow-hidden">
        <div
          className="h-full transition-all ease-linear"
          style={{
            backgroundColor: borderColor,
            animation: "shrinkWidth 4.5s linear forwards",
          }}
        />
      </div>

      {/* CSS for progress animation */}
      <style jsx>{`
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export const TradeNotification = memo(TradeNotificationComponent);
export default TradeNotification;

