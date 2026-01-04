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
  Clock,
  Trophy,
  Sparkles,
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
  const [showReferral, setShowReferral] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://speedtrad.io/ref/${MOCK_REFERRAL.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedQuests = MOCK_QUESTS.filter((q) => q.completed).length;
  const totalQuests = MOCK_QUESTS.length;

  if (showReferral) {
    return (
      <div className="flex flex-col h-full">
        {/* Referral Header */}
        <div className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <button
            onClick={() => setShowReferral(false)}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180 text-white/40" />
          </button>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Referral Program</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Referral Stats - Modern Grid */}
          <div className="px-4 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Referrals", value: MOCK_REFERRAL.totalReferrals, color: "text-[var(--text-primary)]", icon: Users },
                { label: "Pending", value: MOCK_REFERRAL.pendingRewards, color: "text-yellow-500", icon: Clock },
                { label: "Earned", value: MOCK_REFERRAL.earnedRewards, color: "text-[var(--color-long)]", icon: Trophy },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center bg-[var(--bg-card)] py-2 rounded-xl border border-[var(--border-subtle)]/50 shadow-sm transition-transform hover:scale-105">
                  <stat.icon className={`w-3 h-3 ${stat.color} mb-1 opacity-60`} />
                  <span className={`text-sm font-black font-mono ${stat.color}`}>
                    {stat.value.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-[var(--text-tertiary)] uppercase font-black tracking-tighter">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Link - Premium Card */}
          <div className="px-4 py-4">
            <div className="relative group overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-[var(--accent-primary)]/20">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--accent-primary)]/10 rounded-full blur-[60px]" />

              <div className="relative">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <span className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-tight">
                    Invite Your Friends
                  </span>
                </div>

                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-4">
                  Share your link and earn <span className="text-yellow-500 font-black">10%</span> of
                  their trading fees <span className="text-[var(--text-primary)] font-black">forever</span>!
                </p>

                {/* Copy Link Button - Modern */}
                <button
                  onClick={handleCopyCode}
                  className={`group w-full relative h-10 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 overflow-hidden ${copied
                    ? "bg-[var(--color-long)] text-white"
                    : "bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--accent-primary)] hover:text-white"
                    }`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link
                      </>
                    )}
                  </div>
                </button>

                {/* Referral Code Display */}
                <div className="mt-3 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5">
                  <span className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">Code</span>
                  <span className="text-[10px] font-black font-mono text-[var(--accent-primary)] uppercase tracking-wider">
                    {MOCK_REFERRAL.referralCode}
                  </span>
                </div>
              </div>
            </div>

            {/* How it works - Visual Timeline */}
            <div className="mt-5 px-1">
              <h4 className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-4">How it works</h4>
              <div className="space-y-4">
                {[
                  { text: "Share your link", icon: Gift },
                  { text: "Friend joins", icon: Users },
                  { text: "Earn rewards", icon: Sparkles },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent-primary)]/50 transition-colors">
                        <step.icon className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                      </div>
                      {i < 2 && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-[var(--border-subtle)]" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Quest Progress Summary */}
      <div className="px-3 py-3.5 border-b border-[var(--border-subtle)]/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-black tracking-widest">
            Daily Progress
          </span>
          <span className="text-[10px] font-black text-[var(--accent-primary)]">
            {completedQuests}/{totalQuests}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.2)]"
            style={{ width: `${(completedQuests / totalQuests) * 100}%` }}
          />
        </div>
      </div>

      {/* Quest List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Special Refer Item */}
        <button
          onClick={() => setShowReferral(true)}
          className="w-full group relative px-4 py-4 border-b border-white/[0.03] transition-all duration-300 hover:bg-[var(--accent-primary)]/[0.03]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-black text-white tracking-tight">Refer & Earn</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <p className="text-[10px] text-white/40 mt-0.5">Invite friends and get 10% of fees</p>
            </div>
          </div>
        </button>

        {MOCK_QUESTS.map((quest) => {
          const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

          return (
            <div
              key={quest.id}
              className={`group relative px-4 py-4 border-b border-white/[0.03] transition-all duration-300 hover:bg-white/[0.02] ${quest.completed ? "opacity-60" : ""
                }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon Container with Glow */}
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${quest.completed
                      ? "bg-[var(--color-long)]/10 text-[var(--color-long)] scale-95"
                      : "bg-white/[0.03] text-[var(--accent-primary)] group-hover:scale-110 group-hover:bg-[var(--accent-primary)]/10"
                      }`}
                  >
                    {quest.completed ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <div className="transition-transform duration-300 group-hover:rotate-12">
                        {quest.icon}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-black text-white tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">
                      {quest.title}
                    </span>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                      <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-black text-yellow-600">+{quest.reward}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/40 leading-relaxed mb-3">
                    {quest.description}
                  </p>

                  {/* Progress Bar */}
                  {!quest.completed && (
                    <div className="space-y-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.03] overflow-hidden p-[1px]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[9px] font-black font-mono text-white/30 tabular-nums">
                          {quest.progress.toLocaleString()} <span className="opacity-40">/</span> {quest.target.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {quest.completed && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-black text-[var(--color-long)] uppercase tracking-widest">Completed</span>
                      <div className="h-px flex-1 bg-[var(--color-long)]/20" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="px-3 py-3 border-t border-white/[0.03]">
        <button className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors">
          View All Quests
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}


export default QuestsPanel;
