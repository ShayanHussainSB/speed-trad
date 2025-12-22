"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  Trophy,
  Skull,
  Flame,
  Zap,
  Crown,
  Target,
  AlertTriangle,
  Maximize2,
} from "lucide-react";
import { getTransactionUrl } from "@/app/config/network";
import { TradeHistorySkeleton } from "@/app/components/ui/Skeleton";

type TradeFilter = "all" | "wins" | "losses";

interface Trade {
  id: string;
  symbol: string;
  direction: "long" | "short";
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  timestamp: Date;
  txHash?: string;
}

// Mock trade history data
const MOCK_TRADES: Trade[] = [
  {
    id: "1",
    symbol: "SOL/USD",
    direction: "long",
    leverage: 50,
    entryPrice: 195.20,
    exitPrice: 198.42,
    size: 100,
    pnl: 82.35,
    pnlPercent: 16.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    txHash: "5xH4...9kFm",
  },
  {
    id: "2",
    symbol: "SOL/USD",
    direction: "short",
    leverage: 25,
    entryPrice: 200.15,
    exitPrice: 198.42,
    size: 50,
    pnl: 21.63,
    pnlPercent: 8.6,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    txHash: "7yK2...3mNp",
  },
  {
    id: "3",
    symbol: "SOL/USD",
    direction: "long",
    leverage: 100,
    entryPrice: 192.50,
    exitPrice: 190.20,
    size: 75,
    pnl: -89.25,
    pnlPercent: -23.8,
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    txHash: "2aB9...8xLq",
  },
];

interface TradeHistoryProps {
  isConnected: boolean;
  trades?: Trade[];
  onViewAll?: () => void;
  isLoading?: boolean; // "Indexing your W's and L's..."
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Degen tier system - brutal and honest
const getResultTier = (pnlPercent: number): { tier: string; color: string; icon: React.ReactNode; glow?: string } => {
  // WINS - degen slang
  if (pnlPercent >= 100) return {
    tier: "GODLIKE",
    color: "#FFD700",
    icon: <Crown className="w-3 h-3" />,
    glow: "shadow-[0_0_20px_rgba(255,215,0,0.5)]"
  };
  if (pnlPercent >= 50) return {
    tier: "GIGACHAD",
    color: "#9945FF",
    icon: <Trophy className="w-3 h-3" />,
    glow: "shadow-[0_0_15px_rgba(153,69,255,0.4)]"
  };
  if (pnlPercent >= 25) return {
    tier: "BASED",
    color: "#00FFA3",
    icon: <Zap className="w-3 h-3" />,
    glow: "shadow-[0_0_12px_rgba(0,255,163,0.3)]"
  };
  if (pnlPercent >= 10) return {
    tier: "W",
    color: "#00F5A0",
    icon: <Target className="w-3 h-3" />
  };
  if (pnlPercent >= 0) return {
    tier: "SMOL W",
    color: "#00D4AA",
    icon: <TrendingUp className="w-3 h-3" />
  };

  // LOSSES - brutal honesty
  if (pnlPercent <= -50) return {
    tier: "REKT",
    color: "#FF3B69",
    icon: <Skull className="w-3 h-3" />,
    glow: "shadow-[0_0_15px_rgba(255,59,105,0.4)]"
  };
  if (pnlPercent <= -25) return {
    tier: "GUH",
    color: "#FF6B6B",
    icon: <Flame className="w-3 h-3" />
  };
  if (pnlPercent <= -10) return {
    tier: "NGMI",
    color: "#FF8C42",
    icon: <AlertTriangle className="w-3 h-3" />
  };
  return {
    tier: "L",
    color: "#FF9966",
    icon: <TrendingDown className="w-3 h-3" />
  };
};

export function TradeHistory({ isConnected, trades = MOCK_TRADES, onViewAll, isLoading = false }: TradeHistoryProps) {
  const [filter, setFilter] = useState<TradeFilter>("all");

  // Loading state - "Querying your legendary trades..."
  if (isLoading) {
    return <TradeHistorySkeleton count={3} />;
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full py-6 px-4">
        <div className="flex items-center gap-6">
          {/* Animated Icon Container - Compact */}
          <div className="relative flex-shrink-0">
            {/* Pulsing background */}
            <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-secondary)]/20 to-[var(--accent-primary)]/20 animate-pulse" />
            {/* Spinning dashed border */}
            <div className="absolute -inset-1 w-18 h-18 rounded-xl border border-dashed border-[var(--accent-secondary)]/30 animate-spin" style={{ animationDuration: '20s' }} />

