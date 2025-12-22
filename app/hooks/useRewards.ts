"use client";

import { useState, useMemo } from "react";

/**
 * useRewards Hook
 * ---------------
 * "Track your grind, anon. Every trade counts."
 *
 * Manages user rewards, points, quests, and referral data.
 * This is mock data - replace with real API calls in production.
 */

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "milestone" | "referral";
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  expiresAt?: Date;
  icon: "volume" | "streak" | "trades" | "invite" | "pnl" | "leverage";
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  commissionRate: number; // percentage
}

export interface RewardsData {
  // Points
  totalPoints: number;
  weeklyPoints: number;
  pointsThisSession: number;

  // Ranking
  rank: number | null; // null = unranked (fresh account)
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary";
  nextTierPoints: number;

  // Volume stats
  totalVolume: number;
  weeklyVolume: number;
  dailyVolume: number;

  // Streak
  currentStreak: number;
  longestStreak: number;

  // Quests
  quests: Quest[];
  completedQuestsToday: number;

  // Referrals
  referral: ReferralStats;

  // Fresh account indicator - "GM anon, welcome to the grind"
  isFreshAccount: boolean;
}

// Mock quest data - degen style
const MOCK_QUESTS: Quest[] = [
  {
    id: "daily-volume",
    title: "Volume Grinder",
    description: "Trade $10K volume today",
    type: "daily",
    progress: 7500,
    target: 10000,
    reward: 500,
    completed: false,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    icon: "volume",
  },
  {
    id: "daily-streak",
    title: "Streak Keeper",
    description: "Trade every day for 7 days",
    type: "daily",
    progress: 5,
    target: 7,
    reward: 1000,
    completed: false,
    icon: "streak",
  },
  {
    id: "weekly-trades",
    title: "Trade Machine",
    description: "Execute 50 trades this week",
    type: "weekly",
    progress: 34,
    target: 50,
    reward: 2500,
    completed: false,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    icon: "trades",
  },
  {
    id: "invite-fren",
    title: "Bring a Fren",
    description: "Invite 1 friend who trades",
    type: "referral",
    progress: 0,
    target: 1,
    reward: 5000,
    completed: false,
    icon: "invite",
  },
  {
    id: "milestone-100k",
    title: "100K Club",
    description: "Reach $100K total volume",
    type: "milestone",
    progress: 78500,
    target: 100000,
    reward: 10000,
    completed: false,
    icon: "volume",
  },
  {
    id: "degen-leverage",
    title: "True Degen",
    description: "Use 500x+ leverage on 10 trades",
    type: "milestone",
    progress: 8,
    target: 10,
    reward: 3000,
    completed: false,
    icon: "leverage",
  },
  {
    id: "green-week",
    title: "Green Week",
    description: "End the week with positive PnL",
    type: "weekly",
    progress: 1,
    target: 1,
    reward: 1500,
    completed: true,
    icon: "pnl",
  },
];

const MOCK_REFERRAL: ReferralStats = {
  code: "DEGEN420",
  totalReferrals: 12,
  activeReferrals: 8,
  totalEarnings: 2450,
  pendingEarnings: 340,
  commissionRate: 10,
};

// Fresh account referral - "Your journey begins, fren"
const FRESH_REFERRAL: ReferralStats = {
  code: "", // Generated on first load
  totalReferrals: 0,
  activeReferrals: 0,
  totalEarnings: 0,
  pendingEarnings: 0,
  commissionRate: 10,
};

// Starter quests for fresh accounts - "Every legend starts somewhere"
const STARTER_QUESTS: Quest[] = [
  {
    id: "first-trade",
    title: "First Blood",
    description: "Execute your first trade",
    type: "milestone",
    progress: 0,
    target: 1,
    reward: 100,
    completed: false,
    icon: "trades",
  },
  {
    id: "first-volume",
    title: "Baby Steps",
    description: "Trade $100 in volume",
    type: "milestone",
    progress: 0,
    target: 100,
    reward: 250,
    completed: false,
    icon: "volume",
  },
  {
    id: "first-win",
    title: "Taste of Victory",
    description: "Close a trade in profit",
    type: "milestone",
    progress: 0,
    target: 1,
    reward: 500,
    completed: false,
    icon: "pnl",
  },
  {
    id: "invite-fren-starter",
    title: "Bring a Fren",
    description: "Invite 1 friend to join",
    type: "referral",
    progress: 0,
    target: 1,
    reward: 1000,
    completed: false,
    icon: "invite",
  },
];

