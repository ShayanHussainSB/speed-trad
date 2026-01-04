"use client";

import { useState } from "react";
import { Trophy, Clock, Zap } from "lucide-react";
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
  isLoading?: boolean;
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

  if (isLoading) {
    return <LeaderboardSkeleton count={7} />;
  }

  const nextRankPoints = traders.find((t) => t.rank === Math.max(1, userRank - 1))?.points || 0;
  const progressToNext = nextRankPoints > 0 ? Math.min((userPoints / nextRankPoints) * 100, 100) : 0;

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Time Period Strips - Minimal & Compact */}
      <div className="flex items-center p-2 gap-1 border-b border-white/5 bg-white/[0.01]">
        {(["24h", "7d", "30d", "all"] as TimePeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`
              flex-1 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all
              ${period === p
                ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 shadow-[0_0_10px_rgba(255,107,53,0.1)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5"
              }
            `}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-[40px_1fr_90px] px-4 py-2 bg-white/[0.02] border-b border-white/[0.05]">
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Rank</span>
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Trader</span>
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Points</span>
      </div>

      {/* Hall of Fame Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {traders.map((trader) => {
          const isTop3 = trader.rank <= 3;

          return (
            <div
              key={trader.rank}
              className={`
                grid grid-cols-[40px_1fr_90px] items-center px-4 py-3 border-b border-white/5 transition-all
                ${isTop3 ? 'bg-[var(--accent-primary)]/[0.02]' : 'hover:bg-white/[0.02]'}
              `}
            >
              {/* Rank */}
              <div className="flex justify-start">
                <span className={`
                  text-sm font-black font-display tracking-tight
                  ${trader.rank === 1 ? 'text-[var(--color-long)] drop-shadow-[0_0_8px_rgba(255,190,11,0.3)]' :
                    trader.rank === 2 ? 'text-[var(--text-secondary)]' :
                      trader.rank === 3 ? 'text-[var(--accent-primary)]' :
                        'text-[var(--text-muted)]'}
                `}>
                  {trader.rank.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Username + Meta */}
              <div className="flex flex-col min-w-0 pr-2">
                <span className={`text-sm font-bold uppercase tracking-wide truncate ${isTop3 ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                  {trader.username}
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {trader.trades} RACES
                </span>
              </div>

              {/* Points */}
              <div className="flex flex-col items-end">
                <span className="text-sm font-black font-mono text-[var(--color-long)] drop-shadow-[0_0_8px_rgba(255,190,11,0.2)]">
                  {trader.points.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {trader.winRate}% WR
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Terminal Section */}
      <div className="mt-auto border-t border-[var(--accent-primary)]/30 bg-gradient-to-b from-[var(--bg-elevated)] to-black">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-10 h-10 rounded bg-black border border-[var(--accent-primary)]/30 overflow-hidden group-hover:border-[var(--accent-primary)] transition-all">
                  <AvatarIcon avatarId={userAvatar} size={40} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--color-long)] border-2 border-black animate-pulse shadow-[0_0_8px_var(--color-long)]" />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  {username || `PILOT_${walletAddress.slice(2, 6)}`}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">POSITION</span>
                  <span className="text-[11px] font-black font-display text-[var(--accent-primary)]">
                    {formatRank(userRank)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">XP POINTS</span>
              <span className="text-xl font-black font-mono text-[var(--color-long)] leading-none drop-shadow-[0_0_12px_rgba(255,190,11,0.4)]">
                {userPoints.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {userRank > 1 && (
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Advancement</span>
                <span className="text-[10px] font-black font-mono text-[var(--accent-primary)]">{progressToNext.toFixed(1)}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--color-long)] shadow-[0_0_10px_rgba(255,107,53,0.3)] transition-all duration-1000"
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
