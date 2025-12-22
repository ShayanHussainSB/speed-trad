"use client";

import { FC, useState, useCallback, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Zap,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  ChevronDown,
  Pencil,
  Plus,
  TrendingUp,
  Trophy,
  Wifi,
  User,
} from "lucide-react";
import { useWalletBalance } from "@/app/hooks/useWalletBalance";
import { NETWORK_DISPLAY_NAME, IS_PRODUCTION, getAccountUrl } from "@/app/config/network";
import { ProfileEditModal } from "./ProfileEditModal";
import { AvatarIcon } from "@/app/components/avatars/AvatarIcon";

interface WalletSectionProps {
  onOpenModal: () => void;
  onOpenProfile?: () => void;
  username?: string;
  avatar?: string;
  onUpdateProfile?: (username: string, avatar: string) => void;
}

// Solana Logo SVG Component - using unique ID to prevent conflicts
const SolanaLogo = ({ className = "w-5 h-5", id }: { className?: string; id?: string }) => {
  const gradientId = id || "solana-grad";

  return (
    <svg
      className={className}
      viewBox="0 0 397 311"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="360.879"
          y1="351.455"
          x2="141.213"
          y2="-69.2936"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <path
        d="M64.6 237.9C67.5 235 71.5 233.3 75.7 233.3H391.5C398.5 233.3 402 241.8 397 246.8L332.4 311.4C329.5 314.3 325.5 316 321.3 316H5.5C-1.5 316 -5 307.5 0 302.5L64.6 237.9Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M64.6 3.1C67.6 0.2 71.6 -1.5 75.7 -1.5H391.5C398.5 -1.5 402 7 397 12L332.4 76.6C329.5 79.5 325.5 81.2 321.3 81.2H5.5C-1.5 81.2 -5 72.7 0 67.7L64.6 3.1Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M332.4 120.1C329.5 117.2 325.5 115.5 321.3 115.5H5.5C-1.5 115.5 -5 124 0 129L64.6 193.6C67.5 196.5 71.5 198.2 75.7 198.2H391.5C398.5 198.2 402 189.7 397 184.7L332.4 120.1Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};

// Format balance to prevent UI breaking
const formatBalance = (value: number, decimals: number = 2): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  if (value >= 1000) {
    return value.toFixed(decimals > 2 ? 2 : decimals);
  }
  return value.toFixed(decimals);
};

// Format USD with compact notation for large values
const formatUSD = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 10000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  if (value >= 1000) {
    return `$${value.toFixed(0)}`;
  }
  return `$${value.toFixed(0)}`;
};

