"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  Sparkles,
  Trophy,
  TrendingUp,
  Flame,
  Users,
  Target,
  Zap,
  Crown,
  Gem,
  Star,
  Gift,
  Clock,
  ChevronRight,
  ExternalLink,
  Rocket,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/app/utils/cn";
import type { Quest, RewardsData } from "@/app/hooks/useRewards";

/**
 * REWARDS MODAL
 * -------------
 * "Your grind stats, anon. The numbers don't lie."
 *
 * Full rewards dashboard showing:
 * - Points overview (weekly + total)
 * - Volume traded stats
 * - Referral section with copy link
 * - Tasks/Quests with progress
 */

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardsData: RewardsData;
  tierProgress: number;
  copyReferralCode: () => Promise<boolean>;
}

// Tier styling config
const TIER_CONFIG = {
  bronze: {
    color: "#CD7F32",
    bgColor: "rgba(205, 127, 50, 0.15)",
    borderColor: "rgba(205, 127, 50, 0.3)",
    icon: Star,
    name: "Noob",
    nextName: "Ape",
  },
  silver: {
    color: "#C0C0C0",
    bgColor: "rgba(192, 192, 192, 0.15)",
    borderColor: "rgba(192, 192, 192, 0.3)",
    icon: Zap,
    name: "Ape",
    nextName: "Degen",
  },
  gold: {
    color: "#FFD700",
    bgColor: "rgba(255, 215, 0, 0.15)",
    borderColor: "rgba(255, 215, 0, 0.3)",
    icon: Trophy,
    name: "Degen",
    nextName: "Chad",
  },
  platinum: {
    color: "#E5E4E2",
    bgColor: "rgba(229, 228, 226, 0.15)",
    borderColor: "rgba(229, 228, 226, 0.4)",
    icon: Gem,
    name: "Chad",
    nextName: "Gigachad",
  },
  diamond: {
    color: "#B9F2FF",
    bgColor: "rgba(185, 242, 255, 0.15)",
    borderColor: "rgba(185, 242, 255, 0.4)",
    icon: Gem,
    name: "Gigachad",
    nextName: "Legend",
  },
  legendary: {
    color: "#FF2D92",
    bgColor: "rgba(255, 45, 146, 0.15)",
    borderColor: "rgba(255, 45, 146, 0.4)",
    icon: Crown,
    name: "Legend",
    nextName: null,
  },
};

// Quest icon mapping
const QUEST_ICONS = {
  volume: TrendingUp,
  streak: Flame,
  trades: Target,
  invite: Users,
  pnl: Trophy,
  leverage: Zap,
};

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

// Format currency
const formatCurrency = (num: number): string => {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
};

// Time remaining formatter
const formatTimeRemaining = (date?: Date): string => {
  if (!date) return "";
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return "< 1h left";
};

