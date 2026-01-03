"use client";

import { useState, useMemo } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Calendar,
  Trophy,
  Skull,
} from "lucide-react";
import type { Trade } from "./TradeHistory";

const ITEMS_PER_PAGE = 10;

type TradeFilter = "all" | "wins" | "losses";

// Solana icon
const SolanaIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="solGradientModal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FFA3" />
        <stop offset="50%" stopColor="#03E1FF" />
        <stop offset="100%" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#solGradientModal)" />
    <path d="M7.5 14.5L10.5 11.5H16.5L13.5 14.5H7.5Z" fill="white" />
    <path d="M7.5 9.5L10.5 6.5H16.5L13.5 9.5H7.5Z" fill="white" />
    <path d="M16.5 12L13.5 15H7.5L10.5 12H16.5Z" fill="white" opacity="0.7" />
  </svg>
);

// Format date like "03.01.2026"
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

interface TradeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades?: Trade[];
}

export function TradeHistoryModal({ isOpen, onClose, trades = [] }: TradeHistoryModalProps) {
  const [filter, setFilter] = useState<TradeFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter trades
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (filter === "all") return true;
      if (filter === "wins") return t.pnl >= 0;
      return t.pnl < 0;
    });
  }, [trades, filter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / ITEMS_PER_PAGE));
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTrades.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTrades, currentPage]);

  // Stats
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fee, 0);
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter: TradeFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Trade History</h2>
              <span className="px-2 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-bold">
                DEMO
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-tertiary)]">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filter === "all"
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                All ({trades.length})
              </button>
              <button
                onClick={() => handleFilterChange("wins")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filter === "wins"
                    ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--color-long)]"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                Wins ({winningTrades})
              </button>
              <button
                onClick={() => handleFilterChange("losses")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filter === "losses"
                    ? "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--color-short)]"
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                Losses ({losingTrades})
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Total PnL</p>
            <p className={`text-xl font-bold font-mono ${
              totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
            }`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Win Rate</p>
            <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
              {winRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Total Trades</p>
            <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
              {trades.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Total Fees</p>
            <p className="text-xl font-bold font-mono text-[var(--text-secondary)]">
              ${totalFees.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[50vh]">
          {paginatedTrades.length > 0 ? (
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 bg-[var(--bg-primary)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Market</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Side</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Leverage</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-right text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-right text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1">
                      Total PnL
                      <HelpCircle className="w-3 h-3 text-[var(--text-tertiary)]" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Fee</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrades.map((trade) => {
                  const isProfit = trade.pnl >= 0;
                  const isLong = trade.direction === "long";
                  const isLiquidated = trade.outcome === "liquidated";
                  const pnlPercent = (trade.pnl / trade.margin) * 100;
                  const assetSymbol = trade.symbol;

                  return (
                    <tr key={trade.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                      {/* Time */}
                      <td className="px-4 py-4">
                        <span className="text-[13px] font-mono text-[var(--text-secondary)]">{formatDate(trade.closedAt)}</span>
                      </td>
                      
                      {/* Market */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <SolanaIcon />
                          <span className="text-[13px] font-semibold text-[var(--text-primary)]">{assetSymbol}-USDC</span>
                        </div>
                      </td>
                      
                      {/* Side */}
                      <td className="px-4 py-4">
                        <span className={`text-[13px] font-semibold ${isLiquidated ? "text-[var(--color-short)]" : isLong ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                          {isLiquidated ? "Liquidated" : `Close ${isLong ? "Long" : "Short"}`}
                        </span>
                      </td>
                      
                      {/* Leverage */}
                      <td className="px-4 py-4">
                        <span className="text-[13px] font-mono font-bold text-[var(--accent-primary)]">{trade.leverage}x</span>
                      </td>
                      
                      {/* Price */}
                      <td className="px-4 py-4">
                        <span className="text-[13px] font-mono text-[var(--text-secondary)]">
                          {trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                        </span>
                      </td>
                      
                      {/* Size */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-[13px] font-mono text-[var(--text-primary)]">
                          ${trade.margin.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </span>
                      </td>
                      
                      {/* Total PnL */}
                      <td className="px-4 py-4 text-right">
                        <span className={`text-[13px] font-mono font-bold ${isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                          {isProfit ? "+" : ""}${trade.pnl.toFixed(2)}
                          <span className="opacity-70"> ({isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%)</span>
                        </span>
                      </td>
                      
                      {/* Fee */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-[13px] font-mono text-[var(--text-tertiary)]">
                          {trade.fee > 0 ? `$${trade.fee.toFixed(2)}` : "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="relative w-24 h-24 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-[var(--text-tertiary)]" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[var(--color-long)] flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[var(--color-short)] flex items-center justify-center">
                  <Skull className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {filter === "all"
                  ? "No History Yet"
                  : filter === "wins"
                    ? "No Wins Yet"
                    : "No Losses Yet"
                }
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-4 max-w-xs">
                {filter === "all"
                  ? "Your trades will appear here once you close a position."
                  : filter === "wins"
                    ? "No winning trades recorded yet."
                    : "No losing trades yet. Keep it up!"
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTrades.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-tertiary)]">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTrades.length)} of {filteredTrades.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 1
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      page = currentPage - 2 + i;
                    }
                    if (currentPage > totalPages - 2) {
                      page = totalPages - 4 + i;
                    }
                  }
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        currentPage === page
                          ? "bg-[var(--accent-primary)] text-black"
                          : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === totalPages
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeHistoryModal;
