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
    <div className="flex flex-col h-full bg-black/40">
      {/* Search & Filter Strip - Sharp & Minimal */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-1">
          {["all", "long", "short"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as PositionFilter)}
              className={`
                px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all
                ${filter === f
                  ? f === 'long' ? "text-[var(--color-long)] bg-[var(--color-long)]/10" :
                    f === 'short' ? "text-[var(--color-short)] bg-[var(--color-short)]/10" :
                      "text-white bg-white/10"
                  : "text-white/30 hover:text-white"
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">PNL</span>
            <span className={`text-[13px] font-black font-mono tracking-tighter ${totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString()}
            </span>
          </div>
          {onViewAll && positions.length > 0 && (
            <button onClick={onViewAll} className="text-white/20 hover:text-white transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Modular Table Layout */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left">
              <th className="px-6 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">Market</th>
              <th className="px-6 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 text-right">Size</th>
              <th className="px-6 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 text-right hidden md:table-cell">Entry</th>
              <th className="px-6 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 text-right hidden md:table-cell">Mark</th>
              <th className="px-6 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 text-right">Unrealized PNL</th>
              <th className="px-6 py-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {visiblePositions.map((position) => {
              const isLong = position.direction === "long";
              const isProfit = position.pnl >= 0;

              return (
                <tr key={position.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${isLong ? "bg-[var(--color-long)]" : "bg-[var(--color-short)]"}`} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-black text-white uppercase tracking-wider">{position.symbol}</span>
                          <span className={`text-[10px] font-black px-1 rounded-sm ${isLong ? "text-[var(--color-long)] border border-[var(--color-long)]/30" : "text-[var(--color-short)] border border-[var(--color-short)]/30"}`}>
                            {position.leverage}X
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">{formatTimeAgo(position.openedAt)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black font-mono text-white tracking-tighter">${position.size.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-white/40 mt-1 uppercase">{(position.size / position.entryPrice).toFixed(3)} {position.symbol.split('/')[0]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right hidden md:table-cell">
                    <span className="text-[12px] font-black font-mono text-white/40 tracking-tighter">${position.entryPrice.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right hidden md:table-cell">
                    <span className="text-[12px] font-black font-mono text-white/40 tracking-tighter">${position.currentPrice.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`text-[13px] font-black font-mono tracking-tighter ${isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                          {isProfit ? "+" : ""}${Math.abs(position.pnl).toLocaleString()}
                        </span>
                        {isProfit ? <TrendingUp className="w-3 h-3 text-[var(--color-long)]" /> : <TrendingDown className="w-3 h-3 text-[var(--color-short)]" />}
                      </div>
                      <span className={`text-[11px] font-black font-mono mt-1 ${isProfit ? "text-[var(--color-long)]/70" : "text-[var(--color-short)]/70"}`}>
                        {isProfit ? "+" : ""}{position.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onReversePosition(position)}
                        className="p-2 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="Reverse"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onClosePosition(position.id)}
                        className="px-3 py-1.5 rounded bg-[var(--color-short)]/10 border border-[var(--color-short)]/20 text-[10px] font-black text-[var(--color-short)] hover:bg-[var(--color-short)] hover:text-white transition-all uppercase tracking-widest"
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

        {visiblePositions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Rocket className="w-10 h-10 text-[var(--text-tertiary)] mb-4" />
            <p className="text-sm font-bold text-[var(--text-secondary)]">No active positions</p>
            <p className="text-xs text-[var(--text-tertiary)]">Ape into the arena to start trading.</p>
          </div>
        )}
      </div>
    </div>
  );
}
