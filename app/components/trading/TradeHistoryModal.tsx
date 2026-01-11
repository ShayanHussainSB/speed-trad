"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Trophy,
  TrendingUp,
  TrendingDown,
  Zap,
  Star,
  Award,
  Target,
  Flame,
} from "lucide-react";
import { ReplayChart } from "./ReplayChart";
import { TradeRecord } from "@/app/contexts/DemoTradingContext";


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
      className="w-6 h-6 flex-shrink-0 rounded-full object-cover"
    />
  );
};

interface TradeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades?: TradeRecord[];
}

type TradeAchievement = {
  type: "best_profit" | "best_percentage" | "big_win" | "perfect_timing" | "high_leverage";
  label: string;
  icon: React.ReactNode;
};

export function TradeHistoryModal({ isOpen, onClose, trades = [] }: TradeHistoryModalProps) {
  const [view, setView] = useState<"summary" | "replay">("summary");

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView("summary");
    }
  }, [isOpen]);

  // Get the most recent trade (first in array since trades are sorted by closedAt desc)
  const latestTrade = trades[0] || null;

  // Calculate overall stats
  const stats = useMemo(() => {
    if (trades.length === 0) {
      return {
        totalPnL: 0,
        totalTrades: 0,
        winRate: 0,
        winningTrades: 0,
        losingTrades: 0,
        bestProfit: 0,
        bestPercentage: 0,
      };
    }

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const winningTrades = trades.filter((t) => t.pnl > 0).length;
    const losingTrades = trades.filter((t) => t.pnl < 0).length;
    const winRate = (winningTrades / trades.length) * 100;

    // Find best profit and best percentage
    const bestProfit = Math.max(...trades.map((t) => t.pnl));
    const bestPercentage = Math.max(
      ...trades.map((t) => (t.pnl / t.margin) * 100)
    );

    return {
      totalPnL,
      totalTrades: trades.length,
      winRate,
      winningTrades,
      losingTrades,
      bestProfit,
      bestPercentage,
    };
  }, [trades]);

  // Determine if this is one of the best trades (only for profitable trades)
  const achievements = useMemo<TradeAchievement[]>(() => {
    if (!latestTrade || latestTrade.pnl <= 0) return []; // Only profitable trades can be "best"

    const achievements: TradeAchievement[] = [];
    const pnlPercent = (latestTrade.pnl / latestTrade.margin) * 100;

    // Best profit ever (only compare with other profitable trades)
    const profitableTrades = trades.filter(t => t.pnl > 0);
    const bestProfitAmongWins = profitableTrades.length > 0
      ? Math.max(...profitableTrades.map((t) => t.pnl))
      : 0;

    if (latestTrade.pnl >= bestProfitAmongWins && profitableTrades.length > 1) {
      achievements.push({
        type: "best_profit",
        label: "Best Profit",
        icon: <Trophy className="w-4 h-4" />,
      });
    }

    // Best percentage ever (only compare with other profitable trades)
    const bestPercentageAmongWins = profitableTrades.length > 0
      ? Math.max(...profitableTrades.map((t) => (t.pnl / t.margin) * 100))
      : 0;

    if (pnlPercent >= bestPercentageAmongWins && profitableTrades.length > 1) {
      achievements.push({
        type: "best_percentage",
        label: "New Best %",
        icon: <Star className="w-4 h-4" />,
      });
    }

    // Big win (100%+ profit)
    if (pnlPercent >= 100) {
      achievements.push({
        type: "big_win",
        label: "Big Win!",
        icon: <Flame className="w-4 h-4" />,
      });
    }

    // High leverage (50x+)
    if (latestTrade.leverage >= 50) {
      achievements.push({
        type: "high_leverage",
        label: "High Roller",
        icon: <Zap className="w-4 h-4" />,
      });
    }

    // Perfect timing (very high % on reasonable leverage)
    if (pnlPercent >= 50 && latestTrade.leverage <= 20) {
      achievements.push({
        type: "perfect_timing",
        label: "Sniper Entry",
        icon: <Target className="w-4 h-4" />,
      });
    }

    return achievements;
  }, [latestTrade, stats, trades]);

  if (!isOpen) return null;

  // If no trades, show empty state
  if (!latestTrade) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />
        <div className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-[var(--shadow-glow-orange)]">
          <div className="p-8 text-center">
            <Trophy className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-black text-white mb-2 font-display uppercase tracking-wider">
              Ready Player One?
            </h2>
            <p className="text-[var(--text-tertiary)] mb-6 text-sm">
              Complete your first trade to unlock your trading stats and achievements.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--warm-yellow)] to-[var(--sunset-orange)] text-black font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,107,53,0.4)]"
            >
              Start Trading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isProfit = latestTrade.pnl >= 0;
  const isLong = latestTrade.direction === "long";
  const pnlPercent = (latestTrade.pnl / latestTrade.margin) * 100;
  const assetSymbol = latestTrade.symbol;

  // Determine performance rating
  const getPerformanceRating = () => {
    if (pnlPercent >= 200) return { label: "GODLIKE", color: "text-[var(--warm-yellow)] drop-shadow-[0_0_10px_rgba(255,190,11,0.8)]" };
    if (pnlPercent >= 100) return { label: "LEGENDARY", color: "text-[var(--warm-yellow)] drop-shadow-[0_0_8px_rgba(255,190,11,0.6)]" };
    if (pnlPercent >= 50) return { label: "EPIC", color: "text-[var(--hot-pink)] drop-shadow-[0_0_8px_rgba(255,0,110,0.6)]" };
    if (pnlPercent >= 20) return { label: "EXCELLENT", color: "text-[var(--color-long)]" };
    if (pnlPercent >= 0) return { label: "GOOD", color: "text-[var(--color-long)]" };
    if (pnlPercent >= -20) return { label: "OKAY", color: "text-[var(--text-secondary)]" };
    return { label: "WASTED", color: "text-[var(--color-short)] drop-shadow-[0_0_8px_rgba(255,0,110,0.4)]" };
  };

  const performance = getPerformanceRating();
  const isBestTrade = achievements.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with intense blur */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal - Gamified Finish Screen */}
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-3xl border border-[var(--border-accent)] overflow-hidden shadow-[var(--shadow-modal)] flex flex-col animate-in zoom-in-95 duration-300">
        {view === "replay" ? (
          <div className="flex flex-col h-[500px]">
            {/* Replay Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
              <h3 className="flex items-center gap-2 text-lg font-black italic text-white uppercase tracking-wider font-display">
                Instant Replay <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </h3>
              <button
                onClick={() => setView("summary")}
                className="text-xs font-bold text-white/50 hover:text-white uppercase tracking-wider transition-colors"
              >
                Close Replay
              </button>
            </div>
            {/* Chart */}
            <div className="flex-1 relative bg-[var(--bg-primary)]">
              <ReplayChart
                data={(latestTrade as TradeRecord).priceHistory || []}
                entryPrice={latestTrade.entryPrice}
                direction={latestTrade.direction}
                leverage={latestTrade.leverage}
                symbol={latestTrade.symbol}
              />
            </div>
          </div>
        ) : (
          <>

            {/* Top Glow Bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${isProfit ? 'from-[var(--warm-yellow)] via-[var(--sunset-orange)] to-[var(--hot-pink)]' : 'from-[var(--deep-purple)] via-[var(--color-short)] to-[var(--deep-purple)]'}`} />

            {/* Header with YELLOW Close Button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={onClose}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-[var(--warm-yellow)]/20 text-[var(--warm-yellow)] hover:bg-[var(--warm-yellow)] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(255,190,11,0.1)] hover:shadow-[0_0_20px_rgba(255,190,11,0.6)]"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Confetti / Particle Effects (CSS only for now) */}
            {isProfit && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            )}

            {/* Main Content */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 pt-6 pb-6">

              <div className="text-center mb-4 relative">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 font-mono text-xs font-bold uppercase tracking-widest shadow-lg ${isProfit
                  ? 'bg-[var(--warm-yellow)]/10 text-[var(--warm-yellow)] border-[var(--warm-yellow)]/30 shadow-[0_0_10px_rgba(255,190,11,0.2)]'
                  : 'bg-[var(--color-short)]/10 text-[var(--color-short)] border-[var(--color-short)]/30 shadow-[0_0_10px_rgba(255,0,110,0.2)]'
                  }`}>
                  {isProfit ? <Trophy className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isProfit ? "Trade Won" : "Trade Lost"}
                </div>

                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className={`bg-clip-text text-transparent bg-gradient-to-b ${isProfit
                    ? 'from-white via-[var(--warm-yellow)] to-[var(--sunset-orange)]'
                    : 'from-white via-[var(--text-tertiary)] to-[var(--text-disabled)]'
                    }`}>
                    {isProfit ? "VICTORY" : "DEFEAT"}
                  </span>
                </h1>

                <p className={`text-xl font-bold tracking-widest uppercase ${performance.color}`} style={{ fontFamily: 'var(--font-display)' }}>
                  {performance.label}
                </p>
              </div>

              {/* Main Card - Hero Stats */}
              <div className="relative mb-4 group">
                <div className={`absolute inset-0 rounded-2xl blur-xl opacity-20 transition-opacity duration-1000 ${isProfit ? 'bg-[var(--warm-yellow)]' : 'bg-[var(--hot-pink)]'
                  }`} />

                <div className={`relative rounded-2xl p-4 border overflow-hidden backdrop-blur-xl ${isProfit
                  ? 'bg-gradient-to-br from-[var(--warm-yellow)]/10 via-[var(--bg-elevated)] to-[var(--bg-elevated)] border-[var(--warm-yellow)]/30'
                  : 'bg-gradient-to-br from-[var(--hot-pink)]/10 via-[var(--bg-elevated)] to-[var(--bg-elevated)] border-[var(--hot-pink)]/30'
                  }`}>
                  {/* Card Header: Asset & Direction */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full blur-md opacity-40 ${isLong ? 'bg-[var(--color-long)]' : 'bg-[var(--color-short)]'}`} />
                        <AssetIcon symbol={assetSymbol} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white tracking-wide">{assetSymbol}-USDC</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isLong
                            ? 'text-[var(--color-long)] border-[var(--color-long)]/30 bg-[var(--color-long)]/10'
                            : 'text-[var(--color-short)] border-[var(--color-short)]/30 bg-[var(--color-short)]/10'
                            }`}>
                            {latestTrade.leverage}x
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`text-right flex items-center gap-2 font-black italic text-lg ${isLong ? 'text-[var(--color-long)]' : 'text-[var(--color-short)]'}`}>
                      {isLong ? "LONG" : "SHORT"}
                      {isLong ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* PnL Display */}
                  <div className="text-center py-2">
                    <div className={`text-5xl md:text-6xl font-black tracking-tight mb-1 font-mono ${isProfit
                      ? 'text-[var(--warm-yellow)] drop-shadow-[0_0_15px_rgba(255,190,11,0.4)]'
                      : 'text-[var(--hot-pink)] drop-shadow-[0_0_15px_rgba(255,0,110,0.4)]'
                      }`}>
                      {isProfit ? "+" : "-"}${Math.abs(latestTrade.pnl).toFixed(2)}
                    </div>
                    <div className={`text-xl font-bold font-mono ${isProfit ? 'text-[var(--warm-yellow)]/80' : 'text-[var(--hot-pink)]/80'}`}>
                      {isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <p className="text-[10px] uppercase text-[var(--text-tertiary)] font-bold tracking-wider mb-1">Entry Price</p>
                  <p className="text-sm font-mono text-white">${latestTrade.entryPrice.toFixed(4)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <p className="text-[10px] uppercase text-[var(--text-tertiary)] font-bold tracking-wider mb-1">Exit Price</p>
                  <p className="text-sm font-mono text-white">${latestTrade.exitPrice.toFixed(4)}</p>
                </div>
              </div>

              {/* Achievements Ribbon */}
              {achievements.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {achievements.map((achievement, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--warm-yellow)]/20 to-[var(--sunset-orange)]/20 border border-[var(--warm-yellow)]/40 shadow-[0_0_10px_rgba(255,190,11,0.1)]"
                      >
                        <div className="text-[var(--warm-yellow)]">{achievement.icon}</div>
                        <span className="text-xs font-bold text-[var(--warm-yellow)] uppercase tracking-wide">
                          {achievement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifetime Stats Mini-Bar */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 border border-white/5 mb-4">
                <div className="text-center">
                  <p className="text-[10px] text-[var(--text-tertiary)]">Total Wins</p>
                  <p className="text-sm font-bold text-white">{stats.winningTrades}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-[var(--text-tertiary)]">Win Rate</p>
                  <p className={`text-sm font-bold ${stats.winRate > 50 ? 'text-[var(--color-long)]' : 'text-[var(--text-secondary)]'}`}>
                    {stats.winRate.toFixed(0)}%
                  </p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-[var(--text-tertiary)]">Total PnL</p>
                  <p className={`text-sm font-bold ${stats.totalPnL >= 0 ? 'text-[var(--color-long)]' : 'text-[var(--color-short)]'}`}>
                    ${stats.totalPnL.toFixed(0)}
                  </p>
                </div>
              </div>

            </div>

            {/* Footer / Action */}
            <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex flex-col gap-3">
              {latestTrade?.priceHistory && latestTrade.priceHistory.length > 0 && (
                <button
                  onClick={() => setView("replay")}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  Watch Replay <Zap className="w-4 h-4 text-[var(--warm-yellow)]" />
                </button>
              )}

              <button
                onClick={onClose}
                className="group w-full relative overflow-hidden px-8 py-3 rounded-xl bg-[var(--accent-primary)] text-black font-black text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,107,53,0.4)] hover:shadow-[0_0_50px_rgba(255,107,53,0.6)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-2">
                  Continue Trading <TrendingUp className="w-5 h-5" />
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TradeHistoryModal;
