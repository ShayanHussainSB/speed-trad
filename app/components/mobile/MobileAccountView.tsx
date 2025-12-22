"use client";

import { useState } from "react";
import {
  Trophy,
  Zap,
  Users,
  Gift,
  Copy,
  Check,
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  Star,
  Sparkles,
  Shield,
  ExternalLink,
  Wallet,
  Settings,
} from "lucide-react";
import { AvatarIcon } from "@/app/components/avatars/AvatarIcon";

interface MobileAccountViewProps {
  isConnected: boolean;
  onConnectWallet: () => void;
  walletAddress: string;
  balance: number;
  balanceUSD: number;
  username?: string;
  avatar?: string;
  stats?: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    rank: number;
    points: number;
  };
  onOpenProfileEdit?: () => void;
}

// Mock data for quests
const MOCK_QUESTS = [
  {
    id: "1",
    title: "First Trade",
    description: "Complete your first trade",
    reward: 50,
    progress: 0,
    target: 1,
    completed: false,
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "2",
    title: "Daily Trader",
    description: "Make 5 trades today",
    reward: 25,
    progress: 2,
    target: 5,
    completed: false,
    icon: <Target className="w-4 h-4" />,
  },
  {
    id: "3",
    title: "Hot Streak",
    description: "Win 3 trades in a row",
    reward: 100,
    progress: 1,
    target: 3,
    completed: false,
    icon: <Flame className="w-4 h-4" />,
  },
];

// Mock leaderboard data
const MOCK_TOP_TRADERS = [
  { rank: 1, username: "speedrunner", points: 12450 },
  { rank: 2, username: "flashtrader", points: 9820 },
  { rank: 3, username: "quickfingers", points: 7650 },
];

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

export function MobileAccountView({
  isConnected,
  onConnectWallet,
  walletAddress,
  balance,
  balanceUSD,
  username,
  avatar = "pepe",
  stats = { totalTrades: 0, winRate: 0, totalPnL: 0, rank: 9999999, points: 0 },
  onOpenProfileEdit,
}: MobileAccountViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "quests" | "referrals">("overview");

  const referralCode = `SPEED-${walletAddress.slice(2, 6).toUpperCase()}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://speedtrad.io/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-[var(--accent-primary)] blur-lg opacity-30 -z-10" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Connect Wallet</h2>
        <p className="text-sm text-[var(--text-tertiary)] mb-6 text-center max-w-[280px]">
          Connect your wallet to view your profile, track your rank, and earn rewards
        </p>
        <button
          onClick={onConnectWallet}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-lg hover:shadow-xl transition-all"
        >
          <Zap className="w-5 h-5" />
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Profile Hero Section */}
      <div className="relative px-4 pt-4 pb-5 bg-gradient-to-b from-[var(--accent-primary)]/10 to-transparent">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-primary)] opacity-15 blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[var(--accent-primary)] shadow-lg">
              <AvatarIcon avatarId={avatar} size={64} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-long)] flex items-center justify-center border-2 border-[var(--bg-primary)]">
              <Check className="w-3 h-3 text-[#050505]" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">
                {username || `user_${walletAddress.slice(2, 8)}`}
              </h2>
              {onOpenProfileEdit && (
                <button
                  onClick={onOpenProfileEdit}
                  className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-tertiary)]">{truncatedAddress}</span>
              <a
                href={`https://solscan.io/account/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)]"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">{formatRank(stats.rank)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">{formatPoints(stats.points)} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="mt-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">${balanceUSD.toFixed(2)}</p>
              <p className="text-sm text-[var(--text-tertiary)] font-mono">{balance.toFixed(4)} SOL</p>
            </div>
            <button className="px-4 py-2.5 rounded-xl bg-[var(--color-long)] text-[#050505] font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-primary)] z-10">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-secondary)]">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "quests", label: "Quests", icon: Zap },
            { id: "referrals", label: "Refer", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSection === tab.id
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 py-4">
        {activeSection === "overview" && (
          <div className="space-y-4">
            {/* Trading Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span className="text-xs text-[var(--text-tertiary)]">Trades</span>
                </div>
                <p className="text-lg font-bold text-[var(--text-primary)]">{stats.totalTrades}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[var(--color-long)]" />
                  <span className="text-xs text-[var(--text-tertiary)]">Win Rate</span>
                </div>
                <p className={`text-lg font-bold ${stats.winRate >= 50 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                  {stats.winRate.toFixed(1)}%
                </p>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-tertiary)]">Total PnL</span>
                  <span className={`text-lg font-bold font-mono ${stats.totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                    {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Leaderboard Position */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">Leaderboard</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-[var(--accent-primary)] font-medium">
                  View All
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top 3 */}
              <div className="space-y-2 mb-3">
                {MOCK_TOP_TRADERS.map((trader, index) => {
                  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                  return (
                    <div key={trader.rank} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-black"
                        style={{ backgroundColor: rankColors[index] }}
                      >
                        {trader.rank}
                      </div>
                      <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{trader.username}</span>
                      <span className="text-xs font-bold font-mono text-[var(--color-long)]">{formatPoints(trader.points)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Your Position */}
              <div className="relative p-3 rounded-xl border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/5">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-[var(--accent-primary)]">
                    <AvatarIcon avatarId={avatar} size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[var(--accent-primary)] text-white">YOU</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{username || "You"}</span>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">{formatRank(stats.rank)}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-[var(--color-long)]">{formatPoints(stats.points)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "quests" && (
          <div className="space-y-3">
            {/* Quest Progress */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-tertiary)] uppercase font-medium">Daily Progress</span>
                <span className="text-sm font-bold text-[var(--accent-primary)]">0/{MOCK_QUESTS.length}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]" style={{ width: "0%" }} />
              </div>
            </div>

            {/* Quest List */}
            {MOCK_QUESTS.map((quest) => {
              const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
              return (
                <div key={quest.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                      {quest.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{quest.title}</span>
                        <div className="flex items-center gap-1 text-[#FFD700]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold">+{quest.reward}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-2">{quest.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--accent-primary)]"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums">{quest.progress}/{quest.target}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSection === "referrals" && (
          <div className="space-y-4">
            {/* Referral Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">3</p>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Referrals</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                <p className="text-lg font-bold text-[#FFD700]">150</p>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Pending</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                <p className="text-lg font-bold text-[var(--color-long)]">450</p>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase">Earned</p>
              </div>
            </div>

            {/* Referral Link Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-[var(--accent-primary)]" />
                <span className="text-sm font-bold text-[var(--text-primary)]">Your Referral Link</span>
              </div>

              <p className="text-sm text-[var(--text-tertiary)] mb-4">
                Share your link and earn <span className="text-[#FFD700] font-bold">10%</span> of your friends' trading fees forever!
              </p>

              <button
                onClick={handleCopyReferral}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  copied
                    ? "bg-[var(--color-long)] text-white"
                    : "bg-[var(--accent-primary)] text-white hover:opacity-90"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Referral Link
                  </>
                )}
              </button>

              <div className="mt-3 text-center">
                <span className="text-xs text-[var(--text-tertiary)]">Code: </span>
                <span className="text-sm font-mono font-bold text-[var(--accent-primary)]">{referralCode}</span>
              </div>
            </div>

            {/* How it works */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase mb-3">How it works</p>
              <div className="space-y-3">
                {[
                  "Share your unique referral link",
                  "Friend signs up & makes first trade",
                  "You both earn bonus points!",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--accent-primary)]">{i + 1}</span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileAccountView;
