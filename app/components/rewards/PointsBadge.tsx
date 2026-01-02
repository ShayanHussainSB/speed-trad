"use client";

import { Zap, Rocket } from "lucide-react";

/**
 * PointsBadge Component
 * ---------------------
 * A compact, eye-catching badge that shows points balance.
 * Lives in the header, next to wallet connect.
 * For fresh accounts (0 points), shows an inviting "Start" state.
 */

interface PointsBadgeProps {
  points: number;
  onClick: () => void;
  isFreshAccount?: boolean;
}

// Format points with K/M suffix
const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
};

export function PointsBadge({ points, onClick, isFreshAccount = false }: PointsBadgeProps) {
  // Fresh account state - show inviting "Start" badge
  if (isFreshAccount || points === 0) {
    return (
      <button
        onClick={onClick}
        className="relative group flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 border border-[var(--accent-primary)]/30"
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
      className="relative group flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-md bg-[var(--accent-primary)]/20" />

      {/* Icon with accent gradient */}
      <div className="relative">
        <Zap
          className="w-4 h-4 transition-transform group-hover:scale-110 text-[var(--accent-primary)]"
          fill="currentColor"
        />
      </div>

      {/* Points Display */}
      <div className="flex items-center leading-none">
        <span className="text-sm font-bold font-mono tabular-nums text-[var(--text-primary)]">
          {formatPoints(points)}
        </span>
      </div>

      {/* Indicator dot */}
      <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--accent-primary)]" />
    </button>
  );
}

/**
 * Compact version for mobile
 */
export function PointsBadgeCompact({ points, onClick, isFreshAccount = false }: PointsBadgeProps) {
  // Fresh account state - compact "Start" badge
  if (isFreshAccount || points === 0) {
    return (
      <button
        onClick={onClick}
        className="relative group flex items-center gap-1.5 h-9 px-2.5 rounded-lg transition-all duration-200 active:scale-95 bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 border border-[var(--accent-primary)]/30"
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
      className="relative group flex items-center gap-1.5 h-9 px-2.5 rounded-lg transition-all duration-200 active:scale-95 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
    >
      <Zap
        className="w-3.5 h-3.5 text-[var(--accent-primary)]"
        fill="currentColor"
      />
      <span className="text-xs font-bold font-mono tabular-nums text-[var(--text-primary)]">
        {formatPoints(points)}
      </span>
    </button>
  );
}
