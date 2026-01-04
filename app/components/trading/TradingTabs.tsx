"use client";

import { Zap, ArrowLeftRight } from "lucide-react";

type TradingMode = "perpetuals" | "spot";

interface TradingTabsProps {
  activeMode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
}

export function TradingTabs({ activeMode, onModeChange }: TradingTabsProps) {
  return (
    <div className="relative flex items-stretch h-9 w-full">
      <button
        onClick={() => onModeChange("perpetuals")}
        className={`
          relative flex-1 flex items-center justify-center gap-2 transition-all duration-300 z-10
          ${activeMode === "perpetuals" ? "bg-white/[0.04] text-white" : "text-white/30 hover:bg-white/[0.02] hover:text-white/50"}
        `}
      >
        <Zap className={`w-3.5 h-3.5 transition-colors ${activeMode === "perpetuals" ? "text-[var(--accent-primary)]" : "text-current"}`} />
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Perps</span>

        {activeMode === "perpetuals" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-primary)]" />
        )}
      </button>

      <div className="w-[1px] h-3 my-auto bg-white/[0.08]" />

      <button
        onClick={() => onModeChange("spot")}
        className={`
          relative flex-1 flex items-center justify-center gap-2 transition-all duration-300 z-10
          ${activeMode === "spot" ? "bg-white/[0.04] text-white" : "text-white/30 hover:bg-white/[0.02] hover:text-white/50"}
        `}
      >
        <ArrowLeftRight className={`w-3.5 h-3.5 transition-colors ${activeMode === "spot" ? "text-[var(--accent-primary)]" : "text-current"}`} />
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Spot</span>

        {activeMode === "spot" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-primary)]" />
        )}
      </button>
    </div>
  );
}
