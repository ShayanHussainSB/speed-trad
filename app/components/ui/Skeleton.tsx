"use client";

import { cn } from "@/app/utils/cn";

/**
 * SKELETON LOADING SYSTEM
 * -----------------------
 * "Loading gains... or losses. Who knows? That's the thrill, anon."
 *
 * Degen-themed skeleton loaders that pulse with hopium.
 * Each skeleton variant matches the component it's replacing.
 */

interface SkeletonProps {
  className?: string;
  variant?: "default" | "accent" | "long" | "short";
}

// Base skeleton with degen pulse animation
export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const variantStyles = {
    default: "bg-[var(--bg-tertiary)]",
    accent: "bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20",
    long: "bg-[var(--color-long)]/10",
    short: "bg-[var(--color-short)]/10",
  };

  return (
    <div
      className={cn(
        "animate-pulse rounded-lg",
        variantStyles[variant],
        className
      )}
    />
  );
}

// Text line skeleton - "Loading alpha..."
export function SkeletonText({ className, width = "w-24" }: { className?: string; width?: string }) {
  return <Skeleton className={cn("h-4", width, className)} />;
}

// Circle skeleton for avatars/icons - "Generating PFP..."
export function SkeletonCircle({ className, size = "w-10 h-10" }: { className?: string; size?: string }) {
  return <Skeleton className={cn("rounded-full", size, className)} />;
}

/**
 * POSITION CARD SKELETON
 * "Summoning your bags from the void..."
 *
 * Matches the compact position card layout in PositionsList
 */
export function PositionCardSkeleton() {
  return (
    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] animate-pulse">
      {/* Row 1: Direction badge + Symbol + PnL */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Direction badge skeleton */}
          <Skeleton className="w-16 h-6 rounded-lg" variant="accent" />
          {/* Symbol skeleton */}
          <Skeleton className="w-14 h-4" />
        </div>
        {/* PnL skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-5" variant="long" />
          <Skeleton className="w-12 h-5 rounded-lg" variant="long" />
        </div>
      </div>

      {/* Row 2: Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Skeleton className="w-8 h-3" />
          <Skeleton className="w-12 h-3" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-8 h-3" />
          <Skeleton className="w-10 h-3" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-6 h-3" />
          <Skeleton className="w-10 h-3" />
        </div>
      </div>

      {/* Row 3: Action buttons */}
      <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)]">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="w-7 h-7 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * POSITION CARD SKELETON (MODAL VERSION)
 * "Manifesting larger gains... please hold..."
 *
 * Larger, more detailed skeleton for the PositionsModal grid
 */
export function PositionCardSkeletonLarge() {
  return (
    <div className="relative p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] animate-pulse overflow-hidden">
      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Row 1: Direction + Symbol + Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-24 h-8 rounded-lg" variant="accent" />
          <Skeleton className="w-16 h-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </div>

      {/* Row 2: Tier badge + Time */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-20 h-6 rounded-lg" variant="accent" />
        <Skeleton className="w-24 h-4" />
      </div>

      {/* PnL Section */}
      <div className="flex items-end justify-between py-4 border-y border-[var(--border-subtle)]/50 mb-4">
        <div>
          <Skeleton className="w-20 h-3 mb-2" />
          <Skeleton className="w-32 h-8" variant="long" />
        </div>
        <Skeleton className="w-24 h-12 rounded-xl" variant="long" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50 text-center">
            <Skeleton className="w-10 h-3 mx-auto mb-1" />
            <Skeleton className="w-14 h-4 mx-auto" />
          </div>
        ))}
      </div>

      {/* LIQ & TP Row */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" variant="long" />
      </div>
    </div>
  );
}

/**
 * TRADE ROW SKELETON
 * "Fetching your W's and L's from the blockchain..."
 *
 * Matches the trade history row layout
 */
export function TradeRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] animate-pulse">
      {/* Left: Direction + Symbol + Time */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-6 rounded-lg" variant="accent" />
        <div>
          <Skeleton className="w-16 h-4 mb-1" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>

      {/* Right: PnL */}
      <div className="text-right">
        <Skeleton className="w-16 h-5 mb-1 ml-auto" variant="long" />
        <Skeleton className="w-12 h-3 ml-auto" />
      </div>
    </div>
  );
}

/**
 * TRADE TABLE ROW SKELETON (MODAL VERSION)
 * "Querying the degen database..."
 *
 * Table row skeleton for TradeHistoryModal
 */
export function TradeTableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-[var(--border-subtle)]">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-6 rounded-lg" variant="accent" />
          <Skeleton className="w-14 h-4" />
        </div>
      </td>
      <td className="py-4 px-4">
        <Skeleton className="w-16 h-4" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="w-14 h-4" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="w-14 h-4" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="w-20 h-5" variant="long" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="w-24 h-4" />
      </td>
    </tr>
  );
}

