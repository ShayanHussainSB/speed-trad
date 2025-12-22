"use client";

import { Leaderboard } from "./Leaderboard";
import { QuestsPanel } from "./QuestsPanel";

interface LeftPanelProps {
  userRank?: number;
  userPoints?: number;
  walletAddress?: string;
  userAvatar?: string;
  username?: string;
}

export function LeftPanel({
  userRank = 9999999,
  userPoints = 0,
  walletAddress = "0x2e50ffd0",
  userAvatar = "pepe",
  username,
}: LeftPanelProps) {
  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)]">
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

      {/* Bottom Half - Quests & Referrals */}
      <div className="flex-1 min-h-0">
        <QuestsPanel />
      </div>
    </div>
  );
}

export default LeftPanel;
