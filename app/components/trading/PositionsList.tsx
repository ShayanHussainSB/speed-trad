"use client";

import {
  AlertTriangle,
  Zap,
  Trophy,
  Rocket,
  Flame,
} from "lucide-react";
import { Position } from "@/app/hooks/usePositions";
import { PositionsListSkeleton } from "@/app/components/ui/Skeleton";

// Solana icon
const SolanaIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="solGradientPos" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FFA3" />
        <stop offset="50%" stopColor="#03E1FF" />
        <stop offset="100%" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#solGradientPos)" />
    <path d="M7.5 14.5L10.5 11.5H16.5L13.5 14.5H7.5Z" fill="white" />
    <path d="M7.5 9.5L10.5 6.5H16.5L13.5 9.5H7.5Z" fill="white" />
    <path d="M16.5 12L13.5 15H7.5L10.5 12H16.5Z" fill="white" opacity="0.7" />
  </svg>
);

interface PositionsListProps {
  isConnected: boolean;
  positions: Position[];
  totalPnL: number;
  longCount: number;
  shortCount: number;
  onViewAll?: () => void;
  onClosePosition: (positionId: string) => void;
  onReversePosition: (position: Position) => void;
  maxVisible?: number;
  isLoading?: boolean;
}

export function PositionsList({
  isConnected,
  positions,
  totalPnL,
  longCount,
  shortCount,
  onViewAll,
  onClosePosition,
  onReversePosition,
  maxVisible = 5,
  isLoading = false,
}: PositionsListProps) {
  const visiblePositions = positions.slice(0, maxVisible);

  if (isLoading) {
    return <PositionsListSkeleton count={maxVisible} />;
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full py-6 px-4">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 animate-pulse" />
            <div className="absolute -inset-1 w-18 h-18 rounded-xl border border-dashed border-[var(--accent-primary)]/30 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
              <Rocket className="w-7 h-7 text-[var(--accent-primary)] animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-long)] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.4)]">
              <Zap className="w-2.5 h-2.5 text-[#050505]" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">Ready to Trade?</h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-3 max-w-[200px]">Connect your wallet to enter the arena.</p>
          </div>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-6 px-4">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 animate-pulse" />
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
              <Rocket className="w-7 h-7 text-[var(--accent-primary)] animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-long)] flex items-center justify-center">
              <Trophy className="w-2.5 h-2.5 text-[#050505]" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">No Positions Yet</h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-3 max-w-[200px]">Time to ape in, anon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Market / Side</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Leverage</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Margin</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Position Size</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Entry Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Mark Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Liq Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">PnL</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Take Profit</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {visiblePositions.map((position) => {
              const isLong = position.direction === "long";
              const isProfit = position.pnl >= 0;
              const health = position.health ?? 1;
              const isNearLiquidation = position.isNearLiquidation ?? health < 0.4;

              // Calculate position size in asset units
              const assetSymbol = position.symbol.split('-')[0] || position.symbol.split('/')[0] || position.symbol;
              const notionalUSD = position.notional || position.size * position.leverage;
              const positionSizeAsset = notionalUSD / position.entryPrice;

              // Estimate liquidation price (70% loss)
              const liqPrice = isLong
                ? position.entryPrice * (1 - 0.70 / position.leverage)
                : position.entryPrice * (1 + 0.70 / position.leverage);

              // Estimate take profit (100% gain for demo)
              const takeProfitPrice = isLong
                ? position.entryPrice * (1 + 1.0 / position.leverage)
                : position.entryPrice * (1 - 1.0 / position.leverage);

              return (
                <tr key={position.id} className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors ${isNearLiquidation ? "bg-[var(--color-short)]/5" : ""}`}>
                  {/* Market / Side */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <SolanaIcon />
                      <span className="text-sm font-bold text-[var(--text-primary)]">{assetSymbol}/USDC</span>
                      <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${isLong
                          ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                          : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                        }`}>
                        {isLong ? "Long" : "Short"}
                      </span>
                      {isNearLiquidation && (
                        <Flame className="w-3.5 h-3.5 text-[var(--color-short)] animate-pulse" />
                      )}
                    </div>
                  </td>

                  {/* Leverage */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-bold text-[var(--accent-primary)]">{position.leverage}x</span>
                  </td>

                  {/* Margin */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">${position.size.toFixed(0)}</span>
                  </td>

                  {/* Position Size (Notional) */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                      ${(position.notional || position.size * position.leverage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-[var(--text-muted)] font-medium"> ({positionSizeAsset.toFixed(2)} {assetSymbol})</span>
                    </span>
                  </td>

                  {/* Entry Price */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                      ${position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                  </td>

                  {/* Mark Price */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                      ${position.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                  </td>

                  {/* Liq Price */}
                  <td className="px-4 py-3">
                    <span className={`text-sm font-mono font-semibold ${isNearLiquidation ? "text-[var(--color-short)] font-bold" : "text-[var(--text-primary)]"}`}>
                      ${liqPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                  </td>

                  {/* PnL */}
                  <td className="px-4 py-3">
                    <span className={`text-sm font-mono font-bold ${isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                      {isProfit ? "+" : "-"}${Math.abs(position.pnl).toFixed(2)}
                      <span className="font-semibold"> ({isProfit ? "+" : ""}{position.pnlPercent.toFixed(2)}%)</span>
                    </span>
                  </td>

                  {/* Take Profit */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-[var(--color-long)]">
                      ${takeProfitPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onReversePosition(position)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)]/50 transition-all"
                      >
                        Reverse
                      </button>
                      <button
                        onClick={() => onClosePosition(position.id)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--color-short)]/10 border border-[var(--color-short)]/30 text-xs font-bold text-[var(--color-short)] hover:bg-[var(--color-short)] hover:text-white transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View All Button */}
      {onViewAll && positions.length > maxVisible && (
        <div className="px-4 py-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={onViewAll}
            className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            View all {positions.length} positions
          </button>
        </div>
      )}
    </div>
  );
}
