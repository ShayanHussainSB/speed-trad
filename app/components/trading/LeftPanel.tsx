"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Zap, 
  Minimize2, 
  Maximize2,
  EyeOff,
  Eye
} from "lucide-react";
import { Leaderboard } from "./Leaderboard";
import { QuestsPanel } from "./QuestsPanel";

interface LeftPanelProps {
  userRank?: number;
  userPoints?: number;
  walletAddress?: string;
  userAvatar?: string;
  username?: string;
  isHidden?: boolean;
  onToggleHide?: () => void;
}

type PanelSection = "leaderboard" | "quests" | "both";

export function LeftPanel({
  userRank = 9999999,
  userPoints = 0,
  walletAddress = "0x2e50ffd0",
  userAvatar = "pepe",
  username,
  isHidden = false,
  onToggleHide,
}: LeftPanelProps) {
  const [isMinimized, setIsMinimized] = useState(true); // Default to minimized
  const [activeSection, setActiveSection] = useState<PanelSection>("leaderboard"); // Default to leaderboard only

  // Hidden state - minimal edge toggle (no empty space)
  if (isHidden) {
    return (
      <div className="h-full w-full flex flex-col items-center pt-2">
        <button
          onClick={onToggleHide}
          className="w-full h-14 bg-white/5 hover:bg-[var(--accent-primary)]/20 flex items-center justify-center transition-all group border-r border-white/10"
          title="Show Panel"
        >
          <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[var(--accent-primary)]" />
        </button>
      </div>
    );
  }

  // Minimized state - compact view with section tabs
  if (isMinimized) {
    return (
      <div className="h-full w-full flex flex-col bg-black/40">
        {/* Control Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSection("leaderboard")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${
                activeSection === "leaderboard" || activeSection === "both"
                  ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Trophy className="w-3 h-3" />
              LB
            </button>
            <button
              onClick={() => setActiveSection("quests")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${
                activeSection === "quests" || activeSection === "both"
                  ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Zap className="w-3 h-3" />
              Q
            </button>
            <button
              onClick={() => setActiveSection("both")}
              className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${
                activeSection === "both"
                  ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              ALL
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
              title="Expand"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={onToggleHide}
              className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
              title="Hide Panel"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content based on active section */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {(activeSection === "leaderboard" || activeSection === "both") && (
            <div className={`${activeSection === "both" ? "flex-1 min-h-0 border-b border-white/5" : "flex-1"} overflow-hidden`}>
              <Leaderboard
                userRank={userRank}
                userPoints={userPoints}
                walletAddress={walletAddress}
                userAvatar={userAvatar}
                username={username}
              />
            </div>
          )}
          {(activeSection === "quests" || activeSection === "both") && (
            <div className={`${activeSection === "both" ? "flex-1 min-h-0" : "flex-1"} overflow-hidden`}>
              <QuestsPanel />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full expanded view
  return (
    <div className="h-full w-full flex flex-col bg-black/40">
      {/* Panel Control Strip */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">DASHBOARD</span>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
            title="Minimize"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onToggleHide}
            className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
            title="Hide Panel"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Half - Leaderboard */}
      <div className="flex-1 min-h-0 border-b border-[var(--border-subtle)]">
        <Leaderboard
          userRank={userRank}
          userPoints={userPoints}
          walletAddress={walletAddress}
          userAvatar={userAvatar}
          username={username}
        />
      </div>

      {/* Bottom Half - Quests */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <QuestsPanel />
      </div>
    </div>
  );
}

export default LeftPanel;