// Tier thresholds
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 10000,
  gold: 50000,
  platinum: 150000,
  diamond: 500000,
  legendary: 1000000,
};

const getTier = (points: number): "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary" => {
  if (points >= TIER_THRESHOLDS.legendary) return "legendary";
  if (points >= TIER_THRESHOLDS.diamond) return "diamond";
  if (points >= TIER_THRESHOLDS.platinum) return "platinum";
  if (points >= TIER_THRESHOLDS.gold) return "gold";
  if (points >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
};

const getNextTierPoints = (tier: string): number => {
  const tiers = Object.keys(TIER_THRESHOLDS);
  const currentIndex = tiers.indexOf(tier);
  if (currentIndex === tiers.length - 1) return 0; // Already max tier
  return TIER_THRESHOLDS[tiers[currentIndex + 1] as keyof typeof TIER_THRESHOLDS];
};

// Generate a random referral code for fresh accounts
const generateReferralCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

interface UseRewardsOptions {
  // Set to true to simulate a fresh account (for testing)
  simulateFreshAccount?: boolean;
}

export function useRewards(options: UseRewardsOptions = {}) {
  const { simulateFreshAccount = false } = options;
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  // Mock data - in production, fetch from API
  // Toggle simulateFreshAccount to test fresh account UI
  const rewardsData: RewardsData = useMemo(() => {
    // Fresh account state - "GM anon, you're new here"
    if (simulateFreshAccount) {
      return {
        totalPoints: 0,
        weeklyPoints: 0,
        pointsThisSession: 0,

        rank: null, // Unranked
        tier: "bronze" as const,
        nextTierPoints: TIER_THRESHOLDS.silver,

        totalVolume: 0,
        weeklyVolume: 0,
        dailyVolume: 0,

        currentStreak: 0,
        longestStreak: 0,

        quests: STARTER_QUESTS,
        completedQuestsToday: 0,

        referral: {
          ...FRESH_REFERRAL,
          code: generateReferralCode(),
        },

        isFreshAccount: true,
      };
    }

    // Existing user with activity
    const totalPoints = 47850;
    const tier = getTier(totalPoints);

    return {
      totalPoints,
      weeklyPoints: 8420,
      pointsThisSession: 1250,

      rank: 1247,
      tier,
      nextTierPoints: getNextTierPoints(tier),

      totalVolume: 78500,
      weeklyVolume: 23400,
      dailyVolume: 7500,

      currentStreak: 5,
      longestStreak: 12,

      quests: MOCK_QUESTS,
      completedQuestsToday: 2,

      referral: MOCK_REFERRAL,

      isFreshAccount: false,
    };
  }, [simulateFreshAccount]);

  const activeQuests = useMemo(() =>
    rewardsData.quests.filter(q => !q.completed),
    [rewardsData.quests]
  );

  const completedQuests = useMemo(() =>
    rewardsData.quests.filter(q => q.completed),
    [rewardsData.quests]
  );

  const dailyQuests = useMemo(() =>
    rewardsData.quests.filter(q => q.type === "daily"),
    [rewardsData.quests]
  );

  const weeklyQuests = useMemo(() =>
    rewardsData.quests.filter(q => q.type === "weekly"),
    [rewardsData.quests]
  );

  const milestoneQuests = useMemo(() =>
    rewardsData.quests.filter(q => q.type === "milestone" || q.type === "referral"),
    [rewardsData.quests]
  );

  // Progress to next tier
  const tierProgress = useMemo(() => {
    const currentTierPoints = TIER_THRESHOLDS[rewardsData.tier];
    const nextTierPoints = rewardsData.nextTierPoints;
    if (nextTierPoints === 0) return 100; // Max tier

    const progress = ((rewardsData.totalPoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [rewardsData]);

  const openRewardsModal = () => setIsRewardsModalOpen(true);
  const closeRewardsModal = () => setIsRewardsModalOpen(false);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(`https://speedtrad.io/ref/${rewardsData.referral.code}`);
      return true;
    } catch {
      return false;
    }
  };

  return {
    rewardsData,
    activeQuests,
    completedQuests,
    dailyQuests,
    weeklyQuests,
    milestoneQuests,
    tierProgress,
    isRewardsModalOpen,
    openRewardsModal,
    closeRewardsModal,
    copyReferralCode,
  };
}