            {/* Main icon box */}
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
              <Clock className="w-7 h-7 text-[var(--accent-secondary)] animate-pulse" style={{ animationDuration: '2s' }} />
            </div>

            {/* Floating badges */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-long)] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.4)]">
              <Trophy className="w-2.5 h-2.5 text-[#050505]" />
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-[var(--color-short)] flex items-center justify-center">
              <Skull className="w-2 h-2 text-white" />
            </div>
          </div>

          {/* Text Content - Horizontal layout */}
          <div className="flex flex-col">
            <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">
              Trade History
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-3 max-w-[200px]">
              Connect wallet to view your legendary trades.
            </p>

            {/* Stats Pills - Inline */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                <Crown className="w-2.5 h-2.5 text-[#FFD700]" />
                <span className="text-[9px] font-bold text-[var(--color-long)]">GODLIKE</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-short)]/10 border border-[var(--color-short)]/20">
                <Skull className="w-2.5 h-2.5 text-[var(--color-short)]" />
                <span className="text-[9px] font-bold text-[var(--color-short)]">REKT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-6 px-4">
        <div className="flex items-center gap-6">
          {/* Animated Icon Container - Compact */}
          <div className="relative flex-shrink-0">
            {/* Pulsing background */}
            <div className="absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-secondary)]/20 to-[var(--accent-primary)]/20 animate-pulse" />
            {/* Spinning dashed border */}
            <div className="absolute -inset-1 w-18 h-18 rounded-xl border border-dashed border-[var(--accent-secondary)]/30 animate-spin" style={{ animationDuration: '20s' }} />

            {/* Main icon box */}
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
              <Clock className="w-7 h-7 text-[var(--accent-secondary)] animate-pulse" style={{ animationDuration: '2s' }} />
            </div>

            {/* Floating badges */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-long)] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.4)]">
              <Trophy className="w-2.5 h-2.5 text-[#050505]" />
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-[var(--color-short)] flex items-center justify-center">
              <Skull className="w-2 h-2 text-white" />
            </div>
          </div>

          {/* Text Content - Horizontal layout */}
          <div className="flex flex-col">
            <h3 className="text-base font-black text-[var(--text-primary)] mb-0.5">
              No History Yet
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-3 max-w-[200px]">
              Your legendary trades will be immortalized here, anon.
            </p>

            {/* Stats Pills - Inline */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                <Crown className="w-2.5 h-2.5 text-[#FFD700]" />
                <span className="text-[9px] font-bold text-[var(--color-long)]">GODLIKE</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-short)]/10 border border-[var(--color-short)]/20">
                <Skull className="w-2.5 h-2.5 text-[var(--color-short)]" />
                <span className="text-[9px] font-bold text-[var(--color-short)]">REKT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const winRate = (winningTrades / trades.length) * 100;

  // Filter trades
  const filteredTrades = trades.filter((t) => {
    if (filter === "all") return true;
    if (filter === "wins") return t.pnl >= 0;
    return t.pnl < 0;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Stats Header */}
      <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Total PnL */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            totalPnl >= 0 ? "bg-[var(--color-long)]/10" : "bg-[var(--color-short)]/10"
          }`}>
            {totalPnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[var(--color-long)]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[var(--color-short)]" />
            )}
            <span className="text-xs font-bold text-[var(--text-tertiary)]">Total</span>
            <span className={`text-sm font-bold font-mono tabular-nums ${
              totalPnl >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
            }`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
            </span>
          </div>

          {/* Filter Tabs + View All */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-tertiary)]">
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  filter === "all"
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                All ({trades.length})
              </button>
              <button
                onClick={() => setFilter("wins")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  filter === "wins"
                    ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--color-long)]"
                }`}
              >
                <TrendingUp className="w-2.5 h-2.5" />
                Ws ({winningTrades})
              </button>
              <button
                onClick={() => setFilter("losses")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  filter === "losses"
                    ? "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--color-short)]"
                }`}
              >
                <TrendingDown className="w-2.5 h-2.5" />
                Ls ({losingTrades})
              </button>
            </div>

            {/* View All Button */}
            {onViewAll && trades.length > 0 && (
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

        {/* Win Rate Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-long)] to-[var(--color-long)]/70 transition-all"
                style={{ width: `${winRate}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[var(--color-short)]/70 to-[var(--color-short)] transition-all"
                style={{ width: `${100 - winRate}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold font-mono tabular-nums text-[var(--text-primary)] shrink-0">
            {winRate.toFixed(0)}% WR
          </span>
        </div>
      </div>

      {/* Trade Grid (1 col mobile, 2 col desktop) */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTrades.map((trade) => {
            const isProfit = trade.pnl >= 0;
            const isLong = trade.direction === "long";
            const tier = getResultTier(trade.pnlPercent);

            return (
              <div
                key={trade.id}
                className={`p-3 rounded-xl border transition-all hover:border-[var(--accent-primary)]/30 ${
                  isProfit
                    ? "bg-[var(--color-long)]/5 border-[var(--color-long)]/20"
                    : "bg-[var(--color-short)]/5 border-[var(--color-short)]/20"
                } ${tier.glow || ""}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isLong
                        ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                        : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                    }`}>
                      {isLong ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {trade.leverage}x
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{trade.symbol}</span>
                  </div>

                  {/* Degen Tier Badge */}
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                    style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                  >
                    {tier.icon}
                    {tier.tier}
                  </span>
                </div>

                {/* PnL Display */}
                <div className="flex items-baseline justify-between mb-2">
                  <p className={`text-lg font-bold font-mono tabular-nums ${
                    isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                  }`}>
                    {isProfit ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className={`text-sm font-bold font-mono tabular-nums ${
                    isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                  }`}>
                    {isProfit ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-[var(--bg-secondary)]/50 text-center">
                    <p className="text-[8px] text-[var(--text-tertiary)]">ENTRY → EXIT</p>
                    <p className="text-[10px] font-bold font-mono text-[var(--text-primary)] tabular-nums">
                      ${trade.entryPrice.toFixed(2)} → ${trade.exitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--bg-secondary)]/50 text-center">
                    <p className="text-[8px] text-[var(--text-tertiary)]">SIZE</p>
                    <p className="text-[10px] font-bold font-mono text-[var(--text-primary)] tabular-nums">
                      {trade.size} SOL
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimeAgo(trade.timestamp)}
                  </div>
                  {trade.txHash && (
                    <a
                      href={getTransactionUrl(trade.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[10px] text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
                    >
                      <span className="font-mono">{trade.txHash}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                filter === "wins"
                  ? "bg-[var(--color-long)]/10 border border-[var(--color-long)]/20"
                  : "bg-[var(--color-short)]/10 border border-[var(--color-short)]/20"
              }`}>
                {filter === "wins" ? (
                  <Trophy className="w-7 h-7 text-[var(--color-long)]" />
                ) : (
                  <Skull className="w-7 h-7 text-[var(--color-short)]" />
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
              {filter === "wins" ? "No Ws Yet" : "Clean L Sheet"}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] max-w-[180px]">
              {filter === "wins"
                ? "Stack those wins, anon. GIGACHAD status awaits."
                : "No losses? Either god-tier or haven't traded yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
