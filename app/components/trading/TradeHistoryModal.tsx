"use client";

import { useState, useMemo } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Crown,
  Trophy,
  Zap,
  Target,
  Skull,
  Flame,
  AlertTriangle,
  Filter,
  Calendar,
} from "lucide-react";
import { getTransactionUrl } from "@/app/config/network";

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

// Extended mock data for pagination demo
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
  {
    id: "4",
    symbol: "SOL/USD",
    direction: "long",
    leverage: 75,
    entryPrice: 188.00,
    exitPrice: 195.50,
    size: 200,
    pnl: 298.40,
    pnlPercent: 59.7,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    txHash: "9xM3...2pQr",
  },
  {
    id: "5",
    symbol: "SOL/USD",
    direction: "short",
    leverage: 50,
    entryPrice: 210.00,
    exitPrice: 195.00,
    size: 150,
    pnl: 535.71,
    pnlPercent: 107.1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    txHash: "4kL7...9nWx",
  },
  {
    id: "6",
    symbol: "SOL/USD",
    direction: "long",
    leverage: 200,
    entryPrice: 185.00,
    exitPrice: 183.50,
    size: 50,
    pnl: -81.08,
    pnlPercent: -32.4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    txHash: "1bC5...6mYz",
  },
  {
    id: "7",
    symbol: "SOL/USD",
    direction: "short",
    leverage: 30,
    entryPrice: 195.00,
    exitPrice: 198.00,
    size: 80,
    pnl: -36.92,
    pnlPercent: -9.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    txHash: "8pQ2...4rSt",
  },
  {
    id: "8",
    symbol: "SOL/USD",
    direction: "long",
    leverage: 100,
    entryPrice: 175.00,
    exitPrice: 190.00,
    size: 120,
    pnl: 1028.57,
    pnlPercent: 171.4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
    txHash: "3vW9...7uXy",
  },
  {
    id: "9",
    symbol: "SOL/USD",
    direction: "long",
    leverage: 25,
    entryPrice: 192.00,
    exitPrice: 193.50,
    size: 60,
    pnl: 11.72,
    pnlPercent: 3.9,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    txHash: "6zA1...0bCd",
  },
  {
    id: "10",
    symbol: "SOL/USD",
    direction: "short",
    leverage: 150,
    entryPrice: 205.00,
    exitPrice: 180.00,
    size: 100,
    pnl: 1829.27,
    pnlPercent: 365.9,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    txHash: "5eF3...2gHi",
  },
];

const ITEMS_PER_PAGE = 5;

// Degen tier system
const getResultTier = (pnlPercent: number): { tier: string; color: string; icon: React.ReactNode } => {
  if (pnlPercent >= 100) return { tier: "GODLIKE", color: "#FFD700", icon: <Crown className="w-3 h-3" /> };
  if (pnlPercent >= 50) return { tier: "GIGACHAD", color: "#9945FF", icon: <Trophy className="w-3 h-3" /> };
  if (pnlPercent >= 25) return { tier: "BASED", color: "#00FFA3", icon: <Zap className="w-3 h-3" /> };
  if (pnlPercent >= 10) return { tier: "W", color: "#00F5A0", icon: <Target className="w-3 h-3" /> };
  if (pnlPercent >= 0) return { tier: "SMOL W", color: "#00D4AA", icon: <TrendingUp className="w-3 h-3" /> };
  if (pnlPercent <= -50) return { tier: "REKT", color: "#FF3B69", icon: <Skull className="w-3 h-3" /> };
  if (pnlPercent <= -25) return { tier: "GUH", color: "#FF6B6B", icon: <Flame className="w-3 h-3" /> };
  if (pnlPercent <= -10) return { tier: "NGMI", color: "#FF8C42", icon: <AlertTriangle className="w-3 h-3" /> };
  return { tier: "L", color: "#FF9966", icon: <TrendingDown className="w-3 h-3" /> };
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface TradeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades?: Trade[];
}

