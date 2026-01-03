"use client";

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
  if (!isOpen) return null;

  const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);

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
            <span className="text-sm text-[var(--text-tertiary)]">({positions.length})</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Total PnL */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${totalPnL >= 0 ? "bg-[var(--color-long)]/10" : "bg-[var(--color-short)]/10"
              }`}>
              {totalPnL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[var(--color-long)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--color-short)]" />
              )}
              <span className="text-xs font-bold text-[var(--text-tertiary)]">Total PnL</span>
              <span className={`text-sm font-bold font-mono tabular-nums ${totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
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

        {/* Modal Content - Table View */}
        <div className="flex-1 overflow-x-auto min-h-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left sticky top-0 bg-[var(--bg-card)] z-10">
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-wider">Position/Symbol</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-wider text-right">Size</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-wider text-right hidden lg:table-cell">Entry Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-wider text-right hidden lg:table-cell">Mark Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-wider text-right hidden lg:table-cell">Liq. Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-wider text-right">Unrealized PNL (ROI)</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/50 overflow-y-auto">
              {positions.map((position) => {
                const isLong = position.direction === "long";
                const isProfit = position.pnl >= 0;

                return (
                  <tr key={position.id} className="group hover:bg-[var(--bg-elevated)]/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded ${isLong ? "text-[var(--color-long)] bg-[var(--color-long)]/10" : "text-[var(--color-short)] bg-[var(--color-short)]/10"}`}>
                            {isLong ? "LONG" : "SHORT"} {position.leverage}X
                          </span>
                          <span className="text-base font-bold text-[var(--text-primary)]">{position.symbol}</span>
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)]">{formatTimeAgo(position.openedAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col">
                        <span className="text-base font-bold font-mono text-[var(--text-primary)]">${formatValue(position.size)}</span>
                        <span className="text-xs text-[var(--text-tertiary)] font-mono">{(position.size / position.entryPrice).toFixed(3)} {position.symbol.split('/')[0]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right hidden lg:table-cell">
                      <span className="text-base font-medium font-mono text-[var(--text-secondary)]">${position.entryPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-right hidden lg:table-cell">
                      <span className="text-base font-medium font-mono text-[var(--text-secondary)]">${position.currentPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-right hidden lg:table-cell">
                      <span className="text-base font-medium font-mono text-[var(--color-short)]">${position.liquidationPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col">
                        <span className={`text-base font-black font-mono ${isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                          {isProfit ? "+" : ""}${formatValue(position.pnl)}
                        </span>
                        <span className={`text-sm font-bold font-mono ${isProfit ? "text-[var(--color-long)]/80" : "text-[var(--color-short)]/80"}`}>
                          ({isProfit ? "+" : ""}{position.pnlPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onReversePosition?.(position)}
                          className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 group/rev"
                        >
                          <RefreshCw className="w-4 h-4 group-hover/rev:rotate-180 transition-transform duration-500" />
                          <span>Reverse</span>
                        </button>
                        <button
                          onClick={() => onClosePosition?.(position.id)}
                          className="px-3 py-2 rounded-xl bg-[var(--color-short)]/10 border border-[var(--color-short)]/20 text-xs font-bold text-[var(--color-short)] hover:bg-[var(--color-short)] hover:text-white transition-all flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {positions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 opacity-50">
              <Rocket className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
              <p className="text-lg font-bold text-[var(--text-secondary)]">No active positions found</p>
              <p className="text-sm text-[var(--text-tertiary)]">Ape into a position to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PositionsModal;