// Quest card component
function QuestCard({ quest }: { quest: Quest }) {
  const IconComponent = QUEST_ICONS[quest.icon];
  const progress = (quest.progress / quest.target) * 100;
  const isCompleted = quest.completed;
  const timeLeft = formatTimeRemaining(quest.expiresAt);

  return (
    <div
      className={cn(
        "relative p-3 rounded-xl border transition-all",
        isCompleted
          ? "bg-[var(--color-long)]/10 border-[var(--color-long)]/30"
          : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30"
      )}
    >
      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-long)] flex items-center justify-center">
          <Check className="w-3 h-3 text-[#050505]" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            isCompleted
              ? "bg-[var(--color-long)]/20"
              : "bg-[var(--accent-primary)]/10"
          )}
        >
          <IconComponent
            className={cn(
              "w-4 h-4",
              isCompleted
                ? "text-[var(--color-long)]"
                : "text-[var(--accent-primary)]"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {quest.title}
            </h4>
            {/* Type badge */}
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                quest.type === "daily" && "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]",
                quest.type === "weekly" && "bg-[#8B5CF6]/20 text-[#8B5CF6]",
                quest.type === "milestone" && "bg-[#FFD700]/20 text-[#FFD700]",
                quest.type === "referral" && "bg-[var(--color-long)]/20 text-[var(--color-long)]"
              )}
            >
              {quest.type}
            </span>
          </div>

          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            {quest.description}
          </p>

          {/* Progress bar */}
          {!isCompleted && (
            <div className="mb-1.5">
              <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">
              {isCompleted
                ? "Completed"
                : `${formatNumber(quest.progress)} / ${formatNumber(quest.target)}`}
            </span>

            <div className="flex items-center gap-2">
              {timeLeft && !isCompleted && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-tertiary)]">
                  <Clock className="w-3 h-3" />
                  {timeLeft}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-long)]">
                <Sparkles className="w-3 h-3" />
                +{formatNumber(quest.reward)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RewardsModal({
  isOpen,
  onClose,
  rewardsData,
  tierProgress,
  copyReferralCode,
}: RewardsModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"quests" | "referrals">("quests");

  if (!isOpen) return null;

  const tierConfig = TIER_CONFIG[rewardsData.tier];
  const TierIcon = tierConfig.icon;
  const isFreshAccount = rewardsData.isFreshAccount;

  const handleCopyReferral = async () => {
    const success = await copyReferralCode();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter quests
  const activeQuests = rewardsData.quests.filter((q) => !q.completed);
  const completedQuests = rewardsData.quests.filter((q) => q.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - "The void calls..." */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - "The gains dashboard" */}
      <div
        className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 animate-scale-in flex flex-col"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isFreshAccount && "animate-pulse"
              )}
              style={{ background: tierConfig.bgColor, border: `1px solid ${tierConfig.borderColor}` }}
            >
              <TierIcon className="w-6 h-6" style={{ color: tierConfig.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {isFreshAccount ? "Welcome, Anon" : "Rewards"}
                </h2>
                <span
                  className="px-2 py-0.5 rounded-lg text-xs font-bold"
                  style={{
                    background: tierConfig.bgColor,
                    color: tierConfig.color,
                    border: `1px solid ${tierConfig.borderColor}`,
                  }}
                >
                  {tierConfig.name}
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                {rewardsData.rank !== null
                  ? `Rank #${rewardsData.rank.toLocaleString()} globally`
                  : "Start trading to get ranked"}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Fresh Account Welcome Banner */}
          {isFreshAccount && (
            <div className="px-4 sm:px-6 py-4 border-b border-[var(--border-subtle)]">
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 via-[var(--accent-secondary)]/10 to-[var(--color-long)]/10 border border-[var(--accent-primary)]/20 overflow-hidden">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-[var(--accent-primary)]/30 animate-pulse" />
                  <div className="absolute bottom-3 left-6 w-1.5 h-1.5 rounded-full bg-[var(--color-long)]/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-[var(--accent-secondary)]/30 animate-pulse" style={{ animationDelay: "1s" }} />
                </div>

                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                      GM Anon, Your Journey Begins
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                      Complete starter quests to earn your first points. Every degen legend started with their first trade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Points Overview - "The bag status" */}
          <div className="px-4 sm:px-6 py-4 border-b border-[var(--border-subtle)]">
            <div className="grid grid-cols-2 gap-3">
              {/* Total Points */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
                <p className="text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-1">
                  Total Points
                </p>
                <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                  {isFreshAccount ? "0" : formatNumber(rewardsData.totalPoints)}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {isFreshAccount ? "Start trading to earn" : "Lifetime grind"}
                </p>
              </div>

              {/* Weekly Points */}
              <div className={cn(
                "p-3 rounded-xl border",
                isFreshAccount
                  ? "bg-[var(--bg-secondary)] border-[var(--border-subtle)]"
                  : "bg-[var(--color-long)]/10 border-[var(--color-long)]/20"
              )}>
                <p className="text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-1">
                  This Week
                </p>
                <p className={cn(
                  "text-2xl font-bold font-mono",
                  isFreshAccount ? "text-[var(--text-tertiary)]" : "text-[var(--color-long)]"
                )}>
                  {isFreshAccount ? "—" : `+${formatNumber(rewardsData.weeklyPoints)}`}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {isFreshAccount ? "Make your first trade" : "Keep grinding anon"}
                </p>
              </div>
            </div>

            {/* Tier Progress - "The climb to chad status" */}
            {tierConfig.nextName && (
              <div className="mt-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Progress to <span className="font-bold" style={{ color: tierConfig.color }}>{tierConfig.nextName}</span>
                  </span>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {formatNumber(rewardsData.totalPoints)} / {formatNumber(rewardsData.nextTierPoints)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${tierProgress}%`,
                      background: `linear-gradient(90deg, ${tierConfig.color}, var(--accent-secondary))`,
                    }}
                  />
                </div>
                {isFreshAccount && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-2 text-center">
                    Earn {formatNumber(rewardsData.nextTierPoints)} points to rank up
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Volume Stats - "Your degen numbers" */}
          <div className="px-4 sm:px-6 py-4 border-b border-[var(--border-subtle)]">
            <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-3">
              Volume Traded
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">Today</p>
                <p className={cn(
                  "text-sm font-bold font-mono",
                  isFreshAccount ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
                )}>
                  {isFreshAccount ? "$0" : formatCurrency(rewardsData.dailyVolume)}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">This Week</p>
                <p className={cn(
                  "text-sm font-bold font-mono",
                  isFreshAccount ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
                )}>
                  {isFreshAccount ? "$0" : formatCurrency(rewardsData.weeklyVolume)}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">All Time</p>
                <p className={cn(
                  "text-sm font-bold font-mono",
                  isFreshAccount ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
                )}>
                  {isFreshAccount ? "$0" : formatCurrency(rewardsData.totalVolume)}
                </p>
              </div>
            </div>

            {/* Streak indicator */}
            <div className={cn(
              "mt-3 flex items-center justify-between p-2.5 rounded-xl border",
              isFreshAccount
                ? "bg-[var(--bg-secondary)] border-[var(--border-subtle)]"
                : "bg-gradient-to-r from-[#FF6B35]/10 to-[#F7C548]/10 border-[#FF6B35]/20"
            )}>
              <div className="flex items-center gap-2">
                <Flame className={cn("w-4 h-4", isFreshAccount ? "text-[var(--text-tertiary)]" : "text-[#FF6B35]")} />
                <span className="text-xs text-[var(--text-secondary)]">
                  Trading Streak
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isFreshAccount ? (
                  <span className="text-sm text-[var(--text-tertiary)]">
                    No streak yet
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-bold text-[#FF6B35]">
                      {rewardsData.currentStreak} days
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      Best: {rewardsData.longestStreak}d
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs - Quests vs Referrals */}
          <div className="px-4 sm:px-6 pt-4">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-secondary)]">
              <button
                onClick={() => setActiveTab("quests")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === "quests"
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Target className="w-4 h-4" />
                  Quests
                  {activeQuests.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-bold">
                      {activeQuests.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("referrals")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === "referrals"
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Referrals
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-4 sm:px-6 py-4">
            {activeTab === "quests" ? (
              <div className="space-y-3">
                {/* Active Quests */}
                {activeQuests.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                      Active ({activeQuests.length})
                    </p>
                    {activeQuests.map((quest) => (
                      <QuestCard key={quest.id} quest={quest} />
                    ))}
                  </>
                )}

                {/* Completed Quests */}
                {completedQuests.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mt-4">
                      Completed Today
                    </p>
                    {completedQuests.map((quest) => (
                      <QuestCard key={quest.id} quest={quest} />
                    ))}
                  </>
                )}

                {/* Empty state */}
                {rewardsData.quests.length === 0 && (
                  <div className="py-8 text-center">
                    <Gift className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-[var(--text-tertiary)]">
                      No quests available rn, fren
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      Check back soon for more grinding opportunities
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Referrals Tab */
              <div className="space-y-4">
                {/* Referral Link Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
                  <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-2">
                    Your Referral Link
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] font-mono text-sm text-[var(--text-secondary)] truncate">
                      speedtrad.io/ref/{rewardsData.referral.code}
                    </div>
                    <button
                      onClick={handleCopyReferral}
                      className={cn(
                        "px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5",
                        copied
                          ? "bg-[var(--color-long)] text-[#050505]"
                          : "bg-[var(--accent-primary)] text-white hover:opacity-90"
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                    Share with frens and earn {rewardsData.referral.commissionRate}% of their fees forever
                  </p>
                </div>

                {/* Referral Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-1">
                      Total Referrals
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className={cn(
                        "text-xl font-bold",
                        isFreshAccount ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
                      )}>
                        {rewardsData.referral.totalReferrals}
                      </p>
                      {!isFreshAccount && rewardsData.referral.activeReferrals > 0 && (
                        <p className="text-xs text-[var(--text-tertiary)]">
                          ({rewardsData.referral.activeReferrals} active)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-1">
                      Commission Rate
                    </p>
                    <p className="text-xl font-bold text-[var(--accent-primary)]">
                      {rewardsData.referral.commissionRate}%
                    </p>
                  </div>
                </div>

                {/* Earnings - Show different state for fresh accounts */}
                {isFreshAccount ? (
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-long)]/10 flex items-center justify-center flex-shrink-0">
                        <PartyPopper className="w-5 h-5 text-[var(--color-long)]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                          Earn Passive Income
                        </h4>
                        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                          Share your link with frens. When they trade, you earn {rewardsData.referral.commissionRate}% of their fees. Forever. No cap.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--color-long)]/10 border border-[var(--color-long)]/20">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                        Referral Earnings
                      </p>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--color-long)]/20 text-[var(--color-long)]">
                        +{rewardsData.referral.commissionRate}% commission
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">Total Earned</p>
                        <p className="text-lg font-bold font-mono text-[var(--color-long)]">
                          ${rewardsData.referral.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">Pending</p>
                        <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                          ${rewardsData.referral.pendingEarnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button className="w-full py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {isFreshAccount ? "Learn More About Referrals" : "View Full Referral Dashboard"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Degen wisdom */}
        <div className="px-4 sm:px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 flex-shrink-0">
          <p className="text-[10px] text-center text-[var(--text-tertiary)]">
            Points earned through trading. No cap, just grind. WAGMI.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RewardsModal;