/**
 * LEADERBOARD ROW SKELETON
 * "Loading the whales and the rekt..."
 *
 * Matches the leaderboard row with rank, avatar, username, PnL
 */
export function LeaderboardRowSkeleton({ rank }: { rank: number }) {
  const isTopThree = rank <= 3;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl animate-pulse",
      isTopThree ? "bg-[var(--bg-elevated)]" : "bg-[var(--bg-secondary)]"
    )}>
      {/* Rank */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        isTopThree ? "bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20" : "bg-[var(--bg-tertiary)]"
      )}>
        <Skeleton className="w-4 h-4" variant={isTopThree ? "accent" : "default"} />
      </div>

      {/* Avatar */}
      <SkeletonCircle size="w-10 h-10" />

      {/* Username + Tier */}
      <div className="flex-1">
        <Skeleton className="w-24 h-4 mb-1" />
        <Skeleton className="w-16 h-3" variant="accent" />
      </div>

      {/* PnL */}
      <div className="text-right">
        <Skeleton className="w-20 h-5 mb-1 ml-auto" variant="long" />
        <Skeleton className="w-14 h-3 ml-auto" />
      </div>
    </div>
  );
}

/**
 * POSITIONS LIST SKELETON
 * "Summoning your positions from the abyss..."
 *
 * Shows multiple position card skeletons with degen flair
 */
export function PositionsListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-card)]">
        <div className="flex items-center gap-2">
          {/* Filter tabs skeleton */}
          <Skeleton className="w-14 h-7 rounded-lg" />
          <Skeleton className="w-14 h-7 rounded-lg" />
          <Skeleton className="w-14 h-7 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          {/* Stats skeleton */}
          <Skeleton className="w-20 h-6 rounded-lg" variant="long" />
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-hidden p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <PositionCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Degen loading message */}
      <div className="px-3 py-2 text-center">
        <p className="text-[10px] text-[var(--text-tertiary)] animate-pulse">
          Fetching your degen portfolio... WAGMI
        </p>
      </div>
    </div>
  );
}

/**
 * TRADE HISTORY SKELETON
 * "Loading your legendary trades..."
 *
 * Shows multiple trade row skeletons
 */
export function TradeHistorySkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-card)]">
        <div className="flex items-center gap-2">
          <Skeleton className="w-12 h-7 rounded-lg" />
          <Skeleton className="w-12 h-7 rounded-lg" />
          <Skeleton className="w-12 h-7 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-24 h-6 rounded-lg" variant="long" />
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-hidden p-3 space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <TradeRowSkeleton key={i} />
        ))}
      </div>

      {/* Degen loading message */}
      <div className="px-3 py-2 text-center">
        <p className="text-[10px] text-[var(--text-tertiary)] animate-pulse">
          Indexing your W's and L's... no cap
        </p>
      </div>
    </div>
  );
}

/**
 * LEADERBOARD SKELETON
 * "Loading the hall of fame (and shame)..."
 *
 * Full leaderboard skeleton with top 3 highlight
 */
export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Degen title skeleton */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-20 h-6 rounded-lg" variant="accent" />
      </div>

      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <LeaderboardRowSkeleton key={i} rank={i + 1} />
      ))}

      {/* Degen loading message */}
      <div className="text-center mt-2">
        <p className="text-[10px] text-[var(--text-tertiary)] animate-pulse">
          Ranking degens by PnL... may the best ape win
        </p>
      </div>
    </div>
  );
}

/**
 * MODAL SKELETON
 * "Opening the vault..."
 *
 * Generic modal content skeleton
 */
export function ModalSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/3 to-transparent" />
      </div>
      {children}
    </div>
  );
}

/**
 * BALANCE SKELETON
 * "Counting your bags..."
 */
export function BalanceSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <Skeleton className="w-6 h-6 rounded-lg" />
      <div>
        <Skeleton className="w-16 h-3 mb-1" />
        <Skeleton className="w-20 h-5" variant="long" />
      </div>
    </div>
  );
}

/**
 * CHART SKELETON
 * "Drawing lines that go up (hopefully)..."
 */
export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-24 h-8" variant="long" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 p-4 flex items-end gap-1">
        {/* Fake candlesticks */}
        {Array.from({ length: 20 }).map((_, i) => {
          const height = 20 + Math.random() * 60;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm bg-[var(--bg-tertiary)]"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Degen message */}
      <div className="text-center pb-4">
        <p className="text-[10px] text-[var(--text-tertiary)]">
          Loading hopium chart... line goes up right?
        </p>
      </div>
    </div>
  );
}
