"use client";

import { useState } from "react";
import { Trophy, TrendingUp, ChevronUp, Sparkles } from "lucide-react";
import { AvatarIcon } from "@/app/components/avatars/AvatarIcon";
import { LeaderboardSkeleton } from "@/app/components/ui/Skeleton";

type TimePeriod = "24h" | "7d" | "30d" | "all";

interface Trader {
  rank: number;
  username: string;
  points: number;
  pnl: number;
  winRate: number;
  trades: number;
}

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
  all: [
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
  walletAddress?: string;
  userAvatar?: string;
  username?: string;
  isLoading?: boolean; // "Loading the hall of fame (and shame)..."
}

const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
};

const formatRank = (rank: number): string => {
  if (rank >= 1000000) return `${Math.floor(rank / 1000000)}M+`;
  if (rank >= 1000) return `${Math.floor(rank / 1000)}K+`;
  return `#${rank.toLocaleString()}`;
};

export function Leaderboard({
  userRank = 9999999,
  userPoints = 0,
  walletAddress = "0x2e50ffd0",
  userAvatar = "pepe",
  username,
  isLoading = false,
}: LeaderboardProps) {
  const [period, setPeriod] = useState<TimePeriod>("7d");
  const traders = MOCK_TRADERS[period];

  // Loading state - "Ranking degens by PnL..."
  if (isLoading) {
    return <LeaderboardSkeleton count={7} />;
  }

  const nextRankPoints = traders.find((t) => t.rank === Math.max(1, userRank - 1))?.points || 0;
  const progressToNext = nextRankPoints > 0 ? Math.min((userPoints / nextRankPoints) * 100, 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#FFD700]" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
              Leaderboard
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[var(--color-long)]">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[9px] font-medium">Live</span>
          </div>
        </div>

        {/* Time Period Tabs - Compact */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-[var(--bg-secondary)]">
          {(["24h", "7d", "30d", "all"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                period === p
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Trader List - Simplified */}
      <div className="flex-1 overflow-y-auto">
        {traders.map((trader, index) => {
          const isTop3 = trader.rank <= 3;
          const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

          return (
            <div
              key={trader.rank}
              className={`flex items-center gap-2 px-3 py-2 border-b border-[var(--border-subtle)]/50 hover:bg-[var(--bg-secondary)]/30 transition-colors ${
                isTop3 ? "bg-[var(--bg-secondary)]/20" : ""
              }`}
            >
              {/* Rank */}
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  isTop3 ? "text-black" : "text-[var(--text-tertiary)] bg-transparent"
                }`}
                style={isTop3 ? { backgroundColor: rankColors[index] } : undefined}
              >
                {trader.rank}
              </div>

              {/* Avatar & Name */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-white uppercase">
                    {trader.username.slice(0, 2)}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[var(--text-primary)] truncate">
                  {trader.username}
                </span>
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold font-mono text-[var(--color-long)] tabular-nums">
                  {formatPoints(trader.points)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your Position - Enhanced with glow */}
      <div className="relative px-3 py-3 border-t-2 border-[var(--accent-primary)]">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-primary)]/15 via-[var(--accent-primary)]/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent shadow-[0_0_10px_var(--accent-primary)]" />

        <div className="relative">
          {/* Header with YOU badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Avatar with glow ring */}
              <div className="relative">
                <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-[var(--accent-primary)] shadow-[0_0_12px_rgba(var(--accent-primary-rgb),0.4)]">
                  <AvatarIcon avatarId={userAvatar} size={32} />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-long)] border-2 border-[var(--bg-card)]" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  {/* YOU Badge */}
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[var(--accent-primary)] text-white shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.5)]">
                    YOU
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--text-primary)] truncate max-w-[100px] sm:max-w-[80px]">
                    {username || `user_${walletAddress.slice(2, 6)}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[var(--accent-primary)]" />
                  <span className="text-[9px] font-bold text-[var(--text-tertiary)]">{formatRank(userRank)}</span>
                </div>
              </div>
            </div>

            {/* Points display */}
            <div className="text-right">
              <span className="text-sm font-bold font-mono text-[var(--color-long)] tabular-nums">
                {formatPoints(userPoints)}
              </span>
              <span className="text-[9px] text-[var(--text-tertiary)] ml-1">pts</span>
            </div>
          </div>

          {/* Progress to next rank */}
          {userRank > 1 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-wide">Progress to next rank</span>
                <div className="flex items-center gap-0.5 text-[var(--accent-primary)]">
                  <ChevronUp className="w-2.5 h-2.5" />
                  <span className="text-[9px] font-bold tabular-nums">{progressToNext.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-[0_0_6px_var(--accent-primary)]"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