export const WalletSection: FC<WalletSectionProps> = ({
  onOpenModal,
  onOpenProfile,
  username,
  avatar = "pepe",
  onUpdateProfile,
}) => {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { balance, balanceUSD } = useWalletBalance();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const walletAddress = publicKey?.toBase58() || "";
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "";
  const displayName = username || truncatedAddress;

  const handleCopyAddress = useCallback(async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [walletAddress]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setShowDropdown(false);
  }, [disconnect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Not connected state
  if (!connected) {
    return (
      <button
        onClick={onOpenModal}
        disabled={connecting}
        className={`
          flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm
          bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
          text-white shadow-lg
          hover:shadow-[var(--shadow-glow-pink)] hover:-translate-y-0.5 hover:scale-[1.02]
          active:scale-[0.98]
          transition-all duration-200
          ${connecting ? "opacity-70 cursor-wait" : ""}
        `}
      >
        {connecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  // Connected state - Split design
  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      {/* Balance Pill - Mobile (compact) */}
      <div className="flex sm:hidden items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
        <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center flex-shrink-0">
          <SolanaLogo className="w-3 h-3" id="sol-mobile" />
        </div>
        <span className="text-xs font-bold font-mono text-[var(--text-primary)] tabular-nums">
          {formatBalance(balance, 2)}
        </span>
      </div>

      {/* Balance Pill - Desktop (full) */}
      <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
        {/* Solana Logo */}
        <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center p-1">
          <SolanaLogo className="w-4 h-4" id="sol-desktop" />
        </div>

        {/* Balance Info */}
        <div className="flex flex-col min-w-[52px]">
          <span className="text-sm font-bold font-mono text-[var(--text-primary)] leading-tight tabular-nums">
            {formatBalance(balance, 2)}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] leading-tight tabular-nums">
            {formatUSD(balanceUSD)}
          </span>
        </div>

        {/* Quick Deposit Button */}
        <button
          className="w-7 h-7 rounded-lg bg-[var(--color-long)]/10 hover:bg-[var(--color-long)]/20 flex items-center justify-center text-[var(--color-long)] transition-colors"
          title="Deposit"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
          relative flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl
          bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
          hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-tertiary)]
          transition-all duration-200
          ${showDropdown ? "border-[var(--accent-primary)]/50 bg-[var(--bg-tertiary)]" : ""}
        `}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md">
            <AvatarIcon avatarId={avatar} size={32} />
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-long)] border-2 border-[var(--bg-elevated)]" />
        </div>

        {/* Name & Network */}
        <div className="flex flex-col items-start max-w-[100px]">
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate w-full">
            {displayName}
          </span>
          <div className="flex items-center gap-1">
            <Wifi className={`w-2.5 h-2.5 ${IS_PRODUCTION ? "text-[var(--color-long)]" : "text-[#FF6B00]"}`} />
            <span className={`text-[10px] ${IS_PRODUCTION ? "text-[var(--text-tertiary)]" : "text-[#FF6B00]"}`}>
              {NETWORK_DISPLAY_NAME}
            </span>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${
            showDropdown ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Enhanced Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-2 w-auto sm:w-72 mx-2 sm:mx-0 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl animate-slide-down z-50 overflow-hidden">
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
            <div className="flex items-center gap-3">
              {/* Large Avatar */}
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                <AvatarIcon avatarId={avatar} size={48} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text-primary)] truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">
                    {truncatedAddress}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-[var(--color-long)]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center p-0.5">
                  <SolanaLogo className="w-4 h-4" id="sol-dropdown" />
                </div>
                <span className="text-xs uppercase tracking-wide font-bold text-[var(--text-tertiary)]">
                  Wallet Balance
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-long)]/10 text-[var(--color-long)]">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="text-[10px] font-medium">Live</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold font-mono text-[var(--text-primary)] tabular-nums">
                  {formatBalance(balance, 4)}
                  <span className="text-sm ml-1 text-[var(--text-secondary)] font-sans">
                    SOL
                  </span>
                </p>
                <p className="text-sm text-[var(--text-tertiary)] tabular-nums">
                  ≈ {formatUSD(balanceUSD)} USD
                </p>
              </div>

              <button className="px-3 py-2 rounded-lg bg-[var(--color-long)] text-[#050505] text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Deposit
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)]">Trades</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">0</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)]">
              <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)]">Rank</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  --
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            {/* Edit Profile Button */}
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                <Pencil className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <span className="flex-1 text-left">Edit Profile</span>
            </button>

            {onOpenProfile && (
              <button
                onClick={() => {
                  onOpenProfile();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left">View Full Profile</span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            )}

            <a
              href={getAccountUrl(walletAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                <ExternalLink className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">View on Solscan</span>
            </a>

            <div className="my-2 h-px bg-[var(--border-subtle)]" />

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-short)] hover:bg-[var(--color-short)]/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-short)]/10 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">Disconnect Wallet</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUsername={username || ""}
        currentAvatar={avatar}
        onSave={(newUsername, newAvatar) => {
          if (onUpdateProfile) {
            onUpdateProfile(newUsername, newAvatar);
          }
        }}
      />
    </div>
  );
};

export default WalletSection;
