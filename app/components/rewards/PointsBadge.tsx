"use client";

import { Sparkles, Zap, Crown, Star, Gem, Trophy, Rocket } from "lucide-react";

/**
 * PointsBadge Component
 * ---------------------
 * "Your grind, visualized. Click to see the full picture."
 *
 * A compact, eye-catching badge that shows points balance.
 * Lives in the header, next to wallet connect.
 * For fresh accounts (0 points), shows an inviting "Start" state.
 */

interface PointsBadgeProps {
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary";
  onClick: () => void;
  weeklyPoints?: number;
  isFreshAccount?: boolean;
}

// Format points with K/M suffix
const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
};

// Tier config - colors, icons, and degen names
const TIER_CONFIG = {
  bronze: {
    color: "#CD7F32",
    bgColor: "rgba(205, 127, 50, 0.15)",
    borderColor: "rgba(205, 127, 50, 0.3)",
    icon: Star,
    glow: "rgba(205, 127, 50, 0.3)",
    name: "Noob",
  },
  silver: {
    color: "#C0C0C0",
    bgColor: "rgba(192, 192, 192, 0.15)",
    borderColor: "rgba(192, 192, 192, 0.3)",
    icon: Zap,
    glow: "rgba(192, 192, 192, 0.3)",
    name: "Ape",
  },
  gold: {
    color: "#FFD700",
    bgColor: "rgba(255, 215, 0, 0.15)",
    borderColor: "rgba(255, 215, 0, 0.3)",
    icon: Trophy,
    glow: "rgba(255, 215, 0, 0.4)",
    name: "Degen",
  },
  platinum: {
    color: "#E5E4E2",
    bgColor: "rgba(229, 228, 226, 0.15)",
    borderColor: "rgba(229, 228, 226, 0.4)",
    icon: Gem,
    glow: "rgba(229, 228, 226, 0.4)",
    name: "Chad",
  },
  diamond: {
    color: "#B9F2FF",
    bgColor: "rgba(185, 242, 255, 0.15)",
    borderColor: "rgba(185, 242, 255, 0.4)",
    icon: Gem,
    glow: "rgba(185, 242, 255, 0.5)",
    name: "Gigachad",
  },
  legendary: {
    color: "#FF2D92",
    bgColor: "rgba(255, 45, 146, 0.15)",
    borderColor: "rgba(255, 45, 146, 0.4)",
    icon: Crown,
    glow: "rgba(255, 45, 146, 0.5)",
    name: "Legend",
  },
};

export function PointsBadge({ points, tier, onClick, weeklyPoints, isFreshAccount = false }: PointsBadgeProps) {
  const config = TIER_CONFIG[tier];
  const TierIcon = config.icon;

  // Fresh account state - show inviting "Start" badge
  if (isFreshAccount || points === 0) {
    return (
      <button
        onClick={onClick}
        className="relative group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 border border-[var(--accent-primary)]/30"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-md bg-[var(--accent-primary)]/30" />

        {/* Rocket icon - "Ready for liftoff" */}
        <div className="relative">
          <Rocket
            className="w-4 h-4 transition-transform group-hover:scale-110 text-[var(--accent-primary)]"
          />
          {/* Subtle bounce animation */}
          <div className="absolute inset-0 animate-bounce opacity-30" style={{ animationDuration: "2s" }}>
            <Rocket className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
        </div>

        {/* "Start" text */}
        <div className="flex flex-col items-start leading-none">
          <span className="text-sm font-bold text-[var(--accent-primary)]">
            Start
          </span>
          <span className="text-[9px] font-medium text-[var(--text-tertiary)]">
            Earn points
          </span>
        </div>

        {/* Pulsing indicator */}
        <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--accent-primary)]" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
      style={{
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-md"
        style={{ background: config.glow }}
      />

      {/* Tier Icon with pulse */}
      <div className="relative">
        <TierIcon
          className="w-4 h-4 transition-transform group-hover:scale-110"
          style={{ color: config.color }}
        />
        {/* Subtle pulse for high tiers */}
        {(tier === "diamond" || tier === "legendary") && (
          <div
            className="absolute inset-0 animate-ping opacity-30"
            style={{ color: config.color }}
          >
            <TierIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Points Display */}
      <div className="flex flex-col items-start leading-none">
        <span
          className="text-sm font-bold font-mono tabular-nums"
          style={{ color: config.color }}
        >
          {formatPoints(points)}
        </span>
        {/* Weekly gain indicator */}
        {weeklyPoints && weeklyPoints > 0 && (
          <span className="text-[9px] font-medium text-[var(--color-long)] flex items-center gap-0.5">
            <Sparkles className="w-2 h-2" />
            +{formatPoints(weeklyPoints)} this week
          </span>
        )}
      </div>

      {/* Tier indicator dot */}
      <div
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: config.color }}
      />
    </button>
  );
}

/**
 * Compact version for mobile
 */
export function PointsBadgeCompact({ points, tier, onClick, isFreshAccount = false }: Omit<PointsBadgeProps, "weeklyPoints">) {
  const config = TIER_CONFIG[tier];
  const TierIcon = config.icon;

  // Fresh account state - compact "Start" badge
  if (isFreshAccount || points === 0) {
    return (
      <button
        onClick={onClick}
        className="relative group flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 active:scale-95 bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 border border-[var(--accent-primary)]/30"
      >
        <Rocket className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
        <span className="text-xs font-bold text-[var(--accent-primary)]">
          Start
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative group flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 active:scale-95"
      style={{
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <TierIcon
        className="w-3.5 h-3.5"
        style={{ color: config.color }}
      />
      <span
        className="text-xs font-bold font-mono tabular-nums"
        style={{ color: config.color }}
      >
        {formatPoints(points)}
      </span>
    </button>
  );
}
