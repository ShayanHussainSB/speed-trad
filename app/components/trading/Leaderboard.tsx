"use client";

import { useState } from "react";
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Flame,
  Zap,
  Target,
  ChevronUp,
  Sparkles,
} from "lucide-react";

type TimePeriod = "24h" | "7d" | "30d" | "all";

interface Trader {
  rank: number;
  username: string;
  points: number;
  pnl: number;
  winRate: number;
  trades: number;
  isYou?: boolean;
}

// Mock data with extended stats
const MOCK_TRADERS: Record<TimePeriod, Trader[]> = {
  "24h": [
    { rank: 1, username: "speedrunner", points: 12450, pnl: 8420, winRate: 89, trades: 47 },
    { rank: 2, username: "flashtrader", points: 9820, pnl: 5230, winRate: 82, trades: 38 },
    { rank: 3, username: "quickfingers", points: 7650, pnl: 3890, winRate: 78, trades: 52 },
    { rank: 4, username: "momentum_king", points: 5430, pnl: 2150, winRate: 71, trades: 29 },
    { rank: 5, username: "scalp_master", points: 4890, pnl: 1920, winRate: 68, trades: 64 },
    { rank: 6, username: "degen_andy", points: 3920, pnl: 1450, winRate: 65, trades: 41 },
    { rank: 7, username: "sol_whale", points: 3210, pnl: 980, winRate: 62, trades: 23 },
  ],
  "7d": [
    { rank: 1, username: "taichimaster", points: 178167, pnl: 89420, winRate: 76, trades: 234 },
    { rank: 2, username: "jellyfish", points: 81304, pnl: 42150, winRate: 72, trades: 189 },
    { rank: 3, username: "wabo", points: 39320, pnl: 21890, winRate: 69, trades: 156 },
    { rank: 4, username: "user_0x5444", points: 35315, pnl: 18230, winRate: 67, trades: 142 },
    { rank: 5, username: "tothemoonxxx", points: 35234, pnl: 17890, winRate: 65, trades: 198 },
    { rank: 6, username: "minebuu", points: 32607, pnl: 15420, winRate: 63, trades: 167 },
    { rank: 7, username: "user_0xc60a", points: 29014, pnl: 12890, winRate: 61, trades: 134 },
  ],
  "30d": [
    { rank: 1, username: "legend_whale", points: 892450, pnl: 425000, winRate: 74, trades: 1247 },
    { rank: 2, username: "taichimaster", points: 678320, pnl: 312500, winRate: 71, trades: 987 },
    { rank: 3, username: "diamondhands", points: 445890, pnl: 198000, winRate: 68, trades: 756 },
    { rank: 4, username: "jellyfish", points: 389420, pnl: 167500, winRate: 66, trades: 823 },
    { rank: 5, username: "sol_maxi", points: 312780, pnl: 142000, winRate: 64, trades: 698 },
    { rank: 6, username: "perp_god", points: 287650, pnl: 125000, winRate: 62, trades: 654 },
    { rank: 7, username: "wabo", points: 245320, pnl: 108000, winRate: 60, trades: 589 },
  ],
  "all": [
    { rank: 1, username: "og_trader", points: 4892450, pnl: 2125000, winRate: 72, trades: 8924 },
    { rank: 2, username: "legend_whale", points: 3678320, pnl: 1562500, winRate: 70, trades: 7234 },
    { rank: 3, username: "taichimaster", points: 2445890, pnl: 998000, winRate: 68, trades: 5678 },
    { rank: 4, username: "early_degen", points: 1989420, pnl: 867500, winRate: 66, trades: 6123 },
    { rank: 5, username: "diamondhands", points: 1712780, pnl: 742000, winRate: 65, trades: 5432 },
    { rank: 6, username: "sol_maxi", points: 1487650, pnl: 625000, winRate: 63, trades: 4987 },
    { rank: 7, username: "perp_god", points: 1245320, pnl: 508000, winRate: 61, trades: 4234 },
  ],
};

interface LeaderboardProps {
  userRank?: number;
  userPoints?: number;
  userPnl?: number;
  userWinRate?: number;
  walletAddress?: string;
}

// Get trader tier based on points
const getTraderTier = (points: number): { tier: string; color: string; icon: React.ReactNode } => {
  if (points >= 1000000) return { tier: "WHALE", color: "#FFD700", icon: <Crown className="w-3 h-3" /> };
  if (points >= 500000) return { tier: "SHARK", color: "#9945FF", icon: <Sparkles className="w-3 h-3" /> };
  if (points >= 100000) return { tier: "DOLPHIN", color: "#00FFA3", icon: <Zap className="w-3 h-3" /> };
  if (points >= 10000) return { tier: "FISH", color: "#00D4AA", icon: <Target className="w-3 h-3" /> };
  return { tier: "SHRIMP", color: "#FF9966", icon: <Flame className="w-3 h-3" /> };
};

// Format large numbers
const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
};

const formatPnL = (pnl: number): string => {
  if (pnl >= 1000000) return `$${(pnl / 1000000).toFixed(1)}M`;
  if (pnl >= 1000) return `$${(pnl / 1000).toFixed(1)}K`;
  return `$${pnl.toLocaleString()}`;
};

const formatRank = (rank: number): string => {
  if (rank >= 1000000) return `${Math.floor(rank / 1000000)}M+`;
  if (rank >= 1000) return `${Math.floor(rank / 1000)}K+`;
  return rank.toLocaleString();
};

