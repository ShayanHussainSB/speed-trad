"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Trophy,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";
import { AvatarIcon } from "@/app/components/avatars/AvatarIcon";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  onUpdateUsername: (username: string) => void;
  walletAddress: string;
  username: string;
  avatar?: string;
  balance: number;
  balanceUSD: number;
  stats: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    rank: number;
    points: number;
  };
}

export function ProfileModal({
  isOpen,
  onClose,
  onDisconnect,
  walletAddress,
  username,
  avatar = "pepe",
  balance,
  balanceUSD,
  stats,
}: ProfileModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
  };

  const formatRank = (rank: number) => {
    if (rank >= 1000000) return `${Math.floor(rank / 1000000)}M+`;
    if (rank >= 1000) return `${Math.floor(rank / 1000)}K+`;
    return `#${rank.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 animate-scale-in overflow-hidden" style={{ boxShadow: 'var(--shadow-modal)' }}>

        {/* Header */}
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-lg">
                <AvatarIcon avatarId={avatar} size={64} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--color-long)] flex items-center justify-center border-2 border-[var(--bg-card)]">
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#050505]" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">
                {username}
              </h2>

              {/* Wallet Address */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-[var(--text-tertiary)]">
                  {truncatedAddress}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[var(--color-long)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={`https://solscan.io/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="px-4 sm:px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-1">
                Wallet Balance
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {balance.toFixed(4)} SOL
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
                ≈ ${balanceUSD.toFixed(2)} USD
              </p>
            </div>
            <button className="px-3 sm:px-4 py-2 rounded-lg bg-[var(--color-long)] text-[#050505] font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Deposit</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 sm:px-6 py-4 border-b border-[var(--border-subtle)]">
          <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-2 sm:mb-3">
            Trading Stats
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Rank */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD700]" />
                <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">Rank</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {formatRank(stats.rank)}
              </p>
            </div>

            {/* Points */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[var(--color-long)]" />
                <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">Points</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {stats.points.toLocaleString()}
              </p>
            </div>

            {/* Total Trades */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-primary)]" />
                <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">Trades</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {stats.totalTrades}
              </p>
            </div>

            {/* Win Rate */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-long)]" />
                <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">Win Rate</span>
              </div>
              <p className={`text-base sm:text-lg font-bold ${stats.winRate >= 50 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Total PnL */}
          <div className="mt-2 sm:mt-3 p-3 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[var(--text-tertiary)]">Total PnL</span>
              <span className={`text-lg sm:text-xl font-bold font-mono ${stats.totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 space-y-3">
          <button
            onClick={handleDisconnect}
            className="w-full py-2.5 sm:py-3 rounded-xl font-medium text-sm bg-[var(--bg-secondary)] text-[var(--color-short)] hover:bg-[rgba(255,59,105,0.1)] border border-[var(--border-subtle)] hover:border-[var(--color-short)] transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
