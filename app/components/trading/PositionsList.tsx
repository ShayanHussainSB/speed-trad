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
  RefreshCw,
} from "lucide-react";
import { Position } from "@/app/hooks/usePositions";
import { PositionsListSkeleton } from "@/app/components/ui/Skeleton";

type PositionFilter = "all" | "long" | "short";

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
const getPnLTier = (
  pnlPercent: number
): { tier: string; color: string; icon: React.ReactNode; glow: boolean } => {
  if (pnlPercent >= 100)
    return {
      tier: "LEGENDARY",
      color: "#FFD700",
      icon: <Trophy className="w-4 h-4" />,
      glow: true,
    };
  if (pnlPercent >= 50)
    return {
      tier: "EPIC",
      color: "#9945FF",
      icon: <Sparkles className="w-4 h-4" />,
      glow: true,
    };
  if (pnlPercent >= 25)
    return {
      tier: "GREAT",
      color: "#00FFA3",
      icon: <Rocket className="w-4 h-4" />,
      glow: false,
    };
  if (pnlPercent >= 10)
    return {
      tier: "NICE",
      color: "#00F5A0",
      icon: <Zap className="w-4 h-4" />,
      glow: false,
    };
  if (pnlPercent >= 0)
    return {
      tier: "WINNING",
      color: "#00F5A0",
      icon: <TrendingUp className="w-4 h-4" />,
      glow: false,
    };
  if (pnlPercent >= -25)
    return {
      tier: "HOLD",
      color: "#FF6B00",
      icon: <AlertTriangle className="w-4 h-4" />,
      glow: false,
    };
  return {
    tier: "DANGER",
    color: "#FF3B69",
    icon: <Flame className="w-4 h-4" />,
    glow: true,
  };
};

