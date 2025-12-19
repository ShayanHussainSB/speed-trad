"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  X,
  Flame,
  Target,
  AlertTriangle,
  Zap,
  Trophy,
  Rocket,
  BarChart3,
  Sparkles,
  Maximize2,
} from "lucide-react";

type PositionFilter = "all" | "long" | "short";

interface Position {
  id: string;
  symbol: string;
  direction: "long" | "short";
  size: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  takeProfitPrice: number;
  openedAt: Date;
}

// Mock positions data with extended info
const mockPositions: Position[] = [
  {
    id: "1",
    symbol: "SOL/USD",
    direction: "long",
    size: 50,
    entryPrice: 195.20,
    currentPrice: 198.42,
    leverage: 10,
    pnl: 16.10,
    pnlPercent: 16.5,
    liquidationPrice: 177.42,
    takeProfitPrice: 215.00,
    openedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
  },
  {
    id: "2",
    symbol: "SOL/USD",
    direction: "short",
    size: 25,
    entryPrice: 200.50,
    currentPrice: 198.42,
    leverage: 20,
    pnl: 5.20,
    pnlPercent: 10.4,
    liquidationPrice: 210.53,
    takeProfitPrice: 180.00,
    openedAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
];

// Format time ago
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Get PnL tier for gamification
const getPnLTier = (pnlPercent: number): { tier: string; color: string; icon: React.ReactNode; glow: boolean } => {
  if (pnlPercent >= 100) return { tier: "LEGENDARY", color: "#FFD700", icon: <Trophy className="w-4 h-4" />, glow: true };
  if (pnlPercent >= 50) return { tier: "EPIC", color: "#9945FF", icon: <Sparkles className="w-4 h-4" />, glow: true };
  if (pnlPercent >= 25) return { tier: "GREAT", color: "#00FFA3", icon: <Rocket className="w-4 h-4" />, glow: false };
  if (pnlPercent >= 10) return { tier: "NICE", color: "#00F5A0", icon: <Zap className="w-4 h-4" />, glow: false };
  if (pnlPercent >= 0) return { tier: "WINNING", color: "#00F5A0", icon: <TrendingUp className="w-4 h-4" />, glow: false };
  if (pnlPercent >= -25) return { tier: "HOLD", color: "#FF6B00", icon: <AlertTriangle className="w-4 h-4" />, glow: false };
  return { tier: "DANGER", color: "#FF3B69", icon: <Flame className="w-4 h-4" />, glow: true };
};

// Format value with compact notation
const formatValue = (value: number, decimals: number = 2): string => {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}K`;
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return value.toFixed(decimals);
};

interface PositionsListProps {
  isConnected: boolean;
  onViewAll?: () => void;
  maxVisible?: number;
}

export function PositionsList({ isConnected, onViewAll, maxVisible = 2 }: PositionsListProps) {
  const [filter, setFilter] = useState<PositionFilter>("all");

  // Filter positions based on selected filter
  const filteredPositions = mockPositions.filter((p) => {
    if (filter === "all") return true;
    return p.direction === filter;
  });

  // Limit visible positions
  const visiblePositions = filteredPositions.slice(0, maxVisible);
  // hasMore could be used for "show more" button in future
  void (filteredPositions.length > maxVisible);

  // Calculate stats
  const totalPnL = mockPositions.reduce((sum, p) => sum + p.pnl, 0);
  const longCount = mockPositions.filter((p) => p.direction === "long").length;
  const shortCount = mockPositions.filter((p) => p.direction === "short").length;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 flex items-center justify-center mb-4 border border-[var(--accent-primary)]/30">
            <Rocket className="w-10 h-10 text-[var(--accent-primary)]" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent-primary)] flex items-center justify-center">
            <Zap className="w-3 h-3 text-[var(--accent-primary)]" />
          </div>
        </div>
        <p className="text-lg font-bold text-[var(--text-primary)] mb-1">Ready to Trade?</p>
        <p className="text-sm text-[var(--text-tertiary)] mb-4">Connect your wallet to enter the arena</p>
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-long)] animate-pulse" />
            <span>1000x Leverage</span>
          </div>
          <span>•</span>
          <span>Instant Execution</span>
        </div>
      </div>
    );
  }

  if (mockPositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
            <BarChart3 className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] animate-pulse" />
        </div>
        <p className="text-lg font-bold text-[var(--text-primary)] mb-1">No Active Positions</p>
        <p className="text-sm text-[var(--text-tertiary)] mb-4">Open your first trade and start earning</p>
        <div className="px-4 py-2 rounded-xl bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
          <p className="text-xs font-medium text-[var(--color-long)]">
            💡 Pro tip: Start small, scale up as you win
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs & Stats Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-card)]">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-secondary)]">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              filter === "all"
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            All ({mockPositions.length})
          </button>
          <button
            onClick={() => setFilter("long")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              filter === "long"
                ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--color-long)]"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            Long ({longCount})
          </button>
          <button
            onClick={() => setFilter("short")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              filter === "short"
                ? "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--color-short)]"
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            Short ({shortCount})
          </button>
        </div>

        {/* Total PnL Badge - Moved to right */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
            totalPnL >= 0
              ? "bg-[var(--color-long)]/10"
              : "bg-[var(--color-short)]/10"
          }`}>
            {totalPnL >= 0 ? (
              <TrendingUp className="w-3 h-3 text-[var(--color-long)]" />
            ) : (
              <TrendingDown className="w-3 h-3 text-[var(--color-short)]" />
            )}
            <span className={`text-xs font-bold font-mono tabular-nums ${
              totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
            }`}>
              {totalPnL >= 0 ? "+" : ""}${formatValue(totalPnL)}
            </span>
          </div>

          {/* View All Button */}
          {onViewAll && mockPositions.length > 0 && (
            <button
              onClick={onViewAll}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-muted)] transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              View All
            </button>
          )}
        </div>
      </div>

      {/* Positions - Grid Layout */}
      <div className="flex-1 overflow-hidden px-3 py-2">
        <div className="grid grid-cols-2 gap-4 h-full">
          {visiblePositions.map((position) => {
            const isProfit = position.pnl >= 0;
            const isLong = position.direction === "long";
            const pnlTier = getPnLTier(position.pnlPercent);

            // Calculate liquidation distance
            const liqDistance = Math.abs((position.liquidationPrice - position.currentPrice) / position.currentPrice * 100);
            const isNearLiquidation = liqDistance < 5;

            // Calculate progress to take profit
            const priceMovement = position.currentPrice - position.entryPrice;
            const targetMovement = position.takeProfitPrice - position.entryPrice;
            const progressToTP = Math.min(Math.max((priceMovement / targetMovement) * 100, 0), 100);

            return (
              <div
                key={position.id}
                className={`relative p-4 rounded-xl border transition-all hover:border-[var(--accent-primary)]/30 overflow-hidden ${
                  isProfit
                    ? "bg-[var(--color-long)]/5 border-[var(--color-long)]/20"
                    : "bg-[var(--color-short)]/5 border-[var(--color-short)]/20"
                }`}
              >
                {/* Glow effect for legendary/epic/danger positions */}
                {pnlTier.glow && (
                  <div
                    className="absolute inset-0 opacity-10 animate-pulse pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${pnlTier.color}20, transparent)` }}
                  />
                )}

                {/* Card Content */}
                <div className="relative flex flex-col gap-2">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {/* Direction Badge */}
                      <div className={`
                        flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold shrink-0
                        ${isLong
                          ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                          : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                        }
                      `}>
                        {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {position.leverage}x
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)] shrink-0">{position.symbol}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Tier Badge */}
                      <span
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0"
                        style={{ backgroundColor: `${pnlTier.color}20`, color: pnlTier.color }}
                      >
                        {pnlTier.icon}
                        {pnlTier.tier}
                      </span>
                      {/* Close button */}
                      <button className="p-1 rounded-md hover:bg-[var(--color-short)]/10 text-[var(--text-tertiary)] hover:text-[var(--color-short)] transition-colors shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* PnL Display */}
                  <div className="flex items-center justify-between">
                    <p className={`text-xl font-bold font-mono tabular-nums ${
                      isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                    }`}>
                      {isProfit ? "+" : ""}{formatValue(position.pnl)} USD
                    </p>
                    <p className={`text-lg font-bold font-mono tabular-nums ${
                      isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                    }`}>
                      {isProfit ? "+" : ""}{position.pnlPercent.toFixed(1)}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {isProfit && (
                    <div>
                      <div className="flex items-center justify-between text-[9px] mb-1">
                        <span className="text-[var(--text-tertiary)]">To TP</span>
                        <span className="text-[var(--color-long)] font-bold tabular-nums">{progressToTP.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-long)] to-[var(--color-long)]/50"
                          style={{ width: `${progressToTP}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/50">
                      <p className="text-[9px] text-[var(--text-tertiary)] mb-0.5">SIZE</p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        {formatValue(position.size)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/50">
                      <p className="text-[9px] text-[var(--text-tertiary)] mb-0.5">ENTRY</p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.entryPrice.toFixed(0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/50">
                      <p className="text-[9px] text-[var(--text-tertiary)] mb-0.5">MARK</p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.currentPrice.toFixed(0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/50">
                      <p className="text-[9px] text-[var(--text-tertiary)] mb-0.5">TIME</p>
                      <p className="text-xs font-bold text-[var(--text-tertiary)]">
                        {formatTimeAgo(position.openedAt).replace(" ago", "")}
                      </p>
                    </div>
                  </div>

                  {/* Liq & TP Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                      isNearLiquidation
                        ? "bg-[var(--color-short)]/20 animate-pulse"
                        : "bg-[var(--bg-secondary)]/50"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-tertiary)]"}`} />
                        <span className={`text-[10px] font-medium ${isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-tertiary)]"}`}>LIQ</span>
                      </div>
                      <span className={`text-xs font-bold font-mono tabular-nums ${isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-primary)]"}`}>
                        ${position.liquidationPrice.toFixed(0)}
                      </span>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-[var(--color-long)]/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[var(--color-long)]" />
                        <span className="text-[10px] font-medium text-[var(--color-long)]">TP</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-[var(--color-long)] tabular-nums">
                        ${position.takeProfitPrice.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state for filtered results */}
          {visiblePositions.length === 0 && (
            <div className="col-span-2 flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-[var(--text-tertiary)]">
                  No {filter === "all" ? "" : filter} positions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
