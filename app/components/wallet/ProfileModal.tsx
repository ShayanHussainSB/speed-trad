"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Edit3,
  Trophy,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  onUpdateUsername: (username: string) => void;
  walletAddress: string;
  username: string;
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

// Generate consistent gradient from wallet address
const getGradientFromAddress = (address: string): string => {
  if (!address) return "from-[#FF2E8C] to-[#9945FF]";
  const hash = address.slice(0, 8);
  const gradients = [
    "from-[#FF2E8C] to-[#9945FF]",
    "from-[#00FFA3] to-[#03E1FF]",
    "from-[#FFD700] to-[#FF6B00]",
    "from-[#9945FF] to-[#14F195]",
    "from-[#FF6B6B] to-[#FF2E8C]",
    "from-[#00D1FF] to-[#9945FF]",
  ];
  const index = parseInt(hash, 16) % gradients.length;
  return gradients[index];
};

export function ProfileModal({
  isOpen,
  onClose,
  onDisconnect,
  onUpdateUsername,
  walletAddress,
  username,
  balance,
  balanceUSD,
  stats,
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  const gradient = getGradientFromAddress(walletAddress);
  const initial = (username?.[0] || walletAddress?.[0] || "?").toUpperCase();

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUsername = () => {
    if (editedUsername.length >= 3 && editedUsername.length <= 20) {
      onUpdateUsername(editedUsername);
      setIsEditing(false);
    }
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
      <div className="relative w-full max-w-md mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl animate-scale-in overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-primary)] opacity-20 blur-3xl" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header */}
          <div className="flex items-start gap-4">
            {/* Avatar with Gradient */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-bold text-white">{initial}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-long)] flex items-center justify-center border-2 border-[var(--bg-card)]">
                <Check className="w-3 h-3 text-[#050505]" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="p-2 rounded-lg bg-[var(--color-long)] text-[#050505] hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUsername(username);
                    }}
                    className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">
                    {username}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

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
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-1">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {balance.toFixed(4)} SOL
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                ≈ ${balanceUSD.toFixed(2)} USD
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[var(--color-long)] text-[#050505] font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Deposit
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <p className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)] mb-3">
            Trading Stats
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Rank */}
            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
                <span className="text-xs text-[var(--text-tertiary)]">Rank</span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {formatRank(stats.rank)}
              </p>
            </div>

            {/* Points */}
            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-[var(--color-long)]" />
                <span className="text-xs text-[var(--text-tertiary)]">Points</span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {stats.points.toLocaleString()}
              </p>
            </div>

            {/* Total Trades */}
            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-xs text-[var(--text-tertiary)]">Trades</span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {stats.totalTrades}
              </p>
            </div>

            {/* Win Rate */}
            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-[var(--color-long)]" />
                <span className="text-xs text-[var(--text-tertiary)]">Win Rate</span>
              </div>
              <p className={`text-lg font-bold ${stats.winRate >= 50 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Total PnL */}
          <div className="mt-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-tertiary)]">Total PnL</span>
              <span className={`text-xl font-bold font-mono ${stats.totalPnL >= 0 ? "text-[var(--color-long)]" : "text-[var(--color-short)]"}`}>
                {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleDisconnect}
            className="w-full py-3 rounded-xl font-medium text-sm bg-[var(--bg-secondary)] text-[var(--color-short)] hover:bg-[rgba(255,59,105,0.1)] border border-[var(--border-subtle)] hover:border-[var(--color-short)] transition-all flex items-center justify-center gap-2"
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
