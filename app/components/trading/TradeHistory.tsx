"use client";

import {
  Clock,
  Rocket,
  HelpCircle,
} from "lucide-react";
import { TradeHistorySkeleton } from "@/app/components/ui/Skeleton";

export interface Trade {
  id: string;
  symbol: string;
  direction: "long" | "short";
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  margin: number;
  notional: number;
  pnl: number;
  fee: number;
  outcome: "closed" | "liquidated";
  openedAt: string;
  closedAt: string;
}

interface TradeHistoryProps {
  isConnected: boolean;
  trades?: Trade[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

// Solana icon
const SolanaIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="solGradientHist" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FFA3" />
        <stop offset="50%" stopColor="#03E1FF" />
        <stop offset="100%" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#solGradientHist)" />
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

export function TradeHistory({ isConnected, trades = [], isLoading = false, onViewAll }: TradeHistoryProps) {
  if (isLoading) {
    return <TradeHistorySkeleton count={3} />;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Rocket className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Connect wallet to view history</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Clock className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">No trade history yet</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">Your closed trades will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
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
            {trades.map((trade) => {
              const isProfit = trade.pnl >= 0;
              const isLong = trade.direction === "long";
              const isLiquidated = trade.outcome === "liquidated";
              const pnlPercent = (trade.pnl / trade.margin) * 100;
              const assetSymbol = trade.symbol;

              return (
                <tr key={trade.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                  {/* Time */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono text-[var(--text-secondary)]">{formatDate(trade.closedAt)}</span>
                    </div>
                  </td>

                  {/* Market */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <SolanaIcon />
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{assetSymbol}/USDC</span>
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

                  {/* Size (Margin) */}
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
      </div>
    </div>
  );
}