export function TradeHistoryModal({ isOpen, onClose, trades = MOCK_TRADES }: TradeHistoryModalProps) {
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
  const totalPages = Math.ceil(filteredTrades.length / ITEMS_PER_PAGE);
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTrades.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTrades, currentPage]);

  // Stats
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const avgWin = winningTrades > 0
    ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades
    : 0;
  const avgLoss = losingTrades > 0
    ? Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)) / losingTrades
    : 0;

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
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 overflow-hidden animate-scale-in" style={{ boxShadow: 'var(--shadow-modal)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Trade History</h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-tertiary)]">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === "all"
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                All ({trades.length})
              </button>
              <button
                onClick={() => handleFilterChange("wins")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === "wins"
                    ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--color-long)]"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                Ws ({winningTrades})
              </button>
              <button
                onClick={() => handleFilterChange("losses")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === "losses"
                    ? "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--color-short)]"
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                Ls ({losingTrades})
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Total PnL</p>
            <p className={`text-xl font-bold font-mono tabular-nums ${
              totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
            }`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Win Rate</p>
            <p className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
              {winRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Total Trades</p>
            <p className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
              {trades.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Avg Win</p>
            <p className="text-xl font-bold font-mono tabular-nums text-[var(--color-long)]">
              +${avgWin.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Avg Loss</p>
            <p className="text-xl font-bold font-mono tabular-nums text-[var(--color-short)]">
              -${avgLoss.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Pair
                </th>
                <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Side
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Size
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Entry
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Exit
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  PnL
                </th>
                <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Result
                </th>
                <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Tx
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade, index) => {
                const isProfit = trade.pnl >= 0;
                const isLong = trade.direction === "long";
                const tier = getResultTier(trade.pnlPercent);

                return (
                  <tr
                    key={trade.id}
                    className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]/50 transition-colors ${
                      index % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-secondary)]/20"
                    }`}
                  >
                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-[var(--text-secondary)]">
                        {formatDate(trade.timestamp)}
                      </span>
                    </td>

                    {/* Pair */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {trade.symbol}
                      </span>
                    </td>

                    {/* Side */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                          isLong
                            ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                            : "bg-[var(--color-short)]/20 text-[var(--color-short)]"
                        }`}>
                          {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {trade.leverage}x
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono font-medium text-[var(--text-primary)] tabular-nums">
                        {trade.size} SOL
                      </span>
                    </td>

                    {/* Entry */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono text-[var(--text-secondary)] tabular-nums">
                        ${trade.entryPrice.toFixed(2)}
                      </span>
                    </td>

                    {/* Exit */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono text-[var(--text-secondary)] tabular-nums">
                        ${trade.exitPrice.toFixed(2)}
                      </span>
                    </td>

                    {/* PnL */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold font-mono tabular-nums ${
                          isProfit ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                        }`}>
                          {isProfit ? "+" : ""}${trade.pnl.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-mono tabular-nums ${
                          isProfit ? "text-[var(--color-long)]/70" : "text-[var(--color-short)]/70"
                        }`}>
                          {isProfit ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Result Tier */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black"
                          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                        >
                          {tier.icon}
                          {tier.tier}
                        </span>
                      </div>
                    </td>

                    {/* Tx */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        {trade.txHash ? (
                          <a
                            href={getTransactionUrl(trade.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--accent-primary)] hover:bg-[var(--accent-muted)] transition-colors"
                          >
                            <span className="font-mono">{trade.txHash}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--text-tertiary)]">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Animated Icon Container */}
            <div className="relative mb-6">
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 w-28 h-28 rounded-3xl bg-gradient-to-br from-[var(--accent-secondary)]/20 to-[var(--accent-primary)]/20 animate-pulse" />
              <div className="absolute -inset-2 w-32 h-32 rounded-3xl border border-dashed border-[var(--accent-secondary)]/30 animate-spin" style={{ animationDuration: '25s' }} />

              {/* Main icon box */}
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
                <Calendar className="w-12 h-12 text-[var(--accent-secondary)] animate-pulse" style={{ animationDuration: '2s' }} />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-long)] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                <Trophy className="w-4 h-4 text-[#050505]" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-[var(--color-short)] flex items-center justify-center">
                <Skull className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Degen Text */}
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">
              {filter === "all"
                ? "No History Yet"
                : filter === "wins"
                  ? "No Ws on Record"
                  : "Clean L Sheet"
              }
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] mb-6 max-w-xs">
              {filter === "all"
                ? "Your legendary trades will be immortalized here. Time to make history."
                : filter === "wins"
                  ? "No wins recorded yet. Every legend starts somewhere, anon."
                  : "No losses? Either you're a god or you haven't traded yet."
              }
            </p>

            {/* Stats Pills */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                <Crown className="w-3 h-3 text-[#FFD700]" />
                <span className="text-xs font-bold text-[var(--color-long)]">GODLIKE Awaits</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20">
                <Zap className="w-3 h-3 text-[var(--accent-secondary)]" />
                <span className="text-xs font-bold text-[var(--accent-secondary)]">Write History</span>
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] max-w-sm">
              <p className="text-xs text-[var(--text-secondary)] italic">
                &quot;Every trade is a story. Make yours legendary.&quot;
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">— Hall of Degen Fame</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredTrades.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
            <p className="text-sm text-[var(--text-tertiary)]">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTrades.length)} of {filteredTrades.length} trades
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentPage === 1
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-primary)]"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-[var(--accent-primary)] text-white"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-primary)]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentPage === totalPages
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-primary)]"
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
