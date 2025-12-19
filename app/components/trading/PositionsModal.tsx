"use client";

import { useState } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Zap,
  Trophy,
  Rocket,
  Clock,
  Sparkles,
  Flame,
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

// Mock positions data
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
    openedAt: new Date(Date.now() - 1000 * 60 * 45),
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
    openedAt: new Date(Date.now() - 1000 * 60 * 120),
  },
];

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

const getPnLTier = (pnlPercent: number): { tier: string; color: string; icon: React.ReactNode } => {
  if (pnlPercent >= 100) return { tier: "LEGENDARY", color: "#FFD700", icon: <Trophy className="w-3 h-3" /> };
  if (pnlPercent >= 50) return { tier: "EPIC", color: "#9945FF", icon: <Sparkles className="w-3 h-3" /> };
  if (pnlPercent >= 25) return { tier: "GREAT", color: "#00FFA3", icon: <Rocket className="w-3 h-3" /> };
  if (pnlPercent >= 10) return { tier: "NICE", color: "#00F5A0", icon: <Zap className="w-3 h-3" /> };
  if (pnlPercent >= 0) return { tier: "WINNING", color: "#00F5A0", icon: <TrendingUp className="w-3 h-3" /> };
  if (pnlPercent >= -25) return { tier: "HOLD", color: "#FF6B00", icon: <AlertTriangle className="w-3 h-3" /> };
  return { tier: "DANGER", color: "#FF3B69", icon: <Flame className="w-3 h-3" /> };
};

const formatValue = (value: number, decimals: number = 2): string => {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}K`;
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return value.toFixed(decimals);
};

interface PositionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PositionsModal({ isOpen, onClose }: PositionsModalProps) {
  const [filter, setFilter] = useState<PositionFilter>("all");

  if (!isOpen) return null;

  const filteredPositions = mockPositions.filter((p) => {
    if (filter === "all") return true;
    return p.direction === filter;
  });

  const totalPnL = mockPositions.reduce((sum, p) => sum + p.pnl, 0);
  const longCount = mockPositions.filter((p) => p.direction === "long").length;
  const shortCount = mockPositions.filter((p) => p.direction === "short").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">All Positions</h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-tertiary)]">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === "all"
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                All ({mockPositions.length})
              </button>
              <button
                onClick={() => setFilter("long")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
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
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === "short"
                    ? "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--color-short)]"
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                Short ({shortCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Total PnL */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              totalPnL >= 0 ? "bg-[var(--color-long)]/10" : "bg-[var(--color-short)]/10"
            }`}>
              {totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[var(--color-long)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--color-short)]" />
              )}
              <span className="text-xs font-bold text-[var(--text-tertiary)]">Total PnL</span>
              <span className={`text-sm font-bold font-mono tabular-nums ${
                totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
              }`}>
                {totalPnL >= 0 ? "+" : ""}${formatValue(totalPnL)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Positions Grid */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPositions.map((position) => {
              const isProfit = position.pnl >= 0;
              const isLong = position.direction === "long";
              const pnlTier = getPnLTier(position.pnlPercent);
              const liqDistance = Math.abs((position.liquidationPrice - position.currentPrice) / position.currentPrice * 100);
              const isNearLiquidation = liqDistance < 5;
              const priceMovement = position.currentPrice - position.entryPrice;
              const targetMovement = position.takeProfitPrice - position.entryPrice;
              const progressToTP = Math.min(Math.max((priceMovement / targetMovement) * 100, 0), 100);

              return (
                <div
                  key={position.id}
                  className={`p-4 rounded-xl border transition-all hover:border-[var(--accent-primary)]/30 ${
                    isProfit
                      ? "bg-[var(--color-long)]/5 border-[var(--color-long)]/20"
                      : "bg-[var(--color-short)]/5 border-[var(--color-short)]/20"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        isLong
                          ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                          : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                      }`}>
                        {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {position.leverage}x {isLong ? "LONG" : "SHORT"}
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{position.symbol}</span>
                      <span
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                        style={{ backgroundColor: `${pnlTier.color}20`, color: pnlTier.color }}
                      >
                        {pnlTier.icon}
                        {pnlTier.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(position.openedAt)}
                    </div>
                  </div>

                  {/* PnL Display */}
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-2xl font-bold font-mono tabular-nums ${
                      isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                    }`}>
                      {isProfit ? "+" : ""}{formatValue(position.pnl)} USD
                    </p>
                    <p className={`text-xl font-bold font-mono tabular-nums ${
                      isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                    }`}>
                      {isProfit ? "+" : ""}{position.pnlPercent.toFixed(1)}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {isProfit && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-[var(--text-tertiary)]">Progress to TP</span>
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

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/50 text-center">
                      <p className="text-[9px] text-[var(--text-tertiary)]">SIZE</p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        {formatValue(position.size)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/50 text-center">
                      <p className="text-[9px] text-[var(--text-tertiary)]">ENTRY</p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.entryPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-secondary)]/50 text-center">
                      <p className="text-[9px] text-[var(--text-tertiary)]">MARK</p>
                      <p className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg text-center ${
                      isNearLiquidation ? "bg-[var(--color-short)]/20" : "bg-[var(--bg-secondary)]/50"
                    }`}>
                      <p className={`text-[9px] ${isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-tertiary)]"}`}>LIQ</p>
                      <p className={`text-xs font-bold font-mono tabular-nums ${
                        isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-primary)]"
                      }`}>
                        ${position.liquidationPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-[var(--color-long)]/10 hover:bg-[var(--color-long)]/20 text-[var(--color-long)] text-xs font-bold transition-colors flex items-center justify-center gap-1">
                      <Target className="w-3 h-3" />
                      TP: ${position.takeProfitPrice.toFixed(0)}
                    </button>
                    <button className="flex-1 py-2 rounded-lg bg-[var(--color-short)]/10 hover:bg-[var(--color-short)]/20 text-[var(--color-short)] text-xs font-bold transition-colors flex items-center justify-center gap-1">
                      <X className="w-3 h-3" />
                      Close
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPositions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[var(--text-tertiary)]">
                No {filter === "all" ? "" : filter} positions found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PositionsModal;
