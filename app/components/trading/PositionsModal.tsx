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
  RefreshCw,
} from "lucide-react";
import { Position } from "@/app/hooks/usePositions";

type PositionFilter = "all" | "long" | "short";

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
  positions?: Position[];
  onClosePosition?: (positionId: string) => void;
  onReversePosition?: (position: Position) => void;
}

export function PositionsModal({
  isOpen,
  onClose,
  positions = [],
  onClosePosition,
  onReversePosition,
}: PositionsModalProps) {
  const [filter, setFilter] = useState<PositionFilter>("all");

  if (!isOpen) return null;

  const filteredPositions = positions.filter((p) => {
    if (filter === "all") return true;
    return p.direction === filter;
  });

  const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
  const longCount = positions.filter((p) => p.direction === "long").length;
  const shortCount = positions.filter((p) => p.direction === "short").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 overflow-hidden animate-scale-in" style={{ boxShadow: 'var(--shadow-modal)' }}>
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
                All ({positions.length})
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
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  className={`relative p-5 rounded-2xl border transition-all hover:border-[var(--accent-primary)]/40 overflow-hidden ${
                    isProfit
                      ? "bg-gradient-to-br from-[var(--color-long)]/8 to-[var(--color-long)]/3 border-[var(--color-long)]/25"
                      : "bg-gradient-to-br from-[var(--color-short)]/8 to-[var(--color-short)]/3 border-[var(--color-short)]/25"
                  }`}
                >
                  {/* Subtle corner glow for high tier positions */}
                  {pnlTier.tier === "LEGENDARY" || pnlTier.tier === "EPIC" ? (
                    <div
                      className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                      style={{ background: pnlTier.color }}
                    />
                  ) : null}

                  {/* Row 1: Direction + Symbol + Actions */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      {/* Direction Badge - Larger, clearer */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide ${
                        isLong
                          ? "bg-[var(--color-long)]/20 text-[var(--color-long)] border border-[var(--color-long)]/30"
                          : "bg-[var(--color-short)]/20 text-[var(--color-short)] border border-[var(--color-short)]/30"
                      }`}>
                        {isLong ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {position.leverage}x {isLong ? "LONG" : "SHORT"}
                      </div>
                      {/* Symbol */}
                      <span className="text-base font-bold text-[var(--text-primary)]">{position.symbol}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Reverse Button */}
                      {onReversePosition && (
                        <div className="relative group/reverse">
                          <button
                            onClick={() => onReversePosition(position)}
                            className={`flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--bg-tertiary)] border border-transparent transition-all duration-200 hover:-translate-y-0.5 ${
                              isLong
                                ? "hover:bg-[var(--color-short)] hover:border-[var(--color-short)] text-[var(--text-tertiary)] hover:text-white hover:shadow-[0_0_16px_rgba(255,59,105,0.5)]"
                                : "hover:bg-[var(--color-long)] hover:border-[var(--color-long)] text-[var(--text-tertiary)] hover:text-[#050505] hover:shadow-[0_0_16px_rgba(0,255,136,0.5)]"
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
                                {isLong ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                              </div>
                            </div>
                            <div className={`absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rotate-45 ${
                              isLong ? "bg-[var(--color-short)]" : "bg-[var(--color-long)]"
                            }`} />
                          </div>
                        </div>
                      )}

                      {/* Close Button */}
                      <div className="relative group/close">
                        <button
                          onClick={() => onClosePosition?.(position.id)}
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--color-short)] border border-transparent hover:border-[var(--color-short)] text-[var(--text-tertiary)] hover:text-white transition-all duration-200 hover:shadow-[0_0_16px_rgba(255,59,105,0.5)] hover:-translate-y-0.5"
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
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black"
                      style={{ backgroundColor: `${pnlTier.color}15`, color: pnlTier.color, border: `1px solid ${pnlTier.color}30` }}
                    >
                      {pnlTier.icon}
                      {pnlTier.tier}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Opened {formatTimeAgo(position.openedAt)}</span>
                    </div>
                  </div>

                  {/* PnL Section - More prominent with separator */}
                  <div className="flex items-end justify-between py-4 border-y border-[var(--border-subtle)]/50 mb-4">
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Unrealized PnL</p>
                      <p className={`text-3xl font-black font-mono tabular-nums leading-none ${
                        isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                      }`}>
                        {isProfit ? "+" : ""}{formatValue(position.pnl)}
                        <span className="text-lg ml-1 opacity-70">USD</span>
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-mono ${
                      isProfit
                        ? "bg-[var(--color-long)]/15 border border-[var(--color-long)]/30"
                        : "bg-[var(--color-short)]/15 border border-[var(--color-short)]/30"
                    }`}>
                      <p className={`text-2xl font-black tabular-nums ${
                        isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                      }`}>
                        {isProfit ? "+" : ""}{position.pnlPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar - Only when profitable */}
                  {isProfit && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="text-[var(--text-tertiary)] flex items-center gap-1">
                          <Target className="w-3 h-3 text-[var(--color-long)]" />
                          Progress to Take Profit
                        </span>
                        <span className="text-[var(--color-long)] font-bold tabular-nums">{progressToTP.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-long)] to-[var(--color-long)]/60 transition-all duration-500"
                          style={{ width: `${progressToTP}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Grid - 3 columns, cleaner */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/60 text-center">
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Size</p>
                      <p className="text-sm font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${formatValue(position.size)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/60 text-center">
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Entry</p>
                      <p className="text-sm font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.entryPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/60 text-center">
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Mark</p>
                      <p className="text-sm font-bold font-mono text-[var(--text-primary)] tabular-nums">
                        ${position.currentPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* LIQ & TP Row - Full width, distinct styling */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${
                      isNearLiquidation
                        ? "bg-[var(--color-short)]/15 border border-[var(--color-short)]/40 animate-pulse"
                        : "bg-[var(--bg-secondary)]/60"
                    }`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-tertiary)]"}`} />
                        <span className={`text-[10px] font-bold uppercase ${isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-tertiary)]"}`}>
                          Liquidation
                        </span>
                      </div>
                      <span className={`text-sm font-bold font-mono tabular-nums ${isNearLiquidation ? "text-[var(--color-short)]" : "text-[var(--text-primary)]"}`}>
                        ${position.liquidationPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[var(--color-long)]" />
                        <span className="text-[10px] font-bold uppercase text-[var(--color-long)]">Take Profit</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[var(--color-long)] tabular-nums">
                        ${position.takeProfitPrice?.toFixed(2) || "—"}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredPositions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* Animated Icon Container */}
              <div className="relative mb-6">
                {/* Pulsing ring effect */}
                <div className="absolute inset-0 w-28 h-28 rounded-3xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 animate-pulse" />
                <div className="absolute -inset-2 w-32 h-32 rounded-3xl border border-dashed border-[var(--accent-primary)]/30 animate-spin" style={{ animationDuration: '20s' }} />

                {/* Main icon box */}
                <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
                  <Rocket className="w-12 h-12 text-[var(--accent-primary)] animate-bounce" style={{ animationDuration: '2s' }} />
                </div>

                {/* Floating badges */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-long)] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                  <Zap className="w-4 h-4 text-[#050505]" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Degen Text */}
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">
                {filter === "all" ? "No Positions Yet" : `No ${filter === "long" ? "Long" : "Short"} Positions`}
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-6 max-w-xs">
                {filter === "all"
                  ? "Time to ape in, anon. Your first 1000x is waiting."
                  : filter === "long"
                    ? "No longs? ngmi. Bet on the pump, fren."
                    : "No shorts open. Sometimes you gotta short the top."
                }
              </p>

              {/* Stats Pills */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-long)] animate-pulse" />
                  <span className="text-xs font-bold text-[var(--color-long)]">1000x Leverage</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                  <Flame className="w-3 h-3 text-[var(--accent-primary)]" />
                  <span className="text-xs font-bold text-[var(--accent-primary)]">Degen Mode</span>
                </div>
              </div>

              {/* Motivational Quote */}
              <div className="px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] max-w-sm">
                <p className="text-xs text-[var(--text-secondary)] italic">
                  &quot;Fortune favors the bold. And the leveraged.&quot;
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">— Anonymous Degen</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PositionsModal;