// Format value with compact notation
const formatValue = (value: number, decimals: number = 2): string => {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}K`;
  if (Math.abs(value) >= 1000)
    return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return value.toFixed(decimals);
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
  isLoading?: boolean; // "Fetching your bags from the blockchain..."
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
  maxVisible = 2,
  isLoading = false,
}: PositionsListProps) {
  const [filter, setFilter] = useState<PositionFilter>("all");

  // Filter positions based on selected filter
  const filteredPositions = positions.filter((p) => {
    if (filter === "all") return true;
    return p.direction === filter;
  });

  // Limit visible positions
  const visiblePositions = filteredPositions.slice(0, maxVisible);

  // Loading state - "Fetching your degen portfolio..."
  if (isLoading) {
    return <PositionsListSkeleton count={maxVisible} />;
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full py-6 px-4">
        <div className="flex items-center gap-6">
          {/* Animated Icon Container - Compact */}
          <div className="relative flex-shrink-0">
            {/* Pulsing background */}
            <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 animate-pulse" />
            {/* Spinning dashed border */}
            <div className="absolute -inset-1 w-18 h-18 rounded-xl border border-dashed border-[var(--accent-primary)]/30 animate-spin" style={{ animationDuration: '20s' }} />

            {/* Main icon box */}
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
              <Rocket className="w-7 h-7 text-[var(--accent-primary)] animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            {/* Floating badges */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-long)] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.4)]">
              <Zap className="w-2.5 h-2.5 text-[#050505]" />
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>

          {/* Text Content - Horizontal layout */}
          <div className="flex flex-col">
            <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">
              Ready to Trade?
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-3 max-w-[200px]">
              Connect your wallet to enter the arena, anon.
            </p>

            {/* Stats Pills - Inline */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-long)] animate-pulse" />
                <span className="text-[9px] font-bold text-[var(--color-long)]">1000x</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                <Zap className="w-2.5 h-2.5 text-[var(--accent-primary)]" />
                <span className="text-[9px] font-bold text-[var(--accent-primary)]">Instant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-6 px-4">
        <div className="flex items-center gap-6">
          {/* Animated Icon Container - Compact */}
          <div className="relative flex-shrink-0">
            {/* Pulsing background */}
            <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 animate-pulse" />
            {/* Spinning dashed border */}
            <div className="absolute -inset-1 w-18 h-18 rounded-xl border border-dashed border-[var(--accent-primary)]/30 animate-spin" style={{ animationDuration: '20s' }} />

            {/* Main icon box */}
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
              <Rocket className="w-7 h-7 text-[var(--accent-primary)] animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            {/* Floating badges */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-long)] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.4)]">
              <Zap className="w-2.5 h-2.5 text-[#050505]" />
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>

          {/* Text Content - Horizontal layout */}
          <div className="flex flex-col">
            <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">
              No Positions Yet
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-3 max-w-[200px]">
              Time to ape in, anon. Your first 1000x is waiting.
            </p>

            {/* Stats Pills - Inline */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                <Trophy className="w-2.5 h-2.5 text-[#FFD700]" />
                <span className="text-[9px] font-bold text-[var(--color-long)]">1000x</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                <Flame className="w-2.5 h-2.5 text-[var(--accent-primary)]" />
                <span className="text-[9px] font-bold text-[var(--accent-primary)]">Degen</span>
              </div>
            </div>
          </div>
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
            All ({positions.length})
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
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              totalPnL >= 0
                ? "bg-[var(--color-long)]/10"
                : "bg-[var(--color-short)]/10"
            }`}
          >
            {totalPnL >= 0 ? (
              <TrendingUp className="w-3 h-3 text-[var(--color-long)]" />
            ) : (
              <TrendingDown className="w-3 h-3 text-[var(--color-short)]" />
            )}
            <span
              className={`text-xs font-bold font-mono tabular-nums ${
                totalPnL >= 0
                  ? "text-[var(--color-long)]"
                  : "text-[var(--color-short)]"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}${formatValue(totalPnL)}
            </span>
          </div>

          {/* View All Button */}
          {onViewAll && positions.length > 0 && (
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

      {/* Positions - Grid Layout (1 col mobile, 2 col desktop) */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visiblePositions.map((position) => {
            const isProfit = position.pnl >= 0;
            const isLong = position.direction === "long";
            const pnlTier = getPnLTier(position.pnlPercent);

            // Calculate liquidation distance
            const liqDistance = Math.abs(
              ((position.liquidationPrice - position.currentPrice) /
                position.currentPrice) *
                100
            );
            const isNearLiquidation = liqDistance < 5;

            // Calculate progress to take profit
            const priceMovement = position.currentPrice - position.entryPrice;
            const targetMovement =
              position.takeProfitPrice - position.entryPrice;
            const progressToTP = Math.min(
              Math.max((priceMovement / targetMovement) * 100, 0),
              100
            );

            return (
              <div
                key={position.id}
                className={`relative p-4 rounded-xl border transition-all hover:border-[var(--accent-primary)]/40 overflow-hidden ${
                  isProfit
                    ? "bg-gradient-to-br from-[var(--color-long)]/8 to-[var(--color-long)]/3 border-[var(--color-long)]/25"
                    : "bg-gradient-to-br from-[var(--color-short)]/8 to-[var(--color-short)]/3 border-[var(--color-short)]/25"
                }`}
              >
                {/* Subtle corner glow for high tier positions */}
                {pnlTier.glow && (
                  <div
                    className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
                    style={{ background: pnlTier.color }}
                  />
                )}

                {/* Card Content */}
                <div className="relative flex flex-col gap-2.5">
                  {/* Row 1: Direction + Symbol + Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Direction Badge */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wide shrink-0 ${
                          isLong
                            ? "bg-[var(--color-long)]/20 text-[var(--color-long)] border border-[var(--color-long)]/30"
                            : "bg-[var(--color-short)]/20 text-[var(--color-short)] border border-[var(--color-short)]/30"
                        }`}
                      >
                        {isLong ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {position.leverage}x {isLong ? "LONG" : "SHORT"}
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)] shrink-0">
                        {position.symbol}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {/* Reverse Button */}
                      <div className="relative group/reverse">
                        <button
                          onClick={() => onReversePosition(position)}
                          className={`flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-transparent transition-all duration-200 hover:-translate-y-0.5 ${
                            isLong
                              ? "hover:bg-[var(--color-short)] hover:border-[var(--color-short)] text-[var(--text-tertiary)] hover:text-white hover:shadow-[0_0_12px_rgba(255,59,105,0.4)]"
                              : "hover:bg-[var(--color-long)] hover:border-[var(--color-long)] text-[var(--text-tertiary)] hover:text-[#050505] hover:shadow-[0_0_12px_rgba(0,255,136,0.4)]"
                          }`}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        {/* Custom Tooltip */}
                        <div className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 pointer-events-none group-hover/reverse:opacity-100 group-hover/reverse:pointer-events-auto transition-opacity z-50`}>
                          <div className={`animate-tooltip-pop px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap border backdrop-blur-sm ${
                            isLong
                              ? "bg-[var(--color-short)]/90 border-[var(--color-short)] text-white shadow-[0_0_20px_rgba(255,59,105,0.3)]"
                              : "bg-[var(--color-long)]/90 border-[var(--color-long)] text-[#050505] shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <RefreshCw className="w-3 h-3" />
                              <span>Flip to {isLong ? "SHORT" : "LONG"}</span>
                              {isLong ? (
                                <TrendingDown className="w-3 h-3" />
                              ) : (
                                <TrendingUp className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                          <div className={`absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rotate-45 ${
                            isLong ? "bg-[var(--color-short)]" : "bg-[var(--color-long)]"
                          }`} />
                        </div>
                      </div>

                      {/* Close Button */}
                      <div className="relative group/close">
                        <button
                          onClick={() => onClosePosition(position.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--color-short)] border border-transparent hover:border-[var(--color-short)] text-[var(--text-tertiary)] hover:text-white transition-all duration-200 hover:shadow-[0_0_12px_rgba(255,59,105,0.4)] hover:-translate-y-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 pointer-events-none group-hover/close:opacity-100 group-hover/close:pointer-events-auto transition-opacity z-50">
                          <div className="animate-tooltip-pop px-3 py-2 rounded-xl bg-[var(--color-short)]/90 border border-[var(--color-short)] text-white text-[11px] font-bold whitespace-nowrap backdrop-blur-sm shadow-[0_0_20px_rgba(255,59,105,0.3)]">
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3 h-3" />
                              <span>Close at Market</span>
                            </div>
                          </div>
                          <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--color-short)]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Tier Badge + Time */}
                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black"
                      style={{
                        backgroundColor: `${pnlTier.color}15`,
                        color: pnlTier.color,
                        border: `1px solid ${pnlTier.color}30`,
                      }}
                    >
                      {pnlTier.icon}
                      {pnlTier.tier}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {formatTimeAgo(position.openedAt)}
                    </span>
                  </div>

                  {/* PnL Display - More prominent */}
                  <div className="flex items-end justify-between py-2 border-y border-[var(--border-subtle)]/40">
                    <p
                      className={`text-2xl font-black font-mono tabular-nums leading-none ${
                        isProfit
                          ? "text-[var(--color-long)]"
                          : "text-[var(--color-short)]"
                      }`}
                    >
                      {isProfit ? "+" : ""}
                      {formatValue(position.pnl)}
                      <span className="text-sm ml-0.5 opacity-70">USD</span>
                    </p>
                    <div className={`px-2.5 py-1 rounded-lg ${
                      isProfit
                        ? "bg-[var(--color-long)]/15 border border-[var(--color-long)]/30"
                        : "bg-[var(--color-short)]/15 border border-[var(--color-short)]/30"
                    }`}>
                      <p
                        className={`text-lg font-black font-mono tabular-nums ${
                          isProfit
                            ? "text-[var(--color-long)]"
                            : "text-[var(--color-short)]"
                        }`}
                      >
                        {isProfit ? "+" : ""}
                        {position.pnlPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar - Only when profitable */}
                  {isProfit && (
                    <div>
                      <div className="flex items-center justify-between text-[9px] mb-1">
                        <span className="text-[var(--text-tertiary)] flex items-center gap-1">
                          <Target className="w-2.5 h-2.5 text-[var(--color-long)]" />
                          To TP
                        </span>
                        <span className="text-[var(--color-long)] font-bold tabular-nums">
                          {progressToTP.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-long)] to-[var(--color-long)]/50 transition-all duration-500"
                          style={{ width: `${progressToTP}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Row - 3 columns */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/60">
                      <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">
                        Size
                      </p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${formatValue(position.size)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/60">
                      <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">
                        Entry
                      </p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.entryPrice.toFixed(0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/60">
                      <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">
                        Mark
                      </p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.currentPrice.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Liq & TP Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`px-2.5 py-2 rounded-lg flex items-center justify-between ${
                        isNearLiquidation
                          ? "bg-[var(--color-short)]/15 border border-[var(--color-short)]/40 animate-pulse"
                          : "bg-[var(--bg-secondary)]/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            isNearLiquidation
                              ? "text-[var(--color-short)]"
                              : "text-[var(--text-tertiary)]"
                          }`}
                        />
                        <span
                          className={`text-[9px] font-bold uppercase ${
                            isNearLiquidation
                              ? "text-[var(--color-short)]"
                              : "text-[var(--text-tertiary)]"
                          }`}
                        >
                          Liq
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold font-mono tabular-nums ${
                          isNearLiquidation
                            ? "text-[var(--color-short)]"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        ${position.liquidationPrice.toFixed(0)}
                      </span>
                    </div>
                    <div className="px-2.5 py-2 rounded-lg bg-[var(--color-long)]/10 border border-[var(--color-long)]/20 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[var(--color-long)]" />
                        <span className="text-[9px] font-bold uppercase text-[var(--color-long)]">
                          TP
                        </span>
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
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-10 text-center">
              <div className="relative mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  filter === "long"
                    ? "bg-[var(--color-long)]/10 border border-[var(--color-long)]/20"
                    : "bg-[var(--color-short)]/10 border border-[var(--color-short)]/20"
                }`}>
                  {filter === "long" ? (
                    <TrendingUp className="w-7 h-7 text-[var(--color-long)]" />
                  ) : (
                    <TrendingDown className="w-7 h-7 text-[var(--color-short)]" />
                  )}
                </div>
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
                No {filter === "long" ? "Long" : "Short"} Positions
              </p>
              <p className="text-xs text-[var(--text-tertiary)] max-w-[180px]">
                {filter === "long"
                  ? "Bullish vibes only? Time to long something, anon."
                  : "Bear mode activated? Open a short to profit from dumps."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
