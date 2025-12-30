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
    <div className="flex flex-col h-full bg-black/40">
      {/* Control Strip - Sharp & Technical Technical Mode */}
      <div className="flex flex-col border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between px-4 py-2 opacity-50">
          <div className="flex items-center gap-2">
            <Trophy className="w-3 h-3 text-white" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">RANKING_SYSTEM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-[var(--color-long)] animate-pulse" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">LIVE_FEED</span>
          </div>
        </div>

        {/* Time Period Strips - Minimal & Compact */}
        <div className="flex items-center px-2 pb-2 gap-1">
          {(["24h", "7d", "30d", "all"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                flex-1 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all
                ${period === p
                  ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                  : "text-white/30 hover:text-white"
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Hall of Fame Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
        {traders.map((trader) => {
          const isTop3 = trader.rank <= 3;

          return (
            <div
              key={trader.rank}
              className="group flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]"
            >
              {/* Rank Position */}
              <div className="w-6 shrink-0 flex justify-center">
                <span className={`text-[12px] font-black font-mono tracking-tighter ${isTop3 ? "text-white" : "text-white/20"}`}>
                  {trader.rank.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Identity Module */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[var(--accent-primary)]/40 transition-all">
                  <span className="text-[9px] font-black text-white/40 uppercase">
                    {trader.username.slice(0, 2)}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-black text-white uppercase tracking-wider truncate group-hover:text-[var(--accent-primary)] transition-colors">
                    {trader.username}
                  </span>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">
                    {trader.trades} TRADES
                  </span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="text-right shrink-0">
                <div className="flex flex-col">
                  <span className="text-[12px] font-black font-mono text-[var(--color-long)] tracking-tighter">
                    {formatPoints(trader.points)}
                  </span>
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-0.5">
                    {trader.winRate}% WR
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Terminal Section */}
      <div className="mt-auto border-t border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/[0.03]">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-sm bg-black border border-[var(--accent-primary)]/50 overflow-hidden">
                  <AvatarIcon avatarId={userAvatar} size={40} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-long)] border-2 border-black" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-black text-white uppercase tracking-wider">
                    {username || `user_${walletAddress.slice(2, 6)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">GLOBAL_RANK</span>
                  <span className="text-[11px] font-black font-mono text-white tracking-tighter">
                    {formatRank(userRank)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[18px] font-black font-mono text-[var(--color-long)] tracking-tighter block leading-none">
                {formatPoints(userPoints)}
              </span>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 block">AGGREGATE_POINTS</span>
            </div>
          </div>

          {/* Advancement Protocol */}
          {userRank > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">ADVANCEMENT_PROTOCOL</span>
                <span className="text-[10px] font-black font-mono text-[var(--accent-primary)] tracking-tighter">{progressToNext.toFixed(1)}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-primary)] shadow-[0_0_10px_rgba(0,245,160,0.5)]"
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
