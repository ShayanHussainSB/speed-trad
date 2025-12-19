"use client";

import { Zap, ArrowLeftRight } from "lucide-react";

type TradingMode = "perpetuals" | "spot";

interface TradingTabsProps {
  activeMode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
}

export function TradingTabs({ activeMode, onModeChange }: TradingTabsProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => onModeChange("perpetuals")}
        className={`
          relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200
          ${activeMode === "perpetuals"
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }
        `}
      >
        <Zap className={`w-4 h-4 ${activeMode === "perpetuals" ? "text-[var(--accent-primary)]" : ""}`} />
        <span>Perpetuals</span>
        {/* Underline indicator */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200
            ${activeMode === "perpetuals"
              ? "bg-[var(--accent-primary)] opacity-100"
              : "bg-transparent opacity-0"
            }
          `}
        />
      </button>

      <button
        onClick={() => onModeChange("spot")}
        className={`
          relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200
          ${activeMode === "spot"
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }
        `}
      >
        <ArrowLeftRight className={`w-4 h-4 ${activeMode === "spot" ? "text-[var(--accent-primary)]" : ""}`} />
        <span>Spot</span>
        {/* Underline indicator */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200
            ${activeMode === "spot"
              ? "bg-[var(--accent-primary)] opacity-100"
              : "bg-transparent opacity-0"
            }
          `}
        />
      </button>
    </div>
  );
}
