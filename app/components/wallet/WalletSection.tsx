"use client";

import React, { FC, useState, useCallback, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Zap,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  ChevronDown,
  Settings,
  FileText,
  Shield,
  Book,
} from "lucide-react";
import { useWalletBalance } from "@/app/hooks/useWalletBalance";
import { getAccountUrl } from "@/app/config/network";
import { ProfileEditModal } from "./ProfileEditModal";
import { AvatarIcon } from "@/app/components/avatars/AvatarIcon";
import { useSettings } from "@/app/hooks/useSettings";

interface WalletSectionProps {
  onOpenModal: () => void;
  onOpenProfile?: () => void;
  username?: string;
  avatar?: string;
  onUpdateProfile?: (username: string, avatar: string) => void;
}

const formatBalance = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(4);
};

export const WalletSection: FC<WalletSectionProps> = ({
  onOpenModal,
  username,
  avatar = "pepe",
  onUpdateProfile,
}) => {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { balance } = useWalletBalance();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { soundEnabled, setSoundEnabled } = useSettings();



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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Not connected
  if (!connected) {
    return (
      <button
        onClick={onOpenModal}
        disabled={connecting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-[#FF006E] text-white hover:bg-[#FF006E]/90 transition-colors disabled:opacity-50"
      >
        {connecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Connect</span>
          </>
        )}
      </button>
    );
  }

  // Connected - Pro DEX style
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-all ${showDropdown ? "border-[var(--accent-primary)]/50" : ""}`}
      >
        {/* Gradient status dot */}
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] shadow-[0_0_6px_rgba(0,245,160,0.5)]" />

        {/* Address */}
        <span className="text-sm font-mono text-white">
          {truncatedAddress}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          {/* Header - Clean wallet info */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] shadow-[0_0_8px_rgba(0,245,160,0.5)]" />
                <span className="text-xs font-medium text-[#00F5A0] uppercase tracking-wider">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-white">{truncatedAddress}</span>
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00F5A0]" />
                    <span className="text-xs text-[#00F5A0]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-1">Balance</p>
                <p className="text-xl font-semibold text-white tabular-nums">
                  {formatBalance(balance)} <span className="text-sm text-white/40">SOL</span>
                </p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                Deposit
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={(e) => {

                setSoundEnabled(!soundEnabled);

              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4" />
                <span>Sound Effects</span>
              </div>
              <label
                className="relative inline-flex items-center cursor-pointer"
                onClick={(e) => {

                  e.stopPropagation();
                }}
              >
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {

                    setSoundEnabled(e.target.checked);

                  }}
                  onClick={(e) => {

                    e.stopPropagation();
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FF006E]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF006E]"></div>
              </label>
            </button>

            <a
              href={getAccountUrl(walletAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Explorer</span>
            </a>

            <div className="my-2 h-px bg-white/5" />

            <a href="#" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Terms</span>
            </a>
            <a href="#" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
              <Shield className="w-4 h-4" />
              <span>Privacy</span>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
              <Book className="w-4 h-4" />
              <span>Docs</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Follow us</span>
            </a>

            <div className="my-2 h-px bg-white/5" />

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}

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
