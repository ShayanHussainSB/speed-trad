"use client";

import { useState } from "react";
import {
  Zap,
  Gift,
  Users,
  Copy,
  Check,
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  Star,
} from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  icon: React.ReactNode;
  type: "daily" | "weekly" | "achievement";
}

const MOCK_QUESTS: Quest[] = [
  {
    id: "1",
    title: "First Trade",
    description: "Complete your first trade",
    reward: 50,
    progress: 0,
    target: 1,
    completed: false,
    icon: <Zap className="w-3.5 h-3.5" />,
    type: "achievement",
  },
  {
    id: "2",
    title: "Daily Trader",
    description: "Make 5 trades today",
    reward: 25,
    progress: 2,
    target: 5,
    completed: false,
    icon: <Target className="w-3.5 h-3.5" />,
    type: "daily",
  },
  {
    id: "3",
    title: "Hot Streak",
    description: "Win 3 trades in a row",
    reward: 100,
    progress: 1,
    target: 3,
    completed: false,
    icon: <Flame className="w-3.5 h-3.5" />,
    type: "daily",
  },
  {
    id: "4",
    title: "Volume King",
    description: "Trade $1,000 volume",
    reward: 200,
    progress: 450,
    target: 1000,
    completed: false,
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    type: "weekly",
  },
];

interface ReferralStats {
  totalReferrals: number;
  pendingRewards: number;
  earnedRewards: number;
  referralCode: string;
}

const MOCK_REFERRAL: ReferralStats = {
  totalReferrals: 3,
  pendingRewards: 150,
  earnedRewards: 450,
  referralCode: "SPEED-X7K9",
};

export function QuestsPanel() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"quests" | "referrals">("quests");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://speedtrad.io/ref/${MOCK_REFERRAL.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedQuests = MOCK_QUESTS.filter((q) => q.completed).length;
  const totalQuests = MOCK_QUESTS.length;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-[var(--bg-secondary)]">
          <button
            onClick={() => setActiveTab("quests")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
              activeTab === "quests"
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Zap className="w-3 h-3" />
            Quests
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
              activeTab === "referrals"
                ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Users className="w-3 h-3" />
            Refer
          </button>
        </div>
      </div>

      {activeTab === "quests" ? (
        <>
          {/* Quest Progress Summary */}
          <div className="px-3 py-2 border-b border-[var(--border-subtle)]/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-medium">
                Daily Progress
              </span>
              <span className="text-[10px] font-bold text-[var(--accent-primary)]">
                {completedQuests}/{totalQuests}
              </span>
            </div>
            <div className="h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                style={{ width: `${(completedQuests / totalQuests) * 100}%` }}
              />
            </div>
          </div>

          {/* Quest List */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_QUESTS.map((quest) => {
              const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

              return (
                <div
                  key={quest.id}
                  className={`px-3 py-2.5 border-b border-[var(--border-subtle)]/50 hover:bg-[var(--bg-secondary)]/30 transition-colors ${
                    quest.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        quest.completed
                          ? "bg-[var(--color-long)]/20 text-[var(--color-long)]"
                          : "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                      }`}
                    >
                      {quest.completed ? <Check className="w-3.5 h-3.5" /> : quest.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                          {quest.title}
                        </span>
                        <div className="flex items-center gap-0.5 text-[#FFD700]">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span className="text-[9px] font-bold">+{quest.reward}</span>
                        </div>
                      </div>

                      <p className="text-[9px] text-[var(--text-tertiary)] mb-1.5">
                        {quest.description}
                      </p>

                      {/* Progress Bar */}
                      {!quest.completed && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--accent-primary)]"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-[var(--text-tertiary)] tabular-nums">
                            {quest.progress}/{quest.target}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="px-3 py-2 border-t border-[var(--border-subtle)]">
            <button className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors">
              View All Quests
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Referral Stats */}
          <div className="px-3 py-3 border-b border-[var(--border-subtle)]">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {MOCK_REFERRAL.totalReferrals}
                </p>
                <p className="text-[8px] text-[var(--text-tertiary)] uppercase">Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#FFD700]">{MOCK_REFERRAL.pendingRewards}</p>
                <p className="text-[8px] text-[var(--text-tertiary)] uppercase">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[var(--color-long)]">
                  {MOCK_REFERRAL.earnedRewards}
                </p>
                <p className="text-[8px] text-[var(--text-tertiary)] uppercase">Earned</p>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="px-3 py-3 flex-1">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase">
                  Your Referral Link
                </span>
              </div>

              <p className="text-[9px] text-[var(--text-tertiary)] mb-3">
                Share your link and earn <span className="text-[#FFD700] font-bold">10%</span> of
                your friends&apos; trading fees forever!
              </p>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyCode}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  copied
                    ? "bg-[var(--color-long)] text-white"
                    : "bg-[var(--accent-primary)] text-white hover:opacity-90"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Referral Link
                  </>
                )}
              </button>

              {/* Referral Code */}
              <div className="mt-2 text-center">
                <span className="text-[9px] text-[var(--text-tertiary)]">Code: </span>
                <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)]">
                  {MOCK_REFERRAL.referralCode}
                </span>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-3">
              <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase mb-2">
                How it works
              </p>
              <div className="space-y-1.5">
                {[
                  "Share your unique referral link",
                  "Friend signs up & makes first trade",
                  "You both earn bonus points!",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                      <span className="text-[8px] font-bold text-[var(--text-tertiary)]">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-[9px] text-[var(--text-secondary)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invite Button */}
          <div className="px-3 py-2 border-t border-[var(--border-subtle)]">
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
              <Users className="w-3.5 h-3.5" />
              View Referral History
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default QuestsPanel;
