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

// Asset logo mapping - using CoinGecko CDN images
const ASSET_LOGOS: Record<string, string> = {
  SOL: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
  BTC: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
};

// Extract base symbol from trade symbol (e.g., "SOL/USDC" -> "SOL", "BTC" -> "BTC")
function extractBaseSymbol(symbol: string): string {
  // Handle formats like "SOL/USDC", "SOL-USDC", "SOL", etc.
  const base = symbol.split(/[-\/]/)[0].toUpperCase();
  return base;
}

// Get asset logo URL for a given symbol
function getAssetLogo(symbol: string): string {
  const baseSymbol = extractBaseSymbol(symbol);
  return ASSET_LOGOS[baseSymbol] || ASSET_LOGOS.SOL; // Default to SOL if not found
}

// Asset icon component
const AssetIcon = ({ symbol }: { symbol: string }) => {
  const logoUrl = getAssetLogo(symbol);
  return (
    <img
      src={logoUrl}
      alt={extractBaseSymbol(symbol)}
      className="w-4 h-4 flex-shrink-0 rounded-full object-cover"
    />
  );
};

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
                      <AssetIcon symbol={assetSymbol} />
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
