"use client";

import { useState } from "react";
import {
  Trophy,
  Zap,
  Minimize2,
  Maximize2,
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
}

type PanelSection = "leaderboard" | "quests";

export function LeftPanel({
  userRank = 9999999,
  userPoints = 0,
  walletAddress = "0x2e50ffd0",
  userAvatar = "pepe",
  username,
  isHidden = false,
}: LeftPanelProps) {
  const [activeSection, setActiveSection] = useState<PanelSection>("leaderboard");

  // Hidden state
  if (isHidden) return null;

  return (
    <div className="h-full w-full flex flex-col bg-[var(--bg-card)]">
      {/* Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSection("leaderboard")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${activeSection === "leaderboard"
              ? "text-white bg-white/10"
              : "text-white/30 hover:text-white/60"
              }`}
          >
            <Trophy className="w-3 h-3" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveSection("quests")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all ${activeSection === "quests"
              ? "text-white bg-white/10"
              : "text-white/30 hover:text-white/60"
              }`}
          >
            <Zap className="w-3 h-3" />
            Quests
          </button>
        </div>
      </div>

      {/* Content based on active section */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeSection === "leaderboard" && (
          <div className="flex-1 overflow-hidden">
            <Leaderboard
              userRank={userRank}
              userPoints={userPoints}
              walletAddress={walletAddress}
              userAvatar={userAvatar}
              username={username}
            />
          </div>
        )}
        {activeSection === "quests" && (
          <div className="flex-1 overflow-hidden">
            <QuestsPanel />
          </div>
        )}
      </div>
    </div>
  );
}


export default LeftPanel;
