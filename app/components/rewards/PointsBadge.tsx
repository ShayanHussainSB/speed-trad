"use client";

import { Zap } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  onClick: () => void;
  isFreshAccount?: boolean;
  compact?: boolean;
}

const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
};

export function PointsBadge({ points, onClick, isFreshAccount = false, compact = false }: PointsBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all ${
        compact ? "gap-1.5 px-3 py-1.5" : "gap-2 px-3.5 py-2"
      }`}
    >
      <Zap className={`text-[#FF006E] ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} fill="currentColor" />
      <span className={`font-semibold text-white tabular-nums ${compact ? "text-xs" : "text-sm"}`}>
        {isFreshAccount || points === 0 ? "0" : formatPoints(points)}
      </span>
    </button>
  );
}
