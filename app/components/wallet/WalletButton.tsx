"use client";

import { FC, useState, useCallback, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Zap, Copy, Check, LogOut, ExternalLink, ChevronDown, User } from "lucide-react";
import { useWalletBalance } from "@/app/hooks/useWalletBalance";

interface WalletButtonProps {
  onOpenModal: () => void;
  onOpenProfile?: () => void;
  username?: string;
}

export const WalletButton: FC<WalletButtonProps> = ({ onOpenModal, onOpenProfile, username }) => {
  const { publicKey, connected, disconnect, connecting, wallet } = useWallet();
  const { balance, balanceUSD } = useWalletBalance();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const walletAddress = publicKey?.toBase58() || "";
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "";

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
          flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
          bg-[var(--accent-primary)] text-white
          hover:shadow-[var(--shadow-glow-pink)] hover:-translate-y-0.5
          transition-all duration-200
          ${connecting ? "opacity-70 cursor-wait" : "animate-glow-breathe"}
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
            <span>Connect</span>
          </>
        )}
      </button>
    );
  }

  // Connected state
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm
          bg-[var(--bg-elevated)] border border-[var(--border-default)]
          text-[var(--text-primary)]
          hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)]
          transition-all duration-200
        `}
      >
        {/* Wallet Icon */}
        {wallet?.adapter.icon && (
          <img
            src={wallet.adapter.icon}
            alt={wallet.adapter.name}
            className="w-5 h-5 rounded"
          />
        )}

        {/* Username & Balance */}
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold">{username || truncatedAddress}</span>
          <span className="text-[10px] text-[var(--color-long)]">
            {balance.toFixed(2)} SOL
          </span>
        </div>

        {/* Status Dot & Arrow */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--color-long)] animate-pulse" />
          <ChevronDown
            className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-64 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl animate-slide-down z-50">
          {/* Balance Section */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Wallet Balance</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {balance.toFixed(4)} SOL
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              ≈ ${balanceUSD.toFixed(2)} USD
            </p>
          </div>

          {/* Actions */}
          <div className="py-1">
            {onOpenProfile && (
              <button
                onClick={() => {
                  onOpenProfile();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
            )}

            <button
              onClick={handleCopyAddress}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[var(--color-long)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Address"}
            </button>

            <a
              href={`https://solscan.io/account/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Solscan
            </a>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-short)] hover:bg-[var(--color-short-muted)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
