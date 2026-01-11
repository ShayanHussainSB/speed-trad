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

// Asset logo mapping - using CoinGecko CDN images
const ASSET_LOGOS: Record<string, string> = {
  SOL: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
  BTC: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
};

// Extract base symbol from trade symbol (e.g., "SOL/USDC" -> "SOL", "BTC" -> "BTC")
function extractBaseSymbol(symbol: string): string {
  // Handle formats like "SOL/USDC", "SOL-USDC", "SOL", etc.
  const base = symbol.split(/[-\/]/)[0].toUpperCase();
  return base;
}

// Get asset logo URL for a given symbol
function getAssetLogo(symbol: string): string {
  const baseSymbol = extractBaseSymbol(symbol);
  return ASSET_LOGOS[baseSymbol] || ASSET_LOGOS.SOL; // Default to SOL if not found
}

// Asset icon component
const AssetIcon = ({ symbol }: { symbol: string }) => {
  const logoUrl = getAssetLogo(symbol);
  return (
    <img
      src={logoUrl}
      alt={extractBaseSymbol(symbol)}
      className="w-4 h-4 flex-shrink-0 rounded-full object-cover"
    />
  );
};

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
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-white/[0.02]">
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Market / Side</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Leverage</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Margin</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Size</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Entry</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Liq Price</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">PnL</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">TP</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
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

              const liqPrice = position.liquidationPrice;
              const takeProfitPrice = position.takeProfitPrice;

              return (
                <tr key={position.id} className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors ${isNearLiquidation ? "bg-[var(--color-short)]/5" : ""}`}>
                  {/* Market / Side */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <AssetIcon symbol={position.symbol} />
                      <span className="text-xs font-bold text-[var(--text-primary)]">{assetSymbol}</span>
                      <span className={`px-1 py-0.5 text-[10px] font-bold rounded ${isLong
                        ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                        : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                        }`}>
                        {isLong ? "Long" : "Short"}
                      </span>
                      {isNearLiquidation && (
                        <Flame className="w-3 h-3 text-[var(--color-short)] animate-pulse" />
                      )}
                    </div>
                  </td>

                  {/* Leverage */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">{position.leverage}x</span>
                  </td>

                  {/* Margin */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">${position.size.toFixed(0)}</span>
                  </td>

                  {/* Position Size (Notional) - Compact */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                      ${(position.notional || position.size * position.leverage).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </td>

                  {/* Entry Price */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                      ${position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Liq Price */}
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-mono font-semibold ${isNearLiquidation ? "text-[var(--color-short)] font-bold" : "text-[var(--text-primary)]"}`}>
                      ${liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* PnL */}
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col">
                      <span className={`text-xs font-mono font-bold leading-tight ${isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                        {isProfit ? "+" : "-"}${Math.abs(position.pnl).toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-mono leading-tight bg-transparent ${isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                        {isProfit ? "+" : ""}{position.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  {/* Take Profit */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-mono font-semibold text-[var(--color-long)]">
                      ${takeProfitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onReversePosition(position)}
                        className="p-1.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)]/50 transition-all"
                        title="Reverse Position"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onClosePosition(position.id)}
                        className="px-2 py-1 rounded-md bg-[var(--color-short)]/10 border border-[var(--color-short)]/30 text-[10px] font-bold text-[var(--color-short)] hover:bg-[var(--color-short)] hover:text-white transition-all uppercase tracking-wide"
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
