"use client";

import { useMemo } from "react";
import {
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Wallet,
  ArrowDown,
  Check,
  Loader2,
} from "lucide-react";
import { Position } from "@/app/hooks/usePositions";

interface ReversePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  availableBalance: number;
  onConfirm: () => void;
  onDeposit: () => void;
  isProcessing: boolean;
  calculateRequirements: (
    position: Position,
    balance: number
  ) => {
    requiredMargin: number;
    marginAfterClose: number;
    hasSufficientMargin: boolean;
    shortfall: number;
  };
}

// Format value helper
const formatValue = (value: number, decimals: number = 2): string => {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}K`;
  if (Math.abs(value) >= 1000)
    return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return value.toFixed(decimals);
};

export function ReversePositionModal({
  isOpen,
  onClose,
  position,
  availableBalance,
  onConfirm,
  onDeposit,
  isProcessing,
  calculateRequirements,
}: ReversePositionModalProps) {
  const requirements = useMemo(() => {
    if (!position) return null;
    return calculateRequirements(position, availableBalance);
  }, [position, availableBalance, calculateRequirements]);

  if (!isOpen || !position || !requirements) return null;

  const isLong = position.direction === "long";
  const isProfit = position.pnl >= 0;
  const newDirection = isLong ? "short" : "long";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 overflow-hidden animate-scale-in"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Reverse Position
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Close & open opposite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Current Position */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
              Current Position
            </span>
            <div
              className={`p-4 rounded-xl border ${
                isLong
                  ? "bg-[var(--color-long)]/5 border-[var(--color-long)]/20"
                  : "bg-[var(--color-short)]/5 border-[var(--color-short)]/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isLong
                        ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                        : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                    }`}
                  >
                    {isLong ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {position.direction.toUpperCase()} {position.leverage}x
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {position.symbol}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">
                    Size
                  </p>
                  <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
                    ${formatValue(position.size)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">
                    Entry
                  </p>
                  <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
                    ${position.entryPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">
                    PnL
                  </p>
                  <p
                    className={`text-sm font-bold font-mono ${
                      isProfit
                        ? "text-[var(--color-long)]"
                        : "text-[var(--color-short)]"
                    }`}
                  >
                    {isProfit ? "+" : ""}${formatValue(position.pnl)} (
                    {isProfit ? "+" : ""}
                    {position.pnlPercent.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
          </div>

          {/* New Position Preview */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
              New Position
            </span>
            <div
              className={`p-4 rounded-xl border ${
                newDirection === "long"
                  ? "bg-[var(--color-long)]/5 border-[var(--color-long)]/20"
                  : "bg-[var(--color-short)]/5 border-[var(--color-short)]/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      newDirection === "long"
                        ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                        : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                    }`}
                  >
                    {newDirection === "long" ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {newDirection.toUpperCase()} {position.leverage}x
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {position.symbol}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Same size & leverage
                  </p>
                  <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
                    ${formatValue(position.size)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Requirements */}
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-tertiary)]">
                Required Margin
              </span>
              <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                ${formatValue(requirements.requiredMargin)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-tertiary)]">
                Available After Close
              </span>
              <span
                className={`text-sm font-bold font-mono ${
                  requirements.hasSufficientMargin
                    ? "text-[var(--color-long)]"
                    : "text-[var(--color-short)]"
                }`}
              >
                ${formatValue(requirements.marginAfterClose)}
              </span>
            </div>
            {requirements.hasSufficientMargin ? (
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Check className="w-4 h-4 text-[var(--color-long)]" />
                <span className="text-xs font-medium text-[var(--color-long)]">
                  Sufficient margin available
                </span>
              </div>
            ) : (
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-short)]" />
                  <span className="text-xs font-medium text-[var(--color-short)]">
                    Need ${formatValue(requirements.shortfall)} more
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
            <Zap className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)]">
              This will close your current {position.direction} position and
              immediately open a {newDirection} position with the same size and
              leverage at market price.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          {requirements.hasSufficientMargin ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:opacity-70 ${
                  newDirection === "long"
                    ? "bg-[var(--color-long)] text-[#050505] hover:shadow-[var(--shadow-glow-long)]"
                    : "bg-[var(--color-short)] text-white hover:shadow-[var(--shadow-glow-short)]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reversing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Confirm Reverse
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onDeposit}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:shadow-[0_0_20px_rgba(255,45,146,0.3)] transition-all hover:-translate-y-0.5"
              >
                <Wallet className="w-4 h-4" />
                Deposit ${formatValue(requirements.shortfall)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