export function Leaderboard({
  userRank = 9999999,
  userPoints = 0,
  userPnl: _userPnl = 0,
  userWinRate: _userWinRate = 0,
  walletAddress = "0x2e50ffd0",
}: LeaderboardProps) {
  // These props are for future use
  void _userPnl;
  void _userWinRate;
  const [period, setPeriod] = useState<TimePeriod>("7d");

  const traders = MOCK_TRADERS[period];
  const top3 = traders.slice(0, 3);
  const rest = traders.slice(3);

  const truncateUsername = (name: string, maxLen: number = 12): string => {
    if (name.length <= maxLen) return name;
    return name.slice(0, maxLen) + "...";
  };

  // Calculate progress to next rank
  const nextRankPoints = traders.find(t => t.rank === Math.max(1, userRank - 1))?.points || 0;
  const progressToNext = nextRankPoints > 0 ? Math.min((userPoints / nextRankPoints) * 100, 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-[#FFD700]" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)]">
            Top Traders
          </h2>
        </div>

        {/* Time Period Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-secondary)]">
          {(["24h", "7d", "30d", "all"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                period === p
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {p === "all" ? "All" : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Podium - Top 3 */}
      <div className="px-3 py-4 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-secondary)]/50 to-transparent">
        <div className="flex items-end justify-center gap-2">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-[72px]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C0C0C0] to-[#8A8A8A] flex items-center justify-center mb-1 shadow-lg">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-bold text-[var(--text-primary)] truncate w-full text-center">
              {truncateUsername(top3[1]?.username || "", 8)}
            </p>
            <p className="text-[9px] font-mono text-[var(--color-long)] tabular-nums">
              {formatPoints(top3[1]?.points || 0)}
            </p>
            <div className="mt-1 h-12 w-full rounded-t-lg bg-[#C0C0C0]/20 border-t-2 border-[#C0C0C0] flex items-center justify-center">
              <span className="text-lg font-black text-[#C0C0C0]">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-[80px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center mb-1 shadow-lg shadow-[#FFD700]/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD700] flex items-center justify-center animate-pulse">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)] truncate w-full text-center">
              {truncateUsername(top3[0]?.username || "", 10)}
            </p>
            <p className="text-[10px] font-mono text-[var(--color-long)] font-bold tabular-nums">
              {formatPoints(top3[0]?.points || 0)}
            </p>
            <div className="mt-1 h-16 w-full rounded-t-lg bg-[#FFD700]/20 border-t-2 border-[#FFD700] flex items-center justify-center">
              <span className="text-2xl font-black text-[#FFD700]">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-[72px]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CD7F32] to-[#8B4513] flex items-center justify-center mb-1 shadow-lg">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-bold text-[var(--text-primary)] truncate w-full text-center">
              {truncateUsername(top3[2]?.username || "", 8)}
            </p>
            <p className="text-[9px] font-mono text-[var(--color-long)] tabular-nums">
              {formatPoints(top3[2]?.points || 0)}
            </p>
            <div className="mt-1 h-8 w-full rounded-t-lg bg-[#CD7F32]/20 border-t-2 border-[#CD7F32] flex items-center justify-center">
              <span className="text-base font-black text-[#CD7F32]">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Position Card */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {walletAddress.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  user_{walletAddress.slice(0, 8)}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[var(--accent-primary)] text-white">
                  You
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Rank #{formatRank(userRank)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold font-mono text-[var(--color-long)] tabular-nums">
              {formatPoints(userPoints)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)]">points</p>
          </div>
        </div>

        {/* Progress to next rank */}
        {userRank > 1 && (
          <div>
            <div className="flex items-center justify-between text-[9px] mb-1">
              <span className="text-[var(--text-tertiary)]">Progress to #{userRank - 1}</span>
              <div className="flex items-center gap-1 text-[var(--accent-primary)]">
                <ChevronUp className="w-3 h-3" />
                <span className="font-bold tabular-nums">{progressToNext.toFixed(0)}%</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Rest of Leaderboard */}
      <div className="flex-1 overflow-y-auto">
        {rest.map((trader) => {
          const tier = getTraderTier(trader.points);
          const isProfitable = trader.pnl > 0;

          return (
            <div
              key={trader.rank}
              className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]/50 transition-colors"
            >
              {/* Rank */}
              <span className="w-6 text-center text-xs font-bold text-[var(--text-tertiary)] tabular-nums">
                {trader.rank}
              </span>

              {/* Avatar & Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {truncateUsername(trader.username)}
                  </span>
                  {/* Tier Badge */}
                  <span
                    className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-black shrink-0"
                    style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                  >
                    {tier.icon}
                    {tier.tier}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-mono tabular-nums ${
                    isProfitable ? "text-[var(--color-long)]" : "text-[var(--color-short)]"
                  }`}>
                    {isProfitable ? "+" : ""}{formatPnL(trader.pnl)}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {trader.winRate}% WR
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-long)]" />
                  <span className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
                    {formatPoints(trader.points)}
                  </span>
                </div>
                <p className="text-[9px] text-[var(--text-tertiary)]">
                  {trader.trades} trades
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[var(--text-tertiary)]">
            Top {period === "all" ? "All Time" : period.toUpperCase()} Traders
          </span>
          <div className="flex items-center gap-1 text-[var(--color-long)]">
            <TrendingUp className="w-3 h-3" />
            <span className="font-bold">Live Rankings</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
