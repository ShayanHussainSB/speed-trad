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
    <div className="flex flex-col h-full bg-black/40">
      {/* Control Strip - Sharp & Minimal */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-6">
          {/* Total Performance */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Aggregate</span>
            <span className={`text-[13px] font-black font-mono tracking-tighter ${totalPnl >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
            </span>
          </div>

          {/* Win Rate Bar - Minimal */}
          <div className="flex items-center gap-3">
            <div className="w-24 h-1 rounded-full bg-white/5 overflow-hidden flex">
              <div className="h-full bg-[var(--color-long)]" style={{ width: `${winRate}%` }} />
              <div className="h-full bg-[var(--color-short)]" style={{ width: `${100 - winRate}%` }} />
            </div>
            <span className="text-[10px] font-black font-mono text-white/40">{winRate.toFixed(0)}% WIN</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {["all", "wins", "losses"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as TradeFilter)}
                className={`
                  px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all
                  ${filter === f
                    ? f === 'wins' ? "text-[var(--color-long)] bg-[var(--color-long)]/10" :
                      f === 'losses' ? "text-[var(--color-short)] bg-[var(--color-short)]/10" :
                        "text-white bg-white/10"
                    : "text-white/30 hover:text-white"
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>
          {onViewAll && trades.length > 0 && (
            <button onClick={onViewAll} className="text-white/20 hover:text-white transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trade History Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredTrades.map((trade) => {
            const isProfit = trade.pnl >= 0;
            const isLong = trade.direction === "long";
            const tier = getResultTier(trade.pnlPercent);

            return (
              <div
                key={trade.id}
                className={`group relative p-4 rounded bg-white/[0.02] border transition-all overflow-hidden ${isProfit ? "border-[var(--color-long)]/10 hover:border-[var(--color-long)]/30" : "border-[var(--color-short)]/10 hover:border-[var(--color-short)]/30"
                  }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-6 rounded-full ${isLong ? "bg-[var(--color-long)]" : "bg-[var(--color-short)]"}`} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-black text-white uppercase tracking-wider">{trade.symbol}</span>
                          <span className={`text-[8px] font-black px-1 rounded-sm border ${isLong ? "text-[var(--color-long)] border-[var(--color-long)]/30" : "text-[var(--color-short)] border-[var(--color-short)]/30"}`}>
                            {trade.leverage}X {trade.direction.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/5 bg-white/5">
                      <span className="text-[8px] font-black tracking-widest uppercase" style={{ color: tier.color }}>{tier.tier}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Performance</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[16px] font-black font-mono tracking-tighter ${isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                          {isProfit ? "+" : ""}${Math.abs(trade.pnl).toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-black font-mono ${isProfit ? "text-[var(--color-long)]/40" : "text-[var(--color-short)]/40"}`}>
                          {isProfit ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Execution</span>
                      <span className="text-[14px] font-black font-mono text-white/40 tracking-tighter mt-1">${trade.entryPrice.toLocaleString()} → ${trade.exitPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{trade.size} SOL SIZE</span>
                      <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">{formatTimeAgo(trade.timestamp)}</span>
                    </div>
                    {trade.txHash && (
                      <a
                        href={getTransactionUrl(trade.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] font-black text-[var(--accent-primary)]/40 hover:text-[var(--accent-primary)] transition-all uppercase tracking-widest"
                      >
                        EXPLORE <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${filter === "wins"
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
